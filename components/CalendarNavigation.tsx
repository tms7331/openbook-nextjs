/** @jsxImportSource @emotion/react */
import { CalendarView } from '../types/calendar'

interface CalendarNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  view: CalendarView
  onViewChange: (view: CalendarView) => void
}

export default function CalendarNavigation({
  currentDate,
  onDateChange,
}: CalendarNavigationProps) {
  function navigateDate(days: number) {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + days)
    onDateChange(newDate)
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        borderBottom: '1px solid #90caf9',
        marginBottom: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          onClick={() => navigateDate(-1)}
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '9999px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            outline: 'none',
            boxShadow: '0 4px 14px -6px #2196f3',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            '&:hover': {
              backgroundColor: '#1e88e5',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -8px #2196f3',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 14px -6px #2196f3',
            },
          }}
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
          </svg>
        </button>

        <h1
          css={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#1565c0',
            margin: 0,
          }}
        >
          {formatDate(currentDate)}
        </h1>

        <button
          onClick={() => navigateDate(1)}
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '9999px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            outline: 'none',
            boxShadow: '0 4px 14px -6px #2196f3',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            '&:hover': {
              backgroundColor: '#1e88e5',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -8px #2196f3',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 14px -6px #2196f3',
            },
          }}
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
          </svg>
        </button>
      </div>

      <button
        onClick={() => onDateChange(new Date())}
        css={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          outline: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 14px -6px #2196f3',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateY(0)',
          '&:hover': {
            backgroundColor: '#1e88e5',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px -6px #2196f3',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 4px 14px -6px #2196f3',
          },
        }}
      >
        {currentDate.toDateString() === new Date().toDateString()
          ? 'Today'
          : 'Go to Today'}
      </button>
    </div>
  )
}