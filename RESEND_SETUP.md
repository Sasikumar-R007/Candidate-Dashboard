# Resend API Setup - Quick Guide

## Your Resend API Key
```
re_Nff19UXB_3UYmTbaUDvdFyxANhzJAEtPw
```

## Setup Instructions

### For Local Development (Testing)

1. **Create a `.env` file** in the **root directory** of your project (same level as `package.json`):

```env
RESEND_API_KEY=re_Nff19UXB_3UYmTbaUDvdFyxANhzJAEtPw
FROM_EMAIL=StaffOS <onboarding@resend.dev>
```

2. **Make sure dotenv is loaded** (check `server/index.ts` - it should already be configured)

3. **Start your server:**
```bash
npm run dev:backend
```

### For Production (Render)

1. **Go to your Render Dashboard**
2. **Select your Backend Service**
3. **Go to Environment → Environment Variables**
4. **Add these variables:**

```
RESEND_API_KEY=re_Nff19UXB_3UYmTbaUDvdFyxANhzJAEtPw
FROM_EMAIL=StaffOS <onboarding@resend.dev>
```

5. **Save and redeploy** your service

## Email Features Now Active

With this API key configured, the following features will work:

✅ **Candidate Registration** - Welcome emails and OTP verification  
✅ **Employee Creation** - Welcome emails with login credentials  
✅ **OTP Verification** - Email codes for account verification  
✅ **Password Resets** - Email-based password recovery (if implemented)

## Testing

1. **Create a candidate account** - You should receive an OTP email
2. **Create an employee** - They should receive a welcome email
3. **Check console logs** - You'll see email sending status

## Important Notes

- The default `FROM_EMAIL` uses Resend's sandbox domain (`onboarding@resend.dev`)
- For production, verify your own domain in Resend and update `FROM_EMAIL`
- This API key is for testing - consider creating a separate production key for live deployments
- Free tier allows 100 emails/day, 3,000 emails/month

## Troubleshooting

If emails aren't sending:
1. Check server logs for error messages
2. Verify the API key is set correctly (should start with `re_`)
3. Check Resend dashboard for delivery logs
4. Verify the recipient email address is valid

