import { NextResponse } from 'next/server';
import { getAuthMethod } from '@/lib/google-calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const authMethod = await getAuthMethod();
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    authenticated: authMethod === 'oauth',
    user: session?.user || null,
    authMethod,
    capabilities: {
      canCreateCalendars: authMethod === 'service-account',
      bookingsAppearInPersonalCalendar: authMethod === 'oauth',
      requiresOrganizerInfo: authMethod === 'service-account',
    }
  });
}