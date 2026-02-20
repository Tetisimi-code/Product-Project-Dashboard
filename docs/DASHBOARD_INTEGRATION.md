# Dashboard Integration

The dashboard triggers manual generation at the project level. The dashboard
does not store or edit documentation content.

## UI

Add a button in the Project Documentation view:

- Label: **Generate User Manual**
- Scope: visible to project owners and admins

## Behavior

1. User clicks **Generate User Manual**.
2. Dashboard calls the assembler service with `projectId`.
3. Service returns a generated file (`.docx`, optionally `.pdf`).
4. Dashboard prompts the user to download the file.

## Request contract (example)

`POST /api/docs/generate`

Body:

- `projectId` (string)
- `documentType` (string, default `user-manual`)
- `outputFormat` (string, default `docx`)
- `language` (string, default `en`)

Supported languages (default set):

- `en` English
- `fr` French
- `ar-SA` Arabic (Saudi Arabia)
- `es` Spanish
- `de` German
- `zh-CN` Chinese (Simplified)

## Response

- Success: file download (stream or signed URL)
- Failure: error message with retry instructions
