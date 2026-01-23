# How It Works

User Authentication follows a standard flow that begins with credential validation
and ends with session issuance. The system can validate credentials locally or
delegate them to an external identity provider.

## High-level flow

1. User enters credentials and submits a sign-in request.
2. The identity provider validates the credentials.
3. If MFA is enabled, the user completes the second factor.
4. A session token is issued and stored in the client.
5. The token is checked on each protected request.

## Identity providers

The project is configured with a primary identity provider:

- Provider type: `{{auth_provider}}`
- Tenant or domain: `{{auth_provider_domain}}`
- Connection name (if applicable): `{{auth_provider_connection}}`

When external providers are used, local passwords are not stored. If the project
uses email/password, credentials are validated directly by the platform.

## Session lifecycle

Sessions remain active until they expire or are revoked. The session timeout is
configured per project:

- Session timeout: `{{session_timeout_minutes}}` minutes
- Token refresh interval: `{{token_refresh_minutes}}` minutes
- Max session duration: `{{max_session_hours}}` hours

## MFA behavior

If MFA is required, users must complete the second factor after primary sign-in.
Supported factors are configured per project:

- Enabled factors: `{{mfa_factors}}`
- Backup codes available: `{{backup_codes_enabled}}`

## Audit events

Authentication-related events are recorded for monitoring and compliance:

- Sign-in success or failure
- MFA challenge success or failure
- Password reset requested or completed
- Account lockout events

