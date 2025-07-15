'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Calendar, MapPin, Clock, LogIn } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';

export default function AttendByInviteCode() {
  const { invite_code } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchEvent = async () => {
      if (!invite_code) return;

      try {
        // First check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setCheckingAuth(false);

        // Fetch event data
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('invite_code', invite_code)
          .single();

        if (error) {
          setError('Event not found or invalid invite code');
          setLoading(false);
          return;
        }

        setEvent(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load event');
        setLoading(false);
      }
    };

    checkAuthAndFetchEvent();
  }, [invite_code]);

  const handleRSVP = async () => {
    if (!user) {
      // Redirect to signup with event info
      router.push(`/signup?role=attend&event=${invite_code}`);
      return;
    }

    if (!email || !fullName || !event) return;

    setSubmitting(true);
    setError('');

    try {
      // First, ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: fullName,
          email: email,
          role: 'attend', // enforce allowed value
        });

        if (profileError) {
          setError('Failed to create user profile. Please try again.');
          setSubmitting(false);
          return;
        }
      }

      // Check if user already registered for this event
      const { data: existingRegistration } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        setError('You are already registered for this event');
        setSubmitting(false);
        return;
      }

      const uniqueBarcode = uuidv4();
      
      const { error: insertError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id,
          barcode_code: uniqueBarcode,
          has_checked_in: false,
        });

      if (insertError) {
        setError('Failed to RSVP. Please try again.');
        setSubmitting(false);
        return;
      }

      setBarcodeCode(uniqueBarcode);
      setRsvpSubmitted(true);
      setSubmitting(false);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold mb-2">Event Not Found</p>
              <p className="text-sm">{error}</p>
              <Button 
                onClick={() => router.push('/')} 
                className="mt-4"
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rsvpSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">RSVP Confirmed!</CardTitle>
            <p className="text-sm text-gray-600">You're on the guest list for</p>
            <p className="font-semibold text-lg">{event.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <QRCodeSVG value={barcodeCode} size={200} />
              <p className="text-sm text-gray-500 mt-2">
                Present this QR code at the venue for check-in
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Your Access Code:</p>
              <p className="font-mono text-sm font-bold">{barcodeCode}</p>
            </div>
            <div className="text-center">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline"
                className="w-full"
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <p className="text-gray-600">{event.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
            )}
            {event.color_of_the_day && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: event.color_of_the_day }}
                />
                <span>Color of the Day</span>
              </div>
            )}
          </div>

          {!user ? (
            /* Not authenticated - show signup prompt */
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <LogIn className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Sign up to join this event</h3>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Create an account to register for this event and get your QR code for check-in.
                </p>
                <Button 
                  onClick={() => router.push(`/signup?role=attend&event=${invite_code}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign Up to Join Event
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
                <Button 
                  onClick={() => router.push(`/login?redirect=/attend/${invite_code}`)}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </div>
          ) : (
            /* Authenticated - show RSVP form */
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                onClick={handleRSVP}
                disabled={!email || !fullName || submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming RSVP...
                  </>
                ) : (
                  'Confirm RSVP'
                )}
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 