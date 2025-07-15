'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Navbar from "@/components/Navbar";

export default function EventJoinPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  const [event, setEvent] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingBarcode, setExistingBarcode] = useState('');

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${event?.title || 'event'}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    const fetchEventAndCheckRegistration = async () => {
      if (!eventId) return;
      
      try {
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setError('Event not found');
          setLoading(false);
          return;
        }

        setEvent(eventData);

        // Check if user is already registered
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: registration } = await supabase
            .from('event_attendees')
            .select('barcode_code')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

          if (registration) {
            setAlreadyRegistered(true);
            setExistingBarcode(registration.barcode_code);
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndCheckRegistration();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!email || !fullName || !eventId) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // First, check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please sign in to register for events');
        setSubmitting(false);
        return;
      }

      // Check if user already registered for this event
      const { data: existingRegistration } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        setError('You are already registered for this event');
        setSubmitting(false);
        return;
      }

      // Check if event is full
      if (event.max_attendees) {
        const { count } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        if (count && count >= event.max_attendees) {
          setError('This event is full');
          setSubmitting(false);
          return;
        }
      }

      const uniqueCode = uuidv4();
      
      // First, create/update user profile to ensure foreign key constraint is satisfied
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: email,
          role: 'attendee', // <-- must match your DB constraint
        });

      if (profileError) {
        setError('Failed to update profile: ' + profileError.message);
        setSubmitting(false);
        return;
      }
      
      // Then insert into event_attendees table (consistent with planner dashboard)
      const { error } = await supabase.from('event_attendees').insert({
        event_id: eventId,
        user_id: user.id,
        barcode_code: uniqueCode,
        has_checked_in: false,
      });

      if (error) {
        setError(error.message);
      } else {
        setBarcode(uniqueCode);
        setSubmitted(true);
      }
    } catch (err) {
      setError('Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentRole="attend" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentRole="attend" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
            <Button onClick={() => router.push('/attend')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole="attend" />
      
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/attend')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>

        <Card className="overflow-hidden">
          {/* Event Image Header */}
          {event.img_url && (
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${event.img_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">{event.title}</CardTitle>
            <p className="text-gray-600">{event.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{event.time}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.max_attendees && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>Max {event.max_attendees} attendees</span>
                </div>
              )}
            </div>

            {!submitted ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Register for Event
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    {alreadyRegistered ? 'Already Registered!' : 'Registration Successful!'}
                  </h3>
                  <p className="text-green-700">
                    {alreadyRegistered 
                      ? 'You are already registered for this event. Here\'s your access code:'
                      : 'You\'re confirmed for this event. Here\'s your access code:'
                    }
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <QRCode value={alreadyRegistered ? existingBarcode : barcode} size={200} />
                  <p className="mt-4 text-sm text-gray-500">
                    Present this QR code at the venue for check-in
                  </p>
                  <p className="mt-2 text-xs text-gray-400 font-mono">
                    Code: {alreadyRegistered ? existingBarcode : barcode}
                  </p>
                  <Button 
                    onClick={downloadQRCode}
                    variant="outline"
                    className="mt-4 w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>

                <Button 
                  onClick={() => router.push('/attend')} 
                  variant="outline"
                  className="w-full"
                >
                  Back to Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
