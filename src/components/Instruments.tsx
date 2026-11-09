import { useEffect, useRef, useState } from 'react';
import { DemoSource, passband, signalLevel, sampleAudio } from '../adapters/demo.ts';
import { formatFrequency } from '../core/radio.ts';
import type { RadioState } from '../core/types.ts';
import { Icon } from './Icon.tsx';
import { demoTime } from '../core/clock.ts';
const source = new DemoSource();
export function Spectrum({ radio, onTune, lab=false }: { radio: RadioState; onTune:(f:number)=>void; lab?:boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(radio); current.current=radio;
  const [cursor,setCursor] = useState<number | null>(null);
  const hover = useRef<number | null>(null);
  const lastScene = useRef(radio.scenario);
  useEffect(()=>{
    const node=canvas.current!, ctx=node.getContext('2d')!;
    const waterfall=document.createElement('canvas'); waterfall.width=768; waterfall.height=180;
    const wc=waterfall.getContext('2d')!;
    let width=900, height=lab?490:320, raf=0, last=0;
    let lastView='';
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize=new ResizeObserver(()=>{ const rect=node.getBoundingClientRect(); width=rect.width; height=rect.height; const dpr=Math.min(devicePixelRatio||1,2); node.width=width*dpr; node.height=height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }); resize.observe(node);
    const draw=(now:number)=>{
      raf=requestAnimationFrame(draw); if(now-last<(reduced?180:40))return;
      last=now;
      const r=current.current,clock=demoTime();
      const view=`${r[r.active]+r.offset}/${r.span}/${r.scenario}`;
      if(lastScene.current!==r.scenario||view!==lastView) { wc.fillStyle='#071713';wc.fillRect(0,0,768,180);lastView=view;lastScene.current=r.scenario; }
      const bins=source.spectrum(r,clock,768);
      const left=44,right=width-14,plotWidth=right-left,top=20,split=height*.56,bottom=height-25;
      ctx.fillStyle='#07110f';ctx.fillRect(0,0,width,height);
      ctx.font='10px ui-monospace, Consolas, monospace';ctx.textAlign='right';ctx.lineWidth=1;
      const yFor=(v:number)=>top+(r.floor+90-v)/90*(split-top-13);
      for(let db=r.floor;db<=r.floor+90;db+=20) {
        const y=yFor(db);ctx.strokeStyle='#17302a';ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();ctx.fillStyle='#78918a';ctx.fillText(`${db}`,left-9,y+3);
      }
      const center=r[r.active]+r.offset;
      for(let i=0;i<=6;i++) { const x=left+i/6*plotWidth;ctx.strokeStyle='#142923';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();ctx.fillStyle='#88a398';ctx.textAlign='center';ctx.fillText(((center-r.span/2+i/6*r.span)/1e6).toFixed(3),x,height-7); }
      const [lo,hi]=passband(r);
      const xFor=(f:number)=>left+((f-center)/r.span+.5)*plotWidth;
      const bx=xFor(r[r.active]+lo),ex=xFor(r[r.active]+hi);
      ctx.save();ctx.beginPath();ctx.rect(left,top,plotWidth,split-top);ctx.clip();
      ctx.fillStyle='#5cd6af12';ctx.fillRect(bx,top,ex-bx,split-top);
      ctx.strokeStyle='#68bca360';ctx.setLineDash([3,4]);[bx,ex].forEach(x=>{ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,split);ctx.stroke();});ctx.setLineDash([]);
      const gradient=ctx.createLinearGradient(0,top,0,split);gradient.addColorStop(0,'#55d5a850');gradient.addColorStop(1,'#55d5a802');
      ctx.beginPath();bins.forEach((v,i)=>{const x=left+i/767*plotWidth,y=yFor(v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.lineTo(right,split);ctx.lineTo(left,split);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
      ctx.beginPath();bins.forEach((v,i)=>{const x=left+i/767*plotWidth,y=yFor(v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle='#68e3ba';ctx.lineWidth=1.25;ctx.stroke();ctx.restore();
      if(!r.paused) {
        wc.drawImage(waterfall,0,0,768,179,0,1,768,179);
        const line=wc.createImageData(768,1);
        bins.forEach((v,i)=>{const t=Math.min(1,Math.max(0,(v-r.floor)/85));const p=i*4;line.data[p]=t>.65?Math.round(55+(t-.65)*550):Math.round(t*12);line.data[p+1]=Math.round(24+t*202);line.data[p+2]=Math.round(30+t*100);line.data[p+3]=255;});wc.putImageData(line,0,0);
      }
      ctx.drawImage(waterfall,left,split,plotWidth,bottom-split);
      ctx.fillStyle='#06110fcc';ctx.fillRect(left+7,split+7,117,18);ctx.fillStyle='#a8c4b7';ctx.textAlign='left';ctx.fillText('WATERFALL · DEMO',left+13,split+19);
      const tuned=xFor(r[r.active]);
      ctx.strokeStyle='#f3b769';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tuned,top);ctx.lineTo(tuned,bottom);ctx.stroke();ctx.fillStyle='#f3b769';ctx.beginPath();ctx.moveTo(tuned-4,top-7);ctx.lineTo(tuned+4,top-7);ctx.lineTo(tuned,top);ctx.fill();
      if(hover.current!==null) { const x=left+hover.current*plotWidth;ctx.strokeStyle='#b0cec980';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();ctx.setLineDash([]); }
    };
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);resize.disconnect();source.close();};
  },[lab]);
  const point=(x:number)=>{ const rect=canvas.current!.getBoundingClientRect();return Math.max(0,Math.min(1,(x-rect.left-44)/(rect.width-58))); };
  return <section className={`spectrum-panel ${lab?'expanded':''}`} aria-label="Espectro sintético y waterfall">
    <div className="instrument-heading"><span><i className="led"/> ESPECTRO DE RADIOFRECUENCIA</span><span className="source-label">FUENTE: DEMOSTRACIÓN</span></div>
    <canvas ref={canvas} className="spectrum-canvas" tabIndex={0} role="img" aria-label={`Espectro sintético centrado en ${formatFrequency(radio[radio.active]+radio.offset)} MHz. Pulsa flechas para sintonizar.`}
      onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();onTune(radio[radio.active]+radio.step*(e.key==='ArrowRight'?1:-1));}}}
      onPointerMove={e=>{const p=point(e.clientX);hover.current=p;setCursor(radio[radio.active]+radio.offset+(p-.5)*radio.span);}}
      onPointerLeave={()=>{hover.current=null;setCursor(null);}}
      onClick={e=>onTune(Math.round((radio[radio.active]+radio.offset+(point(e.clientX)-.5)*radio.span)/radio.step)*radio.step)} />
    <div className="instrument-bottom"><span>{cursor===null?'Pulsa sobre una señal para sintonizar':`${formatFrequency(cursor)} MHz`}</span><span>{(radio.span/1000).toFixed(0)} kHz <b>SPAN</b> <span className="muted">/</span> 768 <b>BINS SINTÉTICOS</b></span></div>
  </section>;
}
export function Meter({ radio }: { radio:RadioState }) {
  const [db,setDb]=useState(-52);
  useEffect(()=>{const t=setInterval(()=>{if(!radio.paused)setDb(signalLevel(radio,demoTime()));},180);return()=>clearInterval(t);},[radio]);
  const n=Math.max(0,Math.min(24,Math.round((db+120)/90*24)));
  return <div className="signal-meter"><div className="meter-title"><span>S-METER <b>DEMO</b></span><strong>{Math.round(db)} <small>dBm simulados</small></strong></div><div className="meter-scale"><span>1</span><span>3</span><span>5</span><span>7</span><span>9</span><span>+20</span><span>+40</span></div><div className="meter-bars">{Array.from({length:24},(_,i)=><i key={i} className={`${i<n?'lit':''} ${i>17?'hot':''}`}/>)}</div></div>;
}
export function Oscilloscope({ radio }: { radio:RadioState }) {
  const canvas=useRef<HTMLCanvasElement>(null),state=useRef(radio);state.current=radio;
  useEffect(()=>{
    const node=canvas.current!,ctx=node.getContext('2d')!;let raf=0,last=0,time=0;
    const render=(t:number)=>{raf=requestAnimationFrame(render);if(t-last<60)return;last=t;if(!state.current.paused)time=demoTime();const width=node.clientWidth,height=96;const dpr=Math.min(devicePixelRatio||1,2);if(node.width!==width*dpr){node.width=width*dpr;node.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}ctx.clearRect(0,0,width,height);ctx.strokeStyle='#244138';ctx.beginPath();ctx.moveTo(0,48);ctx.lineTo(width,48);ctx.stroke();ctx.strokeStyle='#83c7b1';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<width;i++){const y=48-sampleAudio(state.current,time+i/width*.012)*220;if(i===0)ctx.moveTo(i,y);else ctx.lineTo(i,y);}ctx.stroke();};raf=requestAnimationFrame(render);return()=>cancelAnimationFrame(raf);
  },[]);
  return <div className="scope"><div className="instrument-heading"><span><Icon name="wave" size={14}/> AUDIO / OSCILOSCOPIO</span><span className="source-label">DEMO · 12 ms</span></div><canvas ref={canvas} role="img" aria-label="Forma de onda del audio de demostración; incluye volumen y silenciamiento"/><div className="scope-footer">Audio sintético original <span>48 kHz</span></div></div>;
}

