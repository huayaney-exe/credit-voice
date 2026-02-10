"use client";

import { useCallback, useRef } from "react";
import { useVoiceSession } from "@/context/VoiceSessionContext";
import { useAudioPlayback } from "./useAudioPlayback";
import { float32ToWav } from "@/lib/audio-utils";
import { CreditFormFields } from "@/types";

export function useVoiceAgent() {
  const {
    formFields,
    setFormFields,
    conversationHistory,
    addMessage,
    sessionState,
    setSessionState,
    setIsVoiceOverlayOpen,
  } = useVoiceSession();

  const { playAudio, stopAudio } = useAudioPlayback();

  // Refs to avoid stale closures in the VAD callback
  const formFieldsRef = useRef(formFields);
  formFieldsRef.current = formFields;
  const historyRef = useRef(conversationHistory);
  historyRef.current = conversationHistory;
  const isProcessingRef = useRef(false);

  const handleSpeechEnd = useCallback(
    async (audioFloat32: Float32Array) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setSessionState("processing");

      try {
        // 1. Convert to WAV
        const wavBlob = float32ToWav(audioFloat32, 16000);

        // 2. Transcribe
        const formData = new FormData();
        formData.append("audio", wavBlob, "speech.wav");
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        const { text } = await transcribeRes.json();

        if (!text || !text.trim()) {
          setSessionState("listening");
          return;
        }

        // 3. Add user message
        addMessage({ role: "user", content: text });

        // 4. Chat with agent
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcription: text,
            history: historyRef.current,
            currentFields: formFieldsRef.current,
          }),
        });
        const agentResponse = await chatRes.json();

        // 5. Merge extracted fields
        setFormFields((prev) => {
          const merged = { ...prev };
          for (const [key, value] of Object.entries(
            agentResponse.extractedFields
          )) {
            if (value !== null) {
              merged[key as keyof CreditFormFields] = value as string;
            }
          }
          return merged;
        });

        // 6. Add assistant message
        addMessage({ role: "assistant", content: agentResponse.message });

        // 7. Play TTS (non-blocking — allows interruption)
        setSessionState("speaking");
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: agentResponse.message }),
        });
        const audioBlob = await ttsRes.blob();
        playAudio(audioBlob, () => {
          // Called when TTS finishes naturally (not interrupted)
          if (agentResponse.isComplete) {
            setSessionState("idle");
            setTimeout(() => setIsVoiceOverlayOpen(false), 1500);
          } else {
            setSessionState("listening");
          }
        });
      } catch (error) {
        console.error("Voice agent error:", error);
        setSessionState("listening");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [addMessage, playAudio, setFormFields, setSessionState, setIsVoiceOverlayOpen]
  );

  const triggerGreeting = useCallback(async () => {
    setSessionState("processing");

    try {
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: "",
          history: [],
          currentFields: formFieldsRef.current,
        }),
      });
      const agentResponse = await chatRes.json();

      addMessage({ role: "assistant", content: agentResponse.message });

      setSessionState("speaking");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: agentResponse.message }),
      });
      const audioBlob = await ttsRes.blob();
      playAudio(audioBlob, () => {
        setSessionState("listening");
      });
    } catch (error) {
      console.error("Greeting error:", error);
      setSessionState("listening");
    }
  }, [addMessage, playAudio, setSessionState]);

  return { handleSpeechEnd, triggerGreeting, stopAudio, sessionState };
}
