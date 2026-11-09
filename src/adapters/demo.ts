import type { RadioState, SignalSource, SourceMetadata } from '../core/types.ts';
import { scenarios } from '../core/radio.ts';
const TAU = Math.PI * 2;
export function noise(x: number): number {
  const value = Math.sin(x * 127.1 + 311.7) * 43758.5453123;
  return (value - Math.floor(value)) * 2 - 1;
}
// C=-.-. Q=--.-, repeated twice. Unit duration 90 ms; no recording or third-party audio.
const morse = [1,1,1,0,1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,0,0,0,0,0];
export function cwGate(time: number) { return morse[Math.floor(Math.max(0, time) / .09) % morse.length]; }
export function sceneFrequency(state: RadioState) { return scenarios.find(s => s.id === state.scenario)!.frequency; }
export function envelope(state: RadioState, frequency: number, time: number) {
  const center = sceneFrequency(state);
  const d = frequency - center;
  let signal = 0;
  const bell = (offset: number, width: number, amplitude: number) => amplitude * Math.exp(-.5 * ((d - offset) / width) ** 2);
  if (state.scenario === 'am' || state.scenario === 'neighbors') {
    signal += bell(0, 95, 65) + bell(-440, 100, 36) + bell(440, 100, 36);
    if (state.scenario === 'neighbors') signal += bell(4000, 110, 57) + bell(3340, 90, 32) + bell(4660, 90, 32);
  }
  if (state.scenario === 'ssb') signal += bell(-350, 110, 38) + bell(-700, 130, 52) + bell(-1150, 145, 43);
  if (state.scenario === 'cw') signal += bell(0, 70, 67 * cwGate(time));
  return signal * (.93 + .07 * Math.sin(time * 2));
}
export function passband(state: RadioState): [number, number] {
  if (state.mode === 'USB') return [0, state.filter];
  if (state.mode === 'LSB') return [-state.filter, 0];
  return [-state.filter / 2, state.filter / 2];
}
function reception(state: RadioState, delta: number) {
  const [lo, hi] = passband(state);
  if (state.scenario === 'ssb') {
    return [-350, -700, -1150].reduce((s, x) => s + (x - delta >= lo && x - delta <= hi ? 1 / 3 : 0), 0);
  }
  return Math.exp(-.5 * (delta / Math.max(100, state.filter / 3)) ** 2);
}
export function signalLevel(state: RadioState, time: number) {
  if (state.scenario === 'noise') return -106;
  const delta = state[state.active] - sceneFrequency(state);
  let level = reception(state, delta);
  if (state.scenario === 'neighbors') level = Math.max(level, reception(state, delta - 4000) * .8);
  if (state.scenario === 'cw') level *= cwGate(time);
  return -112 + level * 60;
}
export function sampleAudio(state: RadioState, time: number) {
  if (state.paused || state.muted || signalLevel(state, time) < state.squelch) return 0;
  const delta = state[state.active] - sceneFrequency(state);
  let value = 0;
  if (state.scenario === 'am' || state.scenario === 'neighbors') {
    value = Math.sin(TAU * 440 * time) * reception(state, delta) * .35;
    if (state.scenario === 'neighbors') value += Math.sin(TAU * 660 * time) * reception(state, delta - 4000) * .28;
  }
  if (state.scenario === 'ssb') {
    const [lo, hi] = passband(state);
    for (const f of [-350, -700, -1150]) {
      const beat = f - delta;
      if (beat >= lo && beat <= hi) value += Math.sin(TAU * Math.abs(beat) * time) * .12;
    }
  }
  if (state.scenario === 'cw') value = Math.sin(TAU * Math.max(50, Math.abs(700 + delta)) * time) * cwGate(time) * reception(state, delta) * .3;
  const n = noise(Math.floor(time * 48000)) * .025;
  const rawGain = .25 + state.gain / 50;
  const gain = state.agc ? Math.min(1.3, rawGain) : rawGain;
  return Math.tanh((value + n) * gain) * state.volume / 100;
}
export class DemoSource implements SignalSource {
  metadata(state: RadioState, timestamp: number): SourceMetadata {
    return { kind: 'demo', centerFrequency: state[state.active] + state.offset, sampleRate: 48000,
      bandwidth: state.span, timestamp, label: 'Demostración sintética', isSynthetic: true };
  }
  spectrum(state: RadioState, timestamp: number, bins: number) {
    const result = new Float32Array(bins);
    const center = state[state.active] + state.offset;
    for (let i = 0; i < bins; i++) {
      const f = center - state.span / 2 + i / (bins - 1) * state.span;
      result[i] = -112 + noise(i * .034 + timestamp * .7) * 4 + envelope(state, f, timestamp);
    }
    return result;
  }
  sample = sampleAudio;
  close() { /* No device, socket or background worker in this source. */ }
}

