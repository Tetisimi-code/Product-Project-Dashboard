# Resend API Key Setup Instructions

## Current Issue

Your application is showing this error:
```
API key is invalid
```

This means the `RESEND_API_KEY` environment variable in Supabase contains an invalid key.

## Quick Fix (5 minutes)

### Step 1: Get a Resend API Key

1. Go to https://resend.com/signup
2. Sign up for a **free account** (no credit card required)
3. Verify your email address
4. In the Resend dashboard, click **"API Keys"** in the sidebar
5. Click **"Create API Key"**
6. Give it a name (e.g., "Product Management Board")
7. **Copy the API key** - it starts with `re_` and is about 50+ characters long
   - ⚠️ **IMPORTANT**: Save it immediately - you won't be able to see it again!

### Step 2: Update Supabase Environment Variable

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings → Edge Functions** (or use this direct link: https://supabase.com/dashboard/project/_/settings/functions)
4. Find the environment variable named `RESEND_API_KEY`
5. Click **"Edit"** or the pencil icon
6. **Paste your Resend API key** (the one starting with `re_`)
7. Click **"Save"** or **"Update"**

### Step 3: Wait and Test

1. Wait **30-60 seconds** for the changes to propagate
2. Go back to your application
3. Try signing up again - you should now receive verification emails!

## How to Verify It's Working

The application now includes a built-in health check:

1. When you try to sign up and see the error, click **"View Full Setup Guide"**
2. Click the **"Check Server Status"** button
3. It will show you:
   - ✅ Whether the API key is configured
   - The key prefix and length
   - Any warnings if something looks wrong

## Expected Results

When properly configured:
- API Key Found: ✅
- Key prefix: `re_...`
- Key length: 50+ characters

## Troubleshooting

### "API Key Missing"
- The environment variable is not set at all
- Go to Supabase settings and add the `RESEND_API_KEY` variable

### "API key seems too short"
- You may have copied only part of the key
- Go back to Resend and create a new API key
- Make sure to copy the entire key

### "Still getting 401 errors"
- The key you entered is invalid or revoked
- Create a new API key in Resend
- Make sure you're copying from the right field
- Wait a full minute after updating the Supabase variable

## IMPORTANT: Resend Free Tier Limitation

⚠️ **Critical Information:**

Resend's free tier has an important restriction:
- **You can only send emails to the email address associated with your Resend account**
- To send to other email addresses (like @reactive-technologies.com), you must verify a domain

### Solution 1: Testing with Your Own Email (Quick)

For immediate testing:
1. Sign up using the **same email address** as your Resend account
2. You'll receive verification emails successfully
3. This works great for testing the application

### Solution 2: Domain Verification (Production)

For production use with multiple users:

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `reactive-technologies.com`)
4. Add the DNS records to your domain provider:
   - Usually TXT records for verification
   - MX records for email delivery
5. Wait for verification (typically 5-15 minutes)
6. Once verified, update the server code in `/supabase/functions/server/index.tsx`:
   ```typescript
   from: 'noreply@reactive-technologies.com',  // Change from 'onboarding@resend.dev'
   ```
7. Now you can send emails to any @reactive-technologies.com address!

## Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Use the built-in health check tool in the setup guide
3. Verify your Resend API key is active in the Resend dashboard
4. Make sure you've waited at least 60 seconds after updating Supabase

## Summary

**The fix is simple:**
1. ✅ Get API key from Resend.com (free, takes 2 minutes)
2. ✅ Paste it into Supabase → Settings → Edge Functions → RESEND_API_KEY
3. ✅ Wait 60 seconds
4. ✅ Try signing up again

That's it! Your email verification will work immediately after this.
