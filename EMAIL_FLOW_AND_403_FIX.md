# Email Flow Explanation and 403 Error Fix

## Email Flow (Expected Behavior)

### During Registration:
1. **User fills stepper form** and clicks "Submit"
2. **Backend sends 2 emails**:
   - Welcome email (introduction to StaffOS)
   - OTP email (verification code)
3. **User is redirected to login page** (because account needs verification)

### During Login (Unverified Account):
1. **User enters email/password** and clicks "Login"
2. **Backend detects account is not verified**
3. **Backend sends 1 OTP email** (new verification code)
4. **User sees OTP verification form**

### Resend OTP:
1. **User clicks "Resend Code"**
2. **Backend sends 1 more OTP email**

## Why You See 3 Emails in Resend Logs

The 3 emails you're seeing are:
1. **Welcome email** (during registration)
2. **OTP email** (during registration)
3. **OTP email** (during login, because account is unverified)

This is **correct behavior** - the system is working as designed. The problem is that all 3 are getting `403 Forbidden` errors, which means the emails aren't actually being sent.

## The 403 Forbidden Error

**What it means**: Resend is rejecting your API requests because of authentication/authorization issues.

**Why it happens**:
- Invalid or incorrect `RESEND_API_KEY` in Render
- API key doesn't have permission to send emails
- API key format is wrong
- FROM_EMAIL domain not verified

## Quick Fix Steps

### 1. Check Resend API Key in Render

1. Go to **Render Dashboard** → Your Backend Service → **Environment**
2. Find `RESEND_API_KEY`
3. Verify:
   - It exists
   - It starts with `re_`
   - It matches the key from Resend dashboard
   - No extra spaces or characters

### 2. Get/Verify API Key in Resend

1. Go to **Resend Dashboard**: https://resend.com/api-keys
2. Check if your API key exists and is active
3. If not, create a new one with "Send Email" permission
4. Copy the key (starts with `re_`)

### 3. Update Render Environment Variables

1. In Render → Environment, update `RESEND_API_KEY`:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
2. Verify `FROM_EMAIL` is set:
   ```
   FROM_EMAIL=StaffOS <onboarding@resend.dev>
   ```
3. Click **"Save Changes"**

### 4. Redeploy Backend

- Render will auto-redeploy after saving environment variables
- Or manually trigger a redeploy

### 5. Test Again

1. Register a new candidate
2. Check **Render logs** for:
   - `[OTP Email] Resend API Key present: Yes (length: XX)`
   - Should NOT see: `NO - MISSING!`
3. Check **Resend Dashboard → Logs**:
   - Should see `200 OK` (not `403 Forbidden`)
   - Emails should be in "Sent" status

## Enhanced Logging

After redeploying, the system will log:
- Whether API key is present
- API key length (for verification)
- Detailed error messages for 403 errors
- Specific guidance on what to check

Look for these in Render logs:
- `[OTP Email]`
- `[Welcome Email]`
- `[Candidate Welcome Email]`

## Verification Checklist

After fixing:
- [ ] `RESEND_API_KEY` exists in Render (not just local `.env`)
- [ ] API key starts with `re_` and is correct
- [ ] `FROM_EMAIL` is set in Render
- [ ] Backend redeployed after changes
- [ ] Render logs show "Resend API Key present: Yes"
- [ ] Resend logs show `200 OK` (not `403`)
- [ ] Emails actually arrive in inbox (check spam folder)

## Common Mistakes

1. **API key only in local `.env`**: Render needs it in its own environment variables
2. **Extra spaces in API key**: Copy-paste might add spaces
3. **Wrong API key**: Using old/revoked key instead of current one
4. **Not redeploying**: Environment variable changes require redeploy

## Still Getting 403?

1. **Create a NEW API key** in Resend (old one might be corrupted)
2. **Delete and re-add** `RESEND_API_KEY` in Render
3. **Redeploy** backend
4. **Test** with a new registration

If still not working, check:
- Resend account status (active, not suspended)
- Rate limits (free tier: 100 emails/day)
- Domain verification status (if using custom domain)

