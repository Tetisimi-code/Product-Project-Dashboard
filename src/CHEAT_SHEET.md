# Team Access - Cheat Sheet

## The Problem
❌ Only `tetisimi.sanni@gmail.com` can sign up  
❌ Team members blocked

## The Solution  
✅ Verify domain (15 min, free)  
✅ All team members can sign up

---

## 5-Minute Quick Fix

### 1. Go to Resend
```
https://resend.com/domains
```

### 2. Add Domain
```
reactive-technologies.com
```

### 3. Add These 3 DNS Records

**Record 1 (TXT)**
```
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**Record 2 (TXT)**  
```
Name: resend._domainkey
Value: [copy from Resend]
```

**Record 3 (MX)**
```
Priority: 10
Value: feedback-smtp.us-east-1.amazonses.com
```

### 4. Wait
```
5-15 minutes for verification ✅
```

### 5. Update Code
**File:** `/supabase/functions/server/index.tsx`  
**Line:** ~290

```typescript
// Change this:
from: 'onboarding@resend.dev',

// To this:
from: 'noreply@reactive-technologies.com',
```

### 6. Test
```
Sign up with any @reactive-technologies.com email
```

---

## Where to Add DNS Records

| Provider | URL |
|----------|-----|
| GoDaddy | godaddy.com → Domains → DNS |
| Namecheap | namecheap.com → Domain List → Manage → Advanced DNS |
| Cloudflare | cloudflare.com → Domain → DNS |
| Google Domains | domains.google.com → Domain → DNS |

---

## Success Checklist

- [ ] Domain added in Resend
- [ ] 3 DNS records added
- [ ] Green checkmark in Resend  
- [ ] Code updated
- [ ] Tested signup - works! ✅

---

## Stuck?

**DNS not verifying?**  
→ Wait longer (can take 48 hours)  
→ Check: [whatsmydns.net](https://whatsmydns.net)

**Don't have DNS access?**  
→ Send this sheet to IT

**Need more help?**  
→ Read: [QUICK_FIX.md](./QUICK_FIX.md)

---

## Full Guides

- **Visual:** [QUICK_FIX.md](./QUICK_FIX.md)
- **Detailed:** [DOMAIN_VERIFICATION_STEPS.md](./DOMAIN_VERIFICATION_STEPS.md)
- **Overview:** [START_HERE.md](./START_HERE.md)
- **Navigate:** [TEAM_ACCESS_GUIDES.md](./TEAM_ACCESS_GUIDES.md)

---

**Time to complete:** 15-30 min  
**Cost:** $0 (Free)  
**Difficulty:** Easy (copy-paste)

**Go!** → [resend.com/domains](https://resend.com/domains)
