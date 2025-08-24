export interface TimeSlot {
  id: string
  start: Date
  end: Date
  available: boolean
  bookingId?: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'unavailable'
}

export interface Booking {
  id: string
  calendarId: string
  timeSlot: TimeSlot
  userDetails: UserDetails
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
}

export interface UserDetails {
  name: string
  notes?: string
}

export interface CalendarData {
  id: string
  name: string
  description?: string
  type: CalendarType
  events: CalendarEvent[]
  timeSlots: TimeSlot[]
}

export type CalendarType = 'room' | 'asset' | 'other'

export type CalendarView = 'day' | 'week' | 'month'