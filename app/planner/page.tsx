"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  QrCode,
  Clock,
  Star,
  Plus,
  MapPin,
  Share2,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EventActions2 } from "@/component/EventActions2";
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import Navbar from "@/components/Navbar";

interface Attendee {
  id: string;
  event_id: string;
  user_id: string;
  has_checked_in: boolean;
  barcode_code: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  color_of_the_day: string;
  attendees: Attendee[];
  invite_code: string;
  maxAttendees: number;
  img_url?: string;
}

export default function PlannerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ total: 0, attendees: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'checkedin'>('all');

  const router = useRouter();

  const exportCSV = (eventId: string, attendees: Attendee[]) => {
    const csv = Papa.unparse(
      attendees.map((a) => ({
        Name: a.profiles?.full_name || 'Unknown',
        Email: a.profiles?.email || 'No email',
        Code: a.barcode_code || 'No code',
        Status: a.has_checked_in ? 'Checked In' : 'RSVP',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendees-${eventId}.csv`);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setFetchError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        setFetchError("User not authenticated.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, time, location, color_of_the_day, invite_code, max_attendees, img_url")
        .eq("creator_id", user.id);

      if (error) {
        console.error("❌ Error fetching events:", error.message);
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      const eventIds = data.map((e) => e.id);
      let attendeeGroups: Record<string, Attendee[]> = {};

      if (eventIds.length > 0) {
        const { data: attendees, error: attendeesError } = await supabase
          .from("event_attendees")
          .select(`
            id,
            event_id,
            user_id,
            has_checked_in,
            barcode_code,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .in("event_id", eventIds);

        if (attendeesError) {
          console.error("❌ Error fetching attendees:", attendeesError.message);
          setFetchError("Could not fetch attendee data.");
        } else if (attendees) {
          attendeeGroups = attendees.reduce((acc, attendee) => {
            if (attendee.event_id) {
              if (!acc[attendee.event_id]) acc[attendee.event_id] = [];
              // Fix profiles structure - Supabase returns it as an array
              const fixedAttendee: Attendee = {
                ...attendee,
                profiles: attendee.profiles && Array.isArray(attendee.profiles) && attendee.profiles.length > 0 
                  ? attendee.profiles[0] 
                  : undefined
              };
              acc[attendee.event_id].push(fixedAttendee);
            }
            return acc;
          }, {} as Record<string, Attendee[]>);
        }
      }

      const formatted = data.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date ? new Date(e.date).toLocaleDateString() : "",
        time: e.time || "",
        location: e.location,
        color_of_the_day: e.color_of_the_day,
        invite_code: e.invite_code,
        attendees: attendeeGroups[e.id] || [],
        maxAttendees: e.max_attendees || 0,
        img_url: e.img_url,
      }));

      setEvents(formatted);
      setStats({
        total: formatted.length,
        attendees: formatted.reduce((acc, ev) => acc + ev.attendees.length, 0),
        upcoming: formatted.filter((ev) => {
          const eventDate = new Date(ev.date);
          const today = new Date();
          eventDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return eventDate > today;
        }).length,
      });

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar currentRole="planner" />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Your Events</h2>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            onClick={() => router.push("/planner/event-creation")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-600 text-sm mb-6">
            <Loader2 className="animate-spin w-4 h-4" />
            Loading events...
          </div>
        )}

        {fetchError && (
          <div className="flex items-center gap-3 text-red-600 text-sm mb-6">
            <AlertCircle className="w-5 h-5" />
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden">
                {/* Event Image Header */}
                {event.img_url && (
                  <div 
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${event.img_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-white drop-shadow-lg">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-white/30">
                            {event.attendees.length}/{event.maxAttendees}
                          </Badge>
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: event.color_of_the_day }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className={`p-6 ${!event.img_url ? 'pt-6' : ''}`}>
                  {/* Show title here if no image */}
                  {!event.img_url && (
                    <div className="flex justify-between mb-4">
                      <div className="flex gap-2 items-center">
                        <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                        <Badge>{event.attendees.length}/{event.maxAttendees}</Badge>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: event.color_of_the_day }}
                      />
                    </div>
                  )}

                  <div className="text-sm space-y-1 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Button
                      onClick={() => router.push(`/planner/event/${event.id}/preview-publish`)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                    >
                      Preview
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/planner/scanner?eventId=${event.id}`)}
                        size="sm"
                        variant="outline"
                        className="rounded-xl bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        Scan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportCSV(event.id, event.attendees)}
                        className="rounded-xl"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {event.invite_code && (
                  <EventActions2
                    event={event}
                    eventUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/attend/${event.invite_code}`}
                  />
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
