export function serviceWorker(files,hash) {
  return `/* Radiolab: generated offline application shell. No remote audio or data caching. */
const PREFIX='radiolab-v1-';
const CACHE=PREFIX+${JSON.stringify(hash)};
const FILES=${JSON.stringify(files)};
const urls=FILES.map(f=>new URL(f,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(event.request.mode==='navigate') {
    event.respondWith(fetch(event.request).then(response=>response.ok?response:caches.match(new URL('index.html',self.registration.scope).href)).catch(()=>caches.match(new URL('index.html',self.registration.scope).href)));
  } else if(urls.includes(url.href)) {
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request))));
  }
});\n`;
}
