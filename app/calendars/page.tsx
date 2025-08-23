'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await fetch('/api/calendars');
      const data = await response.json();
      if (data.calendars) {
        setCalendars(data.calendars);
      }
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Meeting Room Calendars</h1>
        <Link href="/create-calendar">
          <button style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            + Create New Calendar
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading calendars...</div>
      ) : calendars.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No calendars yet</p>
          <Link href="/create-calendar">
            <button style={{
              backgroundColor: '#2196f3',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Create Your First Calendar
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {calendars.map((calendar) => (
            <div key={calendar.id} style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{calendar.summary || 'Unnamed Calendar'}</h3>
              {calendar.description && (
                <p style={{ color: '#666', marginBottom: '1rem' }}>{calendar.description}</p>
              )}
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>
                ID: {calendar.id}
              </div>
              <Link href={`/book/${calendar.id}`}>
                <button style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  Book a Time Slot
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}