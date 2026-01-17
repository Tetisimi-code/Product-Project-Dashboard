# Email Verification Guide

## Overview

The Product-Project Management Board uses email verification to ensure that all user accounts are legitimate and belong to authorized team members.

---

## 🔐 How Email Verification Works

### New User Signup Flow

1. **Sign Up** - User creates an account with email and password
2. **Code Sent** - A 6-digit verification code is sent to their email
3. **Enter Code** - User enters the code in the application
4. **Verified** - Email is verified and user can access the application

### Existing User Login Flow

- **Verified Users** - Log in normally and access immediately
- **Unverified Users** - Must verify email before accessing

---

## ✅ For New Users

### Step 1: Sign Up

1. Click "Sign Up" tab
2. Enter your:
   - Full Name
   - Email (@reactive-technologies.com)
   - Password (minimum 6 characters)
3. Click "Sign Up"

### Step 2: Check Your Email

After signing up, you'll receive an email with:
- **Subject:** "Verify Your Email - Product-Project Management Board"
- **From:** Reactive Technologies
- **Content:** A 6-digit verification code

**Example:**
```
Your verification code is:

   123456

Enter this code in the application to verify your email address.
This code will expire in 15 minutes.
```

### Step 3: Enter Verification Code

1. The app will show a verification screen
2. Enter the 6-digit code from your email
3. Click "Verify Email"

### Step 4: Access the Application

Once verified, you'll be automatically logged in and can start using the application!

---

## 🔄 Resending Verification Code

### If You Didn't Receive the Code

**Common Reasons:**
- Email in spam/junk folder
- Email delayed (wait 1-2 minutes)
- Wrong email address entered

**To Resend:**
1. On the verification screen, click "Didn't receive the code? Resend"
2. A new code will be sent to your email
3. Check your inbox (and spam folder)
4. Enter the new code

**Important Notes:**
- Each code expires after 15 minutes
- Only the most recent code is valid
- Old codes will not work after a new one is sent

---

## ⏱️ Code Expiration

### Timing
- Codes expire **15 minutes** after being sent
- Expired codes cannot be used
- Request a new code if yours expired

### What Happens When Code Expires

If you try to use an expired code:
- ❌ Error: "Verification code has expired"
- ✅ Solution: Click "Resend" for a new code

---

## 🚨 Troubleshooting

### "I didn't receive the verification email"

**Check these:**
1. **Spam/Junk Folder** - Email might be filtered
2. **Wait Time** - Email can take 1-2 minutes
3. **Email Address** - Ensure you used correct email
4. **Resend** - Click resend to get a new code

### "Invalid verification code"

**Possible causes:**
1. **Typo** - Carefully re-enter the code
2. **Expired** - Code expired, request new one
3. **Old Code** - Using an old code after requesting new one
4. **Wrong Email** - Code sent to different email

**Solution:**
- Double-check the code
- Request a new code if needed
- Ensure you're using the latest code

### "Verification code has expired"

**What to do:**
1. Click "Didn't receive the code? Resend"
2. Check email for new code
3. Enter new code within 15 minutes

### "I want to go back to sign up"

**If you made a mistake:**
1. Click "← Back to sign up" on verification screen
2. Sign up again with correct information
3. New verification code will be sent

---

## 🔒 Security Features

### Why Email Verification?

**Benefits:**
1. **Confirms Identity** - Ensures you own the email
2. **Prevents Typos** - Catches wrong email addresses
3. **Security** - Blocks unauthorized signups
4. **Team Only** - Ensures only real team members join

### What We Verify

- ✅ Email address is valid
- ✅ User has access to the email
- ✅ Email domain is @reactive-technologies.com

### What We DON'T Store

- ❌ Verification codes (cleared after verification)
- ❌ Expired codes
- ❌ Email content or inbox data

---

## 📧 Email Details

### Verification Email Contains

**Header:**
- From: Reactive Technologies
- Subject: Verify Your Email - Product-Project Management Board

**Content:**
- Welcome message with your name
- 6-digit verification code (large, centered)
- Expiration notice (15 minutes)
- Security note

**Footer:**
- Company name
- Automated message notice

### Email Not From Us?

**Warning signs of phishing:**
- ❌ Different sender email
- ❌ Asking for password
- ❌ Suspicious links
- ❌ Poor grammar/spelling
- ❌ Threats or urgency

**If suspicious:**
- Don't click any links
- Don't enter any information
- Contact your administrator
- Delete the email

---

## 👤 For Unverified Users Trying to Login

### What Happens

If you try to login before verifying:
1. Login succeeds with correct password
2. App detects unverified email
3. Verification screen appears
4. Must verify before accessing

### Steps to Verify

1. Check your email for original code
2. If expired/missing, click "Resend"
3. Enter the code
4. Access granted!

---

## 🔑 First User Special Case

### Automatic Admin

The **first user** to sign up automatically:
- ✅ Becomes an admin
- ✅ Still requires email verification
- ✅ Can manage other users after verification

This ensures someone can administer the system from day one.

---

## 📱 Multiple Devices

### Same Account, Different Devices

Email verification is **per account**, not per device:
- Verify once when you sign up
- Login from any device without re-verifying
- Same credentials work everywhere

---

## ⚙️ Technical Details

### For Administrators

**Email Service:**
- Uses Resend API for email delivery
- Requires RESEND_API_KEY environment variable
- Emails sent from `onboarding@resend.dev`

**Code Generation:**
- 6-digit numeric code
- Randomly generated
- Unique per user
- Stored in user metadata

**Expiration:**
- 15 minutes from generation
- Timestamp checked server-side
- Expired codes rejected

**Storage:**
- Code stored in user metadata
- Cleared after successful verification
- No permanent code storage

**Rate Limiting:**
- No limit on resend requests
- Each resend invalidates previous code
- Only most recent code is valid

---

## 🎯 Best Practices

### For Users

**Do:**
- ✅ Check email immediately after signup
- ✅ Verify within 15 minutes
- ✅ Check spam folder if not received
- ✅ Request new code if expired
- ✅ Keep email accessible during signup

**Don't:**
- ❌ Share verification codes
- ❌ Wait too long (codes expire)
- ❌ Try to use old codes
- ❌ Ignore email domain requirements

### For Administrators

**Setup:**
- ✅ Configure RESEND_API_KEY
- ✅ Test email delivery
- ✅ Monitor failed verifications
- ✅ Help users with email issues

**Support:**
- ✅ Check spam filters
- ✅ Verify email server working
- ✅ Assist with resend requests
- ✅ Delete and recreate stuck accounts if needed

---

## 📊 Verification States

### User Account States

1. **Unverified** (New Signup)
   - Account created
   - Email not verified
   - Cannot access app
   - Verification code active

2. **Verified** (After Verification)
   - Email confirmed
   - Full access granted
   - Can login normally
   - No code required

3. **Expired Code**
   - Unverified account
   - Code older than 15 minutes
   - Must request new code
   - Cannot access until verified

---

## 🆘 Getting Help

### Self-Service

1. **Check Email** - Inbox and spam
2. **Wait** - Up to 2 minutes for delivery
3. **Resend** - Click resend button
4. **Retry** - Enter code carefully

### Contact Support

If still having issues:
- Contact your team administrator
- Include your email address
- Describe the problem
- Mention any error messages

### Common Solutions

| Problem | Solution |
|---------|----------|
| No email received | Check spam, wait, resend |
| Code expired | Click resend |
| Invalid code | Check for typos, resend |
| Wrong email | Back to signup, re-register |
| Email bounced | Verify email domain |

---

## 🔮 Future Enhancements

### Planned Features

- **SMS Verification** - Optional phone verification
- **Magic Links** - Email links instead of codes
- **2FA** - Two-factor authentication
- **Social Login** - Verify via Google/Microsoft
- **QR Codes** - Mobile app verification

*(Not currently available)*

---

## ✅ Verification Checklist

Before you can access the app:

- [ ] Signed up with @reactive-technologies.com email
- [ ] Received verification email
- [ ] Found 6-digit code in email
- [ ] Entered code within 15 minutes
- [ ] Clicked "Verify Email"
- [ ] Saw success message
- [ ] Logged in successfully

**All done?** Welcome aboard! 🎉

---

## 📞 Quick Reference

| Action | How To |
|--------|--------|
| **Sign Up** | Fill form, click "Sign Up" |
| **Check Email** | Look for verification email |
| **Enter Code** | Type 6-digit code |
| **Verify** | Click "Verify Email" |
| **Resend Code** | Click "Resend" link |
| **Go Back** | Click "← Back to sign up" |
| **Get Help** | Contact administrator |

---

**Security Note:** Never share your verification codes with anyone. Reactive Technologies will never ask for your code via phone, email, or chat.

---

[← Back to Getting Started](./QUICK_START.md) | [Authentication Guide →](./AUTHENTICATION.md)
