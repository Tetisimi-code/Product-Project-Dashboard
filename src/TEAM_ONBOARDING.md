# Team Onboarding Guide

## Current Limitation

The app is currently in **testing mode** with Resend's free tier, which only allows sending emails to the account owner's email address (`tetisimi.sanni@gmail.com`).

## Solutions for Team Access

### ✅ Solution 1: Verify Domain in Resend (Recommended)

This enables **all @reactive-technologies.com emails** to receive verification emails.

#### Step 1: Verify Your Domain
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `reactive-technologies.com`
4. Follow the instructions to add DNS records

#### Step 2: Add DNS Records
You'll need to add these records at your domain provider (GoDaddy, Namecheap, Cloudflare, etc.):

**SPF Record (TXT)**
```
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record (TXT)**
```
Name: resend._domainkey
Value: [Resend will provide this value]
```

**MX Record** (Optional but recommended)
```
Priority: 10
Value: feedback-smtp.us-east-1.amazonses.com
```

#### Step 3: Wait for Verification
- Verification usually takes 5-15 minutes
- Resend will show a green checkmark when complete

#### Step 4: Update Server Code
Once verified, update the email "from" address in the server code:

**File:** `/supabase/functions/server/index.tsx`

Find this line (around line 290):
```typescript
from: 'onboarding@resend.dev',
```

Change it to:
```typescript
from: 'noreply@reactive-technologies.com',
```

#### Step 5: Test
- Try signing up with any `@reactive-technologies.com` email
- You should receive the verification code email

---

### 🔄 Solution 2: Alternative Email Service

If you don't have access to the domain DNS settings, you can switch to a different email service:

#### Option A: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Update server code to use SendGrid API

#### Option B: AWS SES
1. Set up AWS SES
2. Verify email addresses or domain
3. Update server code to use AWS SES API

#### Option C: Mailgun, Postmark, etc.
Similar process to above services.

---

### ⚠️ Solution 3: Temporary Workaround (Not Recommended)

For quick testing only, you can:

1. **Share the test email** - All team members use `tetisimi.sanni@gmail.com` to receive codes
   - Not practical for real team use
   - Security concerns

2. **Skip email verification** (requires code changes)
   - Remove email verification requirement
   - Manually create users via admin panel
   - Not recommended for production

---

## Recommended Approach

**For Production Use:**
1. ✅ Verify `reactive-technologies.com` domain in Resend (Solution 1)
2. This is free and takes ~15 minutes
3. Enables unlimited team members

**For Immediate Testing:**
1. Use `tetisimi.sanni@gmail.com` for initial setup
2. Then verify the domain for team access

---

## After Domain Verification

Once your domain is verified:

✅ **All team members can sign up** with their @reactive-technologies.com emails
✅ **Email verification works** for everyone
✅ **Admin controls** still apply (admin approval, role management)
✅ **No code changes needed** except updating the "from" address

---

## Need Help?

**Domain verification issues?**
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- DNS changes can take up to 48 hours (usually much faster)

**Can't access domain DNS?**
- Contact your IT department or domain administrator
- They'll need to add the DNS records Resend provides

**Still having issues?**
- Check Resend documentation: [resend.com/docs](https://resend.com/docs)
- Contact Resend support (very responsive)
