'use client';

import { useState } from 'react';

export default function CreateCalendarPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createCalendar = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          timezone: 'America/New_York',
          makePublic: true
        })
      });
      const data = await response.json();
      setResult(data);
      if (data.id) {
        setName('');
        setDescription('');
      }
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create New Calendar</h1>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Calendar Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Conference Room A"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Main conference room with projector"
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={createCalendar}
        disabled={!name || loading}
        style={{
          backgroundColor: name && !loading ? '#2196f3' : '#ccc',
          color: 'white',
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: name && !loading ? 'pointer' : 'not-allowed',
          width: '100%'
        }}
      >
        {loading ? 'Creating...' : 'Create Calendar'}
      </button>

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: result.error ? '#ffebee' : '#e8f5e9',
          border: `1px solid ${result.error ? '#ffcdd2' : '#c8e6c9'}`,
          borderRadius: '8px'
        }}>
          {result.error ? (
            <div style={{ color: '#c62828' }}>
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div style={{ color: '#2e7d32' }}>
              <strong>Success!</strong> Calendar created
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Calendar ID:</strong> {result.id}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}