# Alarms and Notifications

User Authentication generates alerts and notifications to highlight suspicious
activity or system issues. Alert thresholds are configured per project.

## Security alarms

Security alarms are triggered by abnormal authentication patterns:

- Excessive failed logins in a short time window
- Multiple login attempts from new geographic regions
- Repeated MFA failures

Project-specific thresholds:

- Failed login threshold: `{{failed_login_threshold}}` in `{{failed_login_window_minutes}}` minutes
- MFA failure threshold: `{{mfa_failure_threshold}}` in `{{mfa_failure_window_minutes}}` minutes
- New-region alert enabled: `{{new_region_alert_enabled}}`

## Account lockout notifications

When a user reaches the lockout threshold, the system notifies the user and
admins based on project policy:

- Notify user on lockout: `{{notify_user_on_lockout}}`
- Notify admin on lockout: `{{notify_admin_on_lockout}}`
- Admin notification recipients: `{{admin_notification_emails}}`

## System health notifications

Operational alerts notify admins if the authentication system is degraded:

- Identity provider unreachable
- Token issuance failures
- Audit log write failures

Severity levels and escalation routes are configured per project.

