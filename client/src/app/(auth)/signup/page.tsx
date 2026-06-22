'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { User } from '@/types/api';

export default function SignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      await apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ email, display_name: name }),
      });
      router.replace('/verify-email');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Sign up failed');
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const u = await apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ email: cred.user.email, display_name: cred.user.displayName }),
      });
      router.replace(u.onboarding_done ? '/dashboard' : '/onboarding');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Google sign-up failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: '#2e7d52' }}>🌿 Happy BudgetFlow</div>
          <p className="text-sm" style={{ color: '#6a7e6a' }}>Create your free account</p>
        </div>

        <Button variant="secondary" className="w-full mb-4" onClick={handleGoogle} loading={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: '#e8e3d8' }} /></div>
          <div className="relative text-center"><span className="px-3 text-xs" style={{ background: '#ffffff', color: '#6a7e6a' }}>or</span></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input label="Full name" type="text" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
            helper="At least 6 characters" autoComplete="new-password" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        </form>

        <p className="mt-4 text-sm text-center" style={{ color: '#6a7e6a' }}>
          Already have an account? <Link href="/login" className="hover:underline" style={{ color: '#2e7d52' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
