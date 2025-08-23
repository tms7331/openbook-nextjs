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
      
      // Try to load from file directly
      const fs = require('fs');
      const path = require('path');
      
      const keyFilePath = path.join(process.cwd(), 'service-account-key.json');
      console.log('Looking for service account key at:', keyFilePath);
      
      let credentials;
      try {
        if (fs.existsSync(keyFilePath)) {
          console.log('Found service-account-key.json file');
          const fileContent = fs.readFileSync(keyFilePath, 'utf8');
          credentials = JSON.parse(fileContent);
          console.log('Loaded credentials from file - type:', credentials.type);
          console.log('Project ID:', credentials.project_id);
          console.log('Client email:', credentials.client_email);
        } else {
          throw new Error(`Service account key file not found at ${keyFilePath}. Please add your service-account-key.json file to the project root.`);
        }
      } catch (error: any) {
        console.error('Failed to load service account key:', error);
        throw error;
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      
      console.log('GoogleAuth created successfully');
      return google.calendar({ version: 'v3', auth });
    }
  } catch (error: any) {
    console.error('Error in getCalendarClient:', error);
    throw error;
  }
}

export async function getAuthMethod(): Promise<'oauth' | 'service-account'> {
  const session = await getServerSession(authOptions);
  return session?.accessToken ? 'oauth' : 'service-account';
}

export const CALENDAR_TIMEZONE = process.env.CALENDAR_TIMEZONE || 'America/New_York';