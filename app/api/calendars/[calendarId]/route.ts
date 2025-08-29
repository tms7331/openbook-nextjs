import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ calendarId: string }>;
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    console.log('DELETE /api/calendars/[calendarId] - Starting');
    const { calendarId } = await params;

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar ID is required' },
        { status: 400 }
      );
    }

    // Use service account to delete calendar
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

    console.log('Using service account to delete calendar:', calendarId);

    // First, check if we have owner access to this calendar
    try {
      // Try to get calendar from calendarList to check access role
      let accessRole = 'unknown';
      try {
        const calendarListEntry = await calendar.calendarList.get({
          calendarId: calendarId,
        });
        console.log('Calendar list entry:', calendarListEntry.data);
        accessRole = calendarListEntry.data.accessRole || 'unknown';
      } catch (listError) {
        // If we can't get it from calendar list, try to delete anyway
        console.log('Could not get calendar from list, attempting delete anyway');
        console.log('listError', listError);
      }

      if (accessRole !== 'owner' && accessRole !== 'unknown') {
        console.log(`Cannot delete calendar: Access role is ${accessRole}, not owner`);
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            message: `Cannot delete this calendar. The service account has '${accessRole}' access, but 'owner' access is required to delete a calendar.`,
            hint: 'Only calendars created by the service account can be deleted.'
          },
          { status: 403 }
        );
      }

      // Delete the calendar
      await calendar.calendars.delete({
        calendarId: calendarId,
      });

      console.log('Calendar deleted successfully:', calendarId);

      return NextResponse.json({
        success: true,
        message: `Calendar ${calendarId} deleted successfully`,
      });
    } catch (deleteError) {
      // Handle specific Google Calendar API errors
      const error = deleteError as { code?: number; message?: string };
      if (error.code === 404) {
        return NextResponse.json(
          { error: 'Calendar not found' },
          { status: 404 }
        );
      } else if (error.code === 403) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            message: 'The service account does not have permission to delete this calendar.',
            hint: 'Only calendars created by the service account can be deleted.'
          },
          { status: 403 }
        );
      } else if (error.code === 400) {
        return NextResponse.json(
          {
            error: 'Cannot delete calendar',
            message: 'This calendar cannot be deleted. It may be a primary calendar or a calendar shared with the service account.',
            hint: 'Only secondary calendars created by the service account can be deleted.'
          },
          { status: 400 }
        );
      }

      throw deleteError;
    }
  } catch (error) {
    console.error('Error in DELETE /api/calendars/[calendarId]:', error);
    return NextResponse.json(
      {
        error: (error as Error & { message?: string }).message || 'Failed to delete calendar',
        details: (error as Error).toString(),
      },
      { status: 500 }
    );
  }
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
