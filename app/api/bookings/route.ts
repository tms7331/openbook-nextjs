import { NextResponse } from 'next/server';
import { getCalendarClient, getAuthMethod } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';

export async function GET(request: Request) {
  try {
    console.log('GET /api/bookings - Starting');
    
    // ALWAYS use service account to list events
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }
    const credentials = JSON.parse(serviceAccountKey);
    
    const { google } = await import('googleapis');
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
  } catch (error) {
    console.error('Error in GET /api/bookings:', error);
    return NextResponse.json({ 
      error: (error as Error & {message?: string}).message || 'Failed to list bookings',
      details: (error as Error).toString()
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
    
    const results = [];
    
    // If user is logged in with OAuth, create event on BOTH calendars
    if (authMethod === 'oauth' && body.addToPersonalCalendar !== false) {
      console.log('OAuth user - will create events on both calendars');
      console.log('Session user email:', session?.user?.email);
      console.log('Session access token exists:', !!session?.accessToken);
      
      // 1. First, create on user's personal calendar
      try {
        const oauthCalendar = await getCalendarClient();
        const personalEvent = {
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
      } catch (error) {
        console.error('Failed to create personal calendar event:', error);
        console.error('Error details:', (error as Error & {response?: {data?: unknown}; message?: string}).response?.data || (error as Error & {message?: string}).message);
        console.error('Error code:', (error as Error & {code?: string}).code);
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
        
        const { google } = await import('googleapis');
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        const serviceCalendar = google.calendar({ version: 'v3', auth });
        
        const roomEvent = {
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
      } catch (error) {
        console.error('Failed to create room calendar event:', error);
        console.error('Error details:', (error as Error & {response?: {data?: unknown}; message?: string}).response?.data || (error as Error & {message?: string}).message);
        console.error('Error code:', (error as Error & {code?: string}).code);
        return NextResponse.json({ 
          error: 'Failed to book room. Calendar ID may be invalid or not accessible.',
          details: (error as Error & {message?: string}).message,
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
      const descriptionParts = [];
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
      
      // Note: Service accounts cannot send calendar invites without Domain-Wide Delegation
      // If you need email notifications, consider:
      // 1. Setting up Domain-Wide Delegation (requires Google Workspace admin)
      // 2. Using a separate email service (SendGrid, AWS SES, etc.)
      // 3. Having users sign in with OAuth to get proper calendar invites
      
      // For now, we'll create the event without attendees to avoid the error
      // The email is still captured in the description for reference
      
      console.log('Creating single event on room calendar');
      console.log('Event object:', JSON.stringify(event, null, 2));
      
      const result = await calendar.events.insert({
        calendarId: body.calendarId,
        requestBody: event
      });
      
      console.log('Event created successfully:', result.data.id);
      
      // Send email notification if email provided and Resend is configured
      if (body.organizerEmail && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          const startDate = new Date(body.startTime);
          const endDate = new Date(body.endTime);
          
          await resend.emails.send({
            from: 'Room Booking <onboarding@resend.dev>',
            to: body.organizerEmail,
            subject: `Room Booking Confirmed: ${body.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2196F3;">Your room booking is confirmed!</h2>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 10px 0;"><strong>Booking Title:</strong> ${body.title}</p>
                  <p style="margin: 10px 0;"><strong>Room:</strong> ${body.calendarId}</p>
                  <p style="margin: 10px 0;"><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
                  <p style="margin: 10px 0;"><strong>Time:</strong> ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}</p>
                  ${body.description ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${body.description}</p>` : ''}
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  This booking has been added to the room's calendar. 
                  To receive calendar invites directly, consider signing in with Google when booking.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                  This is an automated confirmation email for your room booking.
                </p>
              </div>
            `
          });
          
          console.log('Confirmation email sent to:', body.organizerEmail);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the booking if email fails - it's just a nice-to-have
        }
      }
      
      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    console.error('Error details:', (error as Error & {response?: {data?: unknown}; message?: string}).response?.data || (error as Error & {message?: string}).message);
    return NextResponse.json({ 
      error: (error as Error & {message?: string}).message || 'Failed to create booking',
      details: (error as Error).toString(),
      googleError: (error as Error & {response?: {data?: unknown}}).response?.data
    }, { status: 500 });
  }
}