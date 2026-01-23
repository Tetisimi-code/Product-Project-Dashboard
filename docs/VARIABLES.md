# Variable Placeholders

Documentation modules use placeholders for project-specific values. These are
replaced at generation time by the documentation assembler.

## Format

Use double curly braces with lower snake_case variable names:

- `{{variable_name}}`

Examples:

- `{{auth_provider}}`
- `{{session_timeout_minutes}}`
- `{{admin_notification_emails}}`

## Conventions

- Keep names product-agnostic when possible.
- Include units in the name when numeric values are used (for example, `_minutes`, `_hours`).
- Use booleans as `true` or `false` when rendered.
- Use lists as comma-separated values when rendered.

## Source of values

Values come from the project configuration and product settings.

