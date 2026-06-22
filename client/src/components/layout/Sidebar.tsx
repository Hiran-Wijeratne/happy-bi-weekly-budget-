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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside
      className="hidden lg:flex flex-col w-56 min-h-screen flex-shrink-0"
      style={{ background: '#ffffff', borderRight: '1px solid #e8e3d8' }}
    >
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e8e3d8' }}>
        <span className="text-sm font-bold tracking-tight" style={{ color: '#2e7d52' }}>🌿 Happy BudgetFlow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? '#edf4ef' : 'transparent',
                color:      active ? '#2e7d52' : '#6a7e6a',
                borderLeft: active ? '3px solid #c97082' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f4ede0'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid #e8e3d8' }}>
        {user?.email && (
          <p className="text-xs px-3 mb-2 truncate" style={{ color: '#6a9070' }}>{user.email}</p>
        )}
        <button
          onClick={() => signOut(auth)}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: '#6a7e6a' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f4ede0'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
