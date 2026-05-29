const SOUND_ENABLED_KEY = "staffos-notification-sound-enabled";

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    if (stored === "false") return false;
    return true;
  } catch {
    return true;
  }
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    /* ignore */
  }
}

let sharedAudioContext: AudioContext | null = null;

/** Call once after user gesture so later beeps are allowed by the browser. */
export function primeNotificationSound(): void {
  if (!isNotificationSoundEnabled() || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioContext) sharedAudioContext = new AudioCtx();
    if (sharedAudioContext.state === "suspended") {
      void sharedAudioContext.resume();
    }
  } catch {
    /* ignore */
  }
}

/** Short two-tone beep via Web Audio (no external file). */
export function playNotificationSound(): void {
  if (!isNotificationSoundEnabled()) return;
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioCtx();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const playTone = (frequency: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    playTone(880, now, 0.1);
    playTone(1174.66, now + 0.11, 0.12);
  } catch {
    /* Autoplay policy or unsupported environment */
  }
}
