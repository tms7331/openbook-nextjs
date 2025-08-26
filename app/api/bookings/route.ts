import { NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/google-calendar';
import { generateICS } from '@/lib/ics-generator';
import { Resend } from 'resend';

const SEND_EMAIL = false;

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
      error: (error as Error & { message?: string }).message || 'Failed to list bookings',
      details: (error as Error).toString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/bookings - Starting');
    console.log('Auth method: service-account');

    const body = await request.json();

    // Fix URL-encoded calendar ID
    if (body.calendarId) {
      body.calendarId = decodeURIComponent(body.calendarId);
    }

    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!body.calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400 });
    }

    // Service account only
    console.log('Service account mode - single booking');
    const calendar = await getCalendarClient();

    const event = {
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
    if (SEND_EMAIL && body.organizerEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const startDate = new Date(body.startTime);
        const endDate = new Date(body.endTime);

        // Try to get calendar name
        let roomName = body.calendarId; // Default to ID if we can't get the name
        try {
          // Get calendar details to fetch the name
          const calendarDetails = await calendar.calendars.get({
            calendarId: body.calendarId
          });
          roomName = calendarDetails.data.summary || body.calendarId;
          console.log('Room name fetched:', roomName);
        } catch (err) {
          console.error('Failed to fetch calendar name:', err);
          // Continue with calendar ID as fallback
        }

        // Generate ICS file content
        const icsContent = generateICS({
          title: body.title || 'Room Booking',
          description: body.description || `Room: ${roomName}`,
          startTime: body.startTime,
          endTime: body.endTime,
          location: roomName,
          organizerEmail: body.organizerEmail,
          organizerName: body.organizerName
        });

        // Convert ICS content to base64 for attachment
        const icsBase64 = Buffer.from(icsContent).toString('base64');

        // Format dates for display
        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        };

        const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
        const formattedStartTime = startDate.toLocaleTimeString('en-US', timeOptions);
        const formattedEndTime = endDate.toLocaleTimeString('en-US', timeOptions);

        await resend.emails.send({
          from: 'Room Booking <onboarding@resend.dev>',
          to: body.organizerEmail,
          subject: `Invitation: ${body.title} @ ${formattedDate} ${formattedStartTime} (${roomName})`,
          html: `
              <div style="font-family: 'Google Sans', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <!-- Google Calendar style header -->
                <div style="border-left: 4px solid #4285F4; padding-left: 16px; margin-bottom: 20px;">
                  <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 400; margin: 0 0 8px 0;">
                    ${body.title}
                  </h2>
                  <div style="color: #5f6368; font-size: 14px;">
                    <div style="margin-bottom: 4px;">
                      <strong style="display: inline-block; width: 60px;">When</strong>
                      ${formattedDate} ⋅ ${formattedStartTime} – ${formattedEndTime}
                    </div>
                    <div style="margin-bottom: 4px;">
                      <strong style="display: inline-block; width: 60px;">Where</strong>
                      ${roomName}
                    </div>
                    ${body.description ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                      <strong style="display: block; margin-bottom: 4px;">Description</strong>
                      ${body.description}
                    </div>` : ''}
                  </div>
                </div>
                
                <!-- Action buttons -->
                <div style="margin: 24px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right: 8px;">
                        <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(body.title || 'Room Booking')}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}/, '')}&details=${encodeURIComponent(body.description || '')}&location=${encodeURIComponent(roomName)}" 
                           style="display: inline-block; background-color: #1a73e8; color: white; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 500;">
                          Add to Calendar
                        </a>
                      </td>
                      <td style="padding-right: 8px;">
                        <a href="https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(body.title || 'Room Booking')}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${encodeURIComponent(roomName)}&body=${encodeURIComponent(body.description || '')}" 
                           style="display: inline-block; background-color: #ffffff; color: #5f6368; padding: 10px 24px; border-radius: 4px; border: 1px solid #dadce0; text-decoration: none; font-size: 14px; font-weight: 500;">
                          Add to Outlook
                        </a>
                      </td>
                      <td>
                        <a href="data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}" 
                           download="invite.ics"
                           style="display: inline-block; background-color: #ffffff; color: #5f6368; padding: 10px 24px; border-radius: 4px; border: 1px solid #dadce0; text-decoration: none; font-size: 14px; font-weight: 500;">
                          Download .ics
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="border-top: 1px solid #e0e0e0; margin-top: 24px; padding-top: 16px;">
                  <p style="color: #5f6368; font-size: 12px; line-height: 16px;">
                    Click "Add to Calendar" above or open the attached invite.ics file to add this event to your calendar.
                  </p>
                </div>
                
                <div style="margin-top: 16px; padding: 12px; background-color: #f8f9fa; border-radius: 8px;">
                  <p style="color: #5f6368; font-size: 12px; margin: 0;">
                    📎 <strong>invite.ics</strong> attached – Open this file to add the event to your calendar
                  </p>
                </div>
              </div>
            `,
          attachments: [
            {
              filename: 'invite.ics',
              content: icsBase64
            }
          ]
        });

        console.log('Confirmation email with ICS sent to:', body.organizerEmail);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the booking if email fails - it's just a nice-to-have
      }
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    console.error('Error details:', (error as Error & { response?: { data?: unknown }; message?: string }).response?.data || (error as Error & { message?: string }).message);
    return NextResponse.json({
      error: (error as Error & { message?: string }).message || 'Failed to create booking',
      details: (error as Error).toString(),
      googleError: (error as Error & { response?: { data?: unknown } }).response?.data
    }, { status: 500 });
  }
}