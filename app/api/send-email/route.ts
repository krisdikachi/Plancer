// /app/api/send-email/route.ts
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { to, subject, name, eventTitle } = body;

  try {
    const data = await resend.emails.send({
      from: "plancer <noreply@plancer.app>",
      to,
      subject,
      html: `<p>Hi ${name},</p>
             <p>You're confirmed for <strong>${eventTitle}</strong> 🎉</p>
             <p>Thanks for using plancer!</p>`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
