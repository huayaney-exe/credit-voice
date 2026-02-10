"use client";

import { useEffect, useRef, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import { useVoiceSession } from "@/context/VoiceSessionContext";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";
import AudioVisualizer from "./AudioVisualizer";
import ConversationSubtitles from "./ConversationSubtitles";

const STATE_LABELS: Record<string, string> = {
  idle: "",
  listening: "Escuchando...",
  processing: "Procesando...",
  speaking: "Hablando...",
};

export default function VoiceOverlay() {
  const {
    isVoiceOverlayOpen,
    setIsVoiceOverlayOpen,
    sessionState,
    setSessionState,
  } = useVoiceSession();

  const { handleSpeechEnd, triggerGreeting, stopAudio, abort } = useVoiceAgent();
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const analyserRef = useAudioAnalyser(micStream);
  const greetingTriggered = useRef(false);

  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;

  const vad = useMicVAD({
    startOnLoad: false,
    baseAssetPath: "/vad/",
    onnxWASMBasePath: "/vad/",
    positiveSpeechThreshold: 0.5,
    negativeSpeechThreshold: 0.25,
    minSpeechMs: 500,
    preSpeechPadMs: 300,
    redemptionMs: 300,
    onSpeechEnd: (audio: Float32Array) => {
      if (sessionStateRef.current === "listening") {
        handleSpeechEnd(audio);
      }
    },
    onVADMisfire: () => {
      // Speech was too short, ignore
    },
  });

  // Capture microphone stream from VAD for the analyser
  useEffect(() => {
    if (isVoiceOverlayOpen && vad.listening) {
      // Access the underlying stream via navigator
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(setMicStream)
        .catch(console.error);
    }
    return () => {
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
        setMicStream(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceOverlayOpen, vad.listening]);

  // Start VAD and trigger greeting when overlay opens
  useEffect(() => {
    if (isVoiceOverlayOpen && !greetingTriggered.current) {
      greetingTriggered.current = true;
      vad.start();
      triggerGreeting();
    }
    if (!isVoiceOverlayOpen) {
      greetingTriggered.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceOverlayOpen]);

  // Pause/resume VAD based on session state
  // VAD only active during "listening" — paused during speaking to prevent TTS feedback
  useEffect(() => {
    if (!isVoiceOverlayOpen) return;

    if (sessionState === "listening") {
      vad.start();
    } else {
      vad.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState, isVoiceOverlayOpen]);

  const handleClose = () => {
    abort();
    vad.pause();
    stopAudio();
    setSessionState("idle");
    setIsVoiceOverlayOpen(false);
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      setMicStream(null);
    }
  };

  if (!isVoiceOverlayOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* State label */}
      <p className="text-sm text-[#009330] font-medium mb-6 h-5">
        {STATE_LABELS[sessionState] || ""}
      </p>

      {/* Visualizer */}
      <AudioVisualizer
        analyserNode={analyserRef.current}
        sessionState={sessionState}
      />

      {/* Subtitles */}
      <div className="mt-8 w-full max-w-md">
        <ConversationSubtitles />
      </div>

      {/* Hint */}
      <p className="absolute bottom-8 text-xs text-gray-400">
        Habla naturalmente — el agente te ira guiando
      </p>
    </div>
  );
}
