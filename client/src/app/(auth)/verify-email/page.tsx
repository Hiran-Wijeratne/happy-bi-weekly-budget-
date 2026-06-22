'use client';

import { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api-client';
import type { User } from '@/types/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  async function resend() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
    }
  }

  async function checkVerified() {
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      try {
        const u = await apiFetch<User>('/users/me');
        router.replace(u.onboarding_done ? '/dashboard' : '/onboarding');
      } catch {
        router.replace('/onboarding');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#1c2e1c' }}>Check your email</h1>
        <p className="text-sm mb-6" style={{ color: '#6a7e6a' }}>
          We sent a verification link to <strong>{auth.currentUser?.email}</strong>.
          Click the link in your email to verify your account.
        </p>

        <div className="space-y-3">
          <Button className="w-full" onClick={checkVerified}>I've verified — continue</Button>
          <Button variant="secondary" className="w-full" onClick={resend} disabled={sent}>
            {sent ? 'Email sent!' : 'Resend verification email'}
          </Button>
          <button
            className="text-sm hover:underline"
            style={{ color: '#6a7e6a' }}
            onClick={() => signOut(auth).then(() => router.replace('/login'))}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
