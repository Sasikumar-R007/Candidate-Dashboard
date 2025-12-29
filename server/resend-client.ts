import { Resend } from 'resend';

let cachedClient: { client: Resend; fromEmail: string } | null = null;

function getCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'StaffOS <onboarding@resend.dev>';
  
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
