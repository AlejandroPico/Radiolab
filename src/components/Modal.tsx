import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon.tsx';
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    node.showModal();
    // Native Android/browser Back consumes the panel entry before the app entry.
    const token = crypto.randomUUID(); history.pushState({ radiolabModal: token }, '');
    const back = () => onClose(); window.addEventListener('popstate', back);
    return () => {
      window.removeEventListener('popstate', back); node.close();
      if (history.state?.radiolabModal === token) history.back();
      previous?.focus();
    };
  }, [onClose]);
  return <dialog ref={dialog} className="modal" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <header><div><span className="eyebrow">RADIOLAB / ESTACIÓN EXPERIMENTAL</span><h2>{title}</h2></div><button className="icon-button" aria-label="Cerrar panel" onClick={onClose}><Icon name="close"/></button></header>
    {children}
  </dialog>;
}
