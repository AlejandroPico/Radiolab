import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultRadio, parseFrequency, clampFrequency, TransmitInterlock, MockController, telemetry } from '../src/core/radio.ts';
import { DemoSource, sampleAudio, envelope, signalLevel, cwGate } from '../src/adapters/demo.ts';
import { decodeState } from '../src/core/storage.ts';
test('Frecuencia: unidades, coma decimal, límites y entradas inválidas',()=>{
  assert.equal(parseFrequency('14,200100','MHz'),14200100);assert.equal(parseFrequency('7100','kHz'),7100000);assert.equal(parseFrequency('7030000','Hz'),7030000);
  for(const text of ['','NaN','Infinity','-2','0','1400'])assert.throws(()=>parseFrequency(text,'MHz'));
  assert.equal(clampFrequency(-1),100000);assert.equal(clampFrequency(2e9),1.3e9);
});
test('La fuente es determinista, declara su origen y sitúa la portadora en frecuencia absoluta',()=>{
  const source=new DemoSource();const a=source.spectrum(defaultRadio,1,768);assert.deepEqual(a,source.spectrum(defaultRadio,1,768));
  assert.equal(source.metadata(defaultRadio,1).isSynthetic,true);assert.equal(source.metadata(defaultRadio,1).kind,'demo');
  assert.ok(envelope(defaultRadio,14200000,0)>envelope(defaultRadio,14205000,0)+50);
  assert.ok(signalLevel(defaultRadio,0)>signalLevel({...defaultRadio,a:14210000},0)+40);
});
test('Silencio, pausa y squelch cierran el audio, y el volumen modifica la señal',()=>{
  const time=.0123;
  for(const patch of [{muted:true},{paused:true},{volume:0},{squelch:-30}])assert.equal(sampleAudio({...defaultRadio,...patch},time),0);
  assert.ok(Math.abs(sampleAudio({...defaultRadio,volume:100},time))>Math.abs(sampleAudio({...defaultRadio,volume:10},time)));
});
test('Selección de banda lateral y filtro modifican el audio sintético',()=>{
  const r={...defaultRadio,scenario:'ssb' as const,a:7100000,mode:'LSB' as const};
  assert.notEqual(sampleAudio(r,.00061),sampleAudio({...r,mode:'USB'},.00061));
  assert.notEqual(sampleAudio(r,.00061),sampleAudio({...r,filter:200},.00061));
  assert.equal(cwGate(0),1);assert.equal(cwGate(.28),0);
});
test('TX permanece imposible y no existe telemetría de hardware inventada',()=>{
  assert.equal(new TransmitInterlock().check().allowed,false);assert.equal(new MockController().canTransmit,false);
  assert.deepEqual(telemetry.read(),{swr:null,txPower:null,temperature:null,isSynthetic:false});
});
test('Persistencia: recupera valores corruptos y migra esquemas desconocidos a valores iniciales',()=>{
  assert.deepEqual(decodeState('{'),decodeState(null));assert.deepEqual(decodeState('{"schema":999}'),decodeState(null));
  const state=decodeState(JSON.stringify({schema:1,radio:{...defaultRadio,volume:999,mode:'INVALID',scenario:'404',a:-1}}));
  assert.equal(state.radio.volume,100);assert.equal(state.radio.mode,'AM');assert.equal(state.radio.scenario,'am');assert.equal(state.radio.a,100000);
});
