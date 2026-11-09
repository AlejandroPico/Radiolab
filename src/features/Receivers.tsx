import { Icon } from '../components/Icon.tsx';
const receivers=[
  {name:'WebSDR',url:'https://www.websdr.org/',description:'Directorio de receptores WebSDR por ubicación y banda.'},
  {name:'KiwiSDR',url:'https://rx.kiwisdr.com/',description:'Receptores de onda larga, media y corta compartidos por sus operadores.'},
  {name:'OpenWebRX',url:'https://www.receiverbook.de/',description:'Directorio Receiverbook con receptores OpenWebRX y otros sistemas.'},
];
export function Receivers(){return <div className="workspace-page"><div className="page-heading"><h1>Receptores remotos</h1></div><div className="notice"><Icon name="external" size={16}/><p>Los receptores se abren en su propia web. Necesitan conexión a Internet.</p></div><div className="receiver-directory">{receivers.map(r=><a key={r.name} className="directory-card" href={r.url} target="_blank" rel="noopener noreferrer"><h2>{r.name}</h2><p>{r.description}</p><span className="directory-cta">Abrir <Icon name="external" size={16}/></span></a>)}</div></div>;}
