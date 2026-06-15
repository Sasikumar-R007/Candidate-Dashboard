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
  password?: string;
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
    const credentialsBlock = data.password
      ? `
**Your Login Details:**
- Candidate ID: ${data.candidateId}
- Email: ${data.email}
- Temporary Password: ${data.password}
- Login URL: ${data.loginUrl}

Please change your password after your first login.
`
      : `
**Your Profile Details:**
- Candidate ID: ${data.candidateId}
- Email: ${data.email}
- Login URL: ${data.loginUrl}
`;
    const credentialsHtml = data.password
      ? `
      <div class="profile-info">
        <h3 style="margin-top: 0;">Your Login Details:</h3>
        <p><strong>Candidate ID:</strong> ${data.candidateId}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Temporary Password:</strong> ${data.password}</p>
        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
        <p style="margin-bottom: 0;">Please change your password after your first login.</p>
      </div>
`
      : `
      <div class="profile-info">
        <h3 style="margin-top: 0;">Your Profile Details:</h3>
        <p><strong>Candidate ID:</strong> ${data.candidateId}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
      </div>
`;

    const emailContent = `
Hi ${data.fullName},

Welcome to StaffOS!

Your candidate account has been successfully created. We're excited to have you join our platform and help you find the perfect career opportunity.

${credentialsBlock}
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
      
      ${credentialsHtml}
      
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

const CLIENT_PORTAL_EMAIL_STYLES = `
  body { margin: 0; padding: 0; background-color: #eef2ff; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2937; }
  .outer { width: 100%; padding: 24px 12px; box-sizing: border-box; }
  .container { max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12); }
  .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; font-weight: 700; line-height: 1.3; }
  .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.95; }
  .content { padding: 28px 24px 20px; }
  .content p { margin: 0 0 14px; font-size: 15px; }
  .section-title { margin: 22px 0 10px; font-size: 16px; font-weight: 700; color: #1e3a8a; }
  .credentials { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 14px; }
  .credentials th, .credentials td { border: 1px solid #dbeafe; padding: 10px 12px; text-align: left; vertical-align: top; }
  .credentials th { background-color: #eff6ff; color: #1e40af; width: 34%; font-weight: 600; }
  .credentials td { background-color: #ffffff; word-break: break-word; }
  .callout { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px; }
  .callout strong { display: block; margin-bottom: 6px; color: #92400e; }
  ul { margin: 8px 0 14px; padding-left: 20px; }
  li { margin-bottom: 6px; font-size: 14px; }
  .cta-wrap { text-align: center; margin: 26px 0 8px; }
  .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
  .footer { text-align: center; padding: 20px 24px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
  .footer strong { color: #1e40af; }
`;

function buildClientPortalEmailShell(options: {
  title: string;
  subtitle: string;
  bodyHtml: string;
  loginUrl: string;
  ctaLabel?: string;
}): string {
  const ctaLabel = options.ctaLabel || "Access StaffOS";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${CLIENT_PORTAL_EMAIL_STYLES}</style>
</head>
<body>
  <div class="outer">
    <div class="container">
      <div class="header">
        <h1>${options.title}</h1>
        <p>${options.subtitle}</p>
      </div>
      <div class="content">
        ${options.bodyHtml}
        <div class="cta-wrap">
          <a class="cta-button" href="${options.loginUrl}" target="_blank" rel="noopener noreferrer">${ctaLabel}</a>
        </div>
      </div>
      <div class="footer">
        <p><strong>StaffOS</strong> — Powered by Nudges.</p>
        <p>Transparent Hiring Starts Here.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function buildCredentialsTable(loginUrl: string, username: string, password: string): string {
  return `
<table class="credentials" role="presentation">
  <tr><th>Login URL</th><td><a href="${loginUrl}">${loginUrl}</a></td></tr>
  <tr><th>Username</th><td>${username}</td></tr>
  <tr><th>Temporary Password</th><td>${password}</td></tr>
</table>
  `.trim();
}

export interface ClientAdminWelcomeEmailData {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}

export interface ClientMemberWelcomeEmailData {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}

export async function sendClientAdminWelcomeEmail(
  data: ClientAdminWelcomeEmailData,
): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();
    const senderEmail = fromEmail || "StaffOS <onboarding@resend.dev>";
    const username = data.email;

    const emailContent = `
Hi ${data.name},

Welcome to StaffOS — The Operating System for Hiring.

Your Client Admin account has been successfully created. You can now access your hiring dashboard and manage your recruitment workflows with real-time visibility, structured communication, and centralized hiring operations.

Login Credentials:
- Login URL: ${data.loginUrl}
- Username: ${username}
- Temporary Password: ${data.password}

Important Security Step:
For security purposes, you will be required to change your password immediately after your first login. Please ensure your new password is kept secure and not shared with unauthorized users.

Getting Started Inside StaffOS:
- Create Departments
- Add Team Members
- Control Sensitive Data Visibility (CTC details, candidate visibility controls)

What You Can Access:
- Real-time hiring pipeline visibility
- Candidate tracking
- Structured recruiter communication
- Hiring metrics & dashboards
- Downloadable candidate profiles
- Nudge-based update tracking

Access StaffOS: ${data.loginUrl}

StaffOS — Powered by Nudges.
Transparent Hiring Starts Here.
    `.trim();

    const bodyHtml = `
      <p>Hi ${data.name},</p>
      <p>Welcome to <strong>StaffOS</strong> — The Operating System for Hiring.</p>
      <p>Your <strong>Client Admin</strong> account has been successfully created. You can now access your hiring dashboard and manage your recruitment workflows with real-time visibility, structured communication, and centralized hiring operations.</p>
      <p class="section-title">Login Credentials</p>
      ${buildCredentialsTable(data.loginUrl, username, data.password)}
      <div class="callout">
        <strong>Important Security Step</strong>
        For security purposes, you will be required to change your password immediately after your first login.
        Please ensure your new password is kept secure and not shared with unauthorized users.
      </div>
      <p class="section-title">Getting Started Inside StaffOS</p>
      <p>Once logged in, you can:</p>
      <ul>
        <li><strong>Create Departments</strong> — Set up departments based on your hiring structure and business functions.</li>
        <li><strong>Add Team Members</strong> — Invite users under each department and manage access permissions accordingly.</li>
        <li><strong>Control Sensitive Data Visibility</strong> — While creating users, you can allow or restrict access to sensitive candidate information such as CTC details (compensation data) and candidate visibility controls.</li>
      </ul>
      <p class="section-title">What You Can Access</p>
      <ul>
        <li>Real-time hiring pipeline visibility</li>
        <li>Candidate tracking</li>
        <li>Structured recruiter communication</li>
        <li>Hiring metrics &amp; dashboards</li>
        <li>Downloadable candidate profiles</li>
        <li>Nudge-based update tracking</li>
      </ul>
      <p>If you face any issues while accessing the platform, please contact the StaffOS support team.</p>
    `;

    const htmlContent = buildClientPortalEmailShell({
      title: "Welcome to StaffOS",
      subtitle: "Your Client Admin account is ready",
      bodyHtml,
      loginUrl: data.loginUrl,
    });

    console.log(`[Client Admin Welcome] Sending to ${data.email}`);
    console.log(`\n[DEV-TESTING] Client Admin welcome for ${data.email}\n${emailContent}\n`);

    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: "Welcome to StaffOS – Your Client Admin Account is Ready",
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error("[Client Admin Welcome] Resend error:", result.error);
      return false;
    }
    console.log(`[Client Admin Welcome] Sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("Error sending client admin welcome email:", error);
    return false;
  }
}

export async function sendClientMemberWelcomeEmail(
  data: ClientMemberWelcomeEmailData,
): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();
    const senderEmail = fromEmail || "StaffOS <onboarding@resend.dev>";
    const username = data.email;

    const emailContent = `
Hi ${data.name},

Welcome to StaffOS.

Your account has been created by your organization's Client Admin. You can now access StaffOS to track hiring pipelines, review candidate progress, and collaborate through a centralized hiring workflow.

Login Credentials:
- Login URL: ${data.loginUrl}
- Username: ${username}
- Temporary Password: ${data.password}

Important Security Step:
For security purposes, you will be required to change your password during your first login. Please keep your login credentials secure and avoid sharing them with unauthorized users.

What You Can Access (based on permissions assigned by your Client Admin):
- View hiring pipelines
- Track candidate progress
- Access recruiter updates
- Monitor hiring metrics
- Download candidate profiles
- Stay updated through structured communication workflows

Please note that access to sensitive information such as compensation details may be restricted based on your assigned permissions.

Getting Started:
1. Login to StaffOS
2. Change your password
3. Explore your assigned dashboards
4. Start tracking your hiring workflows

Access StaffOS: ${data.loginUrl}

StaffOS — Powered by Nudges.
Transparent Hiring Starts Here.
    `.trim();

    const bodyHtml = `
      <p>Hi ${data.name},</p>
      <p>Welcome to <strong>StaffOS</strong>.</p>
      <p>Your account has been created by your organization's <strong>Client Admin</strong>. You can now access StaffOS to track hiring pipelines, review candidate progress, and collaborate through a centralized hiring workflow.</p>
      <p class="section-title">Login Credentials</p>
      ${buildCredentialsTable(data.loginUrl, username, data.password)}
      <div class="callout">
        <strong>Important Security Step</strong>
        For security purposes, you will be required to change your password during your first login.
        Please keep your login credentials secure and avoid sharing them with unauthorized users.
      </div>
      <p class="section-title">What You Can Access</p>
      <p>Based on the permissions assigned by your Client Admin, you may be able to:</p>
      <ul>
        <li>View hiring pipelines</li>
        <li>Track candidate progress</li>
        <li>Access recruiter updates</li>
        <li>Monitor hiring metrics</li>
        <li>Download candidate profiles</li>
        <li>Stay updated through structured communication workflows</li>
      </ul>
      <p>Please note that access to sensitive information such as compensation details may be restricted based on your assigned permissions.</p>
      <p class="section-title">Getting Started</p>
      <ol>
        <li>Login to StaffOS</li>
        <li>Change your password</li>
        <li>Explore your assigned dashboards</li>
        <li>Start tracking your hiring workflows</li>
      </ol>
    `;

    const htmlContent = buildClientPortalEmailShell({
      title: "Welcome to StaffOS",
      subtitle: "Your account has been created",
      bodyHtml,
      loginUrl: data.loginUrl,
    });

    console.log(`[Client Member Welcome] Sending to ${data.email}`);

    const result = await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: "Welcome to StaffOS – Your Account Has Been Created!",
      text: emailContent,
      html: htmlContent,
    });

    if (result.error) {
      console.error("[Client Member Welcome] Resend error:", result.error);
      return false;
    }
    console.log(`[Client Member Welcome] Sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("Error sending client member welcome email:", error);
    return false;
  }
}

