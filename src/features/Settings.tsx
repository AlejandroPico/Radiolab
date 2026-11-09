import type { RadioState, Theme } from '../core/types.ts';
import { ThemePicker } from '../components/ThemePicker.tsx';
export function Settings({theme,setTheme,radio,patch,reset}:{theme:Theme;setTheme:(t:Theme)=>void;radio:RadioState;patch:(r:Partial<RadioState>)=>void;reset:()=>void}){
  return <div className="settings-content"><section><h3>Fuente de señal</h3><label className="setting-row"><span>Modo demo<small>Única fuente disponible en esta versión.</small></span><input type="checkbox" checked disabled aria-label="Modo demo activado"/></label></section>
    <section><h3>Apariencia</h3><ThemePicker theme={theme} onChange={setTheme}/><p>Mañana, tarde, noche o automático. El automático sigue la hora del dispositivo: 06–13 h, 13–20 h y 20–06 h.</p></section>
    <section><h3>Receptor</h3><label className="setting-row"><span>Silenciar audio</span><input type="checkbox" checked={radio.muted} onChange={e=>patch({muted:e.target.checked})}/></label><label className="setting-row"><span>Paso de sintonía</span><select value={radio.step} onChange={e=>patch({step:Number(e.target.value)})}>{[1,10,100,1000,10000,100000].map(s=><option key={s} value={s}>{s>=1000?`${s/1000} kHz`:`${s} Hz`}</option>)}</select></label><button className="reset-settings" onClick={reset}>Restablecer controles del receptor</button><p>Conserva las memorias y el libro de guardia.</p></section>
  </div>;
}
