import { defaultRadio, clampFrequency } from './radio.ts';
import { validateContacts } from './logbook.ts';
import { migrateTheme } from './theme.ts';
import type { RadioState, Memory, Contact, Theme } from './types.ts';
export interface StoredState { schema: 1; radio: RadioState; memories: Memory[]; contacts: Contact[]; theme: Theme; history: number[] }
export const STORAGE_KEY = 'radiolab.state';
export function defaults(): StoredState {
  return { schema: 1, radio: { ...defaultRadio }, memories: [
    { id:'m-am', name:'Portadora · 20 m', frequency:14200000, mode:'AM' },
    { id:'m-ssb', name:'Banda lateral · 40 m', frequency:7100000, mode:'LSB' },
    { id:'m-cw', name:'Morse · 40 m', frequency:7030000, mode:'CW' },
  ], contacts: [], theme:'auto', history:[] };
}
export function decodeState(raw: string | null): StoredState {
  const fresh = defaults();
  if (!raw) return fresh;
  try {
    const data = JSON.parse(raw) as Partial<StoredState>;
    if (data.schema !== 1) return fresh;
    const saved = data.radio;
    if (saved && typeof saved === 'object') {
      for (const key of Object.keys(fresh.radio) as (keyof RadioState)[]) {
        const value = saved[key];
        if (typeof value === typeof fresh.radio[key] && (typeof value !== 'number' || Number.isFinite(value))) Object.assign(fresh.radio, { [key]:value });
      }
      fresh.radio.a = clampFrequency(fresh.radio.a); fresh.radio.b = clampFrequency(fresh.radio.b);
      if (!['a','b'].includes(fresh.radio.active)) fresh.radio.active = 'a';
      if (!['AM','FM','NFM','USB','LSB','CW'].includes(fresh.radio.mode)) fresh.radio.mode = 'AM';
      if (!['am','ssb','neighbors','cw','noise'].includes(fresh.radio.scenario)) fresh.radio.scenario = 'am';
      for (const k of ['volume','gain'] as const) fresh.radio[k] = Math.min(100, Math.max(0,fresh.radio[k]));
      fresh.radio.filter = Math.min(15000, Math.max(100,fresh.radio.filter));
      fresh.radio.squelch = Math.min(-30, Math.max(-120, fresh.radio.squelch));
      fresh.radio.span = [12000,24000,48000,96000].includes(fresh.radio.span) ? fresh.radio.span : 24000;
      fresh.radio.step = [1,10,100,1000,10000,100000].includes(fresh.radio.step) ? fresh.radio.step : 100;
      fresh.radio.floor = Math.min(-80, Math.max(-140, fresh.radio.floor));
      fresh.radio.offset = Math.min(96000, Math.max(-96000, fresh.radio.offset));
      fresh.radio.paused = false;
    }
    if (Array.isArray(data.memories)) fresh.memories = data.memories.filter(m => m && typeof m.name === 'string' && m.name.length <= 60 && typeof m.id === 'string' && Number.isFinite(m.frequency) && ['AM','FM','NFM','USB','LSB','CW'].includes(m.mode)).slice(0,100).map(m=>({...m,frequency:clampFrequency(m.frequency)}));
    if (data.contacts) fresh.contacts = validateContacts(data.contacts);
    if (data.theme) fresh.theme = migrateTheme(data.theme);
    if (Array.isArray(data.history)) fresh.history = data.history.filter(x=>typeof x === 'number' && Number.isFinite(x)).slice(0,12).map(clampFrequency);
    return fresh;
  } catch { return fresh; }
}
export function loadState() {
  try { return decodeState(localStorage.getItem(STORAGE_KEY)); } catch { return defaults(); }
}
export function saveState(data: StoredState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch { return false; }
}
