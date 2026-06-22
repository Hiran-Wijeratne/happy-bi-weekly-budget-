'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV = [
  { href: '/dashboard',     label: 'Dashboard',     icon: '📊' },
  { href: '/periods',       label: 'Pay Periods',   icon: '📅' },
  { href: '/budget',        label: 'Budget',        icon: '💰' },
  { href: '/expenses',      label: 'Expenses',      icon: '🧾' },
  { href: '/savings',       label: 'Savings',       icon: '🎯' },
  { href: '/debts',         label: 'Debts',         icon: '💳' },
  { href: '/sinking-funds', label: 'Sinking Funds', icon: '🪣' },
  { href: '/settings',      label: 'Settings',      icon: '⚙️' },
  { href: '/feedback',      label: 'Feedback',      icon: '💬' },
];

interface NavDrawerProps { open: boolean; onClose: () => void; }

export function NavDrawer({ open, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.25)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <div
        className="fixed left-0 top-0 h-full z-50 flex flex-col w-64 transition-transform duration-300 ease-out"
        style={{ background: '#ffffff', borderRight: '1px solid #e4ede8', transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #e4ede8' }}>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#3a9068' }}>🌿 Happy BudgetFlow</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-lg" style={{ color: '#9ab0a4', background: '#f0f8f4' }}>×</button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? '#f0f8f4' : 'transparent',
                  color:      active ? '#3a9068' : '#5a7a68',
                  borderLeft: active ? '3px solid #b86a80' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f6faf8'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid #e4ede8' }}>
          {user?.email && <p className="text-xs px-3 mb-3 truncate" style={{ color: '#9ab0a4' }}>{user.email}</p>}
          <button
            onClick={() => signOut(auth)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: '#9ab0a4' }}
          >
            <span>🚪</span> Sign out
          </button>
        </div>
      </div>
    </>
  );
}