# Account Deletion Guide

## Overview

Users can delete their own accounts from the Product-Project Management Board at any time. This is a **self-service** feature that doesn't require admin approval.

## How to Delete Your Account

### Step-by-Step Process

1. **Open Account Menu**
   - Click the **"Account"** button in the top-right corner
   - Next to your name

2. **Select Delete Option**
   - Click **"Delete My Account"** (in red at bottom of menu)

3. **Confirm Deletion**
   - Read the warning dialog carefully
   - Click **"Delete My Account"** to confirm
   - Or click **"Cancel"** to abort

4. **Account Deleted**
   - Immediately logged out
   - Account permanently removed
   - Success message displayed

## What Gets Deleted

### ✅ Removed

- **Your user account** - Authentication credentials and profile
- **Your access** - Cannot log in anymore
- **Your session** - Immediately logged out

### ❌ NOT Removed

- **Team projects** - All projects remain for the team
- **Team features** - All product features stay
- **Team data** - Categories, audit logs, everything intact
- **Other users** - Team members unaffected
- **Audit history** - Your past actions remain for accountability

## Important Considerations

### This is Personal Account Deletion

- **No Admin Required:** You don't need permission
- **Immediate Effect:** Takes effect instantly
- **Cannot Be Undone:** Account cannot be recovered
- **Team Data Protected:** Shared work remains intact

### Understanding Collaboration Data

**What This Means:**
- This removes YOUR ACCESS, not the team's data
- Application is designed for team collaboration
- Shared data (projects, features) belongs to the team
- Your contributions remain available to the team

### When to Delete Your Account

**Good Reasons:**
- ✅ Leaving the company
- ✅ No longer need access
- ✅ Creating new account with different email
- ✅ Cleaning up old/unused accounts

**Wrong Reasons:**
- ❌ Want to delete team data (use Export/Import or Admin panel)
- ❌ Having login issues (try logout/login first)
- ❌ Just want to sign out (use "Logout" instead)

## After Deletion

### Immediate Effects

1. **Logged Out:** Immediately signed out
2. **Cannot Login:** Credentials no longer work
3. **Access Revoked:** Cannot access the board

### Re-Joining the Team

If you want to access the board again:

1. **Create New Account:** Sign up with same or different email
2. **Domain Requirement:** Must use @reactive-technologies.com email
3. **Fresh Start:** New account, no connection to old one
4. **Team Data Available:** All projects/features still there

## Security & Privacy

### Data Retention

**User Record:**
- Deleted from Supabase Auth database
- Cannot be recovered

**Audit Logs:**
- Historical entries show your old username
- Kept for team accountability
- Don't contain personal information
- Provide audit trail for team

**Example Audit Entry:**
```
Project "Mobile App" created by John Smith
[Your old username remains for historical record]
```

### Why Keep Audit History?

- Team accountability and transparency
- Historical record of who did what
- No personal data stored (only username)
- Cannot trace back to deleted account

## Comparison: Self-Delete vs Admin-Delete

| Feature | Delete My Account | Admin Delete User |
|---------|------------------|-------------------|
| **Who can do it?** | Any user (self) | Admin only |
| **Target** | Your own account | Any user account |
| **Confirmation** | Required | Required |
| **Effect** | Removes your access | Removes that user's access |
| **Data affected** | None (team data stays) | None (team data stays) |
| **Can undo?** | No | No |
| **Use case** | Self-service exit | Admin managing team |

## Troubleshooting

### "Failed to delete account" Error

**Possible Causes:**
1. Network connection issue
2. Session expired
3. Server temporarily unavailable

**Solutions:**
1. Check internet connection
2. Try logging out and back in
3. Wait a few minutes and try again
4. Contact administrator if problem persists

### Want to Delete Someone Else's Account?

You cannot delete other users' accounts using this feature.

**To delete another user:**
- You need admin access
- Use Admin Panel → Team Management
- Select the user and click "Delete User"

See [Admin Panel Guide](../admin-guides/ADMIN_PANEL.md) for details.

### Accidentally Deleted Your Account?

⚠️ **Deletion is permanent and cannot be undone.**

- Account immediately removed
- No recovery option exists
- Must create a new account
- Contact team admin for help

## Administrator Perspective

### What Admins Should Know

When a user deletes their own account:

1. **No Notification:** Users can self-delete without notice
2. **User List Updated:** Removed from Admin → User Management
3. **Zero Data Impact:** No effect on projects/features
4. **Audit Trail:** Past actions remain with username

### Preventing Self-Deletion

Currently, users can delete their own accounts by design (user autonomy and privacy).

**If you need stricter controls:**
- Remove the "Delete My Account" button from UI
- Implement approval workflow (custom development)
- Use only Admin-initiated deletion

## Technical Details

### API Endpoint

**Endpoint:** `DELETE /make-server-bbcbebd7/delete-my-account`

**Authentication:** Required (Bearer token)

**Process:**
1. Verify user authentication
2. Delete user via Supabase Admin API
3. Return success response

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Implementation

**Frontend:** `App.tsx`
- Account dropdown menu
- Confirmation dialog (AlertDialog)
- API call to delete endpoint
- Automatic logout on success

**Backend:** `/supabase/functions/server/index.tsx`
- Verifies user authentication
- Calls `supabase.auth.admin.deleteUser()`
- Returns success/error

## Summary

**Key Takeaways:**
- ✅ Self-service account deletion
- ✅ Immediate and permanent
- ✅ Cannot be undone
- ✅ Team data remains intact
- ✅ Can create new account to re-join
- ✅ Audit history preserved for team

**Remember:** This deletes YOUR account, not the team's data! 🔒

## Related Documentation

- [Account Settings](./ACCOUNT_SETTINGS.md) - Manage profile and security
- [Admin Panel](../admin-guides/ADMIN_PANEL.md) - Admin user management
- [Authentication](../getting-started/AUTHENTICATION.md) - Signup and login

---

[← Back to Documentation Index](../README.md)
