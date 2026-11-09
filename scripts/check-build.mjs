import { existsSync,readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const sw=readFileSync('dist/sw.js','utf8');
const listeners={};const cache=new Map();let fetched=[];let offline=false;let removed=[];let activated=false;let response;
const scope='https://example.test/Radiolab/';
const environment={URL,Promise,self:{registration:{scope},location:{origin:'https://example.test'},clients:{claim:()=>Promise.resolve()},skipWaiting:()=>{activated=true;},addEventListener:(name,fn)=>listeners[name]=fn},
  caches:{open:async()=>({addAll:async urls=>{fetched=urls;for(const url of urls)cache.set(url,{cached:true,url});},match:async req=>cache.get(typeof req==='string'?req:req.url)}),match:async url=>cache.get(url),keys:async()=>['radiolab-v1-old','other-application-v2'],delete:async key=>{removed.push(key);return true;}},
  fetch:async req=>{if(offline)throw new Error('offline');return {ok:true,url:req.url};}};
vm.runInNewContext(sw,environment);
let task;listeners.install({waitUntil:t=>task=t});await task;
assert.ok(fetched.length>=7);for(const url of fetched){assert.ok(url.startsWith(scope));assert.ok(existsSync('dist/'+url.slice(scope.length)),`Asset missing: ${url}`);}
assert.ok(fetched.some(url=>url.endsWith('index.html')));
listeners.activate({waitUntil:t=>task=t});await task;assert.deepEqual(removed,['radiolab-v1-old']);
offline=true;listeners.fetch({request:{method:'GET',url:scope+'?offline=1',mode:'navigate'},respondWith:t=>response=t});assert.ok((await response).cached);
response=undefined;listeners.fetch({request:{method:'GET',url:'https://remote.test/audio',mode:'cors'},respondWith:t=>response=t});assert.equal(response,undefined);
listeners.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(activated,true);
const html=readFileSync('dist/index.html','utf8');assert.ok(html.includes('/Radiolab/assets/'));assert.ok(!html.includes('http://localhost'));
const manifest=JSON.parse(readFileSync('dist/manifest.webmanifest','utf8'));assert.equal(manifest.scope,'./');assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
console.log(`PWA verificada: ${fetched.length} recursos, rutas /Radiolab/, navegación offline, caché aislada y actualización explícita.`);
