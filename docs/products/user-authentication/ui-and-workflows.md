# UI and Workflows

This section describes the default user-facing screens and administrator flows.
Screens can be branded per project but follow the same functional structure.

## Sign-in screen

The sign-in screen includes:

- Email or username input
- Password input
- Sign-in button
- "Forgot password" link
- Optional "Sign in with {{auth_provider}}" button

### Validation rules

- Email format is validated client-side.
- Password rules follow the project policy:
  - Minimum length: `{{password_min_length}}`
  - Complexity: `{{password_complexity}}`

## MFA challenge

If MFA is enabled, the user is prompted to complete a second factor after entering credentials:

- Default factor order: `{{mfa_primary_factor}}`
- Allowed fallback factor: `{{mfa_fallback_factor}}`

## Password reset flow

1. User selects "Forgot password".
2. A reset link is sent to the user email.
3. The user creates a new password.
4. The system confirms the reset and returns to sign-in.

Project-specific configuration:

- Reset link expiry: `{{reset_link_expiry_minutes}}` minutes
- Email sender name: `{{reset_email_sender_name}}`

## Admin user management

Administrators can:

- Create users
- Reset user passwords
- Force MFA enrollment
- Disable or re-enable accounts

Admin actions are logged and visible to authorized admins only.

