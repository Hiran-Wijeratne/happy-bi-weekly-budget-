'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/'); return; }
    if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
      router.replace('/verify-email');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#f4ede0' }}>
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: '#2e7d52', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const year = new Date().getFullYear();
  const footer = (
    <footer className="text-center py-4 px-6">
      <p className="text-xs text-gray-400">
        © {year} <span className="font-medium text-gray-500">Happy Hero Space</span>. All rights reserved.
      </p>
    </footer>
  );

  if (isDashboard) {
    return (
      <div className="min-h-screen" style={{ background: '#f4ede0' }}>
        <main className="pb-20 lg:pb-0">
          {children}
        </main>
        {footer}
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#f4ede0' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-0 animate-fade-in">
          {children}
          {footer}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
