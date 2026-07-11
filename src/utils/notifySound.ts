/**
 * Premium kitchen alert tones (Web Audio — no audio files required).
 * Order = double chime · Assist = brighter triple ping
 */

type ToneKind = 'order' | 'assist' | 'test';

let sharedCtx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!sharedCtx) sharedCtx = new AC();
    return sharedCtx;
  } catch {
    return null;
  }
}

/** Call once from a user gesture (dashboard open / unmute) so mobile browsers allow sound */
export async function unlockNotifyAudio(): Promise<void> {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') await ctx.resume();
    unlocked = true;
  } catch {
    /* ignore */
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    gain = 0.18,
    type = 'sine',
  }: {
    frequency: number;
    start: number;
    duration: number;
    gain?: number;
    type?: OscillatorType;
  },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playNotifySound(kind: ToneKind = 'order'): void {
  const ctx = getCtx();
  if (!ctx) return;

  const run = () => {
    const t0 = ctx.currentTime + 0.02;
    if (kind === 'order') {
      // Warm double chime — new table order
      tone(ctx, { frequency: 660, start: t0, duration: 0.16, gain: 0.2 });
      tone(ctx, { frequency: 880, start: t0 + 0.14, duration: 0.22, gain: 0.18 });
      tone(ctx, {
        frequency: 1320,
        start: t0 + 0.14,
        duration: 0.18,
        gain: 0.06,
        type: 'triangle',
      });
      return;
    }
    if (kind === 'assist') {
      // Brighter triple ping — waiter / water / cutlery
      tone(ctx, { frequency: 880, start: t0, duration: 0.1, gain: 0.16 });
      tone(ctx, { frequency: 1175, start: t0 + 0.11, duration: 0.1, gain: 0.15 });
      tone(ctx, { frequency: 1480, start: t0 + 0.22, duration: 0.16, gain: 0.14 });
      return;
    }
    // Soft test blip
    tone(ctx, { frequency: 740, start: t0, duration: 0.14, gain: 0.14 });
  };

  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => {
      unlocked = true;
      run();
    });
    return;
  }
  unlocked = true;
  run();
}

export function isNotifyAudioUnlocked(): boolean {
  return unlocked;
}
