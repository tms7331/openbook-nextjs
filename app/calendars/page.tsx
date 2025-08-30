'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Calendar } from "lucide-react";

function CalendarsList() {
  const [calendars, setCalendars] = useState<Array<{ id: string; summary?: string; description?: string }>>([]);
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
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white/80 mb-6 text-balance">Meeting Room Calendars</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl text-pretty">
              Select a room to book your meeting time
            </p>
          </div>
          {isAdmin && (
            <Link href="/create-calendar">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg">
                + Create New Calendar
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">Loading calendars...</div>
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white/10 backdrop-blur rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <p className="text-xl text-white/80 mb-6">No calendars yet</p>
            {isAdmin && (
              <Link href="/create-calendar">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">
                  Create Your First Calendar
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex flex-col space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {calendar.summary || 'Unnamed Calendar'}
                    </h2>
                    {calendar.description && (
                      <p className="text-gray-600 mb-3">{calendar.description}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/book/${calendar.id}`}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
                        Book a Time Slot
                      </Button>
                    </Link>
                    <Link href={`/book/${calendar.id}/qr`}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
                        View QR
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
                        onClick={() => deleteCalendar(calendar.id)}
                        disabled={deletingCalendar === calendar.id}
                      >
                        {deletingCalendar === calendar.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default function CalendarsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar showBackButton={true} />
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="text-white/70 text-lg">Loading...</div>
        </div>
      }>
        <CalendarsList />
      </Suspense>
    </div>
  );
}