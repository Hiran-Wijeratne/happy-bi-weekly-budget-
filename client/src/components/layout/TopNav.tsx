'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/periods',   label: 'Pay Periods' },
  { href: '/budget',    label: 'Budget' },
  { href: '/expenses',  label: 'Expenses' },
  { href: '/savings',   label: 'Savings' },
  { href: '/debts',     label: 'Debts' },
  { href: '/sinking-funds', label: 'Sinking Funds' },
];

export function TopNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav
      className="sticky top-0 z-40 hidden lg:flex items-center gap-1 px-6 h-14 w-full"
      style={{ background: '#3a9068', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mr-6 flex-shrink-0">
        <span className="text-base font-bold text-white tracking-tight">🌿 Happy BudgetFlow</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-0.5 flex-1">
        {NAV.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color:      active ? '#ffffff' : 'rgba(255,255,255,0.58)',
                background: active ? '#b86a80' : 'transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/feedback"
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)' }}
        >
          Feedback
        </Link>
        <Link
          href="/settings"
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)' }}
        >
          Settings
        </Link>
        {user?.photoURL && (
          <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover ml-1"
            style={{ boxShadow: '0 0 0 2px #b86a80' }} />
        )}
        <button
          onClick={() => signOut(auth)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium ml-1"
          style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
