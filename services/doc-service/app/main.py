import base64
import json
import os
import tempfile
import urllib.error
import urllib.request
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from docx import Document
from docxcompose.composer import Composer
from google.auth.transport.requests import Request
from google.oauth2 import service_account

app = FastAPI()

DOC_STORAGE_PATH = os.environ.get("DOC_STORAGE_PATH", "/tmp/doc-service")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "doc-output")
DEFAULT_OUTPUT_PREFIX = os.environ.get("OUTPUT_PREFIX", "manuals")
GOOGLE_TRANSLATE_PROJECT_ID = os.environ.get("GOOGLE_TRANSLATE_PROJECT_ID")
GOOGLE_TRANSLATE_LOCATION = os.environ.get("GOOGLE_TRANSLATE_LOCATION", "us-central1")
GOOGLE_TRANSLATE_SOURCE_LANG = os.environ.get("GOOGLE_TRANSLATE_SOURCE_LANG", "en")
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
GOOGLE_SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE")
GOOGLE_TRANSLATE_SCOPES = ["https://www.googleapis.com/auth/cloud-translation"]
DOCX_MIME_TYPE = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)


class MergeRequest(BaseModel):
    job_id: str
    template_url: str
    module_urls: List[str]
    output_path: Optional[str] = None
    language: Optional[str] = None


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
            "Content-Type": DOCX_MIME_TYPE,
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


def load_service_account_info() -> Optional[dict]:
    if GOOGLE_SERVICE_ACCOUNT_JSON:
        return json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    if GOOGLE_SERVICE_ACCOUNT_FILE:
        with open(GOOGLE_SERVICE_ACCOUNT_FILE, "r", encoding="utf-8") as file_handle:
            return json.load(file_handle)
    return None


def get_google_access_token() -> str:
    service_account_info = load_service_account_info()
    if not service_account_info:
        raise RuntimeError(
            "GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_FILE is required"
        )
    credentials = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=GOOGLE_TRANSLATE_SCOPES
    )
    credentials.refresh(Request())
    if not credentials.token:
        raise RuntimeError("Failed to obtain Google access token")
    return credentials.token


def translate_docx(file_path: str, target_language: str) -> str:
    if not GOOGLE_TRANSLATE_PROJECT_ID:
        raise RuntimeError("GOOGLE_TRANSLATE_PROJECT_ID is required")

    with open(file_path, "rb") as file_handle:
        content = file_handle.read()

    encoded = base64.b64encode(content).decode("utf-8")
    payload: dict = {
        "documentInputConfig": {
            "content": encoded,
            "mimeType": DOCX_MIME_TYPE,
        },
        "documentOutputConfig": {
            "mimeType": DOCX_MIME_TYPE,
        },
        "targetLanguageCode": target_language,
    }

    if GOOGLE_TRANSLATE_SOURCE_LANG:
        payload["sourceLanguageCode"] = GOOGLE_TRANSLATE_SOURCE_LANG

    translate_url = (
        "https://translation.googleapis.com/v3/projects/"
        f"{GOOGLE_TRANSLATE_PROJECT_ID}/locations/{GOOGLE_TRANSLATE_LOCATION}"
        f":translateDocument"
    )
    token = get_google_access_token()
    request = urllib.request.Request(
        translate_url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )

    try:
        with urllib.request.urlopen(request) as response:
            if response.status >= 400:
                raise RuntimeError(f"Translation failed: {response.status}")
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Translation failed ({error.code}): {error_body}"
        ) from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Translation failed (network): {error}") from error

    outputs = (
        result.get("documentTranslation", {}).get("byteStreamOutputs") or []
    )
    if not outputs:
        raise RuntimeError("Translation failed: no output returned")

    translated_bytes = base64.b64decode(outputs[0])
    translated_path = os.path.join(
        DOC_STORAGE_PATH, f"translated-{os.path.basename(file_path)}"
    )
    with open(translated_path, "wb") as file_handle:
        file_handle.write(translated_bytes)
    return translated_path


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

    target_language = (request.language or "en").strip()
    if target_language.lower() != "en":
        try:
            temp_output_path = translate_docx(temp_output_path, target_language)
        except RuntimeError as error:
            raise HTTPException(status_code=502, detail=str(error)) from error

    output_info = upload_to_storage(temp_output_path, output_path)
    return {"job_id": request.job_id, "output": output_info}
