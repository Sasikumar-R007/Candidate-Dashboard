# Email Welcome System - Setup Guide

## Overview

The StaffOS application now includes an automated welcome email system that sends professional emails to new users when their accounts are created.

## What Has Been Implemented

### 1. **Email Service (`server/email-service.ts`)**
A dedicated email service module that handles all email sending functionality using Resend.

### 2. **Employee Welcome Emails**
When a new employee (Admin/Team Leader/Recruiter/Client) is created, they automatically receive an email containing:
- Welcome message
- Employee ID
- Login credentials (email & password)
- Login URL
- Important guidelines for using StaffOS
- Support information

### 3. **Candidate Welcome Emails**
When a new candidate registers, they automatically receive an email containing:
- Welcome message
- Candidate ID
- Login URL
- Features they can use on StaffOS
- Next steps to complete their profile
- Support information

## Email Templates

### For Employees:
The email follows your exact specification with:
- Professional HTML and plain text versions
- Clear credential display
- Guidelines for data confidentiality and accuracy
- Support chat information

### For Candidates:
A welcoming email that includes:
- Overview of StaffOS features
- Profile completion guidance
- Job tracking capabilities
- Direct recruiter communication
- Career journey support

## How It Works

### When Employees Are Created:
1. Admin creates a new employee via `/api/admin/employees`
2. System generates employee ID
3. Employee record is saved to database
4. Welcome email is sent automatically with login credentials
5. Employee receives email and can log in immediately

### When Candidates Register:
1. Candidate registers via `/api/auth/candidate-register`
2. System generates candidate ID
3. Candidate record is saved to database
4. Welcome email is sent automatically
5. Candidate also receives OTP for verification

### When Clients Are Created:
1. Admin creates a new client via `/api/admin/clients`
2. System creates both client record and employee record
3. Welcome email is sent automatically with login credentials
4. Client can log in using their credentials

## Setup Requirements

To make the email system functional, you need:

### 1. **Resend API Key**
- Sign up at [Resend.com](https://resend.com)
- Create an API key
- Add it to your environment variables

### 2. **Verified Sender Email**
- Verify your domain with Resend (recommended for production)
- Or use Resend's sandbox domain for testing

## Configuration Steps

### For Development (Replit):

1. **Get Your Resend API Key:**
   - Go to https://resend.com
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Set Up Environment Variables:**
   The system will request these from you:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: The email address to send from (e.g., `StaffOS <onboarding@yourdomain.com>`)

3. **Testing:**
   - Create a new employee or candidate
   - Check the email inbox
   - Verify email content and links

### For Production Deployment:

1. **Domain Verification:**
   - Add your domain to Resend
   - Add DNS records (MX, TXT, CNAME)
   - Verify domain ownership
   - Use your domain email (e.g., `welcome@staffos.com`)

2. **Environment Variables:**
   Set these in your production environment:
   ```bash
   RESEND_API_KEY=re_your_production_api_key
   FROM_EMAIL=StaffOS <welcome@yourdomain.com>
   REPLIT_DEV_DOMAIN=your-production-domain.com
   ```

3. **Email Volume:**
   - Free tier: 100 emails/day
   - Paid plans: Higher limits available
   - Check Resend pricing for your needs

## Email Sending Flow

```
User Creation
    ↓
Database Save
    ↓
Generate Login URL
    ↓
Prepare Email Data
    ↓
Send via Resend API
    ↓
Log Success/Failure
    ↓
Continue (non-blocking)
```

## Important Notes

### Graceful Degradation
- If `RESEND_API_KEY` is not set, the system logs a warning and continues without sending emails
- This ensures the application still works even if email is not configured
- No errors are thrown to the user

### Security
- Passwords are sent only once via email during account creation
- Use strong passwords when creating accounts
- Encourage users to change passwords after first login
- Emails are sent over secure HTTPS

### Login URLs
- Development: Uses `REPLIT_DEV_DOMAIN` environment variable
- Production: Update to your production domain
- Always HTTPS in production

## Testing the Email System

### 1. Test Employee Email:
```bash
POST /api/admin/employees
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePass123",
  "role": "recruiter"
}
```

### 2. Test Candidate Email:
```bash
POST /api/auth/candidate-register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 3. Check Logs:
Look for messages like:
- `Welcome email sent successfully to user@example.com`
- Or warnings if email is not configured

## Troubleshooting

### Email Not Sending:
1. Check if `RESEND_API_KEY` is set correctly
2. Verify API key is valid in Resend dashboard
3. Check server logs for error messages
4. Ensure `FROM_EMAIL` is from a verified domain

### Email in Spam:
1. Verify your sending domain with Resend
2. Add SPF, DKIM, and DMARC records
3. Use a professional sending domain
4. Avoid spam trigger words

### Wrong Login URL:
1. Check `REPLIT_DEV_DOMAIN` environment variable
2. Update to your actual domain
3. Ensure protocol is HTTPS in production

## Cost Estimation

**Resend Pricing (as of 2024):**
- Free tier: 3,000 emails/month
- Paid: Starting at $20/month for 50,000 emails
- No per-email charges beyond quota

**For StaffOS:**
- Typical usage: ~100-500 emails/month (for new users)
- Free tier is usually sufficient
- Scale to paid plan as team grows

## Next Steps for Production

1. ✅ Email service implemented
2. ✅ Welcome templates created
3. ✅ Integration with user creation
4. 🔲 Get Resend API key
5. 🔲 Configure environment variables
6. 🔲 Test email sending
7. 🔲 Verify domain for production
8. 🔲 Monitor email delivery

## Support

If you need help:
1. Check Resend documentation: https://resend.com/docs
2. Verify API key is correct
3. Check server logs for detailed errors
4. Contact Resend support for delivery issues

---

**Ready to go live?** Just add your Resend API key and the system will start sending welcome emails automatically!
