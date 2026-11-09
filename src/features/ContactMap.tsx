import { useRef, useState } from 'react';
import type { Contact } from '../core/types.ts';
import { routePath } from '../core/geo.ts';
import { Icon } from '../components/Icon.tsx';
// Original schematic silhouettes, not a political or navigational map.
const land=[
 'M35 70 75 40 125 36 168 58 192 73 173 101 154 101 162 128 139 157 126 178 109 163 99 136 75 130 62 108 35 104Z',
 'M143 177 169 179 190 204 198 233 177 266 163 301 148 317 140 278 128 245 129 212Z',
 'M191 30 219 23 238 34 225 65 208 81 192 63Z',
 'M324 106 339 85 369 80 382 60 413 43 474 43 511 34 559 47 616 45 668 69 683 92 645 103 629 127 602 145 572 162 556 144 543 178 524 191 503 169 483 147 465 151 449 126 427 120 411 101 395 110 381 108 368 117 346 112Z',
 'M335 128 365 118 391 133 414 165 404 197 387 225 366 229 350 199 339 176 325 152Z',
 'M410 222 422 214 422 237 414 248 407 238Z',
 'M491 183 509 186 521 202 546 204 563 219 535 219 515 210Z',
 'M563 245 588 227 619 230 642 251 637 277 604 285 575 276Z',
 'M665 278 675 266 678 279 666 299 655 303Z',
 'M619 160 626 147 631 135 636 145 628 165Z',
 'M313 76 319 69 323 77 318 86Z',
 'M28 337 120 332 204 340 307 334 418 339 535 333 682 339 697 357 25 357Z',
];
export function ContactMap({contacts,addExamples}:{contacts:Contact[];addExamples:()=>void}) {
  const located=contacts.filter(c=>c.lat!==null&&c.lon!==null);
  const [selected,setSelected]=useState<string|null>(null),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
  const [origin,setOrigin]=useState<{lat:number;lon:number}|null>(null);
  const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const chosen=located.find(c=>c.id===selected);
  return <div className="workspace-page"><div className="page-heading"><div><span className="eyebrow">GEOGRAFÍA DE CONTACTOS</span><h1>Al otro lado del mundo<span className="heading-dot">.</span></h1><p>Explora las ubicaciones que has añadido a tu libro de guardia.</p></div><span className="badge">{located.length} ubicaciones locales</span></div>
    <div className="map-layout"><div className="map-panel"><div className="map-controls"><button className="icon-button" aria-label="Ampliar mapa" onClick={()=>setZoom(z=>Math.min(4,z+.4))}><Icon name="plus"/></button><button className="icon-button" aria-label="Reducir mapa" onClick={()=>setZoom(z=>Math.max(1,z-.4))}><Icon name="minus"/></button><button className="icon-button" aria-label="Restablecer mapa" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}><Icon name="reset" size={17}/></button></div>
    <svg className="world-map" viewBox="0 0 720 360" role="img" aria-label="Mapa mundial esquemático interactivo de ubicaciones del libro de guardia" onPointerDown={e=>{if((e.target as Element).closest('[data-contact]'))return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};}} onPointerMove={e=>{if(!drag.current)return;const scale=720/e.currentTarget.getBoundingClientRect().width;setPan({x:Math.max(-720,Math.min(720,drag.current.px+(e.clientX-drag.current.x)*scale)),y:Math.max(-300,Math.min(300,drag.current.py+(e.clientY-drag.current.y)*scale))});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <defs><pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="currentColor" strokeWidth=".5"/></pattern></defs><g transform={`translate(${pan.x} ${pan.y}) translate(360 180) scale(${zoom}) translate(-360 -180)`}><rect width="720" height="360" fill="url(#map-grid)" opacity=".2"/>{land.map((d,i)=><path className="land" key={i} d={d}/>)}{origin&&<circle cx={(origin.lon+180)*2} cy={(90-origin.lat)*2} r="4" className="origin-marker"/>}{origin&&located.map(c=><path key={`route-${c.id}`} d={routePath(origin,{lat:c.lat!,lon:c.lon!})} className={`route ${c.origin==='demo'?'demo-route':''}`} opacity={selected&&selected!==c.id? .35:.8}/>)}{located.map(c=><g key={c.id} data-contact="true" role="button" tabIndex={0} aria-label={`${c.callsign}: ${c.lat}, ${c.lon}. ${c.origin==='demo'?'Ejemplo ficticio':''}`} onClick={()=>setSelected(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(c.id);}}} className="map-marker" transform={`translate(${(c.lon!+180)*2} ${(90-c.lat!)*2})`}><circle r={selected===c.id?7:5}/><circle r="12" fill="transparent" stroke="none"/><text y="-11" textAnchor="middle">{c.callsign}</text></g>)}</g>
    </svg><div className="map-caption"><span><i className="led"/> Datos locales · ejemplos etiquetados DEMO</span><span>Mapa esquemático · sin fronteras</span></div></div>
    <aside className="map-sidebar"><span className="eyebrow">PUNTO DE PARTIDA</span><h3>Traza el recorrido</h3><p>Introduce una ubicación para dibujar rutas de círculo máximo. Se usa solo durante esta sesión.</p><form className="origin-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);setOrigin({lat:Number(f.get('lat')),lon:Number(f.get('lon'))});}}><label>Latitud<input type="number" name="lat" min="-90" max="90" step="any" placeholder="40.42" required/></label><label>Longitud<input type="number" name="lon" min="-180" max="180" step="any" placeholder="−3.70" required/></label><button type="submit">Dibujar rutas <Icon name="arrow" size={15}/></button>{origin&&<button type="button" onClick={()=>setOrigin(null)}>Quitar origen y rutas</button>}</form>{chosen&&<div className="map-detail"><span className={`badge ${chosen.origin==='demo'?'amber':''}`}>{chosen.origin.toUpperCase()}</span><h3>{chosen.callsign}</h3><p>{chosen.lat?.toFixed(3)}°, {chosen.lon?.toFixed(3)}°</p><p>{chosen.notes}</p></div>}{located.length===0&&<><p>No hay contactos con coordenadas.</p><button onClick={addExamples}>Cargar ejemplos DEMO</button></>}</aside></div>
  </div>;
}

