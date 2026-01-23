# Limitations

User Authentication has constraints that may affect implementation or usage.

## Supported login methods

Only the following methods are supported for this product version:

- Email/password
- External identity provider: `{{auth_provider}}`

If additional providers are required, they must be configured as part of a
separate project change.

## Session policies

- The maximum session duration is `{{max_session_hours}}` hours.
- Idle sessions expire after `{{session_timeout_minutes}}` minutes.

Projects with stricter requirements should use lower thresholds.

## MFA constraints

- SMS-based MFA may be restricted in certain regions.
- Backup codes are available only when `{{backup_codes_enabled}}` is true.

## Audit retention

Audit data is retained for `{{audit_retention_days}}` days.
Longer retention requires a separate storage configuration.

