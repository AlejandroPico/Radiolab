export type Mode = 'AM' | 'FM' | 'NFM' | 'USB' | 'LSB' | 'CW';
export type ScenarioId = 'am' | 'ssb' | 'neighbors' | 'cw' | 'noise';
export type SourceKind = 'demo' | 'remote' | 'localBridge';
export interface RadioState {
  a: number; b: number; active: 'a' | 'b'; mode: Mode; step: number;
  volume: number; gain: number; squelch: number; filter: number;
  agc: boolean; muted: boolean; paused: boolean; scenario: ScenarioId;
  span: number; offset: number; floor: number; split: boolean;
}
export interface SourceMetadata {
  kind: SourceKind; centerFrequency: number; sampleRate: number;
  bandwidth: number; timestamp: number; label: string; isSynthetic: boolean;
}
export interface SignalSource {
  metadata(state: RadioState, timestamp: number): SourceMetadata;
  spectrum(state: RadioState, timestamp: number, bins: number): Float32Array;
  sample(state: RadioState, time: number): number;
  close(): void;
}
export interface ReceiverSource { source: SignalSource; connected: boolean }
export interface TelemetryProvider {
  read(): { swr: null; txPower: null; temperature: null; isSynthetic: false };
}
export interface TransceiverController {
  readonly canTransmit: false;
  tune(frequency: number): number;
}
export interface Contact {
  id: string; utc: string; callsign: string; frequency: number; mode: Mode;
  report: string; notes: string; lat: number | null; lon: number | null;
  origin: 'demo' | 'manual'; confirmed: boolean;
}
export interface Memory { id: string; name: string; frequency: number; mode: Mode }
export type Theme = 'dark' | 'light' | 'auto';
export const VERSION = '0.1.2';

