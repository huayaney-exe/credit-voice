"use client";

import { useEffect, useRef } from "react";

export function useAudioAnalyser(stream: MediaStream | null) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    // Do NOT connect to destination (would cause feedback)

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    return () => {
      source.disconnect();
      audioContext.close();
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, [stream]);

  return analyserRef;
}
