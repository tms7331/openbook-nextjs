'use client';

import { useState, useEffect } from 'react';
import CalendarNavigation from '@/newcomponents/CalendarNavigation';
import CalendarDisplay from '@/newcomponents/CalendarDisplay';
import { CalendarData, CalendarView, UserDetails } from '@/types/calendar';

interface Props {
  params: Promise<{ calendarId: string }>;
}

export default function BookingPage({ params }: Props) {
  const [calendarId, setCalendarId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [events, setEvents] = useState<any[]>([]);
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

  const handleBooking = async (timeSlot: any, userDetails: UserDetails) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId,
          title: userDetails.name,
          startTime: timeSlot.start.toISOString(),
          endTime: timeSlot.end.toISOString(),
          organizerName: userDetails.name,
          organizerEmail: userDetails.email || 'user@example.com',
          description: userDetails.notes || ''
        })
      });
      
      const data = await response.json();
      if (data.id || data.results) {
        alert('Booking successful!');
        fetchEvents(calendarId);
      } else {
        alert('Booking failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating booking: ' + error);
    }
  };

  const calendarData: CalendarData = {
    id: calendarId,
    name: `Calendar ${calendarId}`,
    type: 'room',
    events: events.map(event => ({
      id: event.id,
      title: event.summary || 'Busy',
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
      type: 'booking' as const
    })),
    timeSlots: []
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading calendar...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Book a Time Slot</h1>
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
          view={view}
          onViewChange={setView}
        />
        <div style={{ padding: '8px' }}>
          <CalendarDisplayWrapper
            calendarData={calendarData}
            currentDate={currentDate}
            view={view}
            onBooking={handleBooking}
          />
        </div>
      </div>
    </div>
  );
}

// Wrapper component to handle booking
function CalendarDisplayWrapper({ 
  calendarData, 
  currentDate, 
  view, 
  onBooking 
}: { 
  calendarData: CalendarData;
  currentDate: Date;
  view: CalendarView;
  onBooking: (timeSlot: any, userDetails: UserDetails) => void;
}) {
  return (
    <CalendarDisplay
      calendarData={calendarData}
      currentDate={currentDate}
      view={view}
    />
  );
}