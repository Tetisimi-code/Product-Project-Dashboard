# Enable Team Access - Quick Guide

## 🎯 Goal
Enable all @reactive-technologies.com team members to sign up and receive verification emails.

---

## 📋 Checklist

### 1️⃣ Verify Domain (15 minutes)

- [ ] Go to [resend.com/domains](https://resend.com/domains)
- [ ] Click "Add Domain"
- [ ] Enter: `reactive-technologies.com`
- [ ] Copy the DNS records Resend provides
- [ ] Add DNS records at your domain provider
- [ ] Wait for green checkmark (5-15 min)

### 2️⃣ Update Code (2 minutes)

**File:** `/supabase/functions/server/index.tsx`

**Find (around line 290):**
```typescript
from: 'onboarding@resend.dev',
```

**Replace with:**
```typescript
from: 'noreply@reactive-technologies.com',
```

### 3️⃣ Test

- [ ] Try signing up with a @reactive-technologies.com email
- [ ] Check that verification email arrives
- [ ] Complete signup flow

---

## 📝 DNS Records to Add

You'll need to add these at your domain provider (GoDaddy, Namecheap, Cloudflare, etc.):

### Record 1: SPF (TXT)
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or default)
```

### Record 2: DKIM (TXT)
```
Name: resend._domainkey
Type: TXT
Value: [Copy from Resend dashboard]
TTL: 3600 (or default)
```

### Record 3: MX (Optional)
```
Type: MX
Priority: 10
Value: feedback-smtp.us-east-1.amazonses.com
TTL: 3600 (or default)
```

---

## 🔍 Where to Find DNS Settings

Common domain providers:

| Provider | DNS Settings Location |
|----------|----------------------|
| **GoDaddy** | My Products → Domain → DNS → Manage DNS |
| **Namecheap** | Domain List → Manage → Advanced DNS |
| **Cloudflare** | Select domain → DNS → Records |
| **Google Domains** | My domains → DNS |
| **AWS Route 53** | Hosted zones → Select zone |

---

## ✅ Success Criteria

After completion, you should see:
- ✅ Green checkmark in Resend dashboard
- ✅ "Verified" status on domain
- ✅ Team members can receive verification emails
- ✅ No more "testing emails" restrictions

---

## ⏱️ Timeline

- **DNS Record Setup:** 5 minutes
- **DNS Propagation:** 5-15 minutes (can take up to 48 hours)
- **Code Update:** 2 minutes
- **Total:** ~15-30 minutes

---

## 🆘 Troubleshooting

**Domain verification stuck?**
- Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- Verify DNS records are correct (no typos)
- Wait a bit longer (DNS can take time)

**Don't have DNS access?**
- Contact your IT department
- Send them the DNS records from Resend
- They can add them for you

**Still showing test mode after verification?**
- Clear browser cache
- Check the "from" address was updated in code
- Restart the server (it may cache the old config)

---

## 💡 Quick Alternative

**Can't verify domain right now?**

Temporary workaround for immediate testing:
1. All team members use: `tetisimi.sanni@gmail.com` for verification
2. Share the verification code via team chat
3. Not ideal, but works for quick testing

**Note:** This is only for testing. For production, verify the domain.
