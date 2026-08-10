// Kleine Soundeffekte, komplett per Web Audio API selbst erzeugt (keine externen
// Audio-Dateien nötig, also auch keine Lizenzfragen). Läuft nur, wenn der Browser
// die Web Audio API unterstützt; sonst passiert einfach nichts.

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/** Muss innerhalb einer echten Nutzer-Interaktion (z.B. Tap) aufgerufen werden, sonst blockt der Browser Audio. */
export function unlockAudio(): void {
  getContext();
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playNoiseBurst(ctx: AudioContext, startTime: number, duration: number, filterFreq: number, volume: number): void {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
}

/** Axt steckt sauber im Holz: kurzer, dumpfer "Thunk". */
export function playHitSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, now, 0.07, 900, 0.22);
  playTone(ctx, 140, now, 0.12, 'triangle', 0.18);
}

/** Axt prallt ab (Kollision): kurzes, helles "Klack". */
export function playMissSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 700, now, 0.07, 'square', 0.1);
  playTone(ctx, 480, now + 0.06, 0.09, 'square', 0.09);
}

/** Apfel eingesammelt: fröhlicher, kurzer Dreiklang aufwärts. */
export function playAppleSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.1, 'sine', 0.16);
  playTone(ctx, 659.25, now + 0.07, 0.12, 'sine', 0.16);
  playTone(ctx, 783.99, now + 0.14, 0.16, 'sine', 0.16);
}

/** Letzte Axt trifft, Holz bricht: tiefer Krach + Splittern. */
export function playBreakSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, now, 0.22, 500, 0.32);
  playNoiseBurst(ctx, now + 0.06, 0.18, 280, 0.26);
  playTone(ctx, 90, now, 0.28, 'sawtooth', 0.18);
}
