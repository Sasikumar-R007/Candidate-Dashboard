import { getUncachableResendClient } from './resend-client';
import { getEmployeeWelcomeMessage } from './admin-settings';

interface EmployeeWelcomeEmailData {
  name: string;
  email: string;
  employeeId: string;
  role: string;
  password: string;
  loginUrl: string;
}

interface CandidateWelcomeEmailData {
  fullName: string;
  email: string;
  candidateId: string;
  loginUrl: string;
}

interface OTPEmailData {
  fullName: string;
  email: string;
  otp: string;
  expiresInMinutes: number;
}

export async function sendEmployeeWelcomeEmail(data: EmployeeWelcomeEmailData): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();
    const welcomeMessage = await getEmployeeWelcomeMessage();
    const welcomeParagraphs = welcomeMessage
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    const welcomeText = welcomeParagraphs.join("\n\n");
    const welcomeHtml = welcomeParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");

    const emailContent = `
Hi ${data.name},

${welcomeText}

**Your Login Details:**
- Employee ID: ${data.employeeId}
- Email: ${data.email}
- Password: ${data.password}
- Login URL: ${data.loginUrl}

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
    .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .credentials { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4F46E5; }
    .credentials strong { color: #1a1a1a; }
    .guidelines { margin: 20px 0; }
    .guidelines ol { padding-left: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to StaffOS!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.name},</p>

      ${welcomeHtml}
      
      <div class="credentials">
        <h3 style="margin-top: 0;">Your Login Details:</h3>
        <p><strong>Employee ID:</strong> ${data.employeeId}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
      </div>
      
      <div class="footer">
        <p><strong>Warm regards,<br>Team StaffOS</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const senderEmail = fromEmail || 'StaffOS <onboarding@resend.dev>';
    
    console.log(`[Welcome Email] Attempting to send welcome email to ${data.email} from ${senderEmail}`);
    console.log(`\n[DEV-TESTING] 📧 WELCOME EMAIL CONTENT for ${data.email}:\n${emailContent}\n`);
    console.log(`[Welcome Email] Resend API Key present: ${process.env.RESEND_API_KEY ? 'Yes (length: ' + process.env.RESEND_API_KEY.length + ')' : 'NO - MISSING!'}`);
    
    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: 'Welcome to StaffOS - Your Account is Ready!',
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error(`[Welcome Email] Resend API error:`, result.error);
      console.error(`[Welcome Email] Error details:`, JSON.stringify(result.error, null, 2));
      
      // Log failed attempt

      
      // Check for 403 Forbidden specifically
      if (result.error && typeof result.error === 'object' && 'message' in result.error) {
        const errorMsg = String(result.error.message || '');
        if (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('unauthorized')) {
          console.error(`[Welcome Email] ⚠️ 403 FORBIDDEN ERROR - Check RESEND_API_KEY and FROM_EMAIL configuration`);
        }
      }
      
      return false;
    }



    console.log(`[Welcome Email] Successfully sent welcome email to ${data.email} from ${senderEmail}. Email ID: ${result.data?.id || 'N/A'}`);
    return true;
  } catch (error) {
    console.error('Error sending employee welcome email:', error);

    return false;
  }
}

export async function sendCandidateWelcomeEmail(data: CandidateWelcomeEmailData): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();

    const emailContent = `
Hi ${data.fullName},

Welcome to StaffOS!

Your candidate account has been successfully created. We're excited to have you join our platform and help you find the perfect career opportunity.

**Your Profile Details:**
- Candidate ID: ${data.candidateId}
- Email: ${data.email}
- Login URL: ${data.loginUrl}

With StaffOS, you can:

• Track all your job applications in one place
• Update your profile and resume anytime
• Receive real-time updates on your application status
• Communicate directly with recruiters
• Get matched with opportunities that fit your skills and preferences

**What's Next?**

1. Complete your profile to increase your visibility to recruiters
2. Upload your latest resume for better job matching
3. Browse and apply to jobs that interest you
4. Stay updated on your application progress through your dashboard

Our team is committed to providing you with a transparent and seamless job search experience. If you have any questions or need assistance, feel free to reach out to our support team.

We wish you all the best in your career journey!

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
    .profile-info { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4F46E5; }
    .profile-info strong { color: #1a1a1a; }
    .features { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .features ul { list-style: none; padding-left: 0; }
    .features li { padding: 8px 0; padding-left: 25px; position: relative; }
    .features li:before { content: "✓"; position: absolute; left: 0; color: #4F46E5; font-weight: bold; }
    .next-steps { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .next-steps ol { padding-left: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .cta-button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to StaffOS!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.fullName},</p>
      
      <p>Your candidate account has been successfully created. We're excited to have you join our platform and help you find the perfect career opportunity.</p>
      
      <div class="profile-info">
        <h3 style="margin-top: 0;">Your Profile Details:</h3>
        <p><strong>Candidate ID:</strong> ${data.candidateId}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
      </div>
      
      <div class="features">
        <h3 style="margin-top: 0;">With StaffOS, you can:</h3>
        <ul>
          <li>Track all your job applications in one place</li>
          <li>Update your profile and resume anytime</li>
          <li>Receive real-time updates on your application status</li>
          <li>Communicate directly with recruiters</li>
          <li>Get matched with opportunities that fit your skills and preferences</li>
        </ul>
      </div>
      
      <div class="next-steps">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <ol>
          <li>Complete your profile to increase your visibility to recruiters</li>
          <li>Upload your latest resume for better job matching</li>
          <li>Browse and apply to jobs that interest you</li>
          <li>Stay updated on your application progress through your dashboard</li>
        </ol>
      </div>
      
      <center>
        <a href="${data.loginUrl}" class="cta-button">Login to Your Account</a>
      </center>
      
      <p>Our team is committed to providing you with a transparent and seamless job search experience. If you have any questions or need assistance, feel free to reach out to our support team.</p>
      
      <p>We wish you all the best in your career journey!</p>
      
      <div class="footer">
        <p><strong>Warm regards,<br>Team StaffOS</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const senderEmail = fromEmail || 'StaffOS <onboarding@resend.dev>';
    
    console.log(`[Candidate Welcome Email] Attempting to send welcome email to ${data.email} from ${senderEmail}`);
    console.log(`\n[DEV-TESTING] 📧 CANDIDATE WELCOME EMAIL CONTENT for ${data.email}:\n${emailContent}\n`);
    console.log(`[Candidate Welcome Email] Resend API Key present: ${process.env.RESEND_API_KEY ? 'Yes (length: ' + process.env.RESEND_API_KEY.length + ')' : 'NO - MISSING!'}`);
    
    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: 'Welcome to StaffOS - Start Your Career Journey!',
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error(`[Candidate Welcome Email] Resend API error:`, result.error);
      console.error(`[Candidate Welcome Email] Error details:`, JSON.stringify(result.error, null, 2));
      
      // Log failed attempt

      
      // Check for 403 Forbidden specifically
      if (result.error && typeof result.error === 'object' && 'message' in result.error) {
        const errorMsg = String(result.error.message || '');
        if (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('unauthorized')) {
          console.error(`[Candidate Welcome Email] ⚠️ 403 FORBIDDEN ERROR - Check RESEND_API_KEY and FROM_EMAIL configuration`);
        }
      }
      
      return false;
    }

    // Log successful send


    console.log(`[Candidate Welcome Email] Successfully sent welcome email to ${data.email} from ${senderEmail}. Email ID: ${result.data?.id || 'N/A'}`);
    return true;
  } catch (error) {
    console.error('Error sending candidate welcome email:', error);
    // Log exception
    try {

    } catch (e) {}
    return false;
  }
}

export async function sendOTPEmail(data: OTPEmailData): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();

    const emailContent = `
Hi ${data.fullName},

Your verification code for StaffOS is: **${data.otp}**

This code will expire in ${data.expiresInMinutes} minutes. For your security, please do not share this code with anyone.

If you didn't request this code, you can safely ignore this email.

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
    .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; text-align: center; }
    .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border: 1px dashed #4F46E5; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>StaffOS Verification</h1>
    </div>
    <div class="content">
      <p>Hi ${data.fullName},</p>
      <p>Use the following code to verify your request:</p>
      <div class="otp-code">${data.otp}</div>
      <p>This code will expire in <strong>${data.expiresInMinutes} minutes</strong>.</p>
      <p>For your security, please do not share this code with anyone.</p>
      
      <div class="footer">
        <p><strong>Warm regards,<br>Team StaffOS</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const senderEmail = fromEmail || 'StaffOS <onboarding@resend.dev>';
    
    console.log(`[OTP Email] Attempting to send OTP email to ${data.email} from ${senderEmail}`);
    console.log(`\n[DEV-TESTING] 🔑 OTP GENERATED: ${data.otp} for ${data.email}\n`);
    
    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: `StaffOS Verification Code: ${data.otp}`,
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error(`[OTP Email] Resend API error:`, result.error);
      // Log failed attempt

      return false;
    }

    // Log successful send


    console.log(`[OTP Email] Successfully sent OTP to ${data.email}. ID: ${result.data?.id}`);
    return true;
  } catch (error) {
    console.error('[OTP Email] Error sending OTP email:', error);
    // Log exception
    try {

    } catch (e) {}
    return false;
  }
}

export interface ClientMemberInviteEmailData {
  name: string;
  email: string;
  companyName: string;
  inviteUrl: string;
  expiresInDays: number;
}

export async function sendClientMemberInviteEmail(
  data: ClientMemberInviteEmailData,
): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();
    const senderEmail = fromEmail || "StaffOS <onboarding@resend.dev>";

    const emailContent = `
Hi ${data.name},

You have been invited to join ${data.companyName} on StaffOS as a Client Member.

Accept your invitation and set your password using this link (valid for ${data.expiresInDays} days):
${data.inviteUrl}

If you did not expect this invitation, you can ignore this email.

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
    .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .button { display: inline-block; background-color: #4F46E5; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>StaffOS Client Invitation</h1></div>
    <div class="content">
      <p>Hi ${data.name},</p>
      <p>You have been invited to join <strong>${data.companyName}</strong> on StaffOS as a Client Member.</p>
      <p><a class="button" href="${data.inviteUrl}" target="_blank" rel="noopener noreferrer">Accept invitation</a></p>
      <p style="font-size: 14px; color: #666;">Or copy this link: ${data.inviteUrl}</p>
      <p style="font-size: 14px; color: #666;">This link expires in ${data.expiresInDays} days.</p>
    </div>
    <div class="footer"><p>Team StaffOS</p></div>
  </div>
</body>
</html>
    `.trim();

    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: `You're invited to ${data.companyName} on StaffOS`,
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error("[Client Invite Email] Resend error:", result.error);
      return false;
    }
    console.log(`[Client Invite Email] Sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("Error sending client member invite email:", error);
    return false;
  }
}
