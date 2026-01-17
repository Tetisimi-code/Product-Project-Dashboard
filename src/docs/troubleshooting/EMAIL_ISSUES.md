# 📧 Email Issues & Solutions

> **Complete troubleshooting guide for email-related problems**

---

## 🚨 **Most Common Email Issue**

### **Problem: "Testing emails restricted to your email address"**

**Full error:**
```
You can only send testing emails to your own email address (tetisimi.sanni@gmail.com).
To send emails to other recipients, please verify a domain.
```

**This means:** Resend (email service) is in testing mode and can only send to the account owner's email.

**Solution:** Verify your domain in Resend
- ⏱️ **Time:** 15-20 minutes
- 💰 **Cost:** FREE
- 📖 **Guide:** [Enable Team Access](../team-collaboration/ENABLE_TEAM_ACCESS.md)

---

## 📬 **Verification Email Not Received**

### **Issue: Signed up but no verification email**

**Check These First:**

#### 1. **Check Spam/Junk Folder**
- Email might be flagged as spam
- Check "Promotions" tab (Gmail)
- Check "Other" folder (Outlook)
- Add sender to safe list

#### 2. **Wait 5-10 Minutes**
- Email delivery can be delayed
- Server processing time
- Network latency

#### 3. **Check Email Address**
- Verify you typed it correctly
- Check for typos
- Try different email

#### 4. **Domain Restrictions**
- App may restrict certain domains
- Contact admin to add your domain
- See [Email Restrictions Guide](../admin-guides/EMAIL_RESTRICTIONS.md)

---

### **Solutions:**

**Solution 1: Request Resend**
```
1. Go back to login page
2. Click "Resend verification code"
3. Wait 5 minutes
4. Check spam folder again
```

**Solution 2: Try Different Email**
```
1. Sign up with different email address
2. Use personal email if work email blocked
3. Contact admin about domain restrictions
```

**Solution 3: Contact Admin**
```
1. Reach out to your administrator
2. Admin can verify domain setup
3. Admin can manually create account
4. Admin can check Resend logs
```

**Solution 4: Check Resend Status** (Admins)
```
1. Log into resend.com
2. Go to "Logs" section
3. Search for recipient email
4. Check delivery status
5. Review any error messages
```

---

## 🔐 **Password Reset Email Not Received**

### **Issue: Requested password reset but no email**

**Check These First:**
- Spam/junk folder
- Correct email address
- Wait 5-10 minutes
- Domain restrictions

### **Solutions:**

**Solution 1: Try Again**
```
1. Go to login page
2. Click "Forgot Password?"
3. Enter email carefully
4. Wait 10 minutes
5. Check all folders
```

**Solution 2: Use Different Email**
```
1. Sign up with new account
2. Use alternative email
3. Contact admin to delete old account
```

**Solution 3: Admin Reset** (Admins)
```
1. Admin Panel → User Management
2. Find user
3. Delete old account
4. User creates new account
5. Or admin creates account manually
```

---

## 🚫 **Domain Restriction Errors**

### **Issue: "Domain not allowed" or similar error**

**Symptoms:**
- Can't sign up with work email
- Only specific emails work
- "Domain not verified" message

**Cause:** Email domain restrictions enabled

### **Solutions:**

**Solution 1: Use Allowed Domain** (Quick)
```
1. Check which domains are allowed
2. Use email from allowed domain
3. Contact admin if needed
```

**Solution 2: Admin Adds Domain** (Permanent)
```
1. Admin goes to Email Restrictions
2. Adds your email domain
3. Saves changes
4. You can now sign up
```

**Solution 3: Remove Restrictions** (If appropriate)
```
1. Admin removes domain restrictions
2. Any email can sign up
3. Less secure but more flexible
```

**See:** [Email Restrictions Guide](../admin-guides/EMAIL_RESTRICTIONS.md)

---

## 📤 **Emails Going to Spam**

### **Issue: All emails land in spam folder**

**Cause:** Resend not fully configured or domain not verified

### **Solutions:**

**Solution 1: Verify Domain** (Best)
```
1. Verify domain in Resend
2. Add SPF, DKIM, DMARC records
3. Improves email deliverability
4. Reduces spam classification
```
**Guide:** [Resend Setup](../deployment/RESEND_SETUP.md)

**Solution 2: Whitelist Sender** (Individual)
```
1. Add sender to contacts
2. Mark as "Not Spam"
3. Create filter rule
4. Check inbox regularly
```

**Solution 3: Use Different Email Service**
```
1. Switch from Resend to SendGrid/AWS SES
2. Requires code changes
3. May have better deliverability
4. Consult with developer
```

---

## ⏱️ **Email Delays**

### **Issue: Emails taking too long to arrive**

**Normal:** Up to 5 minutes  
**Concerning:** Over 15 minutes  
**Problem:** Over 1 hour

### **Causes:**
- Email server delays
- Network issues
- Spam filtering processing
- High email volume

### **Solutions:**

**Solution 1: Wait Patiently**
```
- Check spam folder
- Wait up to 15 minutes
- Don't request multiple times
- Can cause additional delays
```

**Solution 2: Check Resend Logs** (Admins)
```
1. Log into resend.com
2. Go to Logs
3. Search for email
4. Check status
5. Review timestamps
```

**Solution 3: Check Recipient Server**
```
- Some email providers slow
- Corporate servers may delay
- Check with IT department
- Try personal email
```

---

## 🔧 **Resend Configuration Issues**

### **Issue: Resend not working at all**

**Symptoms:**
- No emails being sent
- All emails failing
- Error messages in logs

**Check These:**

#### 1. **API Key Valid**
```
- Verify API key in Supabase secrets
- Check key not expired
- Ensure correct key format
- Test key in Resend dashboard
```

#### 2. **Domain Verified**
```
- Check Resend dashboard
- Ensure green verification checkmark
- DNS records properly configured
- Wait for DNS propagation (up to 48 hours)
```

#### 3. **Rate Limits**
```
- Free tier: 3,000 emails/month
- Check usage in Resend dashboard
- Upgrade plan if exceeded
- Wait for monthly reset
```

#### 4. **Code Configuration**
```
- Check 'from' email address
- Verify matches verified domain
- Review server endpoint
- Check error logs
```

**See:** [Resend Setup Guide](../deployment/RESEND_SETUP.md)

---

## 🌐 **Domain Verification Problems**

### **Issue: Can't verify domain in Resend**

**Symptoms:**
- DNS records added but not verified
- Verification pending for days
- Error messages in Resend

### **Solutions:**

**Solution 1: Check DNS Records**
```
1. Use whatsmydns.net
2. Search for your domain
3. Select TXT record type
4. Verify records propagated
5. Check for typos
```

**Solution 2: Wait for Propagation**
```
- DNS changes take time
- Usually 5-15 minutes
- Can take up to 48 hours
- Be patient
```

**Solution 3: Verify Record Format**
```
1. Compare with Resend instructions
2. Check for extra spaces
3. Verify quotes if needed
4. Ensure correct record type
```

**Solution 4: Contact DNS Provider**
```
- Some providers format differently
- Ask for help adding records
- Provide Resend instructions
- May need IT department
```

**See:** [Domain Verification Steps](../deployment/DOMAIN_VERIFICATION_STEPS.md)

---

## 📝 **Testing Email Delivery**

### **How to Test:**

**Test 1: Send to Yourself**
```
1. Sign up with your own email
2. Should receive verification code
3. Check spam if not received
4. Verify delivery time
```

**Test 2: Send to Team Member**
```
1. Have colleague sign up
2. They should receive email
3. Confirms team access working
4. Verify no domain restrictions
```

**Test 3: Check Resend Logs**
```
1. Log into Resend dashboard
2. Go to Logs section
3. View recent emails
4. Check delivery status
5. Review any errors
```

**Test 4: Different Email Providers**
```
- Test Gmail
- Test Outlook
- Test company email
- Verify all work
```

---

## 🆘 **Admin Troubleshooting Checklist**

If you're an admin troubleshooting email issues:

### **Quick Checklist:**
- [ ] Resend API key configured in Supabase
- [ ] Domain verified in Resend (if using custom domain)
- [ ] DNS records added correctly
- [ ] 'from' email matches verified domain
- [ ] Rate limits not exceeded
- [ ] Check Resend logs for errors
- [ ] Test with own email first
- [ ] Verify domain restrictions appropriate
- [ ] Check spam folder
- [ ] Wait adequate time (5-15 min)

### **Advanced Checks:**
- [ ] SPF record configured
- [ ] DKIM record configured
- [ ] DMARC record configured (optional)
- [ ] DNS propagation complete
- [ ] Firewall not blocking Resend
- [ ] Server function deployed correctly
- [ ] Environment variables set
- [ ] No code errors in logs

---

## 📞 **Getting Help**

### **For Users:**
1. Check spam folder first
2. Wait 10-15 minutes
3. Try resend button
4. Contact your administrator
5. Provide exact error message

### **For Admins:**
1. Check [Resend Setup Guide](../deployment/RESEND_SETUP.md)
2. Review [Domain Verification](../deployment/DOMAIN_VERIFICATION_STEPS.md)
3. Check Resend dashboard logs
4. Verify DNS records
5. Review server error logs
6. Test with multiple emails
7. Contact Resend support if stuck

---

## 🔗 **Related Documentation**

- [Email Service Setup](../admin-guides/EMAIL_SERVICE_SETUP.md)
- [Email Restrictions](../admin-guides/EMAIL_RESTRICTIONS.md)
- [Resend Setup Guide](../deployment/RESEND_SETUP.md)
- [Domain Verification](../deployment/DOMAIN_VERIFICATION_STEPS.md)
- [Team Access Guide](../team-collaboration/ENABLE_TEAM_ACCESS.md)

---

**Most email issues are resolved by checking spam, waiting patiently, or verifying domain setup!** 📧
