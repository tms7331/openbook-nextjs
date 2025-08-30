# OpenBook - Meeting Room Booking System

A modern, easy-to-use meeting room booking application with QR code support for quick access.  Built for the Frontier Tower.

## Features

### 📅 Room Booking
- View available meeting rooms and their schedules
- Book time slots with a visual calendar interface
- See all upcoming bookings at a glance
- Prevent double-booking with automatic conflict detection

### 🔗 QR Code Integration
- Generate unique QR codes for each meeting room
- Place QR codes outside physical meeting rooms for instant booking access
- Scan to immediately view and book available time slots

### 👥 User-Friendly Interface
- No sign-in required for booking rooms
- Clean, modern design with purple-themed styling
- Responsive layout works on desktop and mobile devices
- Real-time calendar updates

### 🛠️ Admin Features
- Create new meeting room calendars
- Manage existing room calendars
- Delete bookings when needed

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud project with Calendar API enabled
- Google Service Account with calendar permissions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontiertowerhackathon-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Google Service Account credentials
   - Set your base URL for QR codes

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Users
1. Visit the calendars page to see all available meeting rooms
2. Click "Book a Time Slot" for your desired room
3. Select a date and time on the calendar
4. Fill in your booking details and confirm

### For Room Management
1. Print QR codes from the "View QR" button for each room
2. Place QR codes outside physical meeting rooms
3. Users can scan to instantly access that room's booking page

### For Administrators
1. Create new room calendars from the admin interface
2. Delete calendars or individual bookings as needed

## Key Pages

- `/` - Homepage
- `/calendars` - View all meeting rooms
- `/book/[calendarId]` - Book a specific room
- `/book/[calendarId]/qr` - QR code for a specific room
- `/create-calendar` - Create new room calendar (admin only)

## Support

For issues or questions, please open an issue on the project repository.