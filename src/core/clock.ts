// One monotonic simulation clock shared by RF, S-meter, Morse and audio.
let origin=performance.now()/1000;
let held:number|null=null;
export function demoTime(){return held??(performance.now()/1000-origin);}
export function pauseClock(paused:boolean){
  if(paused&&held===null)held=demoTime();
  if(!paused&&held!==null){origin=performance.now()/1000-held;held=null;}
}
