import { z } from "zod";

export const creditFormFieldsSchema = z.object({
  nombreCompleto: z.string().nullable(),
  direccion: z.string().nullable(),
  montoCredito: z.string().nullable(),
  ingresoMensual: z.string().nullable(),
  gastoMensual: z.string().nullable(),
  numeroCelular: z.string().nullable(),
  cedula: z.string().nullable(),
});

export type CreditFormFields = z.infer<typeof creditFormFieldsSchema>;

export const agentResponseSchema = z.object({
  message: z.string(),
  extractedFields: creditFormFieldsSchema,
  isComplete: z.boolean(),
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type VoiceSessionState = "idle" | "listening" | "processing" | "speaking";

export const EMPTY_FORM: CreditFormFields = {
  nombreCompleto: null,
  direccion: null,
  montoCredito: null,
  ingresoMensual: null,
  gastoMensual: null,
  numeroCelular: null,
  cedula: null,
};

export const FIELD_LABELS: Record<keyof CreditFormFields, string> = {
  nombreCompleto: "Nombre completo",
  direccion: "Direccion",
  montoCredito: "Monto del credito",
  ingresoMensual: "Ingreso mensual",
  gastoMensual: "Gasto mensual",
  numeroCelular: "Numero celular",
  cedula: "Cedula",
};
