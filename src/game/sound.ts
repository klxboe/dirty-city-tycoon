// Kleine Soundeffekte, komplett per Web Audio API selbst erzeugt (keine externen
// Audio-Dateien nötig, also auch keine Lizenzfragen). Läuft nur, wenn der Browser
// die Web Audio API unterstützt; sonst passiert einfach nichts.

let audioContext: AudioContext | null = null;
let muted = false;

/** Ton global an/aus. Wird aus dem gespeicherten Spielstand gesetzt. */
export function setMuted(value: boolean): void {
  muted = value;
}

/**
 * Kurzes haptisches Feedback, wo das Gerät es unterstützt (Android/Chrome; iOS-Safari
 * kennt navigator.vibrate nicht und ignoriert das hier stillschweigend). Läuft über
 * denselben Stummschalter wie der Ton, damit ein "alles aus" wirklich alles ausschaltet.
 */
export function vibrate(pattern: number | number[]): void {
  if (muted) return;
  navigator.vibrate?.(pattern);
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || muted) return null;
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

/**
 * Generischer UI-Klick für JEDEN Button in der App (siehe globaler Klick-Listener
 * in App.tsx) – Klaus: "baue Sounds ein wenn man auf einen Button klickt, damit es
 * sich deutlich hochwertiger anfühlt". Bewusst sehr kurz und leise (ein doppelter,
 * hoher "Tick" statt eines vollen Tons) – soll bei jedem einzelnen Tap in der
 * Werkstatt/den Menüs unauffällig mitlaufen, nicht wie ein eigenständiger Soundeffekt
 * aus dem Spiel selbst (playHitSound etc.) auffallen.
 */
export function playClickSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 1000, now, 0.05, 'sine', 0.07);
  playTone(ctx, 1600, now + 0.016, 0.035, 'sine', 0.045);
}

/** Boss besiegt: aufsteigende Fanfare. */
export function playBossSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
    playTone(ctx, freq, now + i * 0.09, 0.3, 'triangle', 0.15);
  });
  playNoiseBurst(ctx, now + 0.36, 0.3, 2400, 0.12);
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

/** Axt wird abgeschossen: kurzes, aufsteigendes Schwirren, synchron zum Mündungsblitz. */
export function playThrowSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const duration = 0.09;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(1100, now);
  filter.frequency.exponentialRampToValueAtTime(3400, now + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

/**
 * Axt steckt sauber im Holz: kurzer, dumpfer "Thunk". Klaus: "einen etwas mehr
 * hölzigen Sound wenn man das Brett trifft" – Rauschanteil von einem helleren
 * 900Hz-Klick auf einen dumpferen 500Hz-Thud gesenkt, dazu ein zweiter, leicht
 * verstimmter Oberton (210Hz statt nur eines einzelnen 140Hz-Tons) fürs Holz-Timbre
 * (ein echter Holzschlag klingt nie nach einer einzelnen reinen Frequenz).
 */
export function playHitSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, now, 0.09, 500, 0.2);
  playTone(ctx, 95, now, 0.14, 'triangle', 0.2);
  playTone(ctx, 210, now + 0.008, 0.09, 'sine', 0.08);
}

/**
 * Game Over (Axt trifft die eigene steckende Axt). War erst ein heller "Klack" (zu
 * harmlos), dann ein gleitender Dissonanz-Stoß (kam nicht gut an), dann ein tiefer
 * Holz-Krach ("so ein Holz-zerbrechen-Sound", Klaus' eigener Vorschlag).
 *
 * Nochmal geändert (Klaus: "einen zerscherbten Sound wenn man ein anderes Messer
 * trifft") – der Holz-Krach passte zum ALLGEMEINEN "verloren"-Gefühl, aber nicht
 * mehr zum KONKRETEN Ereignis: zwei Klingen, die aufeinanderprallen, splittern nicht
 * wie Holz, sie zerspringen wie Metall/Glas. Heller, scharfer Knall (Rauschanteil
 * jetzt hochfrequent statt dumpf) plus mehrere schnell hintereinander verklingende
 * hohe "Splitter"-Töne (dieselbe Idee wie die visuellen Funken in GameOverModal.tsx,
 * nur als Ton), der tiefe Ton bleibt als spürbarer Einschlag unter dem Zerspringen.
 */
export function playGameOverSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, now, 0.05, 3200, 0.28);
  playTone(ctx, 90, now, 0.16, 'sawtooth', 0.14);
  [2400, 3100, 1900, 3600].forEach((freq, i) => {
    playTone(ctx, freq, now + 0.02 + i * 0.035, 0.09, 'triangle', 0.09);
  });
}

/**
 * Münze eingesammelt: heller aufwärts-Dreiklang PLUS ein kurzes metallisches "Klimpern"
 * obendrauf, damit es nach Geld statt nach einer generischen Erfolgs-Melodie klingt
 * (passend zum Münzen-statt-Äpfel-Reskin, siehe Apple.tsx).
 */
export function playCoinSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.1, 'sine', 0.16);
  playTone(ctx, 659.25, now + 0.07, 0.12, 'sine', 0.16);
  playTone(ctx, 783.99, now + 0.14, 0.16, 'sine', 0.16);
  // Metallisches Klimpern: mehrere sehr kurze, hohe Töne dicht hintereinander.
  [1568, 1976, 2349].forEach((freq, i) => {
    playTone(ctx, freq, now + 0.14 + i * 0.03, 0.08, 'triangle', 0.06);
  });
}

/**
 * Level geschafft (kein Boss): triumphaler, kurzer "Erfolg!"-Jingle statt des früheren
 * neutralen Holzbruch-Krachs (Klaus: "geiler Sound wenn man das Brett abgeschlossen
 * hat"). Kombiniert einen dumpfen Schlag (das Brett fällt) mit einer hellen, fröhlichen
 * Dur-Akkord-Fanfare direkt danach – fühlt sich nach Belohnung an, nicht nach Zerstörung.
 * Bewusst kürzer/kleiner als `playBossSound`, damit ein echter Bosssieg weiterhin
 * besonderer klingt als ein normales Level.
 */
export function playLevelCompleteSound(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNoiseBurst(ctx, now, 0.14, 450, 0.22);
  playTone(ctx, 100, now, 0.16, 'sawtooth', 0.12);
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    playTone(ctx, freq, now + 0.1 + i * 0.06, 0.32, 'triangle', 0.17);
  });
}
