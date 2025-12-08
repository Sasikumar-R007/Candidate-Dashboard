import { getUncachableResendClient } from './resend-client';

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

export async function sendEmployeeWelcomeEmail(data: EmployeeWelcomeEmailData): Promise<boolean> {
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();

    const emailContent = `
Hi ${data.name},

Welcome to StaffOS!

Your account has been successfully created, and you can now log in to manage all your day-to-day recruitment activities. StaffOS is built to streamline your workflow, improve productivity, and help you deliver a world-class recruitment experience.

**Your Login Details:**
- Employee ID: ${data.employeeId}
- Email: ${data.email}
- Password: ${data.password}
- Login URL: ${data.loginUrl}

As you begin using the platform, please keep the following in mind:

1. Maintain complete confidentiality while handling all client and candidate information.

2. Enter accurate and original data at every step to ensure excellent metrics, transparent reporting, and proper tracking.

3. Engage meaningfully with clients and candidates through the system for a smooth and professional communication experience.

4. Use StaffOS consistently to ensure we build a strong, metrics-driven approach across the organisation.

If you have any questions or face any issues, please feel free to reach out via the Support Chat inside StaffOS. Our team is always here to help you.

Wishing you a productive and seamless experience with StaffOS!

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
      
      <p>Welcome to StaffOS!</p>
      
      <p>Your account has been successfully created, and you can now log in to manage all your day-to-day recruitment activities. StaffOS is built to streamline your workflow, improve productivity, and help you deliver a world-class recruitment experience.</p>
      
      <div class="credentials">
        <h3 style="margin-top: 0;">Your Login Details:</h3>
        <p><strong>Employee ID:</strong> ${data.employeeId}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p><strong>Login URL:</strong> <a href="${data.loginUrl}">${data.loginUrl}</a></p>
      </div>
      
      <div class="guidelines">
        <p>As you begin using the platform, please keep the following in mind:</p>
        <ol>
          <li>Maintain complete confidentiality while handling all client and candidate information.</li>
          <li>Enter accurate and original data at every step to ensure excellent metrics, transparent reporting, and proper tracking.</li>
          <li>Engage meaningfully with clients and candidates through the system for a smooth and professional communication experience.</li>
          <li>Use StaffOS consistently to ensure we build a strong, metrics-driven approach across the organisation.</li>
        </ol>
      </div>
      
      <p>If you have any questions or face any issues, please feel free to reach out via the Support Chat inside StaffOS. Our team is always here to help you.</p>
      
      <p>Wishing you a productive and seamless experience with StaffOS!</p>
      
      <div class="footer">
        <p><strong>Warm regards,<br>Team StaffOS</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const senderEmail = 'StaffOS <onboarding@resend.dev>';
    await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: 'Welcome to StaffOS - Your Account is Ready!',
      text: emailContent,
      html: htmlContent,
    });

    console.log(`Welcome email sent successfully to ${data.email} from ${senderEmail}`);
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

    const senderEmail = 'StaffOS <onboarding@resend.dev>';
    await resend.emails.send({
      from: senderEmail,
      to: data.email,
      subject: 'Welcome to StaffOS - Start Your Career Journey!',
      text: emailContent,
      html: htmlContent,
    });

    console.log(`Welcome email sent successfully to ${data.email} from ${senderEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending candidate welcome email:', error);
    return false;
  }
}
