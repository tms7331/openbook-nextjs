import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useRef, useState } from 'react';
import { CalendarData, CalendarEvent, TimeSlot } from '../types/calendar';
import BookingModal from './BookingModal';
import EventDetailsModal from './EventDetailsModal';

interface CalendarDisplayProps {
  calendarData: CalendarData;
  currentDate: Date;
  onEventCreated: () => void;
  isAdmin?: boolean;
  onEventDelete?: (eventId: string) => Promise<void>;
}

export default function CalendarDisplay({
  calendarData,
  currentDate,
  onEventCreated,
  isAdmin = false,
  onEventDelete,
}: CalendarDisplayProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(currentDate);
    }
  }, [currentDate]);

  const events = calendarData.events.map((event) => {
    const isBooking = event.type === 'booking';
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      backgroundColor: isBooking ? '#8b5cf6' : '#94a3b8',
      borderColor: isBooking ? '#7c3aed' : '#64748b',
    };
  });

  function handleDateClick(info: { date: Date }) {
    const clickedDate = info.date;
    const timeSlot = calendarData.timeSlots.find((slot) => {
      const slotStart = new Date(slot.start);
      return (
        slotStart.getTime() >= clickedDate.getTime() &&
        slotStart.getTime() < clickedDate.getTime() + 30 * 60 * 1000
      );
    });

    if (timeSlot && timeSlot.available) {
      setSelectedTimeSlot(timeSlot);
    }
  }

  function handleSelect(info: { start: Date; end: Date }) {
    const newTimeSlot: TimeSlot = {
      id: `temp-${Date.now()}`,
      start: info.start,
      end: info.end,
      available: true,
    };

    setSelectedTimeSlot(newTimeSlot);
  }

  function handleEventClick(info: { event: { id: string } }) {
    const clickedEvent = calendarData.events.find(
      (event) => event.id === info.event.id
    );
    if (clickedEvent) {
      setSelectedEvent(clickedEvent);
    }
  }

  // Calculate dynamic time range based on displayed date
  const now = new Date();
  const isToday = currentDate.toDateString() === now.toDateString();
  
  let minHour, maxHour, scrollHour;
  
  if (isToday) {
    // For today: 2 hours past to 5 hours future minimum
    const currentHour = now.getHours();
    minHour = Math.max(6, currentHour - 2);
    maxHour = Math.max(currentHour + 5, 18);
    scrollHour = Math.max(minHour, currentHour - 1);
  } else {
    // For other days: show full business hours
    minHour = 8;
    maxHour = 22;
    scrollHour = 8;
  }
  
  const slotMinTime = `${String(minHour).padStart(2, '0')}:00:00`;
  const slotMaxTime = `${String(maxHour).padStart(2, '0')}:00:00`;
  const scrollTime = `${String(scrollHour).padStart(2, '0')}:00:00`;

  return (
    <div className='fc-calendar-wrapper'>
      <style
        jsx
        global
      >{`
        .fc-calendar-wrapper .fc {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, sans-serif;
          font-size: 14px;
        }
        .fc-calendar-wrapper .fc-theme-standard td {
          border-color: #e2e8f0;
        }
        .fc-calendar-wrapper .fc-theme-standard th {
          border-color: #e2e8f0;
          background-color: #f8f9ff;
          color: #7c3aed;
          font-weight: 600;
        }
        .fc-calendar-wrapper .fc-timegrid-slot {
          height: 3em;
        }
        .fc-calendar-wrapper .fc-timegrid-slot:hover {
          background-color: #f3e8ff;
          cursor: pointer;
        }
        .fc-calendar-wrapper .fc-today {
          background-color: #faf5ff !important;
        }
        .fc-calendar-wrapper .fc-button-primary {
          background-color: #8b5cf6;
          border-color: #8b5cf6;
        }
        .fc-calendar-wrapper .fc-button-primary:hover {
          background-color: #7c3aed;
          border-color: #7c3aed;
        }
        .fc-calendar-wrapper .fc-event {
          border-radius: 4px;
          padding: 2px 4px;
        }
        .fc-calendar-wrapper .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }
        .fc-calendar-wrapper .fc-col-header-cell {
          padding: 12px;
        }
        .fc-calendar-wrapper .fc-timegrid-axis {
          padding-right: 8px;
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView='timeGridDay'
        initialDate={currentDate}
        events={events}
        dateClick={handleDateClick}
        select={handleSelect}
        eventClick={handleEventClick}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
        height='auto'
        dragScroll={false}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        slotDuration='00:30:00'
        snapDuration='00:15:00'
        allDaySlot={false}
        nowIndicator={true}
        selectable={true}
        selectMirror={true}
        selectConstraint={{
          start: new Date(),
        }}
        selectOverlap={false}
        dayMaxEvents={true}
        weekends={true}
        scrollTime={scrollTime}
        businessHours={{
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '08:00',
          endTime: '23:00',
        }}
        editable={false}
        longPressDelay={150}
        selectLongPressDelay={150}
        eventLongPressDelay={150}
      />

      {selectedTimeSlot && (
        <BookingModal
          timeSlot={selectedTimeSlot}
          calendarId={calendarData.id}
          onClose={() => setSelectedTimeSlot(null)}
          onConfirm={(userDetails) => {
            console.log('Booking confirmed:', {
              timeSlot: selectedTimeSlot,
              userDetails,
            });
            console.log(
              'Booking successful! The event has been added to the calendar.'
            );
            setSelectedTimeSlot(null);
            onEventCreated();
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isAdmin={isAdmin}
          onDelete={async () => {
            if (onEventDelete) {
              await onEventDelete(selectedEvent.id);
              setSelectedEvent(null);
            }
          }}
        />
      )}
    </div>
  );
}
