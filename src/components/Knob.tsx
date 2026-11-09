import { useRef } from 'react';
export function Knob({ value, onChange, step }: { value: number; onChange: (n:number)=>void; step:number }) {
  const drag = useRef<{ y:number; x:number; value:number } | null>(null);
  const angle = (value / step * 6) % 360;
  return <div className="tuning-assembly"><div className="dial-ticks"/><div className="dial" role="slider" tabIndex={0} aria-label="Dial de sintonía" aria-valuemin={100000} aria-valuemax={1300000000} aria-valuenow={value} aria-valuetext={`${(value/1e6).toFixed(6)} MHz`}
    onKeyDown={e=>{ if (['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','PageUp','PageDown'].includes(e.key)) { e.preventDefault(); onChange(value+step*(['ArrowDown','ArrowLeft','PageDown'].includes(e.key)?-1:1)*(e.key.startsWith('Page')?10:1)); } }}
    onWheel={e=>onChange(value+(e.deltaY<0?step:-step))}
    onPointerDown={e=>{ e.currentTarget.setPointerCapture(e.pointerId); drag.current={y:e.clientY,x:e.clientX,value}; }}
    onPointerMove={e=>{ if (drag.current) onChange(drag.current.value+Math.round((drag.current.y-e.clientY+e.clientX-drag.current.x)/4)*step); }}
    onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="dial-face" style={{transform:`rotate(${angle}deg)`}}><i/><span/></div>
  </div><span className="dial-caption">TUNING <b>VFO</b></span></div>;
}
