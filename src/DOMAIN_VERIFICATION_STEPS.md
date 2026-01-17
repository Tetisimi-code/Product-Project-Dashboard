# Domain Verification - Step by Step

## 🎯 Goal
Enable all team members with @reactive-technologies.com emails to sign up.

**Time Required:** 15-30 minutes  
**Difficulty:** Easy (no coding experience needed)

---

## Step 1: Access Resend Dashboard

1. Go to [resend.com](https://resend.com)
2. Log in with your account (the one that has the API key)
3. Navigate to **"Domains"** in the left sidebar
   - Or go directly to: [resend.com/domains](https://resend.com/domains)

---

## Step 2: Add Your Domain

1. Click the **"Add Domain"** button
2. Enter: `reactive-technologies.com`
3. Click **"Add"**

Resend will now show you DNS records to add.

---

## Step 3: Copy DNS Records

You'll see 3 records. Keep this page open - you'll need these values!

### Record 1: SPF Record
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:_spf.resend.com ~all
```

### Record 2: DKIM Record
```
Type: TXT
Name: resend._domainkey
Value: [Long random string - copy from Resend]
```

### Record 3: MX Record (Optional)
```
Type: MX
Priority: 10
Value: feedback-smtp.us-east-1.amazonses.com
```

---

## Step 4: Add DNS Records to Your Domain

### Where to go:
Find where you manage your domain's DNS settings. This depends on your provider:

#### If using **GoDaddy**:
1. Go to [godaddy.com](https://godaddy.com)
2. Click "My Products"
3. Find "Domains" → Click "DNS"
4. Click "Add" for each record

#### If using **Namecheap**:
1. Go to [namecheap.com](https://namecheap.com)
2. Click "Domain List"
3. Click "Manage" next to reactive-technologies.com
4. Click "Advanced DNS"
5. Click "Add New Record"

#### If using **Cloudflare**:
1. Go to [cloudflare.com](https://cloudflare.com)
2. Select `reactive-technologies.com`
3. Click "DNS" tab
4. Click "Add record"

#### If using **Google Domains**:
1. Go to [domains.google.com](https://domains.google.com)
2. Click on reactive-technologies.com
3. Click "DNS"
4. Scroll to "Custom records"

### How to add each record:

#### For TXT Records (SPF & DKIM):
- **Type/Record Type:** TXT
- **Name/Host:** 
  - For SPF: `@` or leave blank
  - For DKIM: `resend._domainkey`
- **Value/Data:** Paste the value from Resend
- **TTL:** 3600 (or leave as default)

#### For MX Record:
- **Type/Record Type:** MX
- **Priority:** 10
- **Value/Data:** `feedback-smtp.us-east-1.amazonses.com`
- **TTL:** 3600 (or leave as default)

---

## Step 5: Verify in Resend

1. Go back to Resend dashboard
2. Click **"Verify Records"** button
3. Wait for verification...

### What to expect:
- ✅ **Green checkmark** = Success! (Usually 5-15 minutes)
- ⏳ **Pending** = Wait a bit longer
- ❌ **Error** = Double-check your DNS records

**Pro tip:** DNS changes can take up to 48 hours, but usually happen in 5-15 minutes.

---

## Step 6: Update Server Code

Once you see the green checkmark in Resend:

1. Open file: `/supabase/functions/server/index.tsx`
2. Find line ~290 that says:
   ```typescript
   from: 'onboarding@resend.dev',
   ```
3. Change it to:
   ```typescript
   from: 'noreply@reactive-technologies.com',
   ```
4. Save the file

**Note:** You can use any email address on your domain, like:
- `team@reactive-technologies.com`
- `noreply@reactive-technologies.com`
- `verify@reactive-technologies.com`

---

## Step 7: Test!

1. Try signing up with a @reactive-technologies.com email
2. Check that you receive the verification email
3. Complete the signup process

### Success looks like:
```
From: noreply@reactive-technologies.com
To: yourname@reactive-technologies.com
Subject: Verify your email for Reactive Technologies

Your verification code is: 123456
```

---

## 🎉 Done!

Your team can now sign up with any @reactive-technologies.com email address!

---

## 🆘 Troubleshooting

### "Domain verification pending"
**Solution:** Wait longer. DNS can take time to propagate.
- Check status: [whatsmydns.net](https://whatsmydns.net)
- Enter your domain and select "TXT" record type
- Should see the SPF and DKIM records globally

### "Records not found"
**Solution:** Double-check DNS records
- Make sure you didn't include extra spaces
- Verify the record names are exact
- Check you added them to the right domain

### "Still can't send to team emails"
**Solution:** 
1. Verify the green checkmark appears in Resend
2. Make sure you updated the `from:` address in the code
3. Try a different email on your domain (not onboarding@resend.dev)
4. Clear your browser cache

### "I don't have DNS access"
**Solution:** 
- Contact your IT department or domain administrator
- Send them this guide
- They'll need to add the 3 DNS records

---

## 📞 Need Help?

- **Resend Support:** [resend.com/support](https://resend.com/support)
- **Resend Docs:** [resend.com/docs/dashboard/domains/introduction](https://resend.com/docs/dashboard/domains/introduction)
- **DNS Checker:** [whatsmydns.net](https://whatsmydns.net)

---

## ✅ Verification Checklist

Before you start:
- [ ] I have access to Resend account
- [ ] I have access to domain DNS settings (or know who does)
- [ ] I have 15-30 minutes to complete this

After completion:
- [ ] Green checkmark in Resend dashboard
- [ ] All 3 DNS records added
- [ ] Server code updated with new `from:` address
- [ ] Tested signup with team email - success!

---

## 🎓 What You Just Did

You configured email authentication for your domain, which:
- ✅ Proves you own reactive-technologies.com
- ✅ Prevents your emails from going to spam
- ✅ Allows sending to any email on your domain
- ✅ Makes your verification emails look professional

**This is a one-time setup!** Once done, it works forever.
