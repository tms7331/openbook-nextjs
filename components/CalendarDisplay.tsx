/** @jsxImportSource @emotion/react */
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarData, TimeSlot } from '../types/calendar'
import { useState, useRef, useEffect } from 'react'
import BookingModal from './BookingModal'

interface CalendarDisplayProps {
  calendarData: CalendarData
  currentDate: Date
}

export default function CalendarDisplay({
  calendarData,
  currentDate,
}: CalendarDisplayProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.gotoDate(currentDate)
    }
  }, [currentDate])

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

  const hasEventConflict = (start: Date, end: Date): boolean => {
    return calendarData.events.some(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return (start < eventEnd && end > eventStart)
    })
  }

  function handleDateClick(info: {date: Date}) {
    const clickedDate = info.date
    
    if (clickedDate < new Date()) {
      return
    }

    const timeSlot = calendarData.timeSlots.find((slot) => {
      const slotStart = new Date(slot.start)
      return (
        slotStart.getTime() >= clickedDate.getTime() &&
        slotStart.getTime() < clickedDate.getTime() + 30 * 60 * 1000
      )
    })

    if (timeSlot && timeSlot.available && !hasEventConflict(timeSlot.start, timeSlot.end)) {
      setSelectedTimeSlot(timeSlot)
    }
  }

  function handleSelect(info: {start: Date; end: Date}) {
    const startDate = info.start
    const endDate = info.end

    if (startDate < new Date() || hasEventConflict(startDate, endDate)) {
      return
    }

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
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView='timeGridDay'
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
        selectAllow={(selectInfo) => {
          const now = new Date()
          return selectInfo.start >= now && !hasEventConflict(selectInfo.start, selectInfo.end)
        }}
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