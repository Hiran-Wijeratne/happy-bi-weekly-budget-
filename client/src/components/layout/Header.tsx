'use client';

import { useAuth } from '@/providers/AuthProvider';

interface HeaderProps {
  title:     React.ReactNode;
  subtitle?: string;
  action?:   React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white" style={{ borderBottom: '1px solid #e8e3d8' }}>
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#1c2e1c' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: '#6a7e6a' }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        {user?.photoURL && (
          <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" style={{ boxShadow: '0 0 0 2px #2e7d52' }} />
        )}
      </div>
    </header>
  );
}
