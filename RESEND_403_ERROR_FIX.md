# Fixing Resend 403 Forbidden Error

## Problem
You're seeing `403 Forbidden` errors in Resend logs when trying to send emails. This means the API requests are reaching Resend but being rejected due to authentication/authorization issues.

## Root Causes

The 403 error typically occurs due to one of these reasons:

1. **Invalid or Incorrect API Key**
   - API key is wrong or has been regenerated
   - API key format is incorrect
   - API key has been deleted or revoked

2. **API Key Permissions**
   - API key doesn't have permission to send emails
   - API key is restricted to certain domains/operations

3. **Unverified FROM_EMAIL Domain**
   - The domain in `FROM_EMAIL` is not verified in Resend
   - Using a domain that's not authorized for your API key

4. **API Key Format Issues**
   - API key should start with `re_`
   - Extra spaces or characters in the API key

## Step-by-Step Fix

### Step 1: Verify Your Resend API Key

1. **Go to Resend Dashboard**: https://resend.com/api-keys
2. **Check if your API key exists**:
   - If it doesn't exist, create a new one
   - If it exists, verify it's active (not revoked)
3. **Copy the API key** (it should start with `re_`)

### Step 2: Check API Key in Render

1. **Go to Render Dashboard** → Your Backend Service → Environment
2. **Find `RESEND_API_KEY`**:
   - Check if it exists
   - Verify it matches the key from Resend dashboard
   - Make sure there are no extra spaces or characters
   - Should look like: `re_1234567890abcdefghijklmnopqrstuvwxyz`

### Step 3: Verify FROM_EMAIL Domain

1. **Check your `FROM_EMAIL` in Render**:
   - Current value: `StaffOS <onboarding@resend.dev>`
   - This uses Resend's sandbox domain which should work

2. **If using custom domain**:
   - Go to Resend Dashboard → Domains
   - Verify your domain is added and verified
   - DNS records (SPF, DKIM, DMARC) must be configured
   - Update `FROM_EMAIL` to: `StaffOS <noreply@yourdomain.com>`

### Step 4: Test API Key

1. **In Resend Dashboard**:
   - Go to API Keys section
   - Check if the key has "Send Email" permission enabled
   - If not, create a new key with full permissions

2. **Verify API Key Format**:
   ```bash
   # Should start with 're_'
   # Example: re_1234567890abcdefghijklmnopqrstuvwxyz
   ```

### Step 5: Update Render Environment Variables

1. **Go to Render** → Your Backend Service → Environment
2. **Update `RESEND_API_KEY`**:
   - Delete the old value
   - Paste the new/correct API key
   - Make sure no spaces before/after
   - Click "Save Changes"

3. **Verify `FROM_EMAIL`**:
   - Should be: `StaffOS <onboarding@resend.dev>` (for testing)
   - Or: `StaffOS <noreply@yourdomain.com>` (if domain verified)

### Step 6: Redeploy Backend

1. **After updating environment variables**:
   - Render will automatically redeploy
   - Or manually trigger a redeploy

2. **Check Render logs** after redeploy:
   - Look for `[OTP Email]` or `[Welcome Email]` entries
   - Should see: "Resend API Key present: Yes (length: XX)"
   - Should NOT see: "NO - MISSING!"

### Step 7: Test Email Sending

1. **Register a new candidate** or **login with unverified account**
2. **Check Render logs** for:
   - `[OTP Email] Attempting to send...`
   - `[OTP Email] Successfully sent...` (should NOT see 403 error)
3. **Check Resend Dashboard → Logs**:
   - Should see `200 OK` instead of `403 Forbidden`
   - Email should be in "Sent" status

## Common Issues and Solutions

### Issue: API Key Not Found in Render
**Solution**: 
- Make sure variable name is exactly `RESEND_API_KEY` (case-sensitive)
- No spaces in the variable name
- Value should be the full API key starting with `re_`

### Issue: API Key Works Locally But Not in Production
**Solution**:
- Render environment variables are separate from local `.env`
- Make sure you've added `RESEND_API_KEY` to Render, not just local `.env`
- Redeploy after adding environment variables

### Issue: Still Getting 403 After Fixing API Key
**Solution**:
1. Create a **new API key** in Resend (old one might be corrupted)
2. Delete old `RESEND_API_KEY` in Render
3. Add new `RESEND_API_KEY` in Render
4. Redeploy backend
5. Test again

### Issue: FROM_EMAIL Domain Not Verified
**Solution**:
- For testing: Use `StaffOS <onboarding@resend.dev>` (Resend's sandbox)
- For production: Verify your domain in Resend Dashboard → Domains
- Add required DNS records (SPF, DKIM, DMARC)
- Wait for verification (usually takes a few minutes)

## Verification Checklist

After fixing, verify:

- [ ] `RESEND_API_KEY` exists in Render environment variables
- [ ] API key starts with `re_` and is correct
- [ ] `FROM_EMAIL` is set correctly in Render
- [ ] Backend has been redeployed after changes
- [ ] Render logs show "Resend API Key present: Yes"
- [ ] Resend Dashboard logs show `200 OK` (not `403 Forbidden`)
- [ ] Emails are being sent successfully

## Enhanced Logging

The system now logs:
- Whether API key is present and its length
- Detailed error messages for 403 errors
- Specific guidance on what to check
- Full Resend API responses

Check Render logs for entries starting with:
- `[OTP Email]`
- `[Welcome Email]`
- `[Candidate Welcome Email]`

## Still Having Issues?

If you're still getting 403 errors after following these steps:

1. **Check Resend Account Status**:
   - Make sure your Resend account is active
   - Check if you've hit rate limits
   - Verify account billing status

2. **Contact Resend Support**:
   - They can check if your API key has proper permissions
   - They can verify domain status
   - They can check for account-level restrictions

3. **Try Creating a New API Key**:
   - Sometimes old keys get corrupted
   - Create a new key with full permissions
   - Update Render and redeploy

