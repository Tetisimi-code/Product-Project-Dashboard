# Documentation Assembler

This service generates project-specific Word manuals by assembling Markdown
modules and inserting them into the organization Word template.

## Inputs

- `projectId`: Identifier of the project to generate a manual for.
- `documentType`: Manual type (default: `user-manual`).
- `outputFormat`: `docx` or `pdf` (first version can be `docx` only).

## Data sources

- Project configuration (enabled products and project-specific values).
- Product-to-module mapping: `docs/product-module-map.json`.
- Markdown modules in `docs/`.
- Word template with placeholder: `{{DOCUMENT_CONTENT}}`.

## Responsibilities

- Load project configuration for `projectId`.
- Resolve enabled products to module list via the mapping.
- Load and render Markdown modules.
- Replace variables using project values.
- Apply Word styles for headings and body text.
- Insert rendered content into the Word template at the placeholder.
- Output the final document as a file (and optionally PDF).

## Output

- File artifact returned to caller:
  - `user-manual.docx` (or `.pdf` if enabled)

## Basic flow

1. Validate inputs (`projectId`, `documentType`, `outputFormat`).
2. Load project configuration and product list.
3. Resolve modules via `product-module-map.json`.
4. Load Markdown module files in order.
5. Replace `{{variables}}` using project values.
6. Convert Markdown to Word blocks with style mapping.
7. Insert content into template at `{{DOCUMENT_CONTENT}}`.
8. Export and return the final file.

## Non-goals for v1

- Multiple templates
- Conditional logic beyond product enablement
- Persistent storage of generated documents

