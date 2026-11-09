export interface Location { lat:number;lon:number }
export function greatCircle(from:Location,to:Location,steps=72): Location[] {
  const rad=Math.PI/180,deg=180/Math.PI;
  const a=from.lat*rad,b=to.lat*rad,delta=(to.lon-from.lon)*rad;
  const d=Math.acos(Math.max(-1,Math.min(1,Math.sin(a)*Math.sin(b)+Math.cos(a)*Math.cos(b)*Math.cos(delta))));
  if(d<1e-9)return [from,to];
  if(Math.abs(Math.sin(d))<1e-8)return []; // Antipodal route is not uniquely defined.
  return Array.from({length:steps+1},(_,i)=>{
    const t=i/steps,A=Math.sin((1-t)*d)/Math.sin(d),B=Math.sin(t*d)/Math.sin(d);
    const x=A*Math.cos(a)*Math.cos(from.lon*rad)+B*Math.cos(b)*Math.cos(to.lon*rad);
    const y=A*Math.cos(a)*Math.sin(from.lon*rad)+B*Math.cos(b)*Math.sin(to.lon*rad),z=A*Math.sin(a)+B*Math.sin(b);
    return {lat:Math.atan2(z,Math.hypot(x,y))*deg,lon:Math.atan2(y,x)*deg};
  });
}
export function routePath(from:Location,to:Location) {
  let previous:number|null=null;
  return greatCircle(from,to).map(p=>{const command=previous===null||Math.abs(p.lon-previous)>180?'M':'L';previous=p.lon;return `${command}${(p.lon+180)*2},${(90-p.lat)*2}`;}).join(' ');
}
