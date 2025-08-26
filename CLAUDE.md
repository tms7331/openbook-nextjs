# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Meeting Room Booking System built with Next.js 15 and Google Calendar API. It uses Google Service Account authentication to manage meeting room calendars and bookings.

## Development Commands

```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build production application
npm run start      # Start production server
npm run lint       # Run ESLint for code linting
```

## Architecture

### Authentication System
The application uses Google Service Account authentication (`lib/google-calendar.ts`) to manage all calendar operations. This allows users to book rooms without signing in. The system uses a Google Service Account with appropriate permissions to manage calendars.

The `getCalendarClient()` function in `lib/google-calendar.ts` creates the authenticated calendar client.

### API Structure

All API routes are in `app/api/`:

- **Calendars**: `/api/calendars` - Create and list meeting room calendars
- **Bookings**: `/api/bookings` - Create bookings and check availability
  - `/api/bookings/availability` - Check room availability across multiple calendars

### Key Components

- **Calendar Display**: `components/` contains calendar UI components using FullCalendar
- **Booking Pages**: 
  - `/book/[calendarId]` - Book a specific room
  - `/calendars` - List all available rooms
  - `/create-calendar` - Admin interface to create new room calendars

## Environment Configuration

Required environment variables (see `.env.local.example`):

```env
GOOGLE_SERVICE_ACCOUNT_KEY # Full JSON service account credentials
NEXTAUTH_URL              # Base URL (http://localhost:3000 for dev)
CALENDAR_TIMEZONE         # Default timezone (optional)
RESEND_API_KEY            # Optional: Email service for booking confirmations
```

## Google Calendar Setup Requirements

1. **Service Account**: Must have "Make changes to events" permission on each calendar
2. **Calendar Sharing**: Each room calendar must be shared with the service account email

## Testing Endpoints

- `/api/test` - Test system status and basic operations
- `/test` - Frontend test page for API interactions
- `/api/auth-status` - Check service account configuration status

## Important Implementation Notes

- Service account has full control over all calendars and bookings
- Calendar API automatically prevents double-booking
- The service account email format: `*@*.iam.gserviceaccount.com`
- All bookings require organizer information (name and email) for tracking

## TypeScript Configuration

- Strict mode enabled
- Path alias `@/*` maps to project root
- Target ES2017 with ESNext library features