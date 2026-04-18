// Sound abstraction layer. To swap to MP3s: replace synth* functions
// with `new Audio(url).play()` calls keyed by SoundName.

export type SoundName = 'arm' | 'buzz' | 'winner' | 'disarm' | 'kick';

let _ctx: AudioContext | null = null;
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  // Resume if suspended (browsers suspend until user gesture)
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  startOffset = 0,
): void {
  const ac = ctx();
  const t = ac.currentTime + startOffset;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g);
  g.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

const synths: Record<SoundName, () => void> = {
  // Rising two-tone chime — ascending perfect 4th (A4 → D5)
  arm: () => {
    tone(440, 0.25, 'sine', 0.35, 0);
    tone(587, 0.35, 'sine', 0.35, 0.18);
  },
  // Sharp low-frequency blat
  buzz: () => {
    tone(90, 0.08, 'sawtooth', 0.6, 0);
    tone(70, 0.25, 'sawtooth', 0.45, 0.07);
  },
  // 3-note ascending fanfare (C5 → E5 → G5)
  winner: () => {
    tone(523, 0.22, 'sine', 0.4, 0);
    tone(659, 0.22, 'sine', 0.4, 0.18);
    tone(784, 0.5,  'sine', 0.45, 0.36);
  },
  // Soft descending two-click
  disarm: () => {
    tone(440, 0.12, 'sine', 0.18, 0);
    tone(330, 0.12, 'sine', 0.14, 0.1);
  },
  // Single dull low thud
  kick: () => {
    tone(100, 0.28, 'sine', 0.35, 0);
  },
};

export function isSoundOn(): boolean {
  return localStorage.getItem('bz-sound') !== 'off';
}

export function setSoundOn(on: boolean): void {
  localStorage.setItem('bz-sound', on ? 'on' : 'off');
}

export function play(name: SoundName): void {
  if (!isSoundOn()) return;
  try {
    synths[name]();
  } catch {
    // Ignore — AudioContext may be unavailable
  }
}
