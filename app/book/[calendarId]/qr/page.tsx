'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import QRCodeStyling from 'qr-code-styling'
import { Calendar } from 'lucide-react'

export default function QRPage() {
  const params = useParams()
  const calendarId = params.calendarId as string
  const qrRef = useRef<HTMLDivElement>(null)
  const [calendarName, setCalendarName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCalendarMetadata() {
      try {
        const response = await fetch(`/api/calendars/${calendarId}`);
        const data = await response.json();
        setCalendarName(data.calendar?.summary || `Calendar ${calendarId}`);
      } catch (error) {
        console.error('Failed to fetch calendar metadata:', error);
        setCalendarName(`Calendar ${calendarId}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarMetadata();
  }, [calendarId]);

  useEffect(() => {
    if (!qrRef.current || loading) return;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const bookingUrl = `${baseUrl}/book/${calendarId}`

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: bookingUrl,
      image: '/qrlogo.png',
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 1,
        imageSize: 0.4
      },
      dotsOptions: {
        color: '#000000',
        type: 'rounded'
      },
      backgroundOptions: {
        color: '#FFFFFF',
      },
      cornersSquareOptions: {
        color: '#9333ea',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#9333ea',
        type: 'dot',
      }
    })

    qrRef.current.innerHTML = ''
    qrCode.append(qrRef.current)
  }, [calendarId, loading])


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-white/60 mx-auto mb-4 animate-pulse" />
          <p className="text-white/70 text-lg">Loading QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {calendarName}
          </h1>
          <p className="text-white/70">Scan this QR code to book this room</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <div ref={qrRef} className="w-[300px] h-[300px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}