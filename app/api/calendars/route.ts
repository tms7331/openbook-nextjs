import { NextResponse } from 'next/server';
import { getCalendarClient, getAuthMethod } from '@/lib/google-calendar';

export async function GET() {
  try {
    console.log('GET /api/calendars - Starting');
    
    // ALWAYS use service account to list calendars
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }
    
    // Debug: Check if the key looks correct
    console.log('Service account key length:', serviceAccountKey.length);
    console.log('First 100 chars:', serviceAccountKey.substring(0, 100));
    
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKey);
      console.log('Parsed credentials type:', credentials.type);
      console.log('Has private_key:', !!credentials.private_key);
      console.log('Private key starts with:', credentials.private_key?.substring(0, 50));
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY');
    }
    
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
    console.log('Using service account to list calendars');
    
    const response = await calendar.calendarList.list();
    console.log('Calendar list response:', response.data);
    
    return NextResponse.json({
      authMethod: 'service-account',
      calendars: response.data.items || []
    });
  } catch (error: any) {
    console.error('Error in GET /api/calendars:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to list calendars',
      details: error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/calendars - Starting');
    
    // ALWAYS use service account to create calendars
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }
    const credentials = JSON.parse(serviceAccountKey);
    
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    
    console.log('Using service account to create calendar');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: body.name,
        description: body.description,
        timeZone: body.timezone || 'America/New_York'
      }
    });
    console.log('New calendar created:', newCalendar.data);
    
    // Make the calendar public (read-only due to Google limitation)
    if (body.makePublic) {
      console.log('Making calendar public for reading');
      
      // Share calendar publicly (anyone can view, but not directly write)
      await calendar.acl.insert({
        calendarId: newCalendar.data.id!,
        requestBody: {
          role: 'reader',  // Public can only be 'reader'
          scope: {
            type: 'default'  // Makes it public
          }
        }
      });
      console.log('Calendar shared publicly (read-only)');
    }
    
    // Share with specific email/domain if provided
    if (body.shareWith) {
      console.log('Sharing calendar with:', body.shareWith);
      
      await calendar.acl.insert({
        calendarId: newCalendar.data.id!,
        requestBody: {
          role: 'writer',
          scope: {
            type: body.shareWith.includes('@') ? 'user' : 'domain',
            value: body.shareWith
          }
        }
      });
      console.log('Calendar shared with:', body.shareWith);
    }
    
    return NextResponse.json(newCalendar.data);
  } catch (error: any) {
    console.error('Error in POST /api/calendars:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create calendar',
      details: error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}