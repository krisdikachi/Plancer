import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, message, userId } = body;

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
