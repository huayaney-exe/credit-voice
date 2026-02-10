export interface CreditFormFields {
  nombreCompleto: string | null;
  direccion: string | null;
  montoCredito: string | null;
  ingresoMensual: string | null;
  gastoMensual: string | null;
  numeroCelular: string | null;
  cedula: string | null;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentResponse {
  message: string;
  extractedFields: Partial<CreditFormFields>;
  isComplete: boolean;
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
