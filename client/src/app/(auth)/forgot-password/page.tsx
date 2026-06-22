'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to send reset email');
    } finally { setLoading(false); }
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#1c2e1c' }}>Reset email sent</h1>
        <p className="text-sm mb-6" style={{ color: '#6a7e6a' }}>Check your inbox for a link to reset your password.</p>
        <Link href="/login" className="text-sm hover:underline" style={{ color: '#2e7d52' }}>Back to sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: '#2e7d52' }}>Reset password</div>
          <p className="text-sm" style={{ color: '#6a7e6a' }}>Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
        </form>
        <p className="mt-4 text-center text-sm" style={{ color: '#6a7e6a' }}>
          <Link href="/login" className="hover:underline" style={{ color: '#2e7d52' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
