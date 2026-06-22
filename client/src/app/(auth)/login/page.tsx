'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { User } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function ensureUserRecord() {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    await apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ email: fbUser.email, display_name: fbUser.displayName }),
    });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await ensureUserRecord();
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Sign in failed');
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserRecord();
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Google sign-in failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: '#2e7d52' }}>🌿 Happy BudgetFlow</div>
          <p className="text-sm" style={{ color: '#6a7e6a' }}>Sign in to your account</p>
        </div>

        <Button variant="secondary" className="w-full mb-4" onClick={handleGoogle} loading={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: '#e8e3d8' }} /></div>
          <div className="relative text-center"><span className="px-3 text-xs" style={{ background: '#ffffff', color: '#6a7e6a' }}>or</span></div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <Link href="/forgot-password" className="block text-sm hover:underline" style={{ color: '#2e7d52' }}>Forgot password?</Link>
          <p className="text-sm" style={{ color: '#6a7e6a' }}>No account? <Link href="/signup" className="hover:underline" style={{ color: '#2e7d52' }}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
