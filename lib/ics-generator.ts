export function generateICS({
  title,
  description,
  startTime,
  endTime,
  location,
  organizerEmail,
  organizerName
}: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerEmail?: string;
  organizerName?: string;
}): string {
  // Convert dates to ICS format (YYYYMMDDTHHMMSSZ)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const uid = `${Date.now()}@roomBooking`;
  const timestamp = formatDate(new Date().toISOString());
  const start = formatDate(startTime);
  const end = formatDate(endTime);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Room Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    `LOCATION:${location}`,
    organizerEmail ? `ORGANIZER;CN=${organizerName || 'Room Booking System'}:mailto:${organizerEmail}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line).join('\r\n');

  return icsContent;
}