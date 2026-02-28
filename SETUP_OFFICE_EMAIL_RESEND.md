# Setup Office Email with Resend - Complete Guide
## Configure staffos@scalingtheory.com with staffos.io domain

---

## 📋 What You Need

- **Domain**: `staffos.io` (already owned)
- **From Email**: `staffos@scalingtheory.com`
- **Service**: Resend (already integrated)
- **Purpose**: Send welcome emails with login credentials to new employees

---

## 🎯 Step 1: Verify Domain in Resend

### 1.1 Go to Resend Dashboard

1. Visit: https://resend.com
2. Sign in to your account
3. Go to **"Domains"** in the left sidebar

### 1.2 Add Your Domain

1. Click **"Add Domain"**
2. Enter: `staffos.io`
3. Click **"Add"**

### 1.3 Configure DNS Records

Resend will show you DNS records to add. You need to add these to your domain's DNS:

**Required DNS Records:**

1. **SPF Record** (TXT):
   ```
   v=spf1 include:resend.com ~all
   ```

2. **DKIM Record** (TXT):
   ```
   (Resend will provide this - copy exactly)
   ```

3. **DMARC Record** (TXT) - Optional but recommended:
   ```
   v=DMARC1; p=none; rua=mailto:staffos@scalingtheory.com
   ```

### 1.4 Where to Add DNS Records

1. Go to your domain registrar (where you bought `staffos.io`)
2. Find **DNS Management** or **DNS Settings**
3. Add the TXT records Resend provides
4. Wait 24-48 hours for DNS propagation (usually faster)

### 1.5 Verify Domain

1. In Resend Dashboard → Domains → `staffos.io`
2. Click **"Verify"**
3. Wait for verification (green checkmark)

---

## 🎯 Step 2: Create Email Address in Resend

### 2.1 Add Email Address

1. In Resend Dashboard → Domains → `staffos.io`
2. Click **"Add Email Address"** or **"Create Email"**
3. Enter: `staffos@scalingtheory.com`
4. Click **"Add"**

**Note**: If Resend doesn't allow `@scalingtheory.com` (since that's a different domain), you have two options:

**Option A**: Use `staffos@staffos.io` (same domain)
- This is simpler and recommended
- Email: `staffos@staffos.io`

**Option B**: Use `staffos@scalingtheory.com` (if you own scalingtheory.com)
- You'll need to verify `scalingtheory.com` domain in Resend too
- More complex setup

**I recommend Option A** - use `staffos@staffos.io` for simplicity.

---

## 🎯 Step 3: Get Resend API Key

### 3.1 Create API Key

1. In Resend Dashboard → **"API Keys"**
2. Click **"Create API Key"**
3. Name it: `StaffOS Production`
4. Select permissions: **"Sending access"**
5. Click **"Add"**
6. **Copy the API key** (starts with `re_`)
7. **Save it securely** - you won't see it again!

---

## 🎯 Step 4: Update Environment Variables

### 4.1 For Development Backend (Render)

1. Go to Render Dashboard → `staffosdemo-backend` → Environment
2. Add/Update:
   ```
   RESEND_API_KEY=re_your_new_api_key_here
   FROM_EMAIL=StaffOS <staffos@staffos.io>
   ```
3. Save (triggers redeploy)

### 4.2 For Staging Backend (Render)

1. Go to Render Dashboard → `staffos-backend-staging` → Environment
2. Add/Update:
   ```
   RESEND_API_KEY=re_your_new_api_key_here
   FROM_EMAIL=StaffOS <staffos@staffos.io>
   ```
3. Save

### 4.3 For Production Backend (Render)

1. Go to Render Dashboard → `staffos-backendd` → Environment
2. Add/Update:
   ```
   RESEND_API_KEY=re_your_new_api_key_here
   FROM_EMAIL=StaffOS <staffos@staffos.io>
   ```
3. Save

---

## 🎯 Step 5: Update Login URL in Code

The welcome email needs the correct login URL. Let's update it:

### Current Code Issue

In `server/routes.ts` line 6194-6196, the login URL is hardcoded:

```typescript
const loginUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';
```

This should use your production URL for production deployments.

### Fix: Update Login URL Logic

We need to update the code to use the correct URL based on environment.

---

## 🎯 Step 6: Test Email Sending

### 6.1 Test Locally

1. Add to your local `.env`:
   ```env
   RESEND_API_KEY=re_your_api_key
   FROM_EMAIL=StaffOS <staffos@staffos.io>
   ```

2. Create a test employee:
   - Go to Admin Dashboard → Create Employee
   - Fill in details
   - Submit

3. Check:
   - Server logs for email sending status
   - Employee's email inbox
   - Resend Dashboard → Logs (to see delivery status)

### 6.2 Test on Dev Environment

1. Deploy to dev branch
2. Create employee on dev URL
3. Verify email is received

---

## ✅ Checklist

- [ ] Domain `staffos.io` verified in Resend
- [ ] DNS records added and verified
- [ ] Email address `staffos@staffos.io` created in Resend
- [ ] Resend API key created and saved
- [ ] `RESEND_API_KEY` added to all Render backends (dev, staging, production)
- [ ] `FROM_EMAIL` set to `StaffOS <staffos@staffos.io>` in all environments
- [ ] Login URL updated in code (if needed)
- [ ] Test email sent successfully
- [ ] Welcome email received with correct credentials

---

## 🔍 Troubleshooting

### Email Not Sending

1. **Check Resend Dashboard → Logs**
   - See if email was attempted
   - Check error messages

2. **Check Render Logs**
   - Look for email sending errors
   - Verify API key is set

3. **Verify Domain**
   - Check domain is verified in Resend
   - Check DNS records are correct

### 403 Forbidden Error

- API key is invalid or expired
- Domain not verified
- Email address not created in Resend

### Email Goes to Spam

- Verify SPF and DKIM records
- Add DMARC record
- Use proper FROM_EMAIL format

---

## 📝 Quick Reference

**Environment Variables Needed:**
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=StaffOS <staffos@staffos.io>
```

**For Production:**
- Use production API key (separate from dev)
- Use `staffos@staffos.io` as FROM_EMAIL
- Login URL should be `https://staffosdemo.vercel.app` or `https://staffos.io`

---

**Next Steps**: After setting up Resend domain, update the code to use correct login URLs, then test!


