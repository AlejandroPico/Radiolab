import { Icon, type IconName } from './Icon.tsx';
import { themeNames, themeOrder } from '../core/theme.ts';
import type { Theme } from '../core/types.ts';
export const themeIcons:Record<Theme,IconName>={morning:'sun',afternoon:'sunset',night:'moon',auto:'auto'};
export function ThemePicker({theme,onChange}:{theme:Theme;onChange:(t:Theme)=>void}) {
  return <div className="theme-picker" role="group" aria-label="Tema de la aplicación">{themeOrder.map(t=><button key={t} className={theme===t?'selected':''} aria-label={`Modo ${themeNames[t].toLowerCase()}`} title={themeNames[t]} aria-pressed={theme===t} onClick={()=>onChange(t)}><Icon name={themeIcons[t]}/></button>)}</div>;
}
