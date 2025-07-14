"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart2, Users, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalCheckedIn: 0,
    events: [] as any[],
  });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all events for this planner
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, date")
        .eq("creator_id", user.id);
      if (eventsError) return;

      // Fetch all attendees for these events
      const eventIds = events.map((e: any) => e.id);
      let attendees: any[] = [];
      let checkedIn = 0;
      if (eventIds.length > 0) {
        const { data: attendeeData, error: attendeeError } = await supabase
          .from("event_attendees")
          .select("event_id, has_checked_in")
          .in("event_id", eventIds);
        if (!attendeeError && attendeeData) {
          attendees = attendeeData;
          checkedIn = attendeeData.filter((a: any) => a.has_checked_in).length;
        }
      }

      // Aggregate per-event stats
      const eventStats = events.map((event: any) => {
        const eventAttendees = attendees.filter((a) => a.event_id === event.id);
        const checkedInCount = eventAttendees.filter((a) => a.has_checked_in).length;
        return {
          ...event,
          attendeeCount: eventAttendees.length,
          checkedInCount,
        };
      });

      setStats({
        totalEvents: events.length,
        totalAttendees: attendees.length,
        totalCheckedIn: checkedIn,
        events: eventStats,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole="planner" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  <CardTitle className="text-lg">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalEvents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">Total Attendees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalAttendees}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-lg">Check-in Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.totalAttendees > 0
                      ? `${Math.round((stats.totalCheckedIn / stats.totalAttendees) * 100)}%`
                      : "0%"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.totalCheckedIn} checked in
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simple Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-700">Attendees per Event</span>
              </div>
              <div className="space-y-3">
                {stats.events.length === 0 ? (
                  <div className="text-gray-400 text-sm">No events to display</div>
                ) : (
                  stats.events.map((event) => (
                    <div key={event.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{event.title}</span>
                        <span className="text-xs text-gray-500">{event.date ? new Date(event.date).toLocaleDateString() : ""}</span>
                        <span className="text-xs text-gray-700">{event.attendeeCount} attendees</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded h-3 relative">
                        <div
                          className="bg-emerald-500 h-3 rounded"
                          style={{ width: `${stats.totalAttendees > 0 ? (event.attendeeCount / Math.max(...stats.events.map(e => e.attendeeCount), 1)) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Events */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-semibold text-gray-700 mb-4">Top Events by Attendance</div>
              <div className="space-y-2">
                {stats.events.length === 0 ? (
                  <div className="text-gray-400 text-sm">No events to display</div>
                ) : (
                  stats.events
                    .sort((a, b) => b.attendeeCount - a.attendeeCount)
                    .slice(0, 5)
                    .map((event) => (
                      <div key={event.id} className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{event.title}</span>
                        <span className="text-xs text-gray-500">{event.date ? new Date(event.date).toLocaleDateString() : ""}</span>
                        <span className="text-xs text-gray-700">{event.attendeeCount} attendees</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 