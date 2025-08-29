'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import QRCodeStyling from 'qr-code-styling'

export default function QRPage() {
  const params = useParams()
  const calendarId = params.calendarId as string
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const bookingUrl = `${baseUrl}/book/${calendarId}`

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: bookingUrl,
      image: '/qrlogo.png',
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
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 1,
        imageSize: 0.4
      }
    })

    if (qrRef.current) {
      qrRef.current.innerHTML = ''
      qrCode.append(qrRef.current)
    }
  }, [calendarId])


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Booking QR Code</h1>
          <p className="text-gray-600 mb-8">Scan this QR code to book this room</p>

          <div className="flex flex-col items-center space-y-6">
            <div className="bg-white p-8 rounded-lg border-2 border-gray-200" ref={qrRef}></div>

            <a
              href={`/book/${calendarId}`}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
            >
              View Booking Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}