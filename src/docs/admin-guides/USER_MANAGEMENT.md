# User Management Guide

Complete guide for administrators managing team members and user accounts.

## Overview

As an administrator, you're responsible for controlling who has access to the Product-Project Management Board and maintaining team security.

## Key Responsibilities

### Access Control
- Approve appropriate users
- Remove unauthorized access
- Monitor email domain compliance
- Enforce security policies

### Team Management
- Onboard new team members
- Offboard departing employees
- Grant/revoke admin privileges
- Maintain user list accuracy

### Monitoring
- Review user activity
- Check last login dates
- Identify inactive accounts
- Audit admin access

## Common Tasks

### Adding New Users

**Process:**
1. New user signs up at the login page
2. Must use @reactive-technologies.com email
3. Account created automatically after signup
4. You'll see them in Admin Panel

**Your Role:**
- Verify new users are legitimate
- Check they're using correct email domain
- Grant admin role if needed
- Delete any test/unauthorized accounts

### Removing Users

**When to Remove:**
- Employee leaves company
- Contract ends
- Account no longer needed
- Duplicate/test accounts
- Security concern

**How to Remove:**
1. Navigate to Admin Panel
2. Find the user in the list
3. Click **"Delete"** button
4. Confirm deletion
5. User is immediately logged out

See [Admin Panel Guide](./ADMIN_PANEL.md) for detailed instructions.

### Granting Admin Access

**When to Grant:**
- Team lead/manager role
- Needs user management capabilities
- Requires admin panel access
- Trusted senior team member

**How to Grant:**
1. Navigate to Admin Panel
2. Find the user
3. Click **"Make Admin"** button
4. User gains admin privileges immediately

**Considerations:**
- Only grant to trusted users
- Document all admin grants
- Review admin list regularly
- Follow principle of least privilege

### Revoking Admin Access

**When to Revoke:**
- Role change
- No longer needs admin access
- Security concern
- Leaving team (delete instead)

**How to Revoke:**
1. Navigate to Admin Panel
2. Find the admin user
3. Click **"Remove Admin"** button
4. User becomes regular user

**Note:** Cannot revoke your own admin status.

## Onboarding New Team Members

### Step 1: Communication

Before they sign up:
- Send app URL
- Explain email requirement (@reactive-technologies.com)
- Provide quick start guide
- Set expectations for usage

### Step 2: Account Creation

User self-signs up:
- They visit the app
- Click "Sign Up"
- Enter their details
- Account created automatically

### Step 3: Verification

After signup:
- Check Admin Panel for new account
- Verify correct email domain
- Confirm legitimate user
- Grant admin if needed

### Step 4: Orientation

Help them get started:
- Walk through main features
- Show how to create projects
- Explain activity log
- Answer questions

## Offboarding Team Members

### Immediate Actions

When someone leaves:
1. **Delete their account** (Admin Panel → Delete)
2. **Verify deletion** (check user list)
3. **Document departure** (export audit log)
4. **Review their work** (check recent activity)

### What Happens

After deletion:
- ✅ User cannot log in
- ✅ Access immediately revoked
- ✅ Their projects/features remain
- ✅ Activity log shows their past work
- ✅ Team data unaffected

### Best Practices

- Delete accounts on last day of employment
- Export data before deletion (optional backup)
- Review their recent changes
- Reassign ownership if needed (mental note)
- Update team documentation

## Monitoring User Activity

### Last Login Check

Regular review:
1. Open Admin Panel
2. Check "Last Login" column
3. Identify inactive users
4. Follow up as needed

**Frequency:**
- Monthly for small teams
- Weekly for large teams
- After major events
- Before security audits

### Activity Log Review

Check what users are doing:
1. Open Activity Log tab
2. Review recent changes
3. Look for unusual activity
4. Verify changes are appropriate

**Red Flags:**
- Many rapid deletions
- Off-hours activity
- Unexpected changes
- Unfamiliar user names

### Admin Access Audit

Verify admin list:
1. Review current admins
2. Confirm all need access
3. Remove unnecessary access
4. Document changes

**When to Audit:**
- Quarterly at minimum
- After personnel changes
- Before security reviews
- When concerns arise

## Security Best Practices

### Email Domain Enforcement

**Current:** @reactive-technologies.com only

**Maintain by:**
- Regularly check user emails
- Delete non-compliant accounts
- Verify configuration hasn't changed
- Test signup process periodically

See [Email Restrictions Guide](./EMAIL_RESTRICTIONS.md) for details.

### Admin Privileges

**Minimize admin count:**
- Only grant when necessary
- Review regularly
- Remove when no longer needed
- Document all grants/revokes

**Admin responsibilities:**
- User management
- Security enforcement
- Regular audits
- Documentation

### Password Policy

**Current requirements:**
- Minimum 6 characters
- No complexity requirements

**Recommendations:**
- Encourage strong passwords
- Consider implementing stricter policy
- Educate users on password security
- Don't share accounts

### Regular Audits

**Monthly checklist:**
- □ Review user list
- □ Check admin assignments
- □ Verify email domains
- □ Review activity log
- □ Delete inactive accounts
- □ Update documentation
- □ Export backup

## Troubleshooting

### User Can't Sign Up

**Common causes:**
- Wrong email domain
- Typo in email
- Browser issues
- Server problems

**Solutions:**
1. Verify they're using @reactive-technologies.com
2. Check for typos
3. Try different browser
4. Check server status

### User Can't Login

**Common causes:**
- Wrong password
- Account deleted
- Session expired
- Browser cache

**Solutions:**
1. Verify account exists (check Admin Panel)
2. Have them try password reset
3. Clear browser cache
4. Re-create account if deleted

### Admin Panel Not Loading

**Common causes:**
- Not an admin
- Session expired
- Network issue
- Server problem

**Solutions:**
1. Verify admin status
2. Log out and back in
3. Check internet connection
4. Try refreshing page

### Can't Delete User

**Common causes:**
- Trying to delete yourself
- Network issue
- Already deleted
- Permission issue

**Solutions:**
1. Use different admin account to delete yourself
2. Check internet connection
3. Refresh and try again
4. Check browser console for errors

## Documentation & Compliance

### Record Keeping

**Maintain records of:**
- User additions (automatic via audit log)
- User deletions (document externally)
- Admin grants/revokes
- Security incidents
- Policy changes

**Methods:**
- Export regular backups
- Keep external documentation
- Use Activity Log
- Maintain change log

### Compliance Requirements

Depending on your industry:
- User access records
- Change audit trails
- Security policies
- Data retention
- Access control documentation

**Resources:**
- Activity Log (built-in)
- Export/Import for backups
- External documentation system
- Regular reports

## Communication

### With Team

**Keep team informed:**
- New user additions
- Departures
- Policy changes
- Security updates
- Maintenance windows

**Methods:**
- Team meetings
- Email announcements
- Slack/Teams messages
- Documentation updates

### With New Users

**Initial communication:**
- App URL and access instructions
- Email domain requirement
- Quick start guide
- Contact for questions

**Follow-up:**
- Check they successfully signed up
- Verify they can access
- Answer questions
- Provide training

## Best Practices Summary

**Daily:**
- Monitor for new signups
- Check for unusual activity

**Weekly:**
- Review Activity Log
- Verify active users

**Monthly:**
- Full user list audit
- Admin access review
- Export backup
- Update documentation

**Quarterly:**
- Security review
- Policy updates
- Compliance check
- Team training

**As Needed:**
- Onboard new users
- Offboard departing users
- Grant/revoke admin
- Handle security incidents

## Related Documentation

- [Admin Panel](./ADMIN_PANEL.md) - Detailed admin panel guide
- [Email Restrictions](./EMAIL_RESTRICTIONS.md) - Domain configuration
- [Authentication](../getting-started/AUTHENTICATION.md) - User accounts
- [Activity Log](../user-guides/AUDIT_LOG.md) - Tracking changes

---

[← Back to Documentation Index](../README.md)
