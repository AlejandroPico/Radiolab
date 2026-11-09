import { useRef, useState } from 'react';
import { bandName, formatFrequency } from '../core/radio.ts';
import { demoContacts, importContacts, mergeContacts, toCSV, validateContact } from '../core/logbook.ts';
import type { Contact, Mode, RadioState } from '../core/types.ts';
import { Icon } from '../components/Icon.tsx';
export function download(name:string, data:string, type:string) {
  const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function ContactForm({ radio, contact, save, cancel }: { radio:RadioState;contact?:Contact;save:(c:Contact)=>void;cancel:()=>void }) {
  const [error,setError]=useState('');
  const utc=(contact?.utc??new Date().toISOString()).slice(0,16);
  return <form className="contact-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);try {save(validateContact({
    id:contact?.id??crypto.randomUUID(), utc:new Date(`${f.get('utc')}:00Z`).toISOString(), callsign:f.get('callsign'),
    frequency:Number(f.get('frequency'))*1e6,mode:f.get('mode'),report:f.get('report'),notes:f.get('notes'),
    lat:f.get('lat')===''?null:Number(f.get('lat')),lon:f.get('lon')===''?null:Number(f.get('lon')),
    origin:f.get('origin'),confirmed:f.get('confirmed')==='on',
  }));} catch(err) {setError(err instanceof Error?err.message:'Comprueba los campos.');}}}>
    
    <div className="form-grid"><label>Indicativo / identificador<input name="callsign" required maxLength={40} defaultValue={contact?.callsign} placeholder="DEMO-01" autoFocus/></label><label>Fecha y hora UTC<input name="utc" type="datetime-local" required defaultValue={utc}/></label>
    <label>Frecuencia (MHz)<input name="frequency" type="number" min="0.1" max="1300" step="0.000001" required defaultValue={(contact?.frequency??radio[radio.active])/1e6}/></label>
    <label>Modo<select name="mode" defaultValue={contact?.mode??radio.mode}>{(['AM','FM','NFM','USB','LSB','CW'] as Mode[]).map(m=><option key={m}>{m}</option>)}</select></label>
    <label>Reporte<input name="report" maxLength={40} defaultValue={contact?.report??'Simulado'}/></label><label>Origen<select name="origin" defaultValue={contact?.origin??'demo'}><option value="demo">Ejemplo ficticio</option><option value="manual">Manual · anotación propia</option></select></label>
    <label>Latitud opcional<input name="lat" type="number" step="any" min="-90" max="90" defaultValue={contact?.lat??''} placeholder="−90 a 90"/></label><label>Longitud opcional<input name="lon" type="number" step="any" min="-180" max="180" defaultValue={contact?.lon??''} placeholder="−180 a 180"/></label></div>
    <label>Notas<textarea name="notes" rows={3} maxLength={2000} defaultValue={contact?.notes}/></label><label className="checkbox"><input name="confirmed" type="checkbox" defaultChecked={contact?.confirmed}/> Anotación confirmada</label>
    <p className="form-note">Las coordenadas se guardan únicamente al guardar esta ficha. No se deduce la ubicación a partir del indicativo.</p>
    {error&&<p className="error" role="alert">{error}</p>}<div className="form-actions"><button type="button" onClick={cancel}>Cancelar</button><button className="primary" type="submit"><Icon name="check" size={16}/> Guardar contacto</button></div>
  </form>;
}
export function Logbook({ contacts, setContacts, add, edit, notify }: { contacts:Contact[];setContacts:(c:Contact[])=>void;add:()=>void;edit:(c:Contact)=>void;notify:(m:string)=>void }) {
  const [search,setSearch]=useState(''),[remove,setRemove]=useState<string|null>(null);
  const file=useRef<HTMLInputElement>(null);
  const results=contacts.filter(c=>`${c.callsign} ${c.notes} ${c.mode} ${bandName(c.frequency)} ${c.frequency/1e6}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.utc.localeCompare(a.utc));
  const exported=`radiolab-${new Date().toISOString().slice(0,10)}`;
  return <div className="workspace-page logbook"><div className="page-heading"><h1>Libro de guardia</h1><button className="primary" onClick={add}><Icon name="plus" size={17}/> Nuevo contacto</button></div>
    <div className="toolbar"><label className="search"><Icon name="search" size={17}/><input aria-label="Buscar contactos" placeholder="Buscar indicativo, modo, banda…" value={search} onChange={e=>setSearch(e.target.value)}/></label><span className="count">{results.length} anotaciones</span><button onClick={()=>download(`${exported}.json`,JSON.stringify({schema:1,contacts},null,2),'application/json')}><Icon name="download" size={15}/> JSON</button><button onClick={()=>download(`${exported}.csv`,toCSV(contacts),'text/csv;charset=utf-8')}><Icon name="download" size={15}/> CSV</button><button onClick={()=>file.current?.click()}><Icon name="upload" size={15}/> Importar</button><input ref={file} type="file" hidden accept=".json,.csv" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try {if(f.size>5_000_000)throw new Error('El archivo supera 5 MB.');const added=importContacts(await f.text(),f.name.toLowerCase().endsWith('.csv'));setContacts(mergeContacts(contacts,added));notify(`${added.length} anotaciones importadas. Los identificadores coincidentes se actualizan.`);}catch(err){notify(err instanceof Error?err.message:'No se pudo importar el archivo.');}e.target.value='';}}/></div>
    {contacts.length===0?<div className="empty-state"><Icon name="book" size={42}/><h2>Sin anotaciones</h2><p>Añade una anotación o carga tres ejemplos ficticios para explorar el mapa.</p><button onClick={()=>{setContacts(demoContacts);notify('Ejemplos ficticios añadidos.');}}>Cargar ejemplos <Icon name="arrow" size={16}/></button></div>:<div className="table-scroll"><table><thead><tr><th>FECHA / UTC</th><th>INDICATIVO</th><th>FRECUENCIA</th><th>MODO</th><th>REPORTE</th><th>ORIGEN</th><th aria-label="Acciones"/></tr></thead><tbody>{results.map(c=><tr key={c.id}><td className="mono">{c.utc.slice(0,10)}<small>{c.utc.slice(11,16)}</small></td><td><strong>{c.callsign}</strong><small>{c.notes.slice(0,60)}</small></td><td className="mono">{formatFrequency(c.frequency)}<small>{bandName(c.frequency)} · MHz</small></td><td>{c.mode}</td><td>{c.report}<small>{c.confirmed?'Confirmada':'Sin confirmar'}</small></td><td><span className={`badge ${c.origin==='demo'?'amber':''}`}>{c.origin==='demo'?'EJEMPLO':'MANUAL'}</span></td><td><div className="row-actions"><button className="icon-button" aria-label={`Editar ${c.callsign}`} onClick={()=>edit(c)}><Icon name="edit" size={16}/></button>{remove===c.id?<><button className="danger" onClick={()=>{setContacts(contacts.filter(x=>x.id!==c.id));setRemove(null);}}>Borrar</button><button className="icon-button" aria-label="Cancelar borrado" onClick={()=>setRemove(null)}><Icon name="close" size={15}/></button></>:<button className="icon-button" aria-label={`Eliminar ${c.callsign}`} onClick={()=>setRemove(c.id)}><Icon name="trash" size={16}/></button>}</div></td></tr>)}</tbody></table>{results.length===0&&<p className="no-results">No hay anotaciones que coincidan con la búsqueda.</p>}</div>}
    
  </div>;
}

