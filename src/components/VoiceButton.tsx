"use client";

import { useVoiceSession } from "@/context/VoiceSessionContext";
import { warmupAudio } from "@/lib/audio-element";

export default function VoiceButton() {
  const { setIsVoiceOverlayOpen, clearConversation } = useVoiceSession();

  const handleClick = () => {
    warmupAudio(); // Unlock audio on mobile during user gesture
    clearConversation();
    setIsVoiceOverlayOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      className="
        w-full flex items-center justify-center gap-3
        py-4 px-6 rounded-full
        bg-[#009330] hover:bg-[#008429] active:bg-[#007522]
        text-white font-semibold
        transition-all duration-200
        shadow-md shadow-[#009330]/20
        hover:shadow-lg hover:shadow-[#009330]/30
      "
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>

      <span>Llenar conversando</span>
    </button>
  );
}
