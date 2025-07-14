'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, QrCode, Users, CheckCircle } from 'lucide-react';

export default function ScannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams?.get('eventId');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedCount, setScannedCount] = useState(0);

  console.log('Scanner page - eventId:', eventId); // Debug log

  useEffect(() => {
    const fetchEvent = async () => {
      console.log('Fetching event with ID:', eventId); // Debug log
      if (eventId) {
        try {
          const { data, error } = await supabase
            .from('events')
            .select('title, date, time, location')
            .eq('id', eventId)
            .single();
          
          if (error) {
            console.error('Error fetching event:', error);
          } else {
            console.log('Event data fetched:', data); // Debug log
            setEvent(data);
          }
        } catch (err) {
          console.error('Error in fetchEvent:', err);
        }
      } else {
        console.log('No eventId provided, proceeding without event context'); // Debug log
      }
      setLoading(false);
    };

    fetchEvent();
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing load complete'); // Debug log
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [eventId]);

  useEffect(() => {
    console.log('Initializing scanner...'); // Debug log
    
    // Temporarily disable scanner to test page loading
    setLoading(false);
    return;
    
    try {
      const scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        async (decodedText) => {
          console.log('QR code scanned:', decodedText); // Debug log
          const code = decodedText.trim();

          const { data, error } = await supabase
            .from('attendees')
            .update({ has_checked_in: true })
            .eq('barcode_code', code)
            .select();

          if (!error && data.length > 0) {
            setScannedCount(prev => prev + 1);
            alert(`✅ ${data[0].full_name || 'Attendee'} checked in successfully!`);
          } else {
            alert('❌ Invalid or already checked-in code');
          }

          scanner.clear();
        },
        (error) => {
          console.warn('Scanner error:', error);
        }
      );

      return () => {
        console.log('Cleaning up scanner...'); // Debug log
        scanner.clear();
      };
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scanner...</p>
          <p className="text-xs text-gray-500 mt-2">Event ID: {eventId || 'None'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/planner/")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">QR Scanner</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{scannedCount} checked in</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Scanner */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Scan Attendee QR Code</h2>
                  <p className="text-sm text-gray-600">Position the QR code within the scanner frame</p>
                  <Button 
                    onClick={() => {
                      console.log('Manual scanner init...');
                      // Re-enable scanner here
                    }}
                    className="mt-4"
                    variant="outline"
                  >
                    Initialize Scanner
                  </Button>
                </div>
                <div id="reader" className="w-full max-w-md mx-auto"></div>
              </CardContent>
            </Card>
          </div>

          {/* Event Info */}
          <div className="space-y-4">
            {event && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Event Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Event</p>
                      <p className="font-medium">{event.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    {event.time && (
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">{event.time}</p>
                      </div>
                    )}
                    {event.location && (
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Instructions</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ask attendees to show their QR code</li>
                  <li>• Position the QR code in the scanner frame</li>
                  <li>• The system will automatically check them in</li>
                  <li>• You'll see a confirmation message</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
