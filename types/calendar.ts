export type CalendarView = 'day' | 'week' | 'month'

export interface TimeSlot {
  id: string
  start: Date
  end: Date
  available: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'block'
}

export interface CalendarData {
  id: string
  name: string
  type: 'room' | 'resource'
  events: CalendarEvent[]
  timeSlots: TimeSlot[]
}

export interface UserDetails {
  name: string
  notes?: string
  email?: string
}