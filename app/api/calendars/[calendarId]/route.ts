import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ calendarId: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { calendarId } = await params;
    console.log('GET /api/calendars/[calendarId] - Starting for:', calendarId);

    // ALWAYS use service account to get calendar metadata
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch (e) {
      console.error('Failed to parse service account key:', e);
      throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY');
    }

    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });

    console.log('Using service account to get calendar metadata');

    const response = await calendar.calendars.get({
      calendarId: calendarId
    });

    console.log('Calendar metadata response:', response.data);

    return NextResponse.json({
      authMethod: 'service-account',
      calendar: response.data
    });
  } catch (error) {
    console.error('Error in GET /api/calendars/[calendarId]:', error);
    return NextResponse.json({
      error: (error as Error & { message?: string }).message || 'Failed to get calendar metadata',
      details: (error as Error).toString(),
      stack: (error as Error & { stack?: string }).stack
    }, { status: 500 });
  }
}