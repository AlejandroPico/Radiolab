import type { Theme } from './types.ts';
export const themeNames:Record<Theme,string>={morning:'Mañana',afternoon:'Tarde',night:'Noche',auto:'Automático'};
export const themeOrder:Theme[]=['morning','afternoon','night','auto'];
export function effectiveTheme(theme:Theme,date=new Date()):Exclude<Theme,'auto'> {
  if(theme!=='auto')return theme;
  const hour=date.getHours();
  return hour>=6&&hour<13?'morning':hour>=13&&hour<20?'afternoon':'night';
}
export function migrateTheme(value:unknown):Theme {
  if(value==='light')return 'morning';
  if(value==='dark')return 'night';
  return themeOrder.includes(value as Theme)?value as Theme:'auto';
}
