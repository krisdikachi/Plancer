import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY environment variable" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json(
        { error: "Event not found", details: eventError?.message },
        { status: 404 }
      );
    }

    // Fetch attendees
    const { data: attendees, error: attendeesError } = await supabase
      .from("attendees")
      .select("full_name, email")
      .eq("event_id", eventId);

    if (attendeesError) {
      return NextResponse.json(
        { error: "Failed to fetch attendees", details: attendeesError.message },
        { status: 500 }
      );
    }

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({ success: false, message: "No attendees found" });
    }

    // Send email to each
    const emailResults = [];
    for (const attendee of attendees) {
      try {
        const result = await resend.emails.send({
          from: "plancer <noreply@plancer.app>",
          to: attendee.email,
          subject: `Reminder for ${eventData.title}`,
          html: `<p>Hi ${attendee.full_name},</p>
                 <p>This is a reminder for your upcoming event: <strong>${eventData.title}</strong></p>
                 <p>Date: ${eventData.date} @ ${eventData.time}<br/>
                 Location: ${eventData.location}</p>
                 <p>Thanks for RSVPing on plancer!</p>`,
        });
        emailResults.push({ email: attendee.email, success: true, result });
      } catch (emailError) {
        emailResults.push({ email: attendee.email, success: false, error: emailError });
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      count: attendees.length,
      sent: successCount,
      results: emailResults,
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
