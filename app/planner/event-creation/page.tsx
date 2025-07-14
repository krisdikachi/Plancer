"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import colorNames from "colornames";
import Color from "color";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

// A simple color name list for search (add more as needed)
const COLOR_NAME_LIST = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
  "gray",
  "cyan",
  "magenta",
  "lime",
  "teal",
  "indigo",
  "violet",
  "gold",
  "silver",
];

// Upload helper
async function uploadImage(file: File, eventId: string) {
  const filePath = `${eventId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("event-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function EventCreation() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    maxAttendees: "",
    color_of_the_day: "#10B981",
    image: null as File | null,
    colorNameInput: "",
  });
  const [inviteCode, setInviteCode] = useState("");
  const [colorName, setColorName] = useState(colorNames("#10B981") || "green");
  const [colorRgb, setColorRgb] = useState(Color("#10B981").rgb().string());
  const { toast } = useToast();

  // Handle color input (hex or name)
  const handleColorChange = (value: string) => {
    let hex = value;
    let name = colorNames(value) || "";
    let rgb = "";
    try {
      if (!value.startsWith("#")) {
        // Try to parse as color name
        const hexFromName = colorNames(value);
        if (hexFromName) {
          hex = Color(hexFromName).hex();
          name = value;
        }
      }
      rgb = Color(hex).rgb().string();
    } catch {
      hex = "#10B981";
      name = colorNames("#10B981") || "green";
      rgb = Color("#10B981").rgb().string();
    }
    setEventForm({ ...eventForm, color_of_the_day: hex, colorNameInput: value });
    setColorName(name || hex);
    setColorRgb(rgb);
  };

  // Handle color name search/select
  const handleColorNameSelect = (name: string) => {
    const hex = colorNames(name) || "#10B981";
    setEventForm({ ...eventForm, color_of_the_day: hex, colorNameInput: name });
    setColorName(name);
    setColorRgb(Color(hex).rgb().string());
  };

  const handlePreview = async () => {
    if (!eventForm.title || !eventForm.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title and date fields.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);

    try {
      const eventId = uuidv4();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.id) throw new Error("Not logged in");

      const creatorId = user.id;
      const code = nanoid(8);
      setInviteCode(code);

      let imageUrl = "";
      if (eventForm.image) {
        imageUrl = await uploadImage(eventForm.image, eventId);
      }

      const { error: insertError } = await supabase.from("events").insert([
        {
          id: eventId,
          creator_id: creatorId,
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          time: eventForm.time,
          invite_code: code,
          location: eventForm.location,
          img_url: imageUrl,
          max_attendees: eventForm.maxAttendees
            ? parseInt(eventForm.maxAttendees)
            : null,
          color_of_the_day: eventForm.color_of_the_day,
        },
      ]);

      if (insertError) {
        toast({
          title: "Error",
          description: insertError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: `Event created! Your invite code: ${code}`,
        variant: "success",
      });
      setTimeout(() => {
        router.push(`/planner/event/${eventId}/preview-publish`);
      }, 1200);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong while creating the event.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentRole="planner" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/planner/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Event
            </h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Fill in your event information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  placeholder="Wedding Ceremony"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, location: e.target.value })
                  }
                  placeholder="Lagos, Nigeria"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={eventForm.maxAttendees}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        maxAttendees: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="colorOfDay">Color of the Day</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="colorOfDay"
                        type="color"
                        value={eventForm.color_of_the_day}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Badge
                        style={{
                          backgroundColor: eventForm.color_of_the_day,
                          color: "white",
                        }}
                      >
                        {colorName}
                      </Badge>
                      <span className="ml-2 text-xs text-gray-500">
                        {eventForm.color_of_the_day}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {colorRgb}
                      </span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Type color name (e.g. red, blue)"
                      value={eventForm.colorNameInput}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                      {COLOR_NAME_LIST.filter((name) =>
                        name
                          .startsWith(eventForm.colorNameInput.toLowerCase())
                      )
                        .slice(0, 6)
                        .map((name) => (
                          <Button
                            key={name}
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => handleColorNameSelect(name)}
                          >
                            {name}
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Upload Event Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      image: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePreview}
                disabled={!eventForm.title || !eventForm.date || loading}
              >
                {loading ? "Creating..." : "Create Event"}
              </Button>

              {inviteCode && (
                <div className="mt-4 text-center text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded">
                  Your invite code:{" "}
                  <span className="font-mono">{inviteCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}