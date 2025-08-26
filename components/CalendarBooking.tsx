/** @jsxImportSource @emotion/react */
import { useState } from 'react'
import CalendarNavigation from './CalendarNavigation'
import CalendarDisplay from './CalendarDisplay'
import { CalendarData } from '../types/calendar'

interface CalendarBookingProps {
  calendarId: string
}

export default function CalendarBooking({ calendarId }: CalendarBookingProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const mockCalendarData: CalendarData = {
    id: calendarId,
    name: `Calendar ${calendarId}`,
    type: 'room',
    events: [],
    timeSlots: generateTimeSlots(currentDate),
  }

  return (
    <div
      css={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      <div
        css={{
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          padding: 0,
          minHeight: '80vh',
          border: '1px solid #90caf9',
          boxShadow: '0 4px 6px -1px rgba(33, 150, 243, 0.12)',
          overflow: 'hidden',
        }}
      >
        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        <div css={{ padding: '8px' }}>
          <CalendarDisplay
            calendarData={mockCalendarData}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  )
}

function generateTimeSlots(date: Date) {
  const slots = []
  const startTime = new Date(date)
  startTime.setHours(9, 0, 0, 0)

  for (let i = 0; i < 18; i++) {
    const start = new Date(startTime)
    start.setMinutes(startTime.getMinutes() + i * 30)

    const end = new Date(start)
    end.setMinutes(start.getMinutes() + 30)

    slots.push({
      id: `slot-${i}`,
      start,
      end,
      available: Math.random() > 0.3,
    })
  }

  return slots
}