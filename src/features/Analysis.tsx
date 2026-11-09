import { useState } from 'react';
import { DemoSource, passband } from '../adapters/demo.ts';
import { demoTime } from '../core/clock.ts';
import { formatFrequency } from '../core/radio.ts';
import type { RadioState, SourceMetadata } from '../core/types.ts';
import { Icon } from '../components/Icon.tsx';
interface Trace { metadata:SourceMetadata; bins:Float32Array; peak:number; peakFrequency:number }
export function Analysis({radio}:{radio:RadioState}) {
  const [trace,setTrace]=useState<Trace|null>(null);
  const [lo,hi]=passband(radio);
  const capture=()=>{
    const source=new DemoSource(),timestamp=demoTime();
    const metadata=source.metadata(radio,timestamp),bins=source.spectrum(radio,timestamp,768);
    let peak=-Infinity,index=0;bins.forEach((value,i)=>{if(value>peak){peak=value;index=i;}});
    setTrace({metadata,bins,peak,peakFrequency:metadata.centerFrequency-metadata.bandwidth/2+index/767*metadata.bandwidth});
    source.close();
  };
  const exportTrace=()=>{
    if(!trace)return;
    const m=trace.metadata;
    const csv='source,isSynthetic,simulation_seconds,sample_rate_hz,frequency_hz,level_dbm_simulated\r\n'+Array.from(trace.bins,(v,i)=>`demo,true,${m.timestamp.toFixed(6)},${m.sampleRate},${(m.centerFrequency-m.bandwidth/2+i/767*m.bandwidth).toFixed(3)},${v.toFixed(3)}`).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
    a.href=url;a.download='radiolab-traza-DEMO.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section className="analysis-panel"><div className="section-title"><span>BANCO DE ANÁLISIS / DATOS SINTÉTICOS</span><span className="badge amber">DEMO</span></div><div className="analysis-metadata"><div><span>FUENTE / MUESTREO</span><strong>DEMO <small>48 000 Hz</small></strong></div><div><span>BANDA DE PASO ABSOLUTA</span><strong>{formatFrequency(radio[radio.active]+lo)} — {formatFrequency(radio[radio.active]+hi)} <small>MHz</small></strong></div><div><span>RESOLUCIÓN DE LA TRAZA</span><strong>{(radio.span/767).toFixed(2)} <small>Hz / bin</small></strong></div></div><div className="trace-actions"><button onClick={capture}><Icon name="wave" size={15}/> Capturar traza</button><button disabled={!trace} onClick={exportTrace}><Icon name="download" size={15}/> Exportar CSV</button><span>{trace?`Captura t = ${trace.metadata.timestamp.toFixed(3)} s · Pico ${trace.peak.toFixed(1)} dBm simulados en ${formatFrequency(trace.peakFrequency)} MHz`:'Captura los 768 bins del espectro actual para inspeccionarlos o guardarlos.'}</span></div><p>Envolvente analítica sintética. La resolución indicada es el espaciado de los bins de visualización; no es la resolución de una FFT de hardware.</p></section>;
}
