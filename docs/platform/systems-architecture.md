# Systems Architecture

This document describes the end-to-end system architecture for the product-project
management application, including major components, data flows, and integration points.

## High-Level Components

- Web client: React + Vite frontend, runs in the browser.
- Supabase Auth: User authentication and session management.
- Supabase Edge Functions: API surface for app operations.
- Supabase Postgres: Primary data store, including the KV backing table.
- Document service: Generates Word/PDF manuals from Markdown modules.
- External services: Resend email delivery (optional), Atlassian Jira/Confluence (optional).

## System Context Diagram

```text
┌─────────────────────────────┐       ┌─────────────────────────────┐
│          End Users           │       │       External Services     │
│  Browsers (React + Vite)     │       │  Resend, Jira, Confluence   │
└───────────────┬─────────────┘       └───────────────┬─────────────┘
                │ HTTPS                                      │ HTTPS
                v                                            v
┌─────────────────────────────────────────────────────────────────────┐
│                             Supabase                                 │
│  ┌───────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │     Auth      │  │  Edge Functions      │  │    Postgres DB     │  │
│  │  Sessions     │  │  /server/* endpoints │  │  Core data + KV    │  │
│  └───────────────┘  └──────────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                │ HTTPS
                v
┌─────────────────────────────┐
│     Document Service         │
│  Markdown -> DOCX/PDF jobs   │
└─────────────────────────────┘
```

## Core API Request Flow

```text
Browser (React)
  |
  | 1. User action (create project, update feature, etc.)
  v
Edge Function (/server/*)
  |
  | 2. Validate auth token + input
  v
Supabase Postgres
  |
  | 3. Persist / read data
  v
Edge Function
  |
  | 4. Response payload
  v
Browser UI updates
```

## Authentication Flow

```text
User submits email + password
  |
  | Login: Supabase Auth signInWithPassword
  | Signup: Edge Function /server/signup -> Supabase Admin createUser
  v
Supabase Auth issues access token
  |
  v
Browser stores access token
  |
  v
Token used for Edge Function calls (Authorization: Bearer <token>)
```

Notes:

- Email verification is optional and may be disabled in some deployments.
- Password reset uses Supabase Auth built-in email flow.

## Data Storage Model (Simplified)

```text
Postgres
  ├─ projects
  ├─ features
  ├─ products
  ├─ categories
  ├─ audit_log
  └─ kv_store_bbcbebd7
        - key (text, primary key)
        - value (jsonb)
```

The KV table backs server-side state such as cached lists, pending tasks, and
integration configuration.

## Document Generation Flow

```text
Browser -> Edge Function (/server/docs/*)
  |
  | 1. Create generation job with projectId
  v
Document Service
  |
  | 2. Load docs/ modules + project config
  | 3. Render Markdown -> DOCX/PDF
  v
Signed URL or job status returned
```

## Integration Points

- Resend: Optional email delivery for verification flows.
- Atlassian Jira: Issue creation, project linking.
- Atlassian Confluence: Page linking and metadata capture.

## Deployment Topology

```text
Frontend Hosting (Vercel/Netlify/S3)
  |
  v
Supabase Project
  - Auth
  - Edge Function: server
  - Postgres Database
  - Storage (optional)
  |
  v
Document Service (separate host)
```

## Security Boundaries

- Public clients use the Supabase anon key and user access tokens.
- Edge Functions use the Supabase service role key for privileged operations.
- Admin-only routes require verified admin status.
