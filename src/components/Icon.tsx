import type { CSSProperties } from 'react';
const paths = {
  radio: <><path d="M4 9h16v11H4zM6 9l11-6M7 13h5M7 16h3"/><circle cx="16" cy="15" r="2"/></>,
  wave: <path d="M2 12h3l2-7 4 14 4-14 3 7h4"/>,
  book: <><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5M3 6h4M3 10h4M3 14h4M3 18h4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></>,
  antenna: <><path d="M12 6v15M7 21h10M8 21l4-9 4 9M7 4a7 7 0 000 9M17 4a7 7 0 010 9M4 1a11 11 0 000 15M20 1a11 11 0 010 15"/><circle cx="12" cy="6" r="1"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2"/></>,
  moon: <path d="M20 15a9 9 0 01-11-11 9 9 0 1011 11Z"/>,
  auto: <><rect x="3" y="4" width="18" height="13"/><path d="M8 21h8M12 17v4M12 5v11"/></>,
  play: <path d="m8 4 12 8-12 8Z"/>, pause:<><path d="M8 4v16M16 4v16"/></>,
  volume: <><path d="m11 4-5 5H2v6h4l5 5ZM15 8a6 6 0 010 8M18 5a10 10 0 010 14"/></>,
  mute: <><path d="m11 4-5 5H2v6h4l5 5ZM16 9l6 6M22 9l-6 6"/></>,
  plus:<path d="M12 4v16M4 12h16"/>, minus:<path d="M4 12h16"/>,
  star:<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>,
  arrow:<path d="M4 12h16M14 6l6 6-6 6"/>, chevron:<path d="m9 5 7 7-7 7"/>,
  close:<path d="m6 6 12 12M18 6 6 18"/>,
  download:<><path d="M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"/></>,
  upload:<><path d="M12 15V3M7 8l5-5 5 5M4 16v5h16v-5"/></>,
  external:<><path d="M14 3h7v7M21 3 10 14M11 3H3v18h18v-8"/></>,
  lock:<><rect x="5" y="10" width="14" height="11"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></>,
  search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  reset:<><path d="M3 11a9 9 0 119 10M3 3v8h8"/></>,
  trash:<><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
  edit:<><path d="m15 3 6 6-11 11-7 1 1-7ZM12 6l6 6"/></>,
  menu:<path d="M3 5h18M3 12h18M3 19h18"/>, check:<path d="m4 12 5 5L20 6"/>,
  headphones:<><path d="M3 14v-3a9 9 0 0118 0v3M3 12h4v8H3zM17 12h4v8h-4z"/></>,
};
export type IconName = keyof typeof paths;
export function Icon({ name, size=20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
