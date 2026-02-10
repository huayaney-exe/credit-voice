"use client";

import { useVoiceSession } from "@/context/VoiceSessionContext";

export default function ConversationSubtitles() {
  const { conversationHistory } = useVoiceSession();

  const recentMessages = conversationHistory.slice(-3);

  if (recentMessages.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2 px-4">
      {recentMessages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <p
            className={`
              text-sm px-3 py-2 rounded-xl max-w-[85%]
              animate-[fadeIn_0.3s_ease-in]
              ${
                msg.role === "user"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-[#E6F5EA] text-[#004D14]"
              }
            `}
          >
            {msg.content}
          </p>
        </div>
      ))}
    </div>
  );
}
