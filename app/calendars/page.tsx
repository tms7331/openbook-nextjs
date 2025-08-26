'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CalendarsList() {
  const [calendars, setCalendars] = useState<Array<{id: string; summary?: string; description?: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCalendar, setDeletingCalendar] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';

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

  const deleteCalendar = async (calendarId: string) => {
    if (!confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      return;
    }

    setDeletingCalendar(calendarId);
    try {
      const response = await fetch(`/api/calendars/${calendarId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Calendar deleted successfully');
        await fetchCalendars();
      } else {
        const error = await response.json();
        const errorMessage = error.hint 
          ? `${error.message}\n\n${error.hint}` 
          : error.message || error.error;
        alert(`Failed to delete calendar:\n${errorMessage}`);
      }
    } catch (error) {
      console.error('Failed to delete calendar:', error);
      alert('Failed to delete calendar');
    } finally {
      setDeletingCalendar(null);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Meeting Room Calendars</h1>
        {isAdmin && (
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
        )}
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
          {isAdmin && (
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
          )}
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
              <h3 style={{ marginBottom: '0.5rem', color: '#000' }}>{calendar.summary || 'Unnamed Calendar'}</h3>
              {calendar.description && (
                <p style={{ color: '#333', marginBottom: '1rem' }}>{calendar.description}</p>
              )}
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                ID: {calendar.id}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                {isAdmin && (
                  <button
                    onClick={() => deleteCalendar(calendar.id)}
                    disabled={deletingCalendar === calendar.id}
                    style={{
                      backgroundColor: deletingCalendar === calendar.id ? '#999' : '#f44336',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: deletingCalendar === calendar.id ? 'not-allowed' : 'pointer',
                      opacity: deletingCalendar === calendar.id ? 0.7 : 1,
                    }}
                  >
                    {deletingCalendar === calendar.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}>
      <CalendarsList />
    </Suspense>
  );
}