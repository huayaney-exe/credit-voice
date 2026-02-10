"use client";

import { useCallback, useRef } from "react";
import { getSharedAudioElement } from "@/lib/audio-element";

export function useAudioPlayback() {
  const urlRef = useRef<string | null>(null);

  const playAudio = useCallback((audioBlob: Blob, onEnded?: () => void) => {
    const audio = getSharedAudioElement();

    // Stop current playback
    audio.pause();
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    const url = URL.createObjectURL(audioBlob);
    urlRef.current = url;
    audio.src = url;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      urlRef.current = null;
      onEnded?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      urlRef.current = null;
      onEnded?.();
    };

    audio.play().catch(() => {
      // Play failed (e.g. audio not unlocked) — skip to next state
      onEnded?.();
    });
  }, []);

  const stopAudio = useCallback(() => {
    const audio = getSharedAudioElement();
    audio.pause();
    audio.currentTime = 0;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  return { playAudio, stopAudio };
}
