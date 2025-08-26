'use client';

import CalendarDisplay from '@/components/CalendarDisplay';
import CalendarNavigation from '@/components/CalendarNavigation';
import { CalendarData } from '@/types/calendar';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Props {
  params: Promise<{ calendarId: string }>;
}

function CalendarName({ calendarId }: { calendarId: string }) {
  const [calendarName, setCalendarName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendarMetadata() {
      try {
        const response = await fetch(`/api/calendars/${calendarId}`);
        const data = await response.json();
        console.log('Calendar metadata:', data);
        setCalendarName(data.calendar?.summary || `Calendar ${calendarId}`);
      } catch (error) {
        console.error('Failed to fetch calendar metadata:', error);
        setCalendarName(`Calendar ${calendarId}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarMetadata();
  }, [calendarId]);

  if (loading) {
    return (
      <h1 style={{
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#333',
        fontWeight: 'bold'
      }}>
        Loading calendar name...
      </h1>
    );
  }

  return (
    <h1 style={{
      fontSize: '2.5rem',
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#333',
      fontWeight: 'bold'
    }}>
      {calendarName}
    </h1>
  );
}

function BookingPageContent({ params }: Props) {
  const [calendarId, setCalendarId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<
    Array<{
      id: string;
      summary?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';

  useEffect(() => {
    params.then((p) => {
      fetchEvents(p.calendarId);
      setCalendarId(p.calendarId);
    });
  }, [params]);

  async function fetchEvents(id: string) {
    try {
      const response = await fetch(`/api/bookings?calendarId=${id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }

  const calendarData: CalendarData = {
    id: calendarId,
    name: calendarId,
    type: 'room',
    events: events.map((event) => ({
      id: event.id,
      title: event.summary || 'Busy',
      start: new Date(event.start?.dateTime || event.start?.date || new Date()),
      end: new Date(event.end?.dateTime || event.end?.date || new Date()),
      type: 'booking' as const,
    })),
    timeSlots: [],
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading calendar...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <CalendarName calendarId={calendarId} />

      <div
        style={{
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          padding: 0,
          minHeight: '80vh',
          boxShadow: '0 4px 6px -1px rgba(33, 150, 243, 0.12)',
          overflow: 'hidden',
        }}
      >
        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        <CalendarDisplay
          calendarData={calendarData}
          currentDate={currentDate}
          isAdmin={isAdmin}
          onEventDelete={async (eventId: string) => {
            try {
              const response = await fetch(`/api/bookings/${eventId}?calendarId=${calendarId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                // Refresh events after deletion
                await fetchEvents(calendarId);
              } else {
                const error = await response.json();
                alert(`Failed to delete event: ${error.message || error.error}`);
              }
            } catch (error) {
              console.error('Failed to delete event:', error);
              alert('Failed to delete event');
            }
          }}
        />
      </div>
    </div>
  );
}

export default function BookingPage({ params }: Props) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <BookingPageContent params={params} />
    </Suspense>
  );
}
