import { NextResponse } from 'next/server';
import { getCalendarClient, getAuthMethod } from '@/lib/google-calendar';

export async function GET() {
  try {
    console.log('GET /api/calendars - Starting');
    const authMethod = await getAuthMethod();
    console.log('Auth method:', authMethod);
    
    const calendar = await getCalendarClient();
    console.log('Calendar client created');
    
    const response = await calendar.calendarList.list();
    console.log('Calendar list response:', response.data);
    
    return NextResponse.json({
      authMethod,
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
    const authMethod = await getAuthMethod();
    console.log('Auth method:', authMethod);
    
    if (authMethod !== 'service-account') {
      return NextResponse.json({ error: 'Only service account can create calendars' }, { status: 403 });
    }
    
    const calendar = await getCalendarClient();
    console.log('Calendar client created');
    
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