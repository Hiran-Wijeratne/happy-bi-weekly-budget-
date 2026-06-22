'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Home',     icon: '📊' },
  { href: '/budget',    label: 'Budget',   icon: '💰' },
  { href: '/expenses',  label: 'Expenses', icon: '🧾' },
  { href: '/savings',   label: 'Savings',  icon: '🎯' },
  { href: '/debts',     label: 'Debts',    icon: '💳' },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-white" style={{ borderTop: '1px solid #e8e3d8' }}>
      {NAV.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-all"
            style={{ color: active ? '#2e7d52' : '#6a7e6a' }}
          >
            <span className="text-xl mb-0.5">{icon}</span>
            <span style={active ? { color: '#c97082', fontWeight: 700 } : {}}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
