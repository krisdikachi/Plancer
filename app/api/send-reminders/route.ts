import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId } = body;

  // Fetch event details
  const { data: eventData } = await supabase.from("events").select("*").eq("id", eventId).single();

  // Fetch attendees
  const { data: attendees } = await supabase
    .from("attendees")
    .select("full_name, email")
    .eq("event_id", eventId);

  if (!attendees || attendees.length === 0) {
    return NextResponse.json({ success: false, message: "No attendees found" });
  }

  // Send email to each
  for (const attendee of attendees) {
    await resend.emails.send({
      from: "plancer <noreply@plancer.app>",
      to: attendee.email,
      subject: `Reminder for ${eventData.title}`,
      html: `<p>Hi ${attendee.full_name},</p>
             <p>This is a reminder for your upcoming event: <strong>${eventData.title}</strong></p>
             <p>Date: ${eventData.date} @ ${eventData.time}<br/>
             Location: ${eventData.location}</p>
             <p>Thanks for RSVPing on plancer!</p>`,
    });
  }

  return NextResponse.json({ success: true, count: attendees.length });
}
