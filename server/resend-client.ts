import { Resend } from 'resend';

let cachedClient: { client: Resend; fromEmail: string } | null = null;

function getCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'StaffOS <onboarding@resend.dev>';
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set. Please configure your Resend API key.');
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
