'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [calendarId, setCalendarId] = useState('');

  const apiCall = async (url: string, method = 'GET', body?: any) => {
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f44336',
  };

  const infoButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>Calendar API Test</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333' }}>Authentication</h2>
        <button style={buttonStyle} onClick={() => window.location.href = '/api/auth/signin'}>
          Sign In with Google
        </button>
        <button style={dangerButtonStyle} onClick={() => window.location.href = '/api/auth/signout'}>
          Sign Out
        </button>
        <button style={infoButtonStyle} onClick={() => apiCall('/api/auth-status')}>
          Check Auth Status
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333' }}>Calendars</h2>
        <button style={infoButtonStyle} onClick={() => apiCall('/api/calendars')}>
          List Calendars
        </button>
        <button style={buttonStyle} onClick={() => apiCall('/api/calendars', 'POST', {
          name: 'Test Room ' + Date.now(),
          description: 'Test conference room',
          timezone: 'America/New_York',
          makePublic: true  // Makes calendar publicly visible
        })}>
          Create Public Calendar (Visible to All)
        </button>
        
        <button style={buttonStyle} onClick={() => {
          const email = prompt('Enter email to share with (e.g. your@email.com):');
          if (calendarId && email) {
            apiCall('/api/calendars/share', 'POST', {
              calendarId: calendarId,
              email: email,
              role: 'writer'
            });
          } else if (calendarId) {
            apiCall('/api/calendars/share', 'POST', {
              calendarId: calendarId,
              public: true,
              role: 'reader'
            });
          } else {
            alert('Please enter a calendar ID first');
          }
        }}>
          Share Calendar (Email for Write, Empty for Public Read)
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333' }}>Bookings</h2>
        <input
          type="text"
          placeholder="Enter Calendar ID"
          value={calendarId}
          onChange={(e) => setCalendarId(e.target.value)}
          style={{ 
            width: '400px', 
            padding: '10px',
            fontSize: '14px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            marginBottom: '15px'
          }}
        />
        <br />
        
        <button style={infoButtonStyle} onClick={() => apiCall(`/api/bookings?calendarId=${calendarId}`)}>
          List Bookings
        </button>
        
        <button style={buttonStyle} onClick={() => {
          const now = new Date();
          const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
          const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration
          
          apiCall('/api/bookings', 'POST', {
            calendarId,
            title: 'Test Meeting ' + Date.now(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            organizerName: 'Test User',
            organizerEmail: 'test@example.com',
            description: 'Test booking - Starting in 30 minutes'
          });
        }}>
          Create Booking (30 min from now)
        </button>
        
        <button style={buttonStyle} onClick={() => {
          const startTime = new Date();
          startTime.setHours(startTime.getHours() + 2, 0, 0, 0); // 2 hours from now, at top of hour
          const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration
          
          apiCall('/api/bookings', 'POST', {
            calendarId,
            title: 'Meeting Room Reserved',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            organizerName: 'Test User',
            organizerEmail: 'test@example.com',
            description: 'Conference room booking'
          });
        }}>
          Create Booking (2 hours from now)
        </button>
        
        <button style={infoButtonStyle} onClick={() => {
          const now = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          apiCall('/api/bookings/availability', 'POST', {
            calendarIds: [calendarId],
            timeMin: now.toISOString(),
            timeMax: nextWeek.toISOString()
          });
        }}>
          Check Availability (Next 7 Days)
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', marginTop: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333' }}>Result:</h2>
        <pre style={{ 
          backgroundColor: '#2d2d2d', 
          color: '#f8f8f2',
          padding: '15px', 
          borderRadius: '5px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '20px', marginTop: '30px', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>📋 Instructions:</h3>
        <ol style={{ color: '#856404', lineHeight: '1.8' }}>
          <li>First, check auth status to see if you're logged in</li>
          <li>Create a calendar (only works with service account)</li>
          <li>Copy the calendar ID from the result</li>
          <li>Paste it in the input field above</li>
          <li>Try creating bookings and checking availability</li>
          <li>Sign in with Google to test OAuth bookings</li>
        </ol>
      </div>
    </div>
  );
}