'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [authStatus, setAuthStatus] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth-status');
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
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

          {authStatus && !authStatus.authenticated ? (
            <button 
              onClick={() => window.location.href = '/api/auth/signin'}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              🔑 Sign in with Google
            </button>
          ) : authStatus?.authenticated ? (
            <div style={{
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              color: '#2e7d32'
            }}>
              ✓ Signed in as {authStatus.user?.email}
              <button 
                onClick={() => window.location.href = '/api/auth/signout'}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  color: '#2e7d32',
                  border: '1px solid #2e7d32',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : null}
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
            {authStatus?.authenticated 
              ? 'Your bookings will appear in your Google Calendar'
              : 'Sign in to sync bookings with your calendar'}
          </p>
        </div>
      </div>
    </div>
  );
}