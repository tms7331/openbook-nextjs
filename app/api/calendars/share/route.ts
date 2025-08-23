import { NextResponse } from 'next/server';
import { getCalendarClient, getAuthMethod } from '@/lib/google-calendar';

export async function POST(request: Request) {
  try {
    console.log('POST /api/calendars/share - Starting');
    const authMethod = await getAuthMethod();
    console.log('Auth method:', authMethod);
    
    if (authMethod !== 'service-account') {
      return NextResponse.json({ error: 'Only service account can manage calendar sharing' }, { status: 403 });
    }
    
    const calendar = await getCalendarClient();
    const body = await request.json();
    
    if (!body.calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400 });
    }
    
    console.log('Updating sharing for calendar:', body.calendarId);
    
    // Share calendar publicly or with specific users
    let role = body.role || 'writer';
    const scopeType = body.public ? 'default' : (body.email?.includes('@') ? 'user' : 'domain');
    const scopeValue = body.public ? undefined : body.email;
    
    // Public calendars can only be 'reader' (Google limitation)
    if (body.public) {
      role = 'reader';
      console.log('Public sharing - setting to reader only (Google limitation)');
    }
    
    const aclRule = await calendar.acl.insert({
      calendarId: body.calendarId,
      requestBody: {
        role: role,
        scope: {
          type: scopeType,
          value: scopeValue
        }
      }
    });
    
    console.log('Sharing rule created:', aclRule.data);
    
    return NextResponse.json({
      message: 'Calendar sharing updated',
      rule: aclRule.data
    });
  } catch (error: any) {
    console.error('Error in POST /api/calendars/share:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update calendar sharing',
      details: error.toString()
    }, { status: 500 });
  }
}