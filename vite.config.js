import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { serviceWorker } from './scripts/service-worker.mjs';
export default defineConfig({
  base: '/Radiolab/', build: { target: 'es2022' },
  plugins: [{ name: 'radiolab-offline', generateBundle(_,bundle) {
    const files=['index.html','manifest.webmanifest','favicon.svg','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png',...Object.keys(bundle).filter(f=>f!=='index.html')];
    const hash=createHash('sha256');
    Object.values(bundle).forEach(f=>hash.update(f.type==='chunk'?f.code:typeof f.source==='string'?f.source:f.source));
    this.emitFile({type:'asset',fileName:'sw.js',source:serviceWorker(files,hash.digest('hex').slice(0,12))});
  }}],
});
