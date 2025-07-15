"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { QRCodeSVG } from "qrcode.react";
import { EventActions } from "@/component/eventactions";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft } from "lucide-react";

export default function EventPreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Supabase Error:", error);
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="text-red-500 p-10">Error loading event preview.</div>;
  }

  const eventUrl = `https://plancer.vercel.app/attend/${event.invite_code || event.id}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header with back button and scan button */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push("/planner/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.push(`/planner/scanner?eventId=${event.id}`)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Scan Attendees
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
            <p className="text-gray-600">{event.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{event.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{event.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Attendees</p>
                <p className="font-medium">{event.max_attendees}</p>
              </div>
            </div>

            {event.img_url && (
              <div>
                <img
                  src={event.img_url}
                  alt="Event"
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: event.color_of_the_day }}
              />
              <p className="text-sm text-gray-600">
                Color of the Day: {event.color_of_the_day}
              </p>
            </div>

            <div className="mt-4 text-center">
              <div className="mb-2">
                <span className="font-semibold">Invite Code:</span>{" "}
                <span className="font-mono text-lg">{event.invite_code}</span>
              </div>
              <QRCodeSVG value={eventUrl} size={160} />
              <p className="text-sm mt-2 text-gray-500">Scan this QR or use the invite code to join</p>
            </div>

            <EventActions event={event} eventUrl={eventUrl} />
          </div>
        </div>
      </div>
    </>
  );
}
