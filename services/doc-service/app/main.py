import os
import tempfile
import urllib.request
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from docx import Document
from docxcompose.composer import Composer

app = FastAPI()

DOC_STORAGE_PATH = os.environ.get("DOC_STORAGE_PATH", "/tmp/doc-service")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "doc-output")
DEFAULT_OUTPUT_PREFIX = os.environ.get("OUTPUT_PREFIX", "manuals")


class MergeRequest(BaseModel):
    job_id: str
    template_url: str
    module_urls: List[str]
    output_path: Optional[str] = None


def ensure_storage_dir() -> None:
    os.makedirs(DOC_STORAGE_PATH, exist_ok=True)


def download_to_temp(url: str) -> str:
    ensure_storage_dir()
    fd, temp_path = tempfile.mkstemp(suffix=".docx", dir=DOC_STORAGE_PATH)
    os.close(fd)
    urllib.request.urlretrieve(url, temp_path)
    return temp_path


def upload_to_storage(file_path: str, output_path: str) -> dict:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

    with open(file_path, "rb") as file_handle:
        data = file_handle.read()

    object_path = output_path.lstrip("/")
    upload_url = (
        f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{object_path}?upsert=true"
    )
    request = urllib.request.Request(
        upload_url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    )
    with urllib.request.urlopen(request) as response:
        if response.status >= 400:
            raise RuntimeError(f"Upload failed: {response.status}")

    return {
        "bucket": STORAGE_BUCKET,
        "path": object_path,
        "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size": len(data),
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/merge")
def merge_docs(request: MergeRequest) -> dict:
    ensure_storage_dir()

    if not request.module_urls:
        raise HTTPException(status_code=400, detail="module_urls is required")

    template_path = download_to_temp(request.template_url)

    output_path = request.output_path or f"{DEFAULT_OUTPUT_PREFIX}/{request.job_id}.docx"

    template = Document(template_path)
    composer = Composer(template)

    for module_url in request.module_urls:
        module_path = download_to_temp(module_url)
        composer.append(Document(module_path))

    temp_output_path = os.path.join(DOC_STORAGE_PATH, f"{request.job_id}.docx")
    composer.save(temp_output_path)

    output_info = upload_to_storage(temp_output_path, output_path)
    return {"job_id": request.job_id, "output": output_info}
