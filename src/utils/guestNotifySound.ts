/**
 * Soft chimes for guest live-tracking updates (Web Audio).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    return ctx;
  } catch {
    return null;
  }
}

export async function unlockGuestAudio(): Promise<void> {
  const audio = getCtx();
  if (!audio) return;
  try {
    if (audio.state === 'suspended') await audio.resume();
  } catch {
    /* ignore */
  }
}

function blip(
  audio: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gain = 0.12,
) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Gentle double chime when kitchen pushes a live update */
export function playGuestTrackingChime(): void {
  const audio = getCtx();
  if (!audio) return;
  const run = () => {
    const t = audio.currentTime + 0.02;
    blip(audio, 784, t, 0.12, 0.11);
    blip(audio, 1046, t + 0.12, 0.18, 0.1);
  };
  if (audio.state === 'suspended') {
    void audio.resume().then(run);
    return;
  }
  run();
}
