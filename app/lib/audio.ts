"use client";

// Centralized audio engine: singleton AudioContext, a master gain, and a dynamics compressor
// to prevent clipping when multiple notes play simultaneously.

let sharedContext: AudioContext | null = null;
let sharedMasterGain: GainNode | null = null;
let sharedCompressor: DynamicsCompressorNode | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in the browser");
  }
  const w = window as any;
  const AudioCtx = w.AudioContext || w.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("Web Audio API is not supported in this browser");
  }
  if (!sharedContext) {
    sharedContext = new AudioCtx();
  }
  return sharedContext!;
}

function ensureMasterChain(): { ctx: AudioContext; master: GainNode } {
  const ctx = getAudioContext();
  if (!sharedMasterGain) {
    // Master gain at conservative level to allow headroom
    sharedMasterGain = ctx.createGain();
    sharedMasterGain.gain.setValueAtTime(0.8, ctx.currentTime);

    // Gentle compressor as a safety limiter to avoid harsh metallic clipping
    sharedCompressor = ctx.createDynamicsCompressor();
    // Settings chosen to be transparent but protective for stacked notes
    sharedCompressor.threshold.setValueAtTime(-18, ctx.currentTime); // dB
    sharedCompressor.knee.setValueAtTime(24, ctx.currentTime);
    sharedCompressor.ratio.setValueAtTime(4, ctx.currentTime);
    sharedCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
    sharedCompressor.release.setValueAtTime(0.15, ctx.currentTime);

    sharedMasterGain.connect(sharedCompressor).connect(ctx.destination);
  }
  return { ctx, master: sharedMasterGain };
}

// Simple additive bell with controlled partial levels and an overall per-note gain
// to avoid summing amplitudes into clipping.
export function playBellAt(baseFreq: number, when: number) {
  const { ctx, master } = ensureMasterChain();

  // Per-note gain to prevent too-hot signals when many notes stack
  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0.3, when); // conservative
  noteGain.connect(master);

  function partial(freq: number, amp: number, duration: number) {
    const oscillator = ctx.createOscillator();
    const partialGain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, when);

    // Scale partial by amp, then envelope it
    partialGain.gain.setValueAtTime(amp, when);
    // Soft attack to reduce clicks and harshness
    partialGain.gain.linearRampToValueAtTime(amp, when + 0.005);
    // Exponential decay to near-zero
    partialGain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    oscillator.connect(partialGain).connect(noteGain);
    oscillator.start(when);
    oscillator.stop(when + duration);
  }

  // Tuned partials with reduced amplitudes to avoid metallic overtones building up
  partial(baseFreq, 0.9, 1.4);
  partial(baseFreq * 2, 0.32, 1.0);
  partial(baseFreq * 3, 0.18, 0.9);
}

export function playBell(baseFreq: number) {
  const ctx = getAudioContext();
  playBellAt(baseFreq, ctx.currentTime);
}

export function playBellC5() {
  playBell(523.25);
}

// Utility helpers that other modules might want
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function scheduleCallbackInMs(callback: () => void, whenTimeSec: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const msUntil = Math.max(0, (whenTimeSec - now) * 1000);
  return window.setTimeout(callback, msUntil);
}


