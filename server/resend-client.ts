import { Resend } from 'resend';

let cachedClient: { client: Resend; fromEmail: string } | null = null;

function getCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  // Use FROM_EMAIL from environment, but ensure it's not a test email
  // If FROM_EMAIL contains test domains or test emails, warn and use default
  let fromEmail = process.env.FROM_EMAIL || 'StaffOS <onboarding@resend.dev>';
  
  // Check if FROM_EMAIL is a test email (contains common test patterns)
  // Valid production domains (verified in Resend)
  const validProductionDomains = [
    'staffos.io',
    'staffos.com'
  ];
  
  const testEmailPatterns = [
    'sasirajkumar7rs@gmail.com',
    'test@',
    'example@',
    'onboarding@resend.dev' // Resend's test domain
  ];
  
  // Check if email is from a valid production domain
  const isFromValidDomain = validProductionDomains.some(domain => 
    fromEmail.toLowerCase().includes(`@${domain.toLowerCase()}`)
  );
  
  const isTestEmail = !isFromValidDomain && testEmailPatterns.some(pattern => 
    fromEmail.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (isTestEmail && process.env.NODE_ENV === 'production') {
    console.warn(`[Resend] Warning: FROM_EMAIL appears to be a test email (${fromEmail}). For production, please verify a domain at resend.com/domains and use an email from that domain.`);
    console.warn(`[Resend] Current FROM_EMAIL: ${fromEmail}`);
    console.warn(`[Resend] To fix: Set FROM_EMAIL in Render environment variables to a verified domain email (e.g., "StaffOS <staffos@staffos.io>")`);
  } else if (isFromValidDomain) {
    console.log(`[Resend] Using verified production email: ${fromEmail}`);
  }
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set. Please configure your Resend API key in Render environment variables.');
  }
  
  // Validate API key format (should start with 're_')
  if (!apiKey.startsWith('re_')) {
    console.warn(`[Resend] Warning: API key doesn't start with 're_'. This might be incorrect. Expected format: re_xxxxxxxxxx`);
  }
  
  // Validate FROM_EMAIL format
  if (fromEmail && !fromEmail.includes('<') && !fromEmail.includes('@')) {
    console.warn(`[Resend] Warning: FROM_EMAIL format might be incorrect. Expected format: "Display Name <email@domain.com>" or "email@domain.com"`);
  }
  
  return { apiKey, fromEmail };
}

export async function getUncachableResendClient() {
  const credentials = getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

export function getResendClient() {
  if (!cachedClient) {
    const credentials = getCredentials();
    cachedClient = {
      client: new Resend(credentials.apiKey),
      fromEmail: credentials.fromEmail
    };
  }
  return cachedClient;
}
