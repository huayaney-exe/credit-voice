"use client";

import { useCallback, useRef } from "react";
import { useVoiceSession } from "@/context/VoiceSessionContext";
import { useAudioPlayback } from "./useAudioPlayback";
import { float32ToWav } from "@/lib/audio-utils";
import { CreditFormFields } from "@/types";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  backoffMs = 500
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

export function useVoiceAgent() {
  const {
    formFields,
    setFormFields,
    conversationHistory,
    addMessage,
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
  const abortRef = useRef<AbortController | null>(null);
  const greetingAudioRef = useRef<Blob | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const handleSpeechEnd = useCallback(
    async (audioFloat32: Float32Array) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setSessionState("processing");

      try {
        // 1. Convert to WAV
        const wavBlob = float32ToWav(audioFloat32, 16000);

        // 2. Transcribe (no retry — user can re-speak)
        const formData = new FormData();
        formData.append("audio", wavBlob, "speech.wav");
        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
          signal,
        });
        const { text } = await transcribeRes.json();

        if (!text || !text.trim()) {
          setSessionState("listening");
          return;
        }

        // 3. Add user message
        addMessage({ role: "user", content: text });

        // 4. Chat with agent (retry on failure)
        const chatRes = await fetchWithRetry(
          "/api/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcription: text,
              history: historyRef.current,
              currentFields: formFieldsRef.current,
            }),
            signal,
          },
          2
        );
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

        // 6. Fetch TTS audio before showing text (so they appear together)
        setSessionState("speaking");
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: agentResponse.message }),
          signal,
        });
        const audioBlob = await ttsRes.blob();

        // 7. Show text + play audio simultaneously
        addMessage({ role: "assistant", content: agentResponse.message });
        playAudio(audioBlob, () => {
          if (agentResponse.isComplete) {
            setSessionState("idle");
            setTimeout(() => setIsVoiceOverlayOpen(false), 1500);
          } else {
            setSessionState("listening");
          }
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Voice agent error:", error);
        setSessionState("listening");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [abort, addMessage, playAudio, setFormFields, setSessionState, setIsVoiceOverlayOpen]
  );

  const triggerGreeting = useCallback(async () => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

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
        signal,
      });
      const agentResponse = await chatRes.json();

      // Fetch TTS before showing text so they appear together
      setSessionState("speaking");
      let audioBlob: Blob;
      if (greetingAudioRef.current) {
        audioBlob = greetingAudioRef.current;
      } else {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: agentResponse.message }),
          signal,
        });
        audioBlob = await ttsRes.blob();
        greetingAudioRef.current = audioBlob;
      }
      addMessage({ role: "assistant", content: agentResponse.message });
      playAudio(audioBlob, () => {
        setSessionState("listening");
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Greeting error:", error);
      setSessionState("listening");
    }
  }, [addMessage, playAudio, setSessionState]);

  return { handleSpeechEnd, triggerGreeting, stopAudio, abort };
}
