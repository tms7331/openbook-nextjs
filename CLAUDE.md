# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Meeting Room Booking System built with Next.js 15 and Google Calendar API. It provides a dual-authentication system allowing both Google OAuth users and non-authenticated users (via service account) to book meeting rooms.

## Development Commands

```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build production application
npm run start      # Start production server
npm run lint       # Run ESLint for code linting
```

## Architecture

### Authentication System
The application uses a dual authentication approach:

1. **OAuth Authentication** (`lib/auth.ts`): Users sign in with Google to book rooms under their own identity. Events appear in their personal Google Calendar.

2. **Service Account Authentication** (`lib/google-calendar.ts`): Non-authenticated users can book rooms via forms. The system uses a Google Service Account to manage calendars.

The `getCalendarClient()` function in `lib/google-calendar.ts:5-53` automatically selects the appropriate authentication method based on session state.

### API Structure

All API routes are in `app/api/`:

- **Auth**: `/api/auth/[...nextauth]` - NextAuth Google OAuth handlers
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
GOOGLE_CLIENT_ID           # OAuth client ID
GOOGLE_CLIENT_SECRET       # OAuth client secret  
GOOGLE_SERVICE_ACCOUNT_KEY # Full JSON service account credentials
NEXTAUTH_URL              # Base URL (http://localhost:3000 for dev)
NEXTAUTH_SECRET           # Random secret for NextAuth
CALENDAR_TIMEZONE         # Default timezone (optional)
```

## Google Calendar Setup Requirements

1. **Service Account**: Must have "Make changes to events" permission on each calendar
2. **OAuth Users**: Need at least "See all event details" to view availability
3. **Calendar Sharing**: Each room calendar must be shared with the service account email

## Testing Endpoints

- `/api/test` - Test authentication status and basic operations
- `/test` - Frontend test page for API interactions

## Important Implementation Notes

- OAuth users can only modify their own bookings
- Service account has full control over all calendars and bookings
- Both authentication methods respect the same booking conflicts
- Calendar API automatically prevents double-booking
- The service account email format: `*@*.iam.gserviceaccount.com`

## TypeScript Configuration

- Strict mode enabled
- Path alias `@/*` maps to project root
- Target ES2017 with ESNext library features