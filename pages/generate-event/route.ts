import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import StabilityAI from "stability-ai";
import { supabase } from "@/lib/supabaseClient";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const stability = new StabilityAI(process.env.DREAMSTUDIO_API_KEY!);

export async function POST(req: Request) {
  const { plannerId, userPrompts } = await req.json();

  try {
    // 1. Use Gemini to generate event metadata
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(
      `Generate structured JSON for this event description: "${userPrompts}".
Include:
{
  "title": "",
  "description": "",
  "date": "",
  "location": "",
  "dress_code": "",
  "color_of_the_day": "",
  "event_type": ""
}`
    );

    const response = await result.response;
    const eventDataText = response.text();
    const eventData = JSON.parse(eventDataText);

    // 2. Generate image from Stability AI
    const imgs = await stability.v1.generation.textToImage(
      "stable-diffusion-xl-1024-v1-0",
      [{ text: `${eventData.event_type} invitation image`, weight: 1 }]
    );

    const imageBase64 = imgs[0].base64;

    // 3. Save to Supabase
    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        creator_id: plannerId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        dress_code: eventData.dress_code,
        color_of_the_day: eventData.color_of_the_day,
        event_type: eventData.event_type,
        invite_image_url: `data:image/png;base64,${imageBase64}`,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to generate event" }, { status: 500 });
  }
}
