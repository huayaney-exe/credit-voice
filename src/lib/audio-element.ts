/**
 * Shared HTMLAudioElement singleton for mobile-compatible audio playback.
 *
 * Mobile browsers (iOS Safari, Chrome Android) block audio.play() unless
 * it's triggered during a user gesture. By creating ONE element and
 * "unlocking" it on the first tap, all subsequent plays work reliably.
 */

let sharedAudio: HTMLAudioElement | null = null;

// Tiny silent WAV (44 bytes) — used to unlock audio on mobile
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function getSharedAudioElement(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
  }
  return sharedAudio;
}

/**
 * Call this inside a user gesture handler (click/tap) to unlock
 * audio playback on iOS and Android.
 */
export function warmupAudio(): void {
  const audio = getSharedAudioElement();
  audio.src = SILENT_WAV;
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
  }).catch(() => {
    // Silently ignore — warmup is best-effort
  });
}
