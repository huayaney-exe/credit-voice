import openai from "@/lib/openai";
import { buildSystemPrompt } from "@/lib/prompts";
import { AgentResponse, ConversationMessage, CreditFormFields } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { transcription, history, currentFields } = (await req.json()) as {
    transcription: string;
    history: ConversationMessage[];
    currentFields: CreditFormFields;
  };

  const systemMessage = buildSystemPrompt(currentFields);
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: systemMessage },
      ...history,
    ];

  if (transcription) {
    messages.push({ role: "user", content: transcription });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "agent_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Natural language response to speak to the user",
            },
            extractedFields: {
              type: "object",
              properties: {
                nombreCompleto: { type: ["string", "null"] },
                direccion: { type: ["string", "null"] },
                montoCredito: { type: ["string", "null"] },
                ingresoMensual: { type: ["string", "null"] },
                gastoMensual: { type: ["string", "null"] },
                numeroCelular: { type: ["string", "null"] },
                cedula: { type: ["string", "null"] },
              },
              required: [
                "nombreCompleto",
                "direccion",
                "montoCredito",
                "ingresoMensual",
                "gastoMensual",
                "numeroCelular",
                "cedula",
              ],
              additionalProperties: false,
            },
            isComplete: { type: "boolean" },
          },
          required: ["message", "extractedFields", "isComplete"],
          additionalProperties: false,
        },
      },
    },
  });

  const agentResponse: AgentResponse = JSON.parse(
    response.choices[0].message.content!
  );

  return NextResponse.json(agentResponse);
}
