import type { RadioState, ScenarioId, Mode, TransceiverController, TelemetryProvider } from './types.ts';
export const MIN_FREQUENCY = 100_000;
export const MAX_FREQUENCY = 1_300_000_000;
export const bands = [
  { name: '160 m', frequency: 1_850_000, mode: 'LSB' },
  { name: '80 m', frequency: 3_700_000, mode: 'LSB' },
  { name: '40 m', frequency: 7_100_000, mode: 'LSB' },
  { name: '30 m', frequency: 10_120_000, mode: 'CW' },
  { name: '20 m', frequency: 14_200_000, mode: 'USB' },
  { name: '17 m', frequency: 18_130_000, mode: 'USB' },
  { name: '15 m', frequency: 21_250_000, mode: 'USB' },
  { name: '10 m', frequency: 28_500_000, mode: 'USB' },
  { name: '6 m', frequency: 50_150_000, mode: 'USB' },
  { name: '2 m', frequency: 145_500_000, mode: 'NFM' },
  { name: '70 cm', frequency: 433_500_000, mode: 'NFM' },
] satisfies { name: string; frequency: number; mode: Mode }[];
export const scenarios: { id: ScenarioId; name: string; tag: string; description: string; frequency: number; mode: Mode }[] = [
  { id: 'am', name: 'Portadora AM', tag: '01', description: 'Una portadora y sus dos bandas laterales. Tono de prueba de 440 Hz.', frequency: 14_200_000, mode: 'AM' },
  { id: 'ssb', name: 'Banda lateral', tag: '02', description: 'Tres tonos originales en banda lateral inferior. Cambia entre LSB y USB.', frequency: 7_100_000, mode: 'LSB' },
  { id: 'neighbors', name: 'Emisoras cercanas', tag: '03', description: 'Dos señales AM separadas 4 kHz. Sintoniza y estrecha el filtro.', frequency: 14_200_000, mode: 'AM' },
  { id: 'cw', name: 'Morse · CQ', tag: '04', description: 'Secuencia sintética «CQ CQ» en Morse, con tono de 700 Hz.', frequency: 7_030_000, mode: 'CW' },
  { id: 'noise', name: 'Suelo de ruido', tag: '05', description: 'Ruido determinista de prueba. Explora ganancia, AGC y silenciamiento.', frequency: 14_200_000, mode: 'AM' },
];
export const defaultRadio: RadioState = {
  a: 14_200_000, b: 7_100_000, active: 'a', mode: 'AM', step: 100,
  volume: 35, gain: 50, squelch: -120, filter: 6000, agc: true,
  muted: false, paused: false, scenario: 'am', span: 24000, offset: 0, floor: -120, split: false,
};
export function clampFrequency(frequency: number) {
  return Math.round(Math.min(MAX_FREQUENCY, Math.max(MIN_FREQUENCY, Number.isFinite(frequency) ? frequency : MIN_FREQUENCY)));
}
export function formatFrequency(frequency: number) { return (frequency / 1e6).toFixed(6); }
export function bandName(frequency: number) {
  const band = bands.find(b => Math.abs(b.frequency - frequency) < Math.max(100_000, b.frequency * .015));
  return band?.name ?? 'Libre';
}
export function parseFrequency(text: string, unit: 'Hz' | 'kHz' | 'MHz') {
  const n = Number(text.trim().replace(',', '.'));
  if (!Number.isFinite(n) || text.trim() === '') throw new Error('Introduce una frecuencia válida.');
  const hz = n * ({ Hz: 1, kHz: 1000, MHz: 1e6 }[unit]);
  if (hz < MIN_FREQUENCY || hz > MAX_FREQUENCY) throw new Error('El rango de demostración es de 0,1 a 1300 MHz.');
  return Math.round(hz);
}
export class MockController implements TransceiverController {
  readonly canTransmit = false;
  tune(frequency: number) { return clampFrequency(frequency); }
}
export class TransmitInterlock {
  readonly enabled = false;
  check(): { allowed: false; reason: string } {
    return { allowed: false, reason: 'Transmisión deshabilitada; aplicación RX/DEMO.' };
  }
}
export const telemetry: TelemetryProvider = {
  read: () => ({ swr: null, txPower: null, temperature: null, isSynthetic: false }),
};
