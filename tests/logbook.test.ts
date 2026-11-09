import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoContacts, fromCSV, toCSV, importContacts, mergeContacts, validateContact } from '../src/core/logbook.ts';
import { greatCircle, routePath } from '../src/core/geo.ts';
test('CSV conserva comas, comillas, saltos de línea y protege fórmulas',()=>{
  const c={...demoContacts[0],notes:'=SUM(1,2)\nUna "nota", multilinea'};
  const csv=toCSV([c]);assert.ok(csv.includes("'=SUM"));assert.deepEqual(fromCSV(csv),[c]);
});
test('JSON rechaza esquemas, tipos, fechas y coordenadas no válidos sin importar parcialmente',()=>{
  assert.deepEqual(importContacts(JSON.stringify({schema:1,contacts:demoContacts}),false),demoContacts);
  for(const patch of [{frequency:0},{lat:91},{lat:1,lon:null},{mode:'TX'},{origin:'real'},{utc:'nonsense'},{utc:'2026-02-30T12:00:00Z'},{confirmed:'true'}])assert.throws(()=>validateContact({...demoContacts[0],...patch}));
  assert.throws(()=>importContacts('{"schema":2,"contacts":[]}',false));
  assert.throws(()=>importContacts(JSON.stringify([demoContacts[0],{...demoContacts[1],lat:200}]),false));
  assert.throws(()=>fromCSV('bad,header\n1,2'));assert.throws(()=>fromCSV(toCSV(demoContacts)+'\n"unclosed'));
});
test('Importación combina por identificador sin duplicados',()=>{
  const changed={...demoContacts[0],notes:'Nueva nota'};const merged=mergeContacts(demoContacts,[changed]);assert.equal(merged.length,3);assert.equal(merged.find(c=>c.id===changed.id)?.notes,'Nueva nota');
  assert.throws(()=>importContacts(JSON.stringify([changed,changed]),false));
});
test('Rutas de círculo máximo: extremos correctos, cruces de fecha y antipodales',()=>{
  const a={lat:40.42,lon:-3.7},b={lat:35.68,lon:139.69};const route=greatCircle(a,b);
  assert.ok(Math.abs(route[0].lat-a.lat)<1e-6);assert.ok(Math.abs(route.at(-1)!.lon-b.lon)<1e-6);
  assert.ok(route.some(p=>p.lat>50));
  assert.ok((routePath({lat:30,lon:170},{lat:30,lon:-170}).match(/M/g)||[]).length===2);
  assert.deepEqual(greatCircle({lat:0,lon:0},{lat:0,lon:180}),[]);
});
