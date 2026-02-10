import openai from "@/lib/openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return new Response("No text provided", { status: 400 });
  }

  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    response_format: "mp3",
    speed: 1.15,
  });

  return new Response(response.body, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
