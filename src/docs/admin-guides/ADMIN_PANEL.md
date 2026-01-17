# Admin Panel Guide

Complete guide to user management and admin controls.

## Overview

The Admin Panel provides complete control over user management, allowing administrators to view all team members and manage user accounts.

## Accessing the Admin Panel

1. **Login** with an admin account
2. Navigate to the **Admin** tab (shield icon) in the main navigation
3. View the list of all registered users

**Note:** Only users with admin role can access this panel.

## Features

### View All Users

The admin panel displays comprehensive user information:

- ✅ **User Name** - Full name from signup
- ✅ **Email Address** - Login email
- ✅ **Role** - Admin or Regular user
- ✅ **Join Date** - Account creation timestamp
- ✅ **Last Login** - Most recent sign-in time
- ✅ **Current User Indicator** - "You" badge for your account

### User Management Actions

#### Delete Users

**To remove a team member:**

1. Locate the user in the list
2. Click the **"Delete"** button next to their name
3. Confirm deletion in the dialog
4. User account is permanently removed

**Important Notes:**
- ⚠️ Deletion is **permanent and cannot be undone**
- ⚠️ You **cannot delete your own account** from admin panel
- ⚠️ Deleted user is immediately logged out
- ⚠️ Their data contributions (projects, features) remain in the system
- ⚠️ Activity log retains their username for audit trail

#### Refresh User List

- Click the **"Refresh"** button (circular arrow icon)
- Reloads user list with latest data
- Use after expecting account changes

## Admin Role Management

### Who is an Admin?

Administrators are users with elevated privileges:

- Access to Admin Panel
- Ability to delete other users
- Ability to change their own email
- View all user accounts

### Making Someone an Admin

**Current Method:**
1. Access the Admin Panel
2. Locate the user
3. Click **"Make Admin"** button
4. User gains admin privileges

**Server-Side Protection:**
- Admin status checked on every request
- Role stored in user metadata
- Cannot be bypassed from frontend

### Removing Admin Privileges

**Current Method:**
1. Access the Admin Panel
2. Locate the admin user
3. Click **"Remove Admin"** button  
4. User becomes regular user

**Note:** You cannot remove your own admin status.

## Security Considerations

### Admin Access Control

**Protected Features:**
- Admin panel access
- User deletion
- Email changes (admin only)
- Role modifications

**Server-Side Verification:**
- Every admin action verified on server
- Bearer token authentication required
- Admin role checked in database
- Cannot be spoofed from frontend

### Best Practices

1. **Limit Admin Accounts**
   - Only grant admin to trusted users
   - Minimum necessary principle
   - Review admin list regularly

2. **Communication**
   - Notify users before deletion
   - Document admin changes
   - Coordinate with team

3. **Regular Audits**
   - Review user list monthly
   - Remove inactive users
   - Verify admin assignments

4. **Backup First**
   - Export data before deletions
   - Keep audit trail
   - Document major changes

## Use Cases

### Remove Former Team Members

When someone leaves your organization:

1. Navigate to Admin Panel
2. Find their account
3. Click **"Delete"**
4. Confirm removal
5. Their access is revoked immediately

**What happens:**
- User cannot log in
- Projects and features remain
- Activity log shows their past actions
- Other users unaffected

### Clean Up Test Accounts

Remove duplicate or test accounts:

1. Identify test accounts in list
2. Delete each one
3. Verify production accounts remain

### Manage Team Size

Monitor and control team access:

- View total user count
- Check last login dates
- Identify inactive accounts
- Remove as needed

### Verify Active Users

Check who's actively using the system:

- Sort by last login date
- Identify inactive users
- Follow up as needed

## Troubleshooting

### Can't Delete a User

**Possible Reasons:**
- Trying to delete yourself (not allowed)
- Network connection issue
- User already deleted by another admin
- Session expired

**Solutions:**
1. Refresh the page
2. Verify internet connection
3. Check browser console for errors
4. Log out and log back in

### User List Not Loading

**Solutions:**
1. Check internet connection
2. Click the **"Refresh"** button
3. Log out and log in again
4. Check browser console for errors
5. Verify you have admin access

### Deleted User Can Still Login

This shouldn't happen. If it does:

1. Verify deletion was successful (check user list)
2. User might have cached session
3. Have user log out and try again
4. Delete user again if they reappear
5. Check server logs for errors

### Can't Access Admin Panel

**Problem:** Admin tab not visible  
**Solutions:**
- Verify you have admin role
- Ask another admin to grant you access
- Check with system administrator
- Log out and log back in

## Technical Details

### API Endpoints

**List Users:**
```
GET /make-server-bbcbebd7/admin/users
Authorization: Bearer {accessToken}
```

Returns all user accounts with metadata.

**Delete User:**
```
DELETE /make-server-bbcbebd7/admin/users/:userId
Authorization: Bearer {accessToken}
```

Permanently removes a user account.

**Grant Admin:**
```
POST /make-server-bbcbebd7/admin/grant-admin
Authorization: Bearer {accessToken}
Body: { userId: string }
```

Grants admin privileges to a user.

**Revoke Admin:**
```
POST /make-server-bbcbebd7/admin/revoke-admin
Authorization: Bearer {accessToken}
Body: { userId: string }
```

Removes admin privileges from a user.

### Authentication

All admin endpoints require:
- Valid authentication token (Bearer token)
- Active admin session
- Admin role in user metadata

### Data Retention

When a user is deleted:

- ✅ **Kept:** All projects, features, and audit logs they created
- ❌ **Removed:** Their user account
- ❌ **Removed:** Their authentication credentials
- ❌ **Removed:** Their ability to login

### Admin Verification

**Server-side function:**
```typescript
async function verifyAdmin(authHeader) {
  const token = authHeader?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (!user || user.user_metadata?.role !== 'admin') {
    return null;
  }
  
  return user;
}
```

Used on all protected admin routes.

## Future Enhancements

Potential improvements:

### Role-Based Permissions

- Multiple role types (Admin, Manager, User)
- Granular permissions per role
- Custom role creation

### Bulk Operations

- Delete multiple users at once
- Export user list to CSV
- Bulk role assignment

### User Suspension

- Temporarily disable accounts
- Re-enable suspended users
- Suspension reason tracking

### Audit Trail for Admin Actions

- Log all user deletions
- Track role changes
- Record admin actions in Activity Log

### User Invitation System

- Send email invites to new members
- Pre-register users before signup
- Approval workflow for signups

## Summary

The Admin Control Panel provides complete control over team access and user management. Use it responsibly to maintain security and team organization.

**Key Capabilities:**
- ✅ View all user accounts
- ✅ Delete user accounts
- ✅ Grant/revoke admin privileges
- ✅ Monitor user activity
- ✅ Control team access

**Remember:** With great power comes great responsibility! 🛡️

## Related Documentation

- [User Management](./USER_MANAGEMENT.md) - Detailed user management
- [Email Restrictions](./EMAIL_RESTRICTIONS.md) - Domain-based access control
- [Authentication](../getting-started/AUTHENTICATION.md) - User accounts and login

---

[← Back to Documentation Index](../README.md)
