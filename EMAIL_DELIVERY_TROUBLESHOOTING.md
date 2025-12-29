# Email Delivery Troubleshooting Guide

## ✅ Current Status

Your emails **ARE being sent** (visible in Resend logs), but they're **not arriving** in inboxes. This is a **deliverability issue**.

---

## 🔍 Step 1: Check Resend Dashboard

1. Go to **Resend Dashboard** → **Emails** tab
2. Click on the email you sent
3. Check the **Status**:
   - ✅ **Delivered** = Email reached the recipient's mail server
   - ⚠️ **Bounced** = Email was rejected
   - ⏳ **Pending** = Still being processed
   - ❌ **Failed** = Error occurred

4. Check **Delivery Details**:
   - Look for any error messages
   - Check if it says "Delivered" or "Bounced"

---

## 🎯 Step 2: Common Issues & Fixes

### Issue 1: Email in Spam/Junk Folder

**Most Common Cause!**

**Solution:**
1. Check the recipient's **Spam/Junk folder**
2. Mark as "Not Spam" if found
3. Add sender to contacts/whitelist

**Prevention:**
- Verify your domain in Resend (see Step 3)
- Use a verified domain email address

### Issue 2: Sender Email Not Verified

Your current sender: `symphonixtech@gmail.com`

**Problem:** Gmail addresses used as "from" addresses often get blocked or marked as spam.

**Solution:** Use Resend's verified domain or sandbox domain

**Option A: Use Resend Sandbox (Quick Fix)**
1. Go to Render → Environment Variables
2. Update `FROM_EMAIL`:
   ```
   FROM_EMAIL=StaffOS <onboarding@resend.dev>
   ```
3. Redeploy backend
4. Test again

**Option B: Verify Your Domain (Best for Production)**
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records (Resend will show you what to add)
4. Wait for verification (usually 5-10 minutes)
5. Update `FROM_EMAIL`:
   ```
   FROM_EMAIL=StaffOS <noreply@yourdomain.com>
   ```
6. Redeploy backend

### Issue 3: Email Provider Blocking

Some email providers (especially educational ones like `.edu`) have strict spam filters.

**Solution:**
- Try sending to a Gmail/Outlook address first to test
- If Gmail works but `.edu` doesn't, it's the recipient's email provider blocking it

### Issue 4: Resend Account Limits

**Check:**
- Resend Dashboard → Usage
- Free tier: 100 emails/day
- If limit reached, emails won't send

**Solution:**
- Wait for daily reset, or
- Upgrade Resend plan

---

## 🔧 Step 3: Verify Domain in Resend (Recommended)

### Why Verify Domain?

- ✅ Better deliverability (less spam)
- ✅ Professional sender address
- ✅ Higher email reputation
- ✅ Works with all email providers

### How to Verify:

1. **Go to Resend Dashboard** → **Domains**
2. **Click "Add Domain"**
3. **Enter your domain** (e.g., `staffos.com`)
4. **Add DNS Records:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the DNS records Resend shows you:
     - **TXT record** (for verification)
     - **SPF record** (for authentication)
     - **DKIM record** (for signing)
5. **Wait for verification** (5-10 minutes)
6. **Update Render Environment:**
   ```
   FROM_EMAIL=StaffOS <noreply@yourdomain.com>
   ```
7. **Redeploy backend**

---

## 🧪 Step 4: Test Email Delivery

### Test 1: Send to Gmail
- Use a Gmail address to test
- Check inbox AND spam folder
- If Gmail works, issue is with recipient's email provider

### Test 2: Check Resend Logs
- Go to Resend Dashboard → Emails
- Click on the email
- Check delivery status and any error messages

### Test 3: Check Email Headers
- In Resend, view email details
- Check for SPF/DKIM authentication
- Unverified domains show lower authentication scores

---

## ⚡ Quick Fix (Immediate)

**Use Resend's Sandbox Domain:**

1. **Update Render Environment Variable:**
   ```
   FROM_EMAIL=StaffOS <onboarding@resend.dev>
   ```

2. **Redeploy Backend** on Render

3. **Test Again**

This uses Resend's verified domain and should have better deliverability than a Gmail address.

---

## 📊 Email Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| **Delivered** | Reached recipient's server | Check spam folder |
| **Bounced** | Rejected by recipient server | Check email address validity |
| **Pending** | Still processing | Wait a few minutes |
| **Failed** | Error occurred | Check Resend logs for error |

---

## 🎯 Best Practices

1. **Always verify your domain** in Resend
2. **Use a professional domain email** (not Gmail)
3. **Warm up your domain** (start with low volume)
4. **Monitor bounce rates** in Resend dashboard
5. **Check spam scores** before sending

---

## 🔍 Debugging Checklist

- [ ] Check Resend dashboard for delivery status
- [ ] Check recipient's spam/junk folder
- [ ] Verify sender email is verified in Resend
- [ ] Test with Gmail address first
- [ ] Check Resend account limits
- [ ] Verify DNS records if using custom domain
- [ ] Check email headers for authentication
- [ ] Try Resend sandbox domain (`onboarding@resend.dev`)

---

## 💡 Recommendation

**For immediate fix:**
1. Change `FROM_EMAIL` to: `StaffOS <onboarding@resend.dev>`
2. Redeploy backend
3. Test again

**For production:**
1. Verify your domain in Resend
2. Use: `StaffOS <noreply@yourdomain.com>`
3. Much better deliverability!

---

**The email is being sent correctly - it's just a deliverability issue. Try the sandbox domain first!** 📧

