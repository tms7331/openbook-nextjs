'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Meeting Room Booking
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          marginBottom: '3rem'
        }}>
          Book conference rooms quickly and easily
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Link href="/calendars">
            <button style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}>
              📅 View Meeting Rooms
            </button>
          </Link>
        </div>

        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ 
            fontSize: '0.9rem',
            color: '#999'
          }}>
            All bookings are managed via Google Calendar
          </p>
        </div>
      </div>
    </div>
  );
}