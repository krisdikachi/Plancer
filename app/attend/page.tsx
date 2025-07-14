'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users, Plus, Loader2, Search, X } from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function AttendPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedEvent, setSearchedEvent] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleJoinEvent = (event: any) => {
    // Navigate to the specific event join page
    router.push(`/attend/event/${event.id}`);
  };

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) {
      setSearchedEvent(null);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('invite_code', searchCode.trim())
        .single();

      if (error) {
        setSearchedEvent(null);
      } else {
        setSearchedEvent(data);
      }
    } catch (err) {
      setSearchedEvent(null);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchCode('');
    setSearchedEvent(null);
  };

  // Filter events based on search
  const displayEvents = searchedEvent ? [searchedEvent] : events;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole="attend" />
      
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Available Events</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Attendee Dashboard
          </Badge>
        </div>

        {/* Search by Invite Code */}
        <div className="mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Invite Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter invite code (e.g., ABC12345)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchByCode()}
                  className="pl-10 pr-10"
                />
                {searchCode && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearchByCode}
                disabled={searching || !searchCode.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {searchedEvent && (
              <p className="text-sm text-emerald-600 mt-2">
                ✓ Found event: {searchedEvent.title}
              </p>
            )}
            {searchCode && !searchedEvent && !searching && (
              <p className="text-sm text-red-600 mt-2">
                No event found with that invite code
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchedEvent ? 'No event found' : 'No events available'}
            </h3>
            <p className="text-gray-500">
              {searchedEvent 
                ? 'Check the invite code and try again' 
                : 'Check back later for upcoming events!'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden">
                {/* Event Image Header */}
                {event.img_url && (
                  <div 
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${event.img_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.max_attendees && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleJoinEvent(event)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Join Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
