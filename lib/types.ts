export interface MeetingRoom {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity?: number;
}

export interface CreateBookingRequest {
  calendarId: string;
  title: string;
  startTime: string;
  endTime: string;
  organizerName: string;
  organizerEmail?: string;
  attendees?: string[];
  description?: string;
}

export interface Booking {
  id: string;
  calendarId: string;
  title: string;
  startTime: string;
  endTime: string;
  organizer: {
    name: string;
    email?: string;
  };
  attendees?: string[];
  description?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface AvailabilityRequest {
  calendarIds: string[];
  timeMin: string;
  timeMax: string;
}

export interface AvailabilitySlot {
  calendarId: string;
  calendarName?: string;
  busy: Array<{
    start: string;
    end: string;
  }>;
}

export interface CreateCalendarRequest {
  name: string;
  description?: string;
  location?: string;
  timezone?: string;
}