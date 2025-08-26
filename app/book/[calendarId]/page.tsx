'use client';

import { useState, useEffect } from 'react';
import CalendarNavigation from '@/components/CalendarNavigation';
import CalendarDisplay from '@/components/CalendarDisplay';
import { CalendarData } from '@/types/calendar';

interface Props {
  params: Promise<{ calendarId: string }>;
}

export default function BookingPage({ params }: Props) {
  const [calendarId, setCalendarId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Array<{
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setCalendarId(p.calendarId);
      fetchEvents(p.calendarId);
    });
  }, [params]);

  const fetchEvents = async (id: string) => {
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
  };


  const calendarData: CalendarData = {
    id: calendarId,
    name: `Calendar ${calendarId}`,
    type: 'room',
    events: events.map(event => ({
      id: event.id,
      title: event.summary || 'Busy',
      start: new Date(event.start?.dateTime || event.start?.date || new Date()),
      end: new Date(event.end?.dateTime || event.end?.date || new Date()),
      type: 'booking' as const
    })),
    timeSlots: []
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading calendar...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Book a Time Slot</h1>
      </div>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Calendar ID: {calendarId}
      </p>

      <div style={{
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        padding: 0,
        minHeight: '80vh',
        border: '1px solid #90caf9',
        boxShadow: '0 4px 6px -1px rgba(33, 150, 243, 0.12)',
        overflow: 'hidden',
      }}>
        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        <div style={{ padding: '8px' }}>
          <CalendarDisplay
            calendarData={calendarData}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  );
}