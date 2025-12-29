# OTP Email Implementation Guide

## Current Status

✅ **What's Working:**
- OTP generation (4-digit)
- OTP storage with expiry (10 minutes)
- OTP verification endpoint
- Frontend OTP input form
- Login flow detects unverified accounts

❌ **What's Missing:**
- Email sending for OTP (currently shown in alert for demo)
- OTP expiry validation on frontend
- Resend OTP functionality
- Rate limiting for OTP requests

---

## Recommended Implementation Steps

### Step 1: Create OTP Email Template Function

Add a new function to `server/email-service.ts`:

```typescript
interface OTPEmailData {
  fullName: string;
  email: string;
  otp: string;
  expiresInMinutes: number;
}

export async function sendOTPEmail(data: OTPEmailData): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();

    const emailContent = `
Hi ${data.fullName},

Your verification code for StaffOS is: ${data.otp}

This code will expire in ${data.expiresInMinutes} minutes.

If you didn't request this code, please ignore this email.

Warm regards,
Team StaffOS
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .otp-box { background-color: white; padding: 30px; margin: 20px 0; text-align: center; border: 2px dashed #4F46E5; border-radius: 8px; }
    .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: monospace; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>StaffOS Verification Code</h1>
    </div>
    <div class="content">
      <p>Hi ${data.fullName},</p>
      
      <p>Please use the following code to verify your account:</p>
      
      <div class="otp-box">
        <div class="otp-code">${data.otp}</div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> This code will expire in ${data.expiresInMinutes} minutes. Do not share this code with anyone.
      </div>
      
      <p>If you didn't request this verification code, please ignore this email or contact our support team.</p>
      
      <div class="footer">
        <p><strong>Warm regards,<br>Team StaffOS</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const senderEmail = fromEmail || 'StaffOS <onboarding@resend.dev>';
    await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: `Your StaffOS Verification Code: ${data.otp}`,
      text: emailContent,
      html: htmlContent,
    });

    console.log(`OTP email sent successfully to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
```

### Step 2: Update Registration Endpoint

In `server/routes.ts`, update the candidate registration endpoint:

```typescript
// After generating OTP (line ~496)
const otp = Math.floor(1000 + Math.random() * 9000).toString();
await storage.storeOTP(candidateData.email, otp);

// Send OTP via email instead of showing in alert
await sendOTPEmail({
  fullName: newCandidate.fullName,
  email: newCandidate.email,
  otp: otp,
  expiresInMinutes: 10
});

// Remove the OTP from response (don't send it in JSON)
res.json({
  success: true,
  message: "Registration successful! Please check your email for the verification code.",
  candidateId: newCandidate.candidateId,
  email: newCandidate.email,
  requiresVerification: true
});
```

### Step 3: Update Login Endpoint

In `server/routes.ts`, update the login endpoint (line ~615):

```typescript
if (!candidate.isVerified) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  await storage.storeOTP(candidate.email, otp);
  
  // Send OTP via email
  await sendOTPEmail({
    fullName: candidate.fullName,
    email: candidate.email,
    otp: otp,
    expiresInMinutes: 10
  });
  
  return res.status(403).json({
    message: "Account not verified. Please check your email for the verification code.",
    requiresVerification: true,
    email: candidate.email
    // Don't send OTP in response
  });
}
```

### Step 4: Add Resend OTP Endpoint

Add a new endpoint in `server/routes.ts`:

```typescript
app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const candidate = await storage.getCandidateByEmail(email);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await storage.storeOTP(email, otp);

    // Send OTP via email
    await sendOTPEmail({
      fullName: candidate.fullName,
      email: candidate.email,
      otp: otp,
      expiresInMinutes: 10
    });

    res.json({
      success: true,
      message: "New verification code has been sent to your email"
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});
```

### Step 5: Update Frontend - Add Resend OTP Button

In `client/src/pages/candidate-login.tsx`, add resend functionality:

```typescript
const resendOTPMutation = useMutation({
  mutationFn: async () => {
    const res = await apiRequest('POST', '/api/auth/resend-otp', { email: currentEmail });
    return await res.json();
  },
  onSuccess: () => {
    toast({
      title: "Code Sent",
      description: "A new verification code has been sent to your email",
    });
  },
  onError: (error: any) => {
    toast({
      title: "Failed to Resend",
      description: error.message || "Please try again later",
      variant: "destructive"
    });
  }
});

// In the OTP form, update the resend button:
<button
  type="button"
  onClick={() => resendOTPMutation.mutate()}
  disabled={resendOTPMutation.isPending}
  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
  data-testid="button-resend-otp"
>
  {resendOTPMutation.isPending ? "Sending..." : "Resend Code"}
</button>
```

### Step 6: Add OTP Expiry Timer (Frontend)

Add a countdown timer in the OTP form:

```typescript
const [otpExpiry, setOtpExpiry] = useState(600); // 10 minutes in seconds

useEffect(() => {
  if (showOTP && otpExpiry > 0) {
    const timer = setInterval(() => {
      setOtpExpiry(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [showOTP, otpExpiry]);

// Display in UI:
{otpExpiry > 0 ? (
  <p className="text-sm text-gray-500">
    Code expires in {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
  </p>
) : (
  <p className="text-sm text-red-500">Code expired. Please request a new one.</p>
)}
```

### Step 7: Add Rate Limiting (Backend)

Prevent OTP spam by adding rate limiting:

```typescript
// Store OTP request timestamps (in-memory or Redis)
const otpRequestLimits = new Map<string, { count: number; resetAt: number }>();

app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const now = Date.now();
    const limit = otpRequestLimits.get(email);

    // Reset limit after 1 hour
    if (limit && limit.resetAt < now) {
      otpRequestLimits.delete(email);
    }

    const currentLimit = otpRequestLimits.get(email);
    if (currentLimit && currentLimit.count >= 5) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
        retryAfter: Math.ceil((currentLimit.resetAt - now) / 1000)
      });
    }

    // Update limit
    if (!currentLimit) {
      otpRequestLimits.set(email, { count: 1, resetAt: now + 3600000 }); // 1 hour
    } else {
      currentLimit.count++;
    }

    // ... rest of resend OTP logic
  } catch (error) {
    // ...
  }
});
```

---

## Best Practices

### 1. **Security**
- ✅ Never send OTP in API responses (only via email)
- ✅ OTP expires after 10 minutes
- ✅ Rate limit OTP requests (max 5 per hour per email)
- ✅ Invalidate OTP after successful verification
- ✅ Use cryptographically secure random number generation

### 2. **User Experience**
- ✅ Show clear expiry countdown
- ✅ Provide "Resend OTP" option
- ✅ Clear error messages
- ✅ Auto-focus OTP input
- ✅ Auto-submit when 4 digits entered

### 3. **Email Delivery**
- ✅ Use professional email template
- ✅ Include expiry time in email
- ✅ Add security warning
- ✅ Use proper sender name (StaffOS)
- ✅ Test email delivery in production

### 4. **Error Handling**
- ✅ Handle email sending failures gracefully
- ✅ Log all OTP attempts for security
- ✅ Provide fallback if email fails
- ✅ Clear error messages for users

---

## Testing Checklist

- [ ] OTP is sent via email (not shown in alert)
- [ ] OTP expires after 10 minutes
- [ ] Resend OTP works correctly
- [ ] Rate limiting prevents spam
- [ ] Invalid OTP shows proper error
- [ ] Expired OTP shows proper error
- [ ] Successful verification logs user in
- [ ] Email template looks professional
- [ ] Email arrives in inbox (not spam)

---

## Environment Variables Required

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=StaffOS <noreply@yourdomain.com>
```

---

## Implementation Priority

1. **High Priority:**
   - Create OTP email function
   - Update registration/login to send email
   - Remove OTP from API responses

2. **Medium Priority:**
   - Add resend OTP functionality
   - Add expiry timer on frontend

3. **Low Priority:**
   - Add rate limiting
   - Add auto-submit on OTP entry
   - Add OTP attempt logging

---

## Notes

- **Current Demo Mode:** OTP is shown in alert for testing
- **Production Mode:** OTP should ONLY be sent via email
- **Email Service:** Uses Resend (already configured)
- **OTP Storage:** Currently in database with expiry
- **Expiry Time:** 10 minutes (configurable)

