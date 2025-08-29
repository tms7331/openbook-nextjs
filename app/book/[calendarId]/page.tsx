'use client';

import CalendarDisplay from '@/components/CalendarDisplay';
import CalendarNavigation from '@/components/CalendarNavigation';
import { Navbar } from '@/components/Navbar';
import { CalendarData } from '@/types/calendar';
import { Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

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
      <div className="flex items-center justify-center space-x-2 text-white/70">
        <Calendar className="w-5 h-5 animate-pulse" />
        <span>Loading calendar name...</span>
      </div>
    );
  }

  return (
    <h1 className="text-3xl font-bold text-white text-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-white/60 mx-auto mb-4 animate-pulse" />
          <p className="text-white/70 text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <Navbar />

      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <CalendarName calendarId={calendarId} />
        </div>

        <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
          <CalendarNavigation
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
          <div className='p-4'>
            <CalendarDisplay
              calendarData={calendarData}
              currentDate={currentDate}
              isAdmin={isAdmin}
              onEventCreated={() => fetchEvents(calendarId)}
              onEventDelete={async (eventId: string) => {
                try {
                  const response = await fetch(
                    `/api/bookings/${eventId}?calendarId=${calendarId}`,
                    {
                      method: 'DELETE',
                    }
                  );
                  if (response.ok) {
                    // Refresh events after deletion
                    await fetchEvents(calendarId);
                  } else {
                    const error = await response.json();
                    alert(
                      `Failed to delete event: ${error.message || error.error}`
                    );
                  }
                } catch (error) {
                  console.error('Failed to delete event:', error);
                  alert('Failed to delete event');
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-white/60 mx-auto mb-4 animate-pulse" />
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <BookingPageContent params={params} />
    </Suspense>
  );
}
