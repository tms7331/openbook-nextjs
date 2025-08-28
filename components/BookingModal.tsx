import { TimeSlot, UserDetails } from '../types/calendar'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Book Meeting Room
            </h2>
            <p className="text-gray-600">
              {formatTime(timeSlot.start)} - {formatTime(timeSlot.end)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <Input
              type="text"
              required
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              placeholder="e.g., Team Standup"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optional - for confirmation)
            </label>
            <Input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              placeholder="your@email.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <Textarea
              rows={3}
              value={userDetails.notes}
              onChange={(e) =>
                setUserDetails({ ...userDetails, notes: e.target.value })
              }
              placeholder="Add any additional details..."
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!userDetails.name || loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}