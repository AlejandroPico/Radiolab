import type { Contact, Mode } from './types.ts';
import { MAX_FREQUENCY, MIN_FREQUENCY } from './radio.ts';
const modes: Mode[] = ['AM', 'FM', 'NFM', 'USB', 'LSB', 'CW'];
export const csvFields = ['id','utc','callsign','frequency','mode','report','notes','lat','lon','origin','confirmed'] as const;
export function validateContact(value: unknown): Contact {
  if (!value || typeof value !== 'object') throw new Error('Contacto no válido.');
  const v = value as Record<string, unknown>;
  const str = (key: string, max: number) => {
    if (typeof v[key] !== 'string' || (v[key] as string).length > max) throw new Error(`Campo ${key} no válido.`);
    return (v[key] as string).trim();
  };
  const id = str('id', 100), callsign = str('callsign', 40).toUpperCase(), utc = str('utc', 40);
  if (!id || !callsign || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(utc) || !Number.isFinite(Date.parse(utc)) || new Date(utc).toISOString().slice(0,19)!==utc.slice(0,19)) throw new Error('Fecha UTC, identificador o indicativo no válido.');
  if (typeof v.frequency !== 'number' || !Number.isFinite(v.frequency) || v.frequency < MIN_FREQUENCY || v.frequency > MAX_FREQUENCY) throw new Error('Frecuencia fuera de rango.');
  if (!modes.includes(v.mode as Mode)) throw new Error('Modo no compatible.');
  const coord = (key: string, max: number) => {
    if (v[key] === null || v[key] === '' || v[key] === undefined) return null;
    if (typeof v[key] !== 'number' || !Number.isFinite(v[key]) || Math.abs(v[key] as number) > max) throw new Error(`Coordenada ${key} no válida.`);
    return v[key] as number;
  };
  const lat = coord('lat', 90), lon = coord('lon', 180);
  if ((lat === null) !== (lon === null)) throw new Error('Indica ambas coordenadas o deja las dos vacías.');
  if (v.origin !== 'manual' && v.origin !== 'demo') throw new Error('Origen no válido.');
  if (typeof v.confirmed !== 'boolean') throw new Error('Confirmación no válida.');
  return { id, callsign, utc: new Date(utc).toISOString(), frequency: Math.round(v.frequency), mode: v.mode as Mode,
    report: str('report', 40), notes: str('notes', 2000), lat, lon, origin: v.origin, confirmed: v.confirmed };
}
export function validateContacts(values: unknown): Contact[] {
  if (!Array.isArray(values) || values.length > 5000) throw new Error('Se admite una lista de hasta 5000 contactos.');
  const contacts = values.map(validateContact);
  if (new Set(contacts.map(c => c.id)).size !== contacts.length) throw new Error('El archivo contiene identificadores duplicados.');
  return contacts;
}
export function mergeContacts(existing: Contact[], imported: Contact[]): Contact[] {
  const map = new Map(existing.map(c => [c.id, c]));
  imported.forEach(c => map.set(c.id, c));
  if (map.size > 5000) throw new Error('El libro admite como máximo 5000 contactos.');
  return [...map.values()].sort((a,b) => b.utc.localeCompare(a.utc));
}
// Prefix spreadsheet formulas, retaining literal input when round-tripping through this importer.
function safeCell(s: string) { return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; }
export function toCSV(contacts: Contact[]) {
  const cell = (s: unknown) => `"${safeCell(String(s ?? '')).replaceAll('"', '""')}"`;
  return '\uFEFF' + csvFields.join(',') + '\r\n' + contacts.map(c => csvFields.map(k => cell(c[k])).join(',')).join('\r\n');
}
export function fromCSV(text: string): Contact[] {
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (quoted) throw new Error('CSV incompleto: comillas sin cerrar.');
  row.push(cell); if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift();
  if (!headers || headers.join(',') !== csvFields.join(',')) throw new Error('Cabecera CSV no compatible. Usa el formato exportado por Radiolab.');
  return validateContacts(rows.map(r => {
    if (r.length !== csvFields.length) throw new Error('Número de columnas incorrecto.');
    const v = Object.fromEntries(headers.map((h, i) => [h, r[i].replace(/^'(?=[=+\-@\t\r])/, '')]));
    return { ...v, frequency: Number(v.frequency), lat: v.lat === '' ? null : Number(v.lat), lon: v.lon === '' ? null : Number(v.lon), confirmed: v.confirmed === 'true' ? true : v.confirmed === 'false' ? false : null };
  }));
}
export function importContacts(text: string, csv: boolean) {
  if (text.length > 5_000_000) throw new Error('El archivo supera el límite de 5 MB.');
  if (csv) return fromCSV(text);
  const data: unknown = JSON.parse(text);
  if (Array.isArray(data)) return validateContacts(data);
  if (data && typeof data === 'object' && 'schema' in data && data.schema === 1 && 'contacts' in data) return validateContacts(data.contacts);
  throw new Error('Formato JSON no compatible (schema 1).');
}
export const demoContacts: Contact[] = [
  { id:'demo-lisbon', utc:'2026-11-08T18:30:00.000Z', callsign:'DEMO-PT', frequency:14200000, mode:'AM', report:'59 simulado', notes:'Ejemplo ficticio · Lisboa. No es un QSO real.', lat:38.72, lon:-9.14, origin:'demo', confirmed:false },
  { id:'demo-tokyo', utc:'2026-11-08T17:15:00.000Z', callsign:'DEMO-JP', frequency:7100000, mode:'LSB', report:'57 simulado', notes:'Ejemplo ficticio · Tokio. No es un QSO real.', lat:35.68, lon:139.69, origin:'demo', confirmed:false },
  { id:'demo-ny', utc:'2026-11-08T16:00:00.000Z', callsign:'DEMO-US', frequency:7030000, mode:'CW', report:'599 simulado', notes:'Ejemplo ficticio · Nueva York. No es un QSO real.', lat:40.71, lon:-74.01, origin:'demo', confirmed:false },
];
