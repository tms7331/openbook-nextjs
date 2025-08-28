import { CalendarEvent } from '../types/calendar'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Tag, X } from "lucide-react"

interface EventDetailsModalProps {
  event: CalendarEvent
  onClose: () => void
  isAdmin?: boolean
  onDelete?: () => Promise<void>
}

export default function EventDetailsModal({
  event,
  onClose,
  isAdmin = false,
  onDelete,
}: EventDetailsModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Event Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              Title
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {event.title}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {formatDate(event.start)}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              Time
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
              <Tag className="w-4 h-4" />
              Type
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="inline-flex items-center gap-2">
                <span 
                  className={`w-3 h-3 rounded-full ${
                    event.type === 'booking' ? 'bg-purple-600' : 'bg-gray-400'
                  }`}
                />
                <span className="text-gray-900">
                  {event.type === 'booking' ? 'Booking' : 'Blocked Time'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className={`flex gap-3 mt-6 ${
          isAdmin && onDelete ? 'justify-between' : 'justify-end'
        }`}>
          {isAdmin && onDelete && (
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this event?')) {
                  setIsDeleting(true)
                  try {
                    await onDelete()
                  } catch (error) {
                    console.error('Failed to delete event:', error)
                  } finally {
                    setIsDeleting(false)
                  }
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}