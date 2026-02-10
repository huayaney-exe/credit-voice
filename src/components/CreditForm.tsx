"use client";

import { useVoiceSession } from "@/context/VoiceSessionContext";
import { CreditFormFields, FIELD_LABELS } from "@/types";
import { useState } from "react";
import SubmitConfirmation from "./SubmitConfirmation";

const FIELD_TYPES: Record<keyof CreditFormFields, string> = {
  nombreCompleto: "text",
  direccion: "text",
  montoCredito: "text",
  ingresoMensual: "text",
  gastoMensual: "text",
  numeroCelular: "tel",
  cedula: "text",
};

const FIELD_PLACEHOLDERS: Record<keyof CreditFormFields, string> = {
  nombreCompleto: "Juan Perez Garcia",
  direccion: "Calle 10 #45-23, Bogota",
  montoCredito: "5000000",
  ingresoMensual: "3500000",
  gastoMensual: "2000000",
  numeroCelular: "3001234567",
  cedula: "1234567890",
};

export default function CreditForm() {
  const { formFields, setFormFields } = useVoiceSession();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (key: keyof CreditFormFields, value: string) => {
    setFormFields((prev) => ({ ...prev, [key]: value || null }));
  };

  const filledCount = Object.values(formFields).filter((v) => v !== null).length;
  const allFilled = filledCount === 7;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(FIELD_LABELS) as (keyof CreditFormFields)[]).map(
            (key) => (
              <div key={key} className={key === "direccion" ? "md:col-span-2" : ""}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {FIELD_LABELS[key]}
                </label>
                <div className="relative">
                  <input
                    id={key}
                    type={FIELD_TYPES[key]}
                    placeholder={FIELD_PLACEHOLDERS[key]}
                    value={formFields[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={`
                      w-full px-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400
                      border-2 transition-all duration-200
                      focus:outline-none focus:border-[#009330] focus:shadow-[0_0_0_3px_rgba(0,147,48,0.15)]
                      ${formFields[key] ? "border-[#009330]/40" : "border-gray-300"}
                    `}
                  />
                  {formFields[key] && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009330] text-sm font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            {filledCount}/7 campos completados
          </p>
          <button
            type="submit"
            disabled={!allFilled}
            className={`
              px-8 py-3.5 rounded-full font-semibold transition-all duration-200
              ${
                allFilled
                  ? "bg-[#009330] hover:bg-[#008429] active:bg-[#007522] text-white shadow-md shadow-[#009330]/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Enviar solicitud
          </button>
        </div>
      </form>

      {showConfirmation && (
        <SubmitConfirmation onClose={() => setShowConfirmation(false)} />
      )}
    </>
  );
}
