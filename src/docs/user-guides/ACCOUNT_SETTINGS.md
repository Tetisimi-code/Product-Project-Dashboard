# Account Settings Guide

## Overview

Manage your personal account information, security settings, and email through the Account Settings dialog.

## Accessing Account Settings

1. Click the **"Account"** button in the top-right corner
2. Select **"Account Settings"** from the dropdown menu
3. The settings dialog opens with multiple sections

## Profile Information

### Update Your Name

Your display name appears in:
- Account menu
- Activity log entries
- User lists (admin view)

**To update:**
1. Edit the **"Full Name"** field
2. Click **"Update Profile"**
3. Success notification confirms the change

## Security Settings

### Change Your Password

**Requirements:**
- Current password (for verification)
- New password (minimum 6 characters)
- Confirm new password (must match)

**Steps:**
1. Scroll to **"Change Password"** section
2. Enter your **current password**
3. Enter your **new password**
4. Re-enter new password in **"Confirm New Password"**
5. Click **"Update Password"**

**What happens:**
- ✅ Password verified against current one
- ✅ New password saved
- ✅ Success notification appears
- ✅ You stay logged in
- ✅ Use new password for future logins

**Troubleshooting:**
- **"Passwords do not match"** - Verify confirmation field
- **"Current password is incorrect"** - Check your current password
- **"Password too short"** - Must be at least 6 characters

## Email Management (Admin Only)

### Change Your Email Address

⚠️ **Admin Only Feature** - Only administrators can change their email.

**Requirements:**
- Must be an administrator
- New email must be @reactive-technologies.com
- Different from current email
- **You will be logged out after changing**

**Steps:**
1. Scroll to **"Change Email Address"** section
2. Click **"Change Email Address"** button
3. Read the warning about being logged out
4. Enter your **new email address**
5. Click **"Update Email"**
6. You'll be automatically logged out
7. **Sign in with your new email** (same password)

**What happens:**
- ✅ Email updated in database
- ✅ Automatic logout for security
- ✅ Must sign in with new email
- ✅ Password remains the same
- ✅ All your data preserved

**Why logout is required:**
- Security best practice
- Ensures new email is verified
- Prevents session confusion
- Forces re-authentication

## Account Deletion

### Delete Your Account

⚠️ **Warning:** This action is permanent and cannot be undone!

**What gets deleted:**
- ✅ Your user account
- ✅ Your login credentials
- ✅ Your access to the application

**What stays:**
- ✅ All team projects
- ✅ All features
- ✅ All audit log entries
- ✅ Other users' accounts

**To delete your account:**
1. Click **"Account"** → **"Delete My Account"**
2. Read the confirmation dialog carefully
3. Click **"Delete My Account"** to confirm
4. You'll be immediately logged out
5. Account permanently removed

For more details, see [Account Deletion Guide](./ACCOUNT_DELETION.md).

## Best Practices

### Password Security

**Strong Password Tips:**
- Use at least 12 characters
- Mix uppercase and lowercase
- Include numbers and symbols
- Don't reuse passwords from other sites
- Change password if you suspect compromise

**When to Change Password:**
- ✅ Regularly (every 90 days recommended)
- ✅ If you suspect unauthorized access
- ✅ After sharing password accidentally
- ✅ When leaving a shared computer

### Email Changes

**Before Changing Email:**
- ✅ Export a backup of your data
- ✅ Inform team members
- ✅ Ensure new email is accessible
- ✅ Remember your password (you'll need it to sign in with new email)

**After Changing Email:**
- ✅ Sign in with new email
- ✅ Verify everything works
- ✅ Update any saved credentials
- ✅ Test creating/editing projects

### Profile Updates

**Keep Your Name Current:**
- Use your real name for audit trail clarity
- Update if your name changes
- Be consistent with team naming conventions

## Troubleshooting

### Cannot Update Profile

**Problem:** Changes not saving  
**Solutions:**
- Check internet connection
- Verify you're logged in
- Try logging out and back in
- Check browser console for errors

### Password Update Fails

**Problem:** "Current password is incorrect"  
**Solutions:**
- Verify current password spelling
- Check caps lock key
- Try resetting password (contact admin)

**Problem:** "Passwords do not match"  
**Solutions:**
- Retype both new password fields carefully
- Check for extra spaces
- Verify passwords match exactly

### Email Change Not Working

**Problem:** Email change rejected  
**Solutions:**
- Verify you're an administrator
- Check email domain (@reactive-technologies.com)
- Ensure new email is different from current
- Make sure email isn't already in use

**Problem:** Can't login after email change  
**Solutions:**
- Use NEW email address (not old one)
- Password remains the same
- Check email spelling carefully
- Clear browser cache and try again

### Account Deletion Issues

**Problem:** Can't delete account  
**Solutions:**
- Check internet connection
- Verify you're logged in
- Try refreshing the page
- Contact administrator

## Technical Details

### Data Storage

**Where Settings are Stored:**
- **Name:** Supabase Auth user_metadata
- **Email:** Supabase Auth email field
- **Password:** Hashed in Supabase Auth

**API Endpoints:**
- `POST /update-profile` - Update user metadata
- `POST /update-email` - Change email (admin only)
- Password changes use Supabase Auth API directly

### Security

**Password Security:**
- Passwords are hashed using bcrypt
- Never transmitted in plain text
- Current password verified before change
- Secure HTTPS connection required

**Email Validation:**
- Server-side domain checking
- Duplicate email prevention
- Auto-confirmation (no email sent)
- Admin role verification

## Related Documentation

- [Authentication Guide](../getting-started/AUTHENTICATION.md) - Login and signup
- [Account Deletion](./ACCOUNT_DELETION.md) - Detailed deletion guide
- [Admin Panel](../admin-guides/ADMIN_PANEL.md) - Admin user management

---

[← Back to Documentation Index](../README.md)
