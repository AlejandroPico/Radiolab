import { useCallback, useEffect, useRef, useState } from 'react';
import { Receiver } from './features/Receiver.tsx';
import { ReceiverTools } from './features/ReceiverTools.tsx';
import { Receivers } from './features/Receivers.tsx';
import { ContactForm, Logbook } from './features/Logbook.tsx';
import { ContactMap } from './features/ContactMap.tsx';
import { About } from './features/About.tsx';
import { Settings } from './features/Settings.tsx';
import { Modal } from './components/Modal.tsx';
import { Icon, type IconName } from './components/Icon.tsx';
import { ThemePicker, themeIcons } from './components/ThemePicker.tsx';
import { defaultRadio, clampFrequency, formatFrequency, scenarios } from './core/radio.ts';
import { themeNames, effectiveTheme } from './core/theme.ts';
import { demoContacts, mergeContacts } from './core/logbook.ts';
import { loadState, saveState } from './core/storage.ts';
import { type Contact, type RadioState, type ScenarioId, type Theme } from './core/types.ts';
import { DemoAudio } from './adapters/audio.ts';
import { pauseClock } from './core/clock.ts';

type View='classic'|'lab'|'log'|'map'|'receivers';
type Panel='menu'|'tools'|null;
const navigation:{id:View;label:string;icon:IconName}[]=[
  {id:'classic',label:'Estación clásica',icon:'radio'},
  {id:'lab',label:'Laboratorio',icon:'wave'},
  {id:'log',label:'Libro de guardia',icon:'book'},
  {id:'map',label:'Mapa de contactos',icon:'globe'},
  {id:'receivers',label:'Receptores remotos',icon:'antenna'},
];
interface InstallPrompt extends Event { prompt:()=>Promise<void>; userChoice:Promise<{outcome:string}> }
function getView():View {const id=location.hash.slice(1);return navigation.some(n=>n.id===id)?id as View:'classic';}

export default function App(){
  const [data,setData]=useState(loadState),[view,setView]=useState<View>(getView);
  const [modal,setModal]=useState<'about'|'settings'|'theme'|'contact'|'memory'|null>(null);
  const [editing,setEditing]=useState<Contact|undefined>(),[toast,setToast]=useState('');
  const [panel,setPanel]=useState<Panel>(null),[audioOn,setAudioOn]=useState(false),[scanning,setScanning]=useState(false);
  const [install,setInstall]=useState<InstallPrompt|null>(null),[update,setUpdate]=useState<ServiceWorker|null>(null);
  const audio=useRef<DemoAudio|null>(null),toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const storageFailed=useRef(false),radio=data.radio,radioRef=useRef(radio);radioRef.current=radio;
  const menu=panel==='menu',tools=panel==='tools';
  const notify=useCallback((s:string)=>{setToast(s);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),5000);},[]);
  const patch=useCallback((p:Partial<RadioState>)=>setData(d=>({...d,radio:{...d.radio,...p}})),[]);
  const tune=useCallback((f:number)=>{setScanning(false);setData(d=>({...d,radio:{...d.radio,[d.radio.active]:clampFrequency(f)}}));},[]);
  const closeModal=useCallback(()=>{setModal(null);setEditing(undefined);},[]);
  const setTheme=(theme:Theme)=>setData(d=>({...d,theme}));
  const navigate=(v:View)=>{location.hash=v;setPanel(null);};
  useEffect(()=>{const onHash=()=>setView(getView());window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
  useEffect(()=>{const t=setTimeout(()=>{if(!saveState(data)&&!storageFailed.current){storageFailed.current=true;notify('El almacenamiento local no está disponible. Exporta el libro para conservar tus datos.');}},350);return()=>clearTimeout(t);},[data,notify]);
  useEffect(()=>{const frequency=radio[radio.active];const t=setTimeout(()=>setData(d=>d.history[0]===frequency?d:{...d,history:[frequency,...d.history.filter(f=>f!==frequency)].slice(0,12)}),1000);return()=>clearTimeout(t);},[radio.a,radio.b,radio.active]);
  useEffect(()=>{pauseClock(radio.paused);audio.current?.update(radio);},[radio]);
  useEffect(()=>{
    if(!panel)return;
    const token=crypto.randomUUID();history.pushState({radiolabPanel:token},'');
    const back=()=>{if(history.state?.radiolabPanel!==token)setPanel(null);};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))setPanel(null);};
    window.addEventListener('popstate',back);window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('popstate',back);window.removeEventListener('keydown',key);if(history.state?.radiolabPanel===token)history.back();};
  },[panel!==null]);
  useEffect(()=>()=>{void audio.current?.close();if(toastTimer.current)clearTimeout(toastTimer.current);},[]);
  useEffect(()=>{
    const apply=()=>{const theme=effectiveTheme(data.theme);document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='night'?'#000000':theme==='afternoon'?'#f3eadf':'#f7f9fc');};
    apply();const timer=setInterval(apply,30000);return()=>clearInterval(timer);
  },[data.theme]);
  useEffect(()=>{if(!scanning)return;const initial=radioRef.current[radioRef.current.active],range=12000;const timer=setInterval(()=>setData(d=>{const r=d.radio;return {...d,radio:{...r,[r.active]:clampFrequency(r[r.active]>=initial+range?initial-range:r[r.active]+Math.max(100,r.step))}};}),250);return()=>clearInterval(timer);},[scanning]);
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(modal||['INPUT','TEXTAREA','SELECT','BUTTON'].includes((e.target as HTMLElement).tagName)||(e.target as HTMLElement).getAttribute('role')==='slider')return;const r=radioRef.current;if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();tune(r[r.active]+r.step*(e.key==='ArrowUp'?1:-1));}if(e.code==='Space'){e.preventDefault();patch({paused:!r.paused});}if(e.key.toLowerCase()==='m')patch({muted:!r.muted});};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[modal,patch,tune]);
  useEffect(()=>{
    const prompt=(e:Event)=>{e.preventDefault();setInstall(e as InstallPrompt);};const installed=()=>setInstall(null);
    window.addEventListener('beforeinstallprompt',prompt);window.addEventListener('appinstalled',installed);
    if('serviceWorker' in navigator&&import.meta.env.PROD)void navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{scope:import.meta.env.BASE_URL}).then(reg=>{if(reg.waiting)setUpdate(reg.waiting);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)setUpdate(worker);});});}).catch(()=>notify('No se pudo preparar la instalación sin conexión.'));
    return()=>{window.removeEventListener('beforeinstallprompt',prompt);window.removeEventListener('appinstalled',installed);};
  },[notify]);
  const changeScenario=(id:ScenarioId)=>{const s=scenarios.find(x=>x.id===id)!;setScanning(false);setData(d=>({...d,radio:{...d.radio,scenario:id,[d.radio.active]:s.frequency,mode:s.mode,filter:s.mode==='CW'?500:s.mode==='LSB'?2400:6000,offset:0,paused:false}}));};
  const toggleAudio=async()=>{if(audioOn){await audio.current?.close();audio.current=null;setAudioOn(false);return;}try{const engine=new DemoAudio(radioRef.current);audio.current=engine;await engine.start();setAudioOn(true);}catch{await audio.current?.close();audio.current=null;notify('No se ha podido activar el audio. Inténtalo de nuevo.');}};
  const setContacts=(contacts:Contact[])=>setData(d=>({...d,contacts}));
  const installApp=async()=>{if(install){await install.prompt();await install.userChoice;setInstall(null);}else notify('Instala Radiolab desde el menú del navegador. En iOS: Compartir → Añadir a pantalla de inicio.');};

  return <>
    <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>Saltar al contenido</a>
    <div className={'app-shell'+(menu?' menu-expanded':'')+(tools?' tools-open':'')}>
      <aside className="navigation" aria-label="Menú principal">
        <button className="rail-brand" title={menu?'Contraer menú':'Radiolab · Expandir menú'} aria-label={menu?'Contraer menú':'Expandir menú'} aria-expanded={menu} onClick={()=>setPanel(menu?null:'menu')}>
          <img src={import.meta.env.BASE_URL+'favicon.svg'} alt="" width="34" height="34"/><span>Radiolab</span><Icon name="chevron" size={14}/>
        </button>
        <nav>{navigation.map(n=><button key={n.id} title={n.label} aria-label={n.label} aria-current={view===n.id?'page':undefined} className={'rail-button'+(view===n.id?' current':'')} onClick={()=>navigate(n.id)}><Icon name={n.icon}/><span>{n.label}</span></button>)}</nav>
        <div className="rail-bottom">
          {menu&&<div className="source-state"><span>Modo demo</span><strong>Activado</strong></div>}
          <button className="rail-button" aria-label="Instalar Radiolab" title="Instalar Radiolab" onClick={()=>void installApp()}><Icon name="download"/><span>Instalar Radiolab</span></button>
          <button className="rail-button" aria-label="Ajustes" title="Ajustes" onClick={()=>setModal('settings')}><Icon name="settings"/><span>Ajustes</span></button>
          <button className="rail-button" aria-label={'Tema: '+themeNames[data.theme]} title={'Tema: '+themeNames[data.theme]} onClick={()=>setModal('theme')}><Icon name={themeIcons[data.theme]}/><span>Temas</span></button>
          <button className="rail-button" aria-label="Acerca de Radiolab" title="Acerca de Radiolab" onClick={()=>setModal('about')}><Icon name="info"/><span>Acerca de</span></button>
        </div>
      </aside>
      {menu&&<button className="rail-backdrop" aria-label="Cerrar menú lateral" onClick={()=>setPanel(null)}/>}
      <main id="main" tabIndex={-1} className={view==='classic'||view==='lab'?'radio-workspace':'content-workspace'}>
        {(view==='classic'||view==='lab')&&<Receiver radio={radio} patch={patch} tune={tune} scenario={changeScenario} memories={data.memories} history={data.history} saveMemory={()=>setModal('memory')} removeMemory={id=>setData(d=>({...d,memories:d.memories.filter(m=>m.id!==id)}))} audioOn={audioOn} toggleAudio={()=>void toggleAudio()} lab={view==='lab'} scanning={scanning} toggleScan={()=>setScanning(s=>!s)} notify={notify}/>}
        {view==='log'&&<Logbook contacts={data.contacts} setContacts={setContacts} add={()=>{setEditing(undefined);setModal('contact');}} edit={c=>{setEditing(c);setModal('contact');}} notify={notify}/>}
        {view==='map'&&<ContactMap contacts={data.contacts} addExamples={()=>{setContacts(mergeContacts(data.contacts,demoContacts));notify('Ejemplos añadidos.');}}/>}
        {view==='receivers'&&<Receivers/>}
      </main>
      {tools&&<aside id="receiver-tools" className="receiver-tools" aria-label="Controles del receptor"><ReceiverTools radio={radio} patch={patch} scenario={changeScenario} memories={data.memories} history={data.history} saveMemory={()=>setModal('memory')} removeMemory={id=>setData(d=>({...d,memories:d.memories.filter(m=>m.id!==id)}))} tune={tune} close={()=>setPanel(null)}/></aside>}
      {!tools&&<button className="panel-toggle" aria-label="Abrir panel de controles" aria-expanded={false} aria-controls="receiver-tools" title="Controles del receptor" onClick={()=>setPanel('tools')}><Icon name="sliders" size={18}/><Icon name="chevron" size={11} style={{transform:'rotate(180deg)'}}/></button>}
    </div>
    {toast&&<div className="toast" role="status"><Icon name="info" size={18}/><span>{toast}</span><button className="icon-button" aria-label="Cerrar notificación" onClick={()=>setToast('')}><Icon name="close" size={16}/></button></div>}
    {update&&<div className="update-banner" role="status">Nueva versión disponible.<button onClick={()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});update.postMessage({type:'ACTIVATE_UPDATE'});}}>Actualizar</button></div>}
    {modal==='about'&&<Modal title="Acerca de Radiolab" onClose={closeModal}><About/></Modal>}
    {modal==='theme'&&<Modal title="Temas" onClose={closeModal}><div className="theme-dialog"><ThemePicker theme={data.theme} onChange={setTheme}/></div></Modal>}
    {modal==='settings'&&<Modal title="Ajustes" onClose={closeModal}><Settings theme={data.theme} setTheme={setTheme} radio={radio} patch={patch} reset={()=>{setScanning(false);patch({...defaultRadio});notify('Controles restablecidos.');}}/></Modal>}
    {modal==='contact'&&<Modal title={editing?'Editar anotación':'Nueva anotación'} onClose={closeModal}><ContactForm radio={radio} contact={editing} cancel={closeModal} save={c=>{try{setContacts(mergeContacts(data.contacts,[c]));closeModal();notify('Anotación guardada.');}catch(err){notify((err as Error).message);}}}/></Modal>}
    {modal==='memory'&&<Modal title="Guardar frecuencia" onClose={closeModal}><form className="memory-form" onSubmit={e=>{e.preventDefault();if(data.memories.length>=100){notify('Límite de 100 memorias alcanzado.');return;}const f=new FormData(e.currentTarget);setData(d=>({...d,memories:[...d.memories,{id:crypto.randomUUID(),name:String(f.get('name')).trim()||'Mi frecuencia',frequency:radio[radio.active],mode:radio.mode}]}));closeModal();}}><p className="saved-frequency">{formatFrequency(radio[radio.active])} <small>MHz · {radio.mode}</small></p><label>Nombre<input name="name" maxLength={60} required autoFocus defaultValue="Mi frecuencia"/></label><div className="form-actions"><button type="button" onClick={closeModal}>Cancelar</button><button className="primary" type="submit">Guardar memoria</button></div></form></Modal>}
  </>;
}
