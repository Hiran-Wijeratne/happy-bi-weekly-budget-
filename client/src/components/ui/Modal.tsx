'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const [mounted,  setMounted]  = useState(open);
  const [entering, setEntering] = useState(false);
  const [leaving,  setLeaving]  = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
      // Next frame so CSS transition fires from the starting state
      const raf = requestAnimationFrame(() => setEntering(true));
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setEntering(false);
      setLeaving(true);
      const t = setTimeout(() => { setMounted(false); setLeaving(false); }, 260);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const show = entering && !leaving;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: 'rgba(0,0,0,0.50)',
          opacity:    show ? 1 : 0,
          transition: 'opacity 240ms ease',
        }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={cn(
          'relative bg-white w-full sm:max-w-md',
          'rounded-t-2xl sm:rounded-2xl shadow-xl',
          'p-6 pb-8 sm:pb-6',
          className,
        )}
        style={{
          opacity:   show ? 1 : 0,
          transform: show ? 'none' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 260ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#e2dcd4' }} />
        {title && <h2 className="text-lg font-semibold mb-4" style={{ color: '#1c2e1c' }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
