'use client';

import { useState } from 'react';
import { NavDrawer } from './NavDrawer';

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavDrawer open={open} onClose={() => setOpen(false)} />
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center px-4 h-14"
        style={{ background: '#ffffff', borderBottom: '1px solid #e8e3d8' }}
      >
        <button
          onClick={() => setOpen(true)}
          className="p-2 flex flex-col justify-center gap-[5px]"
          aria-label="Open menu"
        >
          <span className="block w-5 h-[1.5px] rounded" style={{ background: '#1c2e1c' }} />
          <span className="block w-5 h-[1.5px] rounded" style={{ background: '#1c2e1c' }} />
          <span className="block w-5 h-[1.5px] rounded" style={{ background: '#1c2e1c' }} />
        </button>
        <span className="flex-1 text-center text-sm font-bold" style={{ color: '#2e7d52' }}>
          🌿 BudgetFlow
        </span>
        <div className="w-9" />
      </header>
    </>
  );
}
