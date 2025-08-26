/** @jsxImportSource @emotion/react */
import { CalendarEvent } from '../types/calendar'
import React from 'react'

interface EventDetailsModalProps {
  event: CalendarEvent
  onClose: () => void
}

export default function EventDetailsModal({
  event,
  onClose,
}: EventDetailsModalProps) {
  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
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
            Event Details
          </h2>
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
            Title
          </label>
          <div
            css={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              color: '#212121',
            }}
          >
            {event.title}
          </div>
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
            Date
          </label>
          <div
            css={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              color: '#212121',
            }}
          >
            {formatDate(event.start)}
          </div>
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
            Time
          </label>
          <div
            css={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              color: '#212121',
            }}
          >
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>
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
            Type
          </label>
          <div
            css={{
              padding: '12px',
              fontSize: '16px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              color: '#212121',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              css={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: event.type === 'booking' ? '#2196f3' : '#bdbdbd',
              }}
            />
            {event.type === 'booking' ? 'Booking' : 'Blocked Time'}
          </div>
        </div>

        <div
          css={{
            display: 'flex',
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
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#2196f3',
              color: '#fafafa',
              border: 'none',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#1e88e5',
              },
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}