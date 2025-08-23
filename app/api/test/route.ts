import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  const endpoints = {
    auth: {
      signIn: `${baseUrl}/api/auth/signin`,
      signOut: `${baseUrl}/api/auth/signout`,
      session: `${baseUrl}/api/auth/session`,
      status: `${baseUrl}/api/auth-status`
    },
    calendars: {
      list: 'GET /api/calendars',
      create: 'POST /api/calendars',
    },
    bookings: {
      list: 'GET /api/bookings?calendarId=CALENDAR_ID',
      create: 'POST /api/bookings',
      availability: 'POST /api/bookings/availability'
    }
  };
  
  return NextResponse.json({
    message: 'API endpoints ready',
    endpoints,
    testExamples: {
      createCalendar: {
        method: 'POST',
        url: '/api/calendars',
        body: {
          name: 'Conference Room A',
          description: 'Main conference room',
          timezone: 'America/New_York'
        }
      },
      createBooking: {
        method: 'POST',
        url: '/api/bookings',
        body: {
          calendarId: 'YOUR_CALENDAR_ID',
          title: 'Team Meeting',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 90000000).toISOString(),
          organizerName: 'John Doe',
          organizerEmail: 'john@example.com',
          description: 'Weekly sync'
        }
      },
      checkAvailability: {
        method: 'POST',
        url: '/api/bookings/availability',
        body: {
          calendarIds: ['CALENDAR_ID_1', 'CALENDAR_ID_2'],
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 604800000).toISOString()
        }
      }
    }
  });
}