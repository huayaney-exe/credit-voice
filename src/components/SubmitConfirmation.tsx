"use client";

import { useVoiceSession } from "@/context/VoiceSessionContext";
import { FIELD_LABELS, CreditFormFields } from "@/types";

interface SubmitConfirmationProps {
  onClose: () => void;
}

export default function SubmitConfirmation({ onClose }: SubmitConfirmationProps) {
  const { formFields } = useVoiceSession();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#E6F5EA] flex items-center justify-center">
            <span className="text-[#009330] text-lg font-bold">✓</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Solicitud completada
          </h2>
        </div>

        <div className="space-y-3 mb-6">
          {(Object.keys(FIELD_LABELS) as (keyof CreditFormFields)[]).map(
            (key) => (
              <div key={key} className="flex justify-between items-start gap-4">
                <span className="text-sm text-gray-500 shrink-0">
                  {FIELD_LABELS[key]}
                </span>
                <span className="text-sm text-gray-900 text-right font-medium">
                  {formFields[key] ?? "—"}
                </span>
              </div>
            )
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-mono">JSON Output</p>
          <pre className="text-xs text-[#009330] font-mono overflow-x-auto">
            {JSON.stringify(formFields, null, 2)}
          </pre>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-[#009330] hover:bg-[#008429] text-white font-semibold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
