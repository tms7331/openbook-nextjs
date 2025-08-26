import { NextResponse } from 'next/server';
import { getAuthMethod } from '@/lib/google-calendar';

export async function GET() {
  const authMethod = await getAuthMethod();
  
  return NextResponse.json({
    authenticated: false,
    user: null,
    authMethod,
    capabilities: {
      canCreateCalendars: true,
      bookingsAppearInPersonalCalendar: false,
      requiresOrganizerInfo: true,
    }
  });
}