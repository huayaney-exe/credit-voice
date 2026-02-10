import { experimental_generateSpeech as generateSpeech } from "ai";
import { openai } from "@/lib/openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return new Response("No text provided", { status: 400 });
  }

  const { audio } = await generateSpeech({
    model: openai.speech("tts-1"),
    text,
    voice: "nova",
    speed: 1.15,
  });

  const buffer = Buffer.from(audio.uint8Array);

  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
