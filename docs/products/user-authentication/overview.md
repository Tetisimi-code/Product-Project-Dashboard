# Overview

User Authentication provides secure sign-in, session management, and access control for the platform.
It supports centralized identity providers and multi-factor authentication to reduce account risk.

## Purpose

The module ensures that only approved users can access protected areas of the product.
It also standardizes how user identities are created, verified, and audited across environments.

## Scope

- End-user sign-in and sign-out
- Session issuance and renewal
- Identity provider integration
- Basic audit events for authentication activity

## Intended audience

This content is written for administrators and project owners who configure and monitor authentication.

## Key capabilities

- Login via email/password or external identity provider
- Optional multi-factor authentication (MFA)
- Configurable session lifetimes
- Account lockout protection
- Password reset flows

## Project-specific configuration

The following values are supplied per project and vary by deployment:

- Identity provider: `{{auth_provider}}`
- MFA requirement: `{{mfa_enforced}}`
- Session timeout: `{{session_timeout_minutes}}` minutes
- Maximum failed attempts before lockout: `{{lockout_threshold}}`
- Lockout duration: `{{lockout_duration_minutes}}` minutes

