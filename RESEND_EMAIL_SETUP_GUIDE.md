# Resend Email Setup Guide - Custom Email Addresses

## 📧 Using Custom Email Addresses (e.g., staffos@gmail.com)

### ⚠️ Important: Gmail Addresses

**You CANNOT use `staffos@gmail.com` directly with Resend.**

**Why?**
- Gmail doesn't allow third-party services (like Resend) to send emails "from" Gmail addresses
- Gmail requires SMTP authentication which Resend doesn't support for Gmail
- This would violate Gmail's terms of service

### ✅ What You CAN Do

#### Option 1: Use Your Own Domain (Recommended)

**Example:** `staffos@yourdomain.com` or `noreply@yourdomain.com`

**Steps:**
1. **Get a Domain** (if you don't have one):
   - Buy from: Namecheap, GoDaddy, Google Domains, etc.
   - Cost: ~$10-15/year

2. **Verify Domain in Resend:**
   - Go to **Resend Dashboard** → **Domains** → **Add Domain**
   - Enter your domain (e.g., `staffos.com`)
   - Resend will show you DNS records to add

3. **Add DNS Records:**
   - Go to your domain registrar's DNS settings
   - Add these records (Resend will show exact values):
     ```
     TXT Record: (for domain verification)
     SPF Record: (for email authentication)
     DKIM Record: (for email signing)
     ```
   - Wait 5-10 minutes for DNS propagation

4. **Update Environment Variable:**
   ```
   FROM_EMAIL=StaffOS <noreply@yourdomain.com>
   ```

5. **Redeploy Backend**

**Benefits:**
- ✅ Professional email address
- ✅ Better deliverability
- ✅ Full control
- ✅ Branded emails

#### Option 2: Use Resend's Sandbox Domain (Free, Quick)

**Example:** `StaffOS <onboarding@resend.dev>`

**Steps:**
1. **Update Environment Variable:**
   ```
   FROM_EMAIL=StaffOS <onboarding@resend.dev>
   ```

2. **Redeploy Backend**

**Benefits:**
- ✅ Free, no setup needed
- ✅ Works immediately
- ✅ Good deliverability
- ✅ Verified domain

**Limitations:**
- ⚠️ Shows "onboarding@resend.dev" as sender
- ⚠️ Less professional than custom domain

#### Option 3: Use Google Workspace (If You Have It)

If you have **Google Workspace** (paid Gmail for business):

1. **Set up SMTP in Resend** (if supported)
2. **Or use Google Workspace API** directly
3. **More complex setup**

**Note:** This requires Google Workspace subscription (~$6/user/month)

---

## 💰 Resend Pricing & Limits

### Free Tier (Hobby Plan)

**Monthly Limits:**
- ✅ **3,000 emails/month** (100 emails/day)
- ✅ **1 domain** verification
- ✅ **Unlimited API requests**
- ✅ **Email logs & analytics**
- ✅ **Webhooks**

**Perfect for:**
- Development & testing
- Small applications
- Low-volume production (< 100 emails/day)

### Paid Plans

#### Pro Plan - $20/month
- ✅ **50,000 emails/month**
- ✅ **5 domains**
- ✅ **Priority support**
- ✅ **Advanced analytics**
- ✅ **Custom tracking domains**

#### Business Plan - $80/month
- ✅ **200,000 emails/month**
- ✅ **Unlimited domains**
- ✅ **Dedicated support**
- ✅ **SLA guarantee**
- ✅ **Custom IP addresses**

#### Enterprise Plan - Custom
- ✅ **Unlimited emails**
- ✅ **Custom pricing**
- ✅ **Dedicated account manager**
- ✅ **Custom features**

---

## 📊 Email Volume Calculator

**Estimate your needs:**

```
Daily Active Users × Emails per User = Daily Email Volume

Examples:
- 10 users × 2 emails/day = 20 emails/day (Free tier OK)
- 50 users × 2 emails/day = 100 emails/day (Free tier limit)
- 100 users × 2 emails/day = 200 emails/day (Need Pro plan)
```

**Common Email Types:**
- Registration OTP: 1 email per new user
- Login OTP: 1 email per login (if unverified)
- Welcome emails: 1 email per new user
- Password reset: Occasional

---

## 🎯 Recommended Setup for Your App

### For Development/Testing:
```
FROM_EMAIL=StaffOS <onboarding@resend.dev>
```
- ✅ Free
- ✅ Works immediately
- ✅ Good for testing

### For Production (Small Scale):
```
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
```
- ✅ Professional
- ✅ Better deliverability
- ✅ Free tier sufficient if < 100 emails/day

### For Production (Large Scale):
```
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
+ Pro Plan ($20/month)
```
- ✅ Handles 50,000 emails/month
- ✅ Better support
- ✅ Advanced features

---

## 🔧 Step-by-Step: Setting Up Custom Domain

### Step 1: Get a Domain
1. Go to **Namecheap**, **GoDaddy**, or **Google Domains**
2. Search for your desired domain (e.g., `staffos.com`)
3. Purchase (usually $10-15/year)

### Step 2: Verify Domain in Resend
1. Go to **Resend Dashboard** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `staffos.com`)
4. Click **"Add"**

### Step 3: Add DNS Records
Resend will show you 3 DNS records to add:

**Record 1: Domain Verification (TXT)**
```
Type: TXT
Name: @ (or leave blank)
Value: [Resend will provide]
TTL: 3600
```

**Record 2: SPF (TXT)**
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**Record 3: DKIM (TXT)**
```
Type: TXT
Name: resend._domainkey (or similar)
Value: [Resend will provide]
TTL: 3600
```

### Step 4: Wait for Verification
- Usually takes 5-10 minutes
- Check Resend dashboard for status
- Status will change from "Pending" to "Verified"

### Step 5: Update Environment Variable
```
FROM_EMAIL=StaffOS <noreply@staffos.com>
```

### Step 6: Redeploy Backend
- Render will auto-redeploy when you save environment variables
- Or manually trigger redeploy

---

## 📧 Email Address Best Practices

### Good Email Addresses:
- ✅ `noreply@yourdomain.com` - For automated emails
- ✅ `support@yourdomain.com` - For support emails
- ✅ `welcome@yourdomain.com` - For welcome emails
- ✅ `notifications@yourdomain.com` - For notifications

### Avoid:
- ❌ `staffos@gmail.com` - Can't use Gmail with Resend
- ❌ `info@free-email-provider.com` - Poor deliverability
- ❌ Generic addresses without domain verification

---

## 💡 Cost Comparison

### Option 1: Free Tier + Resend Sandbox
- **Cost:** $0/month
- **Emails:** 3,000/month
- **Sender:** `onboarding@resend.dev`
- **Best for:** Development, small apps

### Option 2: Free Tier + Custom Domain
- **Cost:** ~$1/month (domain only, ~$12/year)
- **Emails:** 3,000/month
- **Sender:** `noreply@yourdomain.com`
- **Best for:** Production, professional look

### Option 3: Pro Plan + Custom Domain
- **Cost:** ~$21/month ($20 Resend + $1 domain)
- **Emails:** 50,000/month
- **Sender:** `noreply@yourdomain.com`
- **Best for:** Growing apps, high volume

---

## 🎯 Recommendation for Your App

### Current Stage (Development/Testing):
```
FROM_EMAIL=StaffOS <onboarding@resend.dev>
Cost: $0/month
Emails: 3,000/month (100/day)
```

### When You Go Live (Small Scale):
```
1. Buy domain: staffos.com (~$12/year)
2. Verify in Resend (free)
3. Use: StaffOS <noreply@staffos.com>
Cost: ~$1/month (domain only)
Emails: 3,000/month (100/day)
```

### When You Scale (High Volume):
```
1. Keep custom domain
2. Upgrade to Resend Pro: $20/month
3. Use: StaffOS <noreply@staffos.com>
Cost: ~$21/month
Emails: 50,000/month
```

---

## ✅ Quick Answer Summary

**Q: Can I use staffos@gmail.com?**
**A:** No, Gmail doesn't allow third-party sending. Use your own domain instead.

**Q: How many free emails?**
**A:** 3,000 emails/month (100/day) on Resend free tier.

**Q: Is it free?**
**A:** Yes, free tier is free. Paid plans start at $20/month for 50,000 emails.

**Q: Best setup?**
**A:** 
- **Now:** Use `onboarding@resend.dev` (free, works immediately)
- **Later:** Get domain, verify in Resend, use `noreply@yourdomain.com`

---

**For now, stick with `onboarding@resend.dev` - it's free and works great!** 🎯

