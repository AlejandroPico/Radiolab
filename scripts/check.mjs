import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
for(const file of [...walk('scripts'),'vite.config.js']) if(/\.m?js$/.test(file))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const p=JSON.parse(readFileSync('package.json','utf8'));
if(!readFileSync('src/core/types.ts','utf8').includes(`VERSION = '${p.version}'`))throw new Error('La versión visible no coincide con package.json.');
for(const file of walk('src'))if(/\.(tsx?|css)$/.test(file)&&readFileSync(file,'utf8').includes('\uFFFD'))throw new Error(`Codificación incorrecta: ${file}`);
console.log('Comprobación estática: sintaxis, tipos estrictos, codificación y versión coherente.');
