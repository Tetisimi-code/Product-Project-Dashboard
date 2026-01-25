# Doc Service

Minimal FastAPI service that merges Word documents into a single manual.
This service should remain internal-only with no UI or auth complexity.

## Endpoints

- `GET /health` -> health check
- `POST /merge` -> merges template + module docs

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment

- `DOC_STORAGE_PATH` (default: `/tmp/doc-service`)
- `SUPABASE_URL` (required for upload)
- `SUPABASE_SERVICE_ROLE_KEY` (required for upload)
- `STORAGE_BUCKET` (default: `doc-output`)
- `OUTPUT_PREFIX` (default: `manuals`)
