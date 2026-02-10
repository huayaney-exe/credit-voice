import { generateText, Output } from "ai";
import { openai } from "@/lib/openai";
import { buildSystemPrompt } from "@/lib/prompts";
import { agentResponseSchema, ConversationMessage, CreditFormFields } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { transcription, history, currentFields } = (await req.json()) as {
    transcription: string;
    history: ConversationMessage[];
    currentFields: CreditFormFields;
  };

  const systemPrompt = buildSystemPrompt(currentFields);

  const messages = history
    .filter((m): m is ConversationMessage & { role: "user" | "assistant" } => m.role !== "system")
    .map(({ role, content }) => ({ role, content }));

  if (transcription) {
    messages.push({ role: "user", content: transcription });
  }

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    output: Output.object({
      schema: agentResponseSchema,
    }),
  });

  return NextResponse.json(output);
}
