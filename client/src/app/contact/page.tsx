'use client';

import { useState } from 'react';
import Link from 'next/link';

const TYPES = [
  { value: 'contact', label: 'General question' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'love', label: 'Just saying hi 👋' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', type: 'contact', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/feedback/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Something went wrong');
      }
      setStatus('sent');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  const inputCls =
    'w-full rounded-xl border border-[#cde0d4] bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3db86a] transition-shadow';

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#f4ede0' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-5xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold" style={{ color: '#2e7d52' }}>
          🌿 Happy BudgetFlow
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3db86a 0%, #2e7d52 55%, #1f6040 100%)', boxShadow: '0 2px 10px rgba(46,125,82,0.28)' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1c2e1c' }}>Contact Us</h1>
            <p className="text-sm text-gray-500">Have a question, bug to report, or just want to say hi? We'd love to hear from you.</p>
          </div>

          {status === 'sent' ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'linear-gradient(145deg, #52c97a 0%, #34a85a 45%, #1f8040 100%)' }}
            >
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-white mb-2">Message received!</h2>
              <p className="text-sm text-green-100 mb-6">Thanks for reaching out. We'll get back to you soon.</p>
              <Link
                href="/"
                className="inline-block text-sm font-semibold px-5 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.92)', color: '#1a7038' }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 lg:p-8 flex flex-col gap-4 shadow-sm"
              style={{ background: '#ffffff' }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Your name</label>
                <input
                  className={inputCls}
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email address</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</label>
                <select className={inputCls} value={form.type} onChange={set('type')}>
                  {TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Message</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={set('message')}
                  required
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full font-semibold text-white py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3db86a 0%, #2e7d52 55%, #1f6040 100%)', boxShadow: '0 2px 10px rgba(46,125,82,0.28)' }}
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-6">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} <span className="font-medium text-gray-500">Happy Hero Space</span>. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
