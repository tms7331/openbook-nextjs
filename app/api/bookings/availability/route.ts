import { NextResponse } from 'next/server';
import { getCalendarClient } from '@/lib/google-calendar';

export async function POST(request: Request) {
  const calendar = await getCalendarClient();
  const body = await request.json();
  
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: body.timeMin,
      timeMax: body.timeMax,
      items: body.calendarIds.map((id: string) => ({ id }))
    }
  });
  
  return NextResponse.json(response.data.calendars || {});
}