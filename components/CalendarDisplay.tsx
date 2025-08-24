/** @jsxImportSource @emotion/react */
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarData, CalendarView, TimeSlot } from '../types/calendar'
import { useState } from 'react'
import BookingModal from './BookingModal'

interface CalendarDisplayProps {
  calendarData: CalendarData
  currentDate: Date
  view: CalendarView
}

function getCalendarView(view: CalendarView): string {
  if (view === 'day') return 'timeGridDay'
  if (view === 'week') return 'timeGridWeek'
  return 'dayGridMonth'
}

export default function CalendarDisplay({
  calendarData,
  currentDate,
  view,
}: CalendarDisplayProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )

  const events = calendarData.events.map((event) => {
    const isBooking = event.type === 'booking'
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      backgroundColor: isBooking ? '#2196f3' : '#bdbdbd',
      borderColor: isBooking ? '#1e88e5' : '#9e9e9e',
    }
  })

  function handleDateClick(info: {date: Date}) {
    const clickedDate = info.date
    const timeSlot = calendarData.timeSlots.find((slot) => {
      const slotStart = new Date(slot.start)
      return (
        slotStart.getTime() >= clickedDate.getTime() &&
        slotStart.getTime() < clickedDate.getTime() + 30 * 60 * 1000
      )
    })

    if (timeSlot && timeSlot.available) {
      setSelectedTimeSlot(timeSlot)
    }
  }

  function handleSelect(info: {start: Date; end: Date}) {
    const startDate = info.start
    const endDate = info.end

    const newTimeSlot: TimeSlot = {
      id: `temp-${Date.now()}`,
      start: startDate,
      end: endDate,
      available: true,
    }

    setSelectedTimeSlot(newTimeSlot)
  }

  return (
    <div
      css={{
        '& .fc': {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
        },
        '& .fc-theme-standard td': {
          borderColor: '#90caf9',
        },
        '& .fc-theme-standard th': {
          borderColor: '#90caf9',
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          fontWeight: '600',
        },
        '& .fc-daygrid-day': {
          '&:hover': {
            backgroundColor: '#e3f2fd',
            cursor: 'pointer',
          },
        },
        '& .fc-today': {
          backgroundColor: '#bbdefb !important',
        },
        '& .fc-button-primary': {
          backgroundColor: '#1e88e5',
          borderColor: '#1e88e5',
          '&:hover': {
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
          },
        },
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={getCalendarView(view)}
        initialDate={currentDate}
        events={events}
        dateClick={handleDateClick}
        select={handleSelect}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
        height='auto'
        slotMinTime='09:00:00'
        slotMaxTime='18:00:00'
        slotDuration='00:30:00'
        snapDuration='00:15:00'
        allDaySlot={false}
        nowIndicator={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
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
            })
            alert('Booking successful! The event has been added to the calendar.')
            setSelectedTimeSlot(null)
            // Optionally refresh the page to show new booking
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}