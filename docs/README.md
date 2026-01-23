# Documentation Source of Truth

This folder is the single, version-controlled source of documentation content.
Content is authored in Markdown and later assembled into project-specific Word manuals.

## Structure

- `platform/` : shared, platform-level documentation modules
- `products/` : product-specific documentation modules

## Conventions

- One Markdown file per logical documentation module.
- Keep files small and reusable.
- Use variables for project-specific values (placeholders to be filled at generation time).

See `VARIABLES.md` for placeholder format and naming rules.

## Product mapping

Product-to-module mapping is defined in `product-module-map.json`.

## Word template

The Word template placeholder is defined in `TEMPLATE.md`.

## Assembler

Assembler responsibilities and interface are described in `ASSEMBLER.md`.

## Dashboard integration

Dashboard integration details are in `DASHBOARD_INTEGRATION.md`.

## Project configuration

Project config schema and example are in `PROJECT_CONFIG_SCHEMA.md`.

Sample config: `project-config.sample.json`.
