# Email Domain Restriction Guide

## Overview

The Product-Project Management Board restricts signups to specific email domains, ensuring only authorized users with company email addresses can create accounts.

## Current Configuration

**Allowed Domain:**
- `reactive-technologies.com`

Only users with `@reactive-technologies.com` email addresses can sign up.

## How It Works

### Two-Layer Validation

#### 1. Frontend Validation
- Immediate feedback before submitting
- Red error message for wrong domain
- Blue info box shows allowed domains
- Prevents unnecessary API calls

#### 2. Server Validation
- Enforces restriction on backend
- Double-checks email domain
- Returns 403 error if domain not allowed
- Prevents bypass attempts

### User Experience

**With Allowed Email:**
```
Email: john@reactive-technologies.com
✅ Account created successfully
```

**With Disallowed Email:**
```
Email: john@gmail.com
❌ Only reactive-technologies.com email addresses are allowed
```

## Changing Allowed Domains

### Step 1: Update Server Configuration

Edit `/supabase/functions/server/index.tsx`:

```typescript
// Configuration: Allowed email domains
const ALLOWED_EMAIL_DOMAINS = [
  'yourcompany.com',     // Your primary domain
  'yourcompany.co.uk',   // International domains
  'subsidiary.com',      // Subsidiary companies
];
```

### Step 2: Update Frontend Configuration

Edit `/components/AuthDialog.tsx`:

```typescript
// Configuration: Allowed email domains (must match server)
const ALLOWED_EMAIL_DOMAINS = [
  'yourcompany.com',
  'yourcompany.co.uk',
  'subsidiary.com',
];
```

### Step 3: Update Account Settings

Edit `/components/AccountSettingsDialog.tsx`:

```typescript
// Configuration: Allowed email domains (must match server)
const ALLOWED_EMAIL_DOMAINS = [
  'yourcompany.com',
  'yourcompany.co.uk',
  'subsidiary.com',
];
```

**⚠️ Important:** All three configurations must match exactly!

## Configuration Examples

### Single Domain

Only allow `@company.com` emails:

```typescript
const ALLOWED_EMAIL_DOMAINS = [
  'company.com',
];
```

### Multiple Domains

Allow multiple company domains:

```typescript
const ALLOWED_EMAIL_DOMAINS = [
  'company.com',
  'company.co.uk',
  'company.net',
  'companygroup.com',
];
```

### Contractors/Partners

Allow external partners:

```typescript
const ALLOWED_EMAIL_DOMAINS = [
  'yourcompany.com',
  'partnerfirm.com',
  'contractor.net',
];
```

## Testing

### Test Valid Email

1. Click "Sign Up"
2. Enter name: `Test User`
3. Enter email: `test@reactive-technologies.com`
4. Enter password: `password123`
5. Click "Sign Up"
6. ✅ Should succeed

### Test Invalid Email

1. Click "Sign Up"
2. Enter name: `Test User`
3. Enter email: `test@gmail.com`
4. Try to submit
5. ❌ Should show error message immediately

## Security Considerations

### Why Restrict Email Domains?

1. **Access Control** - Only company employees can access
2. **Data Protection** - Prevents unauthorized external access
3. **Compliance** - Meets corporate security policies
4. **Accountability** - All users have verifiable company emails
5. **Reduced Risk** - Limits attack surface

### What This Does NOT Prevent

⚠️ **Important Limitations:**

- Does not verify person actually works at your company
- Does not prevent account sharing
- Does not enforce email verification (auto-confirmed currently)
- Does not prevent former employees from keeping access

### Recommended Additional Security

1. **Email Verification**
   - Configure Supabase to send verification emails
   - Require email confirmation before access

2. **Regular Audits**
   - Review user list in Admin panel monthly
   - Check for suspicious accounts
   - Verify active users are current employees

3. **Offboarding Process**
   - Delete users immediately when they leave
   - Document departures
   - Review access list

4. **Password Policy**
   - Currently 6+ characters (minimum)
   - Consider stronger requirements
   - Enforce password complexity

5. **Multi-Factor Authentication**
   - Add MFA for additional security
   - Requires custom implementation
   - Consider for admin accounts first

## Troubleshooting

### Users Can't Sign Up

**Check:**
1. Is their email domain in the allowed list?
2. Are they typing email correctly?
3. Is domain spelled exactly as configured?
4. Does the domain match (case-insensitive)?
5. Any extra spaces or special characters?

**Solutions:**
- Verify domain configuration in all three files
- Check for typos
- Compare server and frontend configs
- Test with a known-good email

### Domain Not Working

**Verify:**
1. All three files updated (server, AuthDialog, AccountSettings)?
2. Domain spelled correctly in all three?
3. No extra spaces or special characters?
4. Server redeployed after changes?
5. Cache cleared in browser?

**Solutions:**
- Double-check all three configurations
- Restart the application
- Clear browser cache
- Check server logs for errors

### Error: "Only X domains are allowed"

This is working correctly! The user's email domain is not in the allowed list.

**Solutions:**
- Add their domain to all three configurations
- Have them use an approved email address
- Check for typos in their email
- Verify domain is spelled correctly

## Advanced Configuration

### Case Sensitivity

Domains are checked **case-insensitively**:
- `user@COMPANY.COM` ✅ Works
- `user@Company.Com` ✅ Works
- `user@company.com` ✅ Works

All convert to lowercase for comparison.

### Subdomain Matching

Currently requires **exact domain match**:
- Allowed: `company.com`
- `user@company.com` ✅ Works
- `user@mail.company.com` ❌ Does not work

To allow subdomains, you'd need custom validation logic.

### Wildcard Domains

Not currently supported. Each domain must be listed explicitly.

**Future enhancement:** Pattern matching for subdomains.

## Migration Notes

### Existing Users

- Users who already have accounts are not affected
- They can continue logging in regardless of domain
- Restriction only applies to new signups

### To Restrict Existing Users

1. Export current user list from Admin panel
2. Manually review each user's email
3. Delete users with non-approved domains via Admin panel
4. They will be unable to login after deletion

### Bulk Updates

If you need to change many domains:

1. Export backup first
2. Update all three configuration files
3. Test with one signup
4. Verify it works
5. Notify team of new domains

## Admin Email Changes

Administrators can change their own email to a different allowed domain:

1. Click "Account" → "Account Settings"
2. Scroll to "Change Email Address" (admin only)
3. Click "Change Email Address"
4. Enter new email (must be in allowed domains)
5. Click "Update Email"
6. You'll be logged out
7. Sign in with new email

**Validation:**
- New email must be in allowed domains list
- Server checks domain before updating
- Cannot bypass restriction

## Summary

Email domain restrictions provide simple but effective access control for your Product-Project Management Board.

**Quick Reference:**
- 📝 **Configure:** Edit `ALLOWED_EMAIL_DOMAINS` in three files
- ✅ **Validates:** Frontend (UX) + Backend (security)
- 🔒 **Restricts:** New signups and email changes
- 👥 **Manage:** Use Admin panel to remove unauthorized users

**Three Files to Update:**
1. `/supabase/functions/server/index.tsx`
2. `/components/AuthDialog.tsx`
3. `/components/AccountSettingsDialog.tsx`

**Remember:** Keep all three configurations in sync! 🔐

## Related Documentation

- [Admin Panel](./ADMIN_PANEL.md) - User management
- [User Management](./USER_MANAGEMENT.md) - Managing team members
- [Authentication](../getting-started/AUTHENTICATION.md) - Signup and login

---

[← Back to Documentation Index](../README.md)
