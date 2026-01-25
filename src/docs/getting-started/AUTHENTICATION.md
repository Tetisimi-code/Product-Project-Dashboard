# Authentication & Cloud Storage

## Overview

The Product-Project Management Board includes secure team collaboration features:

- ✅ **Secure user authentication** - Email/password signup and login
- ✅ **Cloud database storage** - All data synced via Supabase
- ✅ **Real-time team collaboration** - Everyone sees the same data
- ✅ **User attribution** - Audit logs track who made changes
- ✅ **Email domain restrictions** - Only @reactive-technologies.com emails allowed

## Getting Started

### First Time Users

#### Sign Up Process

1. Click the **"Sign Up"** tab in the login dialog
2. Fill in your information:
   - **Full Name:** Your real name (used in audit logs)
   - **Email:** Must be @reactive-technologies.com
   - **Password:** Minimum 6 characters
3. Click **"Sign Up"**
4. You'll be automatically logged in

#### After Sign Up

- Your account is created in the Supabase database
- You can immediately start creating projects and features
- All your changes will be tracked with your name
- Your session persists across browser restarts

### Returning Users

#### Automatic Login

If you have an active session:
- App will automatically log you in
- No need to enter credentials again
- Session stays active for security duration

#### Manual Login

1. Enter your **email address**
2. Enter your **password**
3. Click **"Login"**
4. You're signed in!

## Managing Your Account

### Account Settings

Click the **"Account"** button in the top-right corner to access:

#### Profile Settings
- Update your full name
- View your email address

#### Change Password
1. Enter your **current password**
2. Enter your **new password**
3. Confirm the **new password**
4. Click **"Update Password"**

#### Change Email (Admin Only)
Administrators can update their email:
1. Click **"Change Email Address"**
2. Enter new @reactive-technologies.com email
3. Click **"Update Email"**
4. **You'll be logged out** - sign in with new email

### Account Deletion

⚠️ **Warning:** This action is permanent!

To delete your account:
1. Click **"Account"** → **"Delete My Account"**
2. Confirm in the dialog
3. Your account is permanently removed

**What happens:**
- ✅ Your user account is deleted
- ✅ You cannot log in anymore
- ✅ Team data (projects, features) remains intact
- ❌ This action cannot be undone

### Logout

To sign out:
1. Click **"Account"** → **"Logout"**
2. Your session ends
3. You return to the login screen
4. Your data is safe in the cloud

## Team Collaboration

### How It Works

**Shared Database Architecture:**
```
User A ──┐
User B ──┼──> Cloud Database (Supabase) ──> All Projects & Features
User C ──┘
```

**Key Features:**
- All users access the same central database
- Changes save immediately to the cloud
- Refresh the page to see teammates' updates
- Last write wins (no merge conflicts)

### Best Practices

#### Communication
- Coordinate before making major changes
- Use Activity Log to see what teammates are doing
- Establish naming conventions as a team

#### Data Safety
- Export backups regularly (weekly recommended)
- Don't delete projects without team discussion
- Check Activity Log before major edits

#### Performance
- Refresh page periodically for latest data
- Clear browser cache if app feels slow
- Log out/in if data seems stale

## Security

### Authentication Security

✅ **What's Protected:**
- Passwords are securely hashed
- All API calls require authentication tokens
- Sessions expire after period of inactivity
- Email verification ensures valid users

### Access Control

**Email Domain Restriction:**
- Only @reactive-technologies.com emails can sign up
- Configured at server level
- Cannot be bypassed by users
- Admin can update their own email

**Who Has Access:**
- Admin users: Full control (user management + all features)
- Regular users: Create/edit projects and features
- No public access: Must be authenticated

### Data Privacy

⚠️ **Important Security Note:**

This system is designed for **internal team collaboration** only.

**Safe to Store:**
- Product feature descriptions
- Project timelines and status
- Internal team collaboration data
- Non-sensitive business planning

**Do NOT Store:**
- Customer PII (personally identifiable information)
- Financial or payment data
- Sensitive business secrets
- Regulated data (HIPAA, PCI, SOC 2, etc.)

## Troubleshooting

### Login Issues

**"Invalid credentials" error**
- Check your email spelling
- Verify password (case-sensitive)
- Try resetting password (contact admin)

**Can't sign up**
- Email must be @reactive-technologies.com
- Check for typos in email address
- Contact admin if domain restriction is wrong

**Session expired**
- Your session timed out for security
- Simply log in again
- Sessions last until browser closure or timeout

### Account Issues

**Can't change password**
- Verify current password is correct
- New password must be 6+ characters
- Make sure passwords match in confirm field

**Forgot password**
- Contact your administrator
- Admin can delete and recreate your account
- Or admin can help reset via Supabase

**Email change not working**
- Only admins can change their email
- Must be different from current email
- Must be @reactive-technologies.com domain
- You'll be logged out after change

### Data Not Syncing

**Changes not appearing**
- Check internet connection
- Refresh the page (Ctrl+R / Cmd+R)
- Verify you're logged in
- Check Activity Log for recent saves

**Other users' changes not visible**
- Refresh the page to load latest data
- Check that you're on the right account
- Verify team member is logged in

## Technical Details

### Architecture

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ HTTPS + Auth Token
         ▼
┌─────────────────┐
│   API Server    │ (Supabase Edge Functions)
│   (Hono)        │
└────────┬────────┘
         │
         ├──> Supabase Auth (User Management)
         │
         └──> Supabase Database (KV Store)
```

### Authentication Flow

**Sign Up:**
1. Frontend → Server `/signup` endpoint
2. Server creates user via Supabase Admin API
3. Email auto-confirmed (no email server needed)
4. Server returns success
5. Frontend auto-logs in user

**Login:**
1. Frontend calls `supabase.auth.signInWithPassword()`
2. Supabase validates credentials
3. Returns access token and user data
4. Token stored in localStorage
5. Token sent with all API requests

**Logout:**
1. Frontend calls `supabase.auth.signOut()`
2. Session invalidated
3. localStorage cleared
4. Redirect to login

### Supabase Client

**Singleton Pattern:**

The app uses ONE shared Supabase client instance:

```typescript
// /utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
```

**Usage in Components:**
```typescript
import { supabase } from '../utils/supabase/client';

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@reactive-technologies.com',
  password: 'password123'
});

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

### API Authentication

All protected routes require Bearer token:

```typescript
const accessToken = localStorage.getItem('accessToken');

fetch(`https://${projectId}.supabase.co/functions/v1/server/projects`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
});
```

## Support

Need help with authentication?

1. Check [Troubleshooting Section](#troubleshooting) above
2. Review [Quick Start Guide](./QUICK_START.md)
3. See [Technical Documentation](../technical/ARCHITECTURE.md)
4. Contact your administrator

---

[← Back to Documentation Index](../README.md)
