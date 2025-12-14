// /app/api/send-email/route.ts
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
    const { to, subject, name, eventTitle } = body;

    if (!to || !subject || !name || !eventTitle) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, name, or eventTitle" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "plancer <noreply@plancer.app>",
      to,
      subject,
      html: `<p>Hi ${name},</p>
             <p>You're confirmed for <strong>${eventTitle}</strong> 🎉</p>
             <p>Thanks for using plancer!</p>`
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
