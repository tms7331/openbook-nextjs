import { google, calendar_v3 } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getCalendarClient(): Promise<calendar_v3.Calendar> {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session check:', session ? 'Session exists' : 'No session');
    
    if (session?.accessToken) {
      console.log('Using OAuth authentication');
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: session.accessToken as string,
      });
      return google.calendar({ version: 'v3', auth: oauth2Client });
    } else {
      console.log('Using Service Account authentication');
      
      // Load from environment variable
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
      }
      
      let credentials;
      try {
        credentials = JSON.parse(serviceAccountKey);
        console.log('Loaded credentials from env - type:', credentials.type);
        console.log('Project ID:', credentials.project_id);
        console.log('Client email:', credentials.client_email);
      } catch (error) {
        console.error('Failed to parse service account key from env:', error as Error);
        throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      
      console.log('GoogleAuth created successfully');
      return google.calendar({ version: 'v3', auth });
    }
  } catch (error) {
    console.error('Error in getCalendarClient:', error);
    throw error;
  }
}

export async function getAuthMethod(): Promise<'oauth' | 'service-account'> {
  const session = await getServerSession(authOptions);
  return session?.accessToken ? 'oauth' : 'service-account';
}

export const CALENDAR_TIMEZONE = process.env.CALENDAR_TIMEZONE || 'America/New_York';