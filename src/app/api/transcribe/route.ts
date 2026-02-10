import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  const { text } = await transcribe({
    model: openai.transcription("whisper-1"),
    audio: Buffer.from(await audioFile.arrayBuffer()),
    providerOptions: {
      openai: {
        language: "es",
        prompt: "Solicitud de crédito, nombre, dirección, monto, ingreso, gasto, celular, cédula.",
      },
    },
  });

  return NextResponse.json({ text });
}
