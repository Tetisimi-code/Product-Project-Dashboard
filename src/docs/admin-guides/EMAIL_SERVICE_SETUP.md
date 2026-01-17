# Email Service Setup Guide

## Overview

The Product-Project Management Board uses email verification to ensure that all user accounts are legitimate. This guide will help administrators set up and configure the email service.

---

## 📧 Email Service Provider

### Resend API

The application uses **Resend** for sending verification emails:
- **Website:** https://resend.com
- **Pricing:** Free tier available (100 emails/day)
- **Reliability:** High deliverability
- **Developer-friendly:** Simple REST API

---

## 🔑 Setting Up Resend API Key

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click "Sign Up"
3. Create your account
4. Verify your email address

### Step 2: Get API Key

1. Log in to Resend dashboard
2. Navigate to "API Keys" section
3. Click "Create API Key"
4. Name it (e.g., "Product-Project Board")
5. Copy the API key (starts with `re_`)

**⚠️ Important:** Save the key immediately - you won't see it again!

### Step 3: Add to Application

The API key has already been configured in your application through the Figma Make interface. You should have been prompted to add it when the feature was implemented.

If you need to update it:
1. The key is stored as `RESEND_API_KEY` environment variable
2. Contact your Figma Make administrator to update it
3. Changes take effect immediately (no restart needed)

---

## ✉️ Email Configuration

### Default Settings

**From Address:**
```
Reactive Technologies <onboarding@resend.dev>
```

**Subject Line:**
```
Verify Your Email - Product-Project Management Board
```

**Email Template:**
- Clean, professional design
- Purple/violet branding (matches Reactive Technologies)
- Large, centered 6-digit code
- Expiration notice (15 minutes)
- Security note

### Customizing From Address

**Using Resend's Default Domain:**
- Default: `onboarding@resend.dev`
- No setup required
- Works immediately
- May appear less official

**Using Your Own Domain:**
1. Add your domain to Resend dashboard
2. Verify DNS records
3. Update the sender address in `/supabase/functions/server/index.tsx`
4. Change this line:
   ```typescript
   from: 'Reactive Technologies <onboarding@resend.dev>',
   ```
   To:
   ```typescript
   from: 'Reactive Technologies <noreply@reactive-technologies.com>',
   ```

**DNS Records Required:**
- SPF record
- DKIM record
- DMARC record (recommended)

See Resend documentation for exact DNS values.

---

## 🧪 Testing Email Delivery

### Test During Signup

1. Sign up with a test account
2. Check if email arrives
3. Verify code works
4. Check spam folder if not received

### Test Resend Functionality

1. Sign up but don't verify
2. Wait for code to expire (15 minutes)
3. Click "Resend"
4. Verify new code arrives
5. Check that old code doesn't work

### Test Edge Cases

- [ ] Verify with valid code
- [ ] Try expired code
- [ ] Try invalid code
- [ ] Resend multiple times
- [ ] Check spam folder delivery
- [ ] Verify email formatting
- [ ] Test on mobile devices
- [ ] Check with different email providers

---

## 📊 Monitoring Email Delivery

### Resend Dashboard

**View:**
- Total emails sent
- Delivery rate
- Bounce rate
- Open rate (if tracking enabled)
- Click rate (if links present)

**Access:**
1. Log in to Resend dashboard
2. Go to "Emails" or "Analytics"
3. View recent deliveries
4. Check for errors

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Emails not sending | Invalid API key | Verify key is correct |
| High bounce rate | Invalid email addresses | Check email validation |
| Emails in spam | Domain not verified | Add SPF/DKIM records |
| Slow delivery | API rate limiting | Upgrade Resend plan |
| 401 error | Expired/wrong API key | Generate new key |

---

## 🔒 Security Best Practices

### API Key Security

**Do:**
- ✅ Store in environment variables
- ✅ Never commit to code
- ✅ Rotate periodically
- ✅ Use separate keys for dev/prod
- ✅ Limit permissions if possible

**Don't:**
- ❌ Share publicly
- ❌ Hardcode in files
- ❌ Send via email/chat
- ❌ Use same key everywhere
- ❌ Leave in logs

### Email Content Security

**Do:**
- ✅ Use HTTPS links only
- ✅ Keep code format simple (6 digits)
- ✅ Include expiration notice
- ✅ Add security warnings
- ✅ Brand clearly

**Don't:**
- ❌ Include sensitive data
- ❌ Ask for passwords
- ❌ Use suspicious links
- ❌ Make urgent threats
- ❌ Impersonate others

---

## 💰 Pricing & Limits

### Resend Free Tier

**Includes:**
- 100 emails/day
- 1 domain
- API access
- Email logs
- Support

**Limitations:**
- Daily send limit
- One domain verification
- 30-day log retention

### Upgrading

**When to upgrade:**
- More than 100 signups per day
- Need multiple domains
- Want longer log retention
- Require priority support

**Paid Plans:**
- Pro: $20/month (10,000 emails)
- Business: Custom pricing
- Enterprise: Custom pricing

Visit https://resend.com/pricing for current pricing.

### Monitoring Usage

**Check:**
1. Resend dashboard
2. Daily email count
3. Approaching limits
4. Failed deliveries

**Set Alerts:**
- 80% of daily limit
- API errors
- High bounce rate
- Delivery failures

---

## 🔧 Troubleshooting

### Emails Not Being Sent

**Check:**
1. **API Key Valid?**
   - Log in to Resend dashboard
   - Verify key is active
   - Generate new key if needed

2. **Environment Variable Set?**
   - Check `RESEND_API_KEY` is configured
   - Verify no typos
   - Restart server if changed

3. **Rate Limits?**
   - Check Resend dashboard
   - Verify under daily limit
   - Upgrade plan if needed

4. **API Errors?**
   - Check server logs
   - Look for error messages
   - Test API key directly

### Emails Going to Spam

**Solutions:**
1. **Verify Domain**
   - Add SPF record
   - Add DKIM record
   - Add DMARC record

2. **Improve Content**
   - Remove spammy words
   - Use plain text
   - Keep it simple
   - Add unsubscribe link

3. **Build Reputation**
   - Start with small volume
   - Monitor bounce rate
   - Remove invalid emails
   - Maintain consistency

### Emails Delayed

**Common Causes:**
- Resend API delays
- Recipient server delays
- Network issues
- Rate limiting

**What to do:**
- Wait 2-5 minutes
- Check spam folder
- Verify recipient email
- Use resend feature

---

## 🔄 Alternative Email Services

### If Not Using Resend

The application can be adapted for other email services:

**Popular Options:**
- **SendGrid** - Twilio's email service
- **Mailgun** - Developer-focused
- **AWS SES** - Amazon's email service
- **Postmark** - Transactional emails

**To Switch:**
1. Update `/supabase/functions/server/index.tsx`
2. Replace `sendVerificationEmail` function
3. Use new service's API
4. Update environment variables
5. Test thoroughly

**Code Location:**
```
/supabase/functions/server/index.tsx
Lines: ~50-100 (sendVerificationEmail function)
```

---

## 📧 Email Template Customization

### Current Template

The email includes:
- Welcome message with user's name
- Large 6-digit code (easy to read)
- Expiration notice (15 minutes)
- Security note
- Company branding
- Footer disclaimer

### Customizing Content

**To change:**
1. Edit `/supabase/functions/server/index.tsx`
2. Find `sendVerificationEmail` function
3. Modify HTML in the `html` field
4. Test changes thoroughly

**Best Practices:**
- Keep it simple and clear
- Make code prominent
- Include expiration time
- Add security notes
- Brand appropriately
- Test on mobile

### HTML Email Tips

**Do:**
- Use inline styles
- Test on multiple clients
- Keep it responsive
- Use web-safe fonts
- Include plain text version

**Don't:**
- Use external CSS
- Rely on JavaScript
- Use complex layouts
- Assume image display
- Forget mobile users

---

## 📈 Success Metrics

### What to Monitor

**Email Delivery:**
- Total emails sent
- Delivery rate (target: >98%)
- Bounce rate (target: <2%)
- Time to deliver (target: <30 seconds)

**User Experience:**
- Verification completion rate (target: >90%)
- Time to verify (target: <5 minutes)
- Resend requests (target: <10%)
- Support tickets (target: <5%)

**Technical:**
- API uptime (target: >99.9%)
- Error rate (target: <1%)
- Response time (target: <1 second)
- Failed sends (target: 0)

---

## 🆘 Getting Help

### Resend Support

**Resources:**
- Documentation: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Status Page: https://status.resend.com
- Support Email: support@resend.com

### Community

- Resend Discord
- GitHub Issues
- Stack Overflow
- Dev.to tutorials

### Internal Support

- Check application logs
- Review server responses
- Test with different emails
- Contact technical lead

---

## ✅ Setup Checklist

Before launching email verification:

- [ ] Resend account created
- [ ] API key generated
- [ ] API key added to application
- [ ] Test email sent successfully
- [ ] Email arrives in inbox (not spam)
- [ ] Verification code works
- [ ] Resend functionality tested
- [ ] Expiration works correctly
- [ ] Domain verified (optional but recommended)
- [ ] Monitoring set up
- [ ] Team trained on troubleshooting
- [ ] Documentation reviewed

---

## 📋 Quick Reference

| Task | How To |
|------|--------|
| **Get API Key** | Resend Dashboard → API Keys → Create |
| **Configure Key** | Environment variable: `RESEND_API_KEY` |
| **Test Emails** | Sign up with test account |
| **Monitor Usage** | Resend Dashboard → Analytics |
| **Check Logs** | Resend Dashboard → Emails |
| **Verify Domain** | Resend Dashboard → Domains → Add |
| **Get Support** | support@resend.com |

---

## 🔮 Future Enhancements

### Planned Features

- **Custom Templates** - User-defined email designs
- **Multiple Languages** - Internationalization
- **SMS Backup** - Verify via text if email fails
- **Email Preferences** - User control over emails
- **Analytics Dashboard** - Built-in email metrics

*(Not currently available)*

---

**Need more help?** Contact your technical administrator or refer to the [Resend Documentation](https://resend.com/docs).

---

[← Back to Admin Guides](../README.md) | [Email Restrictions →](./EMAIL_RESTRICTIONS.md)
