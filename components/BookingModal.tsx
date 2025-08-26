/** @jsxImportSource @emotion/react */
import { TimeSlot, UserDetails } from '../types/calendar'
import React, { useState } from 'react'

interface BookingModalProps {
  timeSlot: TimeSlot
  onClose: () => void
  onConfirm: (userDetails: UserDetails) => void
  calendarId?: string
}

export default function BookingModal({
  timeSlot,
  onClose,
  onConfirm,
  calendarId,
}: BookingModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    notes: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userDetails.name) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Get calendar ID from URL if not provided
      const urlCalendarId = calendarId || window.location.pathname.split('/').pop()
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: urlCalendarId,
          title: userDetails.name,
          startTime: timeSlot.start.toISOString(),
          endTime: timeSlot.end.toISOString(),
          organizerName: userDetails.name,
          organizerEmail: userDetails.email || undefined,
          description: userDetails.notes || ''
        })
      })
      
      const data = await response.json()
      
      if (response.ok && (data.id || data.results)) {
        onConfirm(userDetails)
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        css={{
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          padding: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div css={{ marginBottom: '24px' }}>
          <h2
            css={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#212121',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            Book It
          </h2>
          <p
            css={{
              fontSize: '16px',
              color: '#757575',
              margin: 0,
            }}
          >
            {formatTime(timeSlot.start)} - {formatTime(timeSlot.end)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div css={{ marginBottom: '16px' }}>
            <label
              css={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#616161',
                marginBottom: '4px',
              }}
            >
              Title *
            </label>
            <input
              type='text'
              required
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              css={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: 'white',
                color: '#212121',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#2196f3',
                  boxShadow: '0 0 0 3px #bbdefb',
                },
                '&::placeholder': {
                  color: '#9e9e9e',
                },
              }}
            />
          </div>

          <div css={{ marginBottom: '16px' }}>
            <label
              css={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#616161',
                marginBottom: '4px',
              }}
            >
              Email (optional - for confirmation)
            </label>
            <input
              type='email'
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              placeholder='your@email.com'
              css={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: 'white',
                color: '#212121',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#2196f3',
                  boxShadow: '0 0 0 3px #bbdefb',
                },
                '&::placeholder': {
                  color: '#9e9e9e',
                },
              }}
            />
          </div>

          <div css={{ marginBottom: '24px' }}>
            <label
              css={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#616161',
                marginBottom: '4px',
              }}
            >
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={userDetails.notes}
              onChange={(e) =>
                setUserDetails({ ...userDetails, notes: e.target.value })
              }
              css={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                resize: 'vertical',
                minHeight: '80px',
                backgroundColor: 'white',
                color: '#212121',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#2196f3',
                  boxShadow: '0 0 0 3px #bbdefb',
                },
                '&::placeholder': {
                  color: '#9e9e9e',
                },
              }}
            />
          </div>

          {error && (
            <div css={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div
            css={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type='button'
              onClick={onClose}
              css={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'transparent',
                color: '#757575',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              css={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#2196f3',
                color: '#fafafa',
                border: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#1e88e5',
                },
                '&:disabled': {
                  backgroundColor: '#bdbdbd',
                  cursor: 'not-allowed',
                },
              }}
              disabled={!userDetails.name || loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}