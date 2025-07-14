"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useRouter } from "next/navigation";

const EventPreview = () => {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("eventDraft");
    if (data) {
      setEvent(JSON.parse(data));
    }
  }, []);

  if (!event) {
    return <div className="text-center p-10">No event to preview</div>;
  }

  const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/attend/${event.title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="space-y-4">
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
                <p className="font-medium">{event.maxAttendees}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: event.color_of_the_day }} />
              <p className="text-sm text-gray-600">Color of the Day: {event.color_of_the_day}</p>
            </div>

            <div className="text-center mt-6">
              <QRCodeSVG value={eventUrl} size={160} />
              <p className="text-sm mt-2 text-gray-500">Share this QR with attendees</p>

              <Button
  onClick={() => {
    const shareUrl = `${window.location.origin}/attend/${event.invite_code}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: "Join my event!",
        url: shareUrl,
      });
    } else {
      // fallback: show WhatsApp, Email, etc. links
      window.open(`https://wa.me/?text=Join my event: ${shareUrl}`);
    }
  }}
>
  Share Event
</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push("/planner/")}>
            Publish & Go Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
