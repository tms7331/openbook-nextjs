import { NextResponse } from 'next/server';
import { getCalendarClient, getAuthMethod } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('GET /api/bookings - Starting');
    
    // ALWAYS use service account to list events
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
    
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId');
    
    if (!calendarId) {
      return NextResponse.json({ error: 'calendarId required' }, { status: 400 });
    }
    
    console.log('Listing events for calendar:', calendarId);
    const response = await calendar.events.list({
      calendarId,
      timeMin: searchParams.get('timeMin') || new Date().toISOString(),
      timeMax: searchParams.get('timeMax') || undefined,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    console.log('Events found:', response.data.items?.length || 0);
    return NextResponse.json(response.data.items || []);
  } catch (error: any) {
    console.error('Error in GET /api/bookings:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to list bookings',
      details: error.toString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/bookings - Starting');
    const authMethod = await getAuthMethod();
    console.log('Auth method:', authMethod);
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'none');
    
    const body = await request.json();
    
    // Fix URL-encoded calendar ID
    if (body.calendarId) {
      body.calendarId = decodeURIComponent(body.calendarId);
    }
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    if (!body.calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400 });
    }
    
    let results = [];
    
    // If user is logged in with OAuth, create event on BOTH calendars
    if (authMethod === 'oauth' && body.addToPersonalCalendar !== false) {
      console.log('OAuth user - will create events on both calendars');
      console.log('Session user email:', session?.user?.email);
      console.log('Session access token exists:', !!session?.accessToken);
      
      // 1. First, create on user's personal calendar
      try {
        const oauthCalendar = await getCalendarClient();
        const personalEvent: any = {
          summary: body.title || 'Room Booking',
          description: `Room: ${body.calendarId}\n${body.description || ''}`,
          start: { dateTime: body.startTime },
          end: { dateTime: body.endTime },
          attendees: [
            // Add the organizer email if provided (they'll get an invite)
            ...(body.organizerEmail ? [{ email: body.organizerEmail }] : []),
            // Add any additional attendees
            ...(body.attendees?.map((email: string) => ({ email })) || [])
          ]
        };
        
        console.log('Creating event on personal calendar');
        console.log('Personal event object:', JSON.stringify(personalEvent, null, 2));
        
        const personalResult = await oauthCalendar.events.insert({
          calendarId: 'primary', // User's primary calendar
          requestBody: personalEvent,
          sendUpdates: personalEvent.attendees.length > 0 ? 'all' : 'none'
        });
        
        results.push({ calendar: 'personal', event: personalResult.data });
        console.log('Personal calendar event created:', personalResult.data.id);
      } catch (error: any) {
        console.error('Failed to create personal calendar event:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error code:', error.code);
      }
      
      // 2. Then create on room calendar using service account
      try {
        // Force service account for room calendar
        const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
          throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
        }
        const credentials = JSON.parse(serviceAccountKey);
        console.log('Service account email:', credentials.client_email);
        
        const { google } = require('googleapis');
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        const serviceCalendar = google.calendar({ version: 'v3', auth });
        
        const roomEvent: any = {
          summary: body.title || 'Room Booked',
          description: `Booked by: ${session?.user?.email || 'Unknown'}\n${body.description || ''}`,
          start: { dateTime: body.startTime },
          end: { dateTime: body.endTime }
        };
        
        console.log('Creating event on room calendar with service account');
        console.log('Room calendar ID:', body.calendarId);
        console.log('Room event object:', JSON.stringify(roomEvent, null, 2));
        
        const roomResult = await serviceCalendar.events.insert({
          calendarId: body.calendarId,
          requestBody: roomEvent
        });
        
        results.push({ calendar: 'room', event: roomResult.data });
        console.log('Room calendar event created:', roomResult.data.id);
      } catch (error: any) {
        console.error('Failed to create room calendar event:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error code:', error.code);
        return NextResponse.json({ 
          error: 'Failed to book room. Calendar ID may be invalid or not accessible.',
          details: error.message,
          calendarId: body.calendarId
        }, { status: 500 });
      }
      
      return NextResponse.json({
        message: 'Booking created on both calendars',
        results
      });
      
    } else {
      // Service account only - original flow
      console.log('Service account mode - single booking');
      const calendar = await getCalendarClient();
      
      const event: any = {
        summary: body.title || 'Untitled Event',
        description: body.description || '',
        start: { dateTime: body.startTime },
        end: { dateTime: body.endTime }
      };
      
      // Add organizer info to description
      let descriptionParts = [];
      if (body.organizerName) {
        descriptionParts.push(`Booked by: ${body.organizerName}`);
      }
      if (body.organizerEmail) {
        descriptionParts.push(`Contact: ${body.organizerEmail}`);
      }
      if (body.description) {
        descriptionParts.push(`\nDetails: ${body.description}`);
      }
      event.description = descriptionParts.join('\n');
      
      console.log('Creating single event on room calendar');
      const result = await calendar.events.insert({
        calendarId: body.calendarId,
        requestBody: event
      });
      
      console.log('Event created successfully:', result.data.id);
      return NextResponse.json(result.data);
    }
  } catch (error: any) {
    console.error('Error in POST /api/bookings:', error);
    console.error('Error details:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to create booking',
      details: error.toString(),
      googleError: error.response?.data
    }, { status: 500 });
  }
}