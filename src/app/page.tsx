"use client";

import CreditForm from "@/components/CreditForm";
import VoiceButton from "@/components/VoiceButton";
import VoiceOverlay from "@/components/VoiceOverlay";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitud de Credito
          </h1>
          <p className="text-gray-500">
            Completa los campos manualmente o usa tu voz para llenarlos
            conversando.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <CreditForm />
        </div>

        {/* Voice CTA */}
        <VoiceButton />

        {/* Voice Overlay (renders when open) */}
        <VoiceOverlay />
      </main>
    </div>
  );
}
