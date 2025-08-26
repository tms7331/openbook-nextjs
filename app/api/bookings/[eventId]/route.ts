import { NextResponse } from 'next/server';

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    console.log('DELETE /api/bookings/[eventId] - Starting');
    const { eventId } = await params;
    
    // Get calendarId from query params
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar ID is required' },
        { status: 400 }
      );
    }

    // Use service account to delete event
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

    console.log(`Using service account to delete event ${eventId} from calendar ${calendarId}`);

    try {
      // Delete the event
      await calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });

      console.log('Event deleted successfully:', eventId);

      return NextResponse.json({
        success: true,
        message: `Event ${eventId} deleted successfully`,
      });
    } catch (deleteError) {
      const error = deleteError as { code?: number; message?: string };
      
      if (error.code === 404) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      } else if (error.code === 403) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            message: 'The service account does not have permission to delete this event.',
          },
          { status: 403 }
        );
      } else if (error.code === 410) {
        // Event was already deleted
        return NextResponse.json({
          success: true,
          message: 'Event was already deleted',
        });
      }
      
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in DELETE /api/bookings/[eventId]:', error);
    return NextResponse.json(
      {
        error: (error as Error & { message?: string }).message || 'Failed to delete event',
        details: (error as Error).toString(),
      },
      { status: 500 }
    );
  }
}