import openai from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "es",
    response_format: "text",
    prompt: "Solicitud de crédito, nombre, dirección, monto, ingreso, gasto, celular, cédula.",
  });

  return NextResponse.json({ text: transcription });
}
