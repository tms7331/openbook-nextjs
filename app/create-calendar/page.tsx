'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";

export default function CreateCalendarPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<{id?: string; error?: string} | null>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar showBackButton={true} />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Calendar</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Conference Room A"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Main conference room with projector"
                rows={3}
                className="w-full"
              />
            </div>

            <Button
              onClick={createCalendar}
              disabled={!name || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Calendar'}
            </Button>

            {result && (
              <div className={`rounded-lg p-4 ${
                result.error 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {result.error ? (
                  <div className="text-red-700">
                    <strong>Error:</strong> {result.error}
                  </div>
                ) : (
                  <div className="text-green-700">
                    <strong>Success!</strong> Calendar created
                    <div className="mt-2 text-sm">
                      <strong>Calendar ID:</strong> 
                      <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs break-all">
                        {result.id}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}