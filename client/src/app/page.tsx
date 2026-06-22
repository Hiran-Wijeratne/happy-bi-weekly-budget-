'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Appear } from '@/components/ui/Appear';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading) return null;

  // Pure CSS animation helper — no JS state needed.
  // animation-fill-mode:both keeps opacity:0 during the delay, then holds opacity:1 after.
  const fadeUp = (delay: number): React.CSSProperties => ({
    animation: `fadeUp 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
  });

  return (
    <main className="min-h-screen flex flex-col overflow-hidden" style={{ background: '#f4ede0' }}>

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 lg:px-10 py-4 lg:py-6 max-w-7xl mx-auto w-full"
        style={fadeUp(0)}
      >
        <span className="text-xl lg:text-2xl font-bold" style={{ color: '#2e7d52' }}>🌿 Happy BudgetFlow</span>
        <div className="flex gap-3 lg:gap-4 items-center">
          <Link href="/contact" className="text-sm lg:text-base font-medium text-gray-500 hover:text-gray-800 transition-colors hidden sm:inline">Contact</Link>
          <Link href="/login" className="text-sm lg:text-base font-medium text-gray-500 hover:text-gray-800 transition-colors">Sign in</Link>
          <Link
            href="/signup"
            className="text-sm lg:text-base font-semibold text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #3db86a 0%, #2e7d52 55%, #1f6040 100%)', boxShadow: '0 2px 10px rgba(46,125,82,0.28)' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 max-w-7xl mx-auto w-full relative">

        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute" style={{
          top: '-60px', right: '-80px', width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,82,0.07) 0%, transparent 70%)',
          animation: 'breathe 7s ease-in-out infinite',
        }} />
        <div className="pointer-events-none absolute" style={{
          bottom: '40px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,82,0.05) 0%, transparent 70%)',
          animation: 'breathe 9s ease-in-out infinite reverse',
        }} />

        <div className="flex flex-col lg:flex-row lg:min-h-[560px]">

          {/* Left — copy */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-6 lg:py-16 text-center lg:text-left relative z-10">

            <div style={fadeUp(80)}>
              <div
                className="inline-flex items-center gap-2 text-xs lg:text-sm font-semibold uppercase tracking-widest px-3 lg:px-4 py-1.5 rounded-full mb-6 lg:mb-8 self-center lg:self-start"
                style={{ background: '#dde8e0', color: '#1c2e1c' }}
              >
                ✦ Built for biweekly earners
              </div>
            </div>

            <div style={fadeUp(180)}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 lg:mb-7" style={{ color: '#1c2e1c' }}>
                Stop running out<br />of money{' '}
                <span style={{ color: '#2e7d52' }}>before payday</span>
              </h1>
            </div>

            <div style={fadeUp(280)}>
              <p className="text-base lg:text-lg mb-8 lg:mb-10 max-w-sm lg:max-w-md mx-auto lg:mx-0" style={{ color: '#6a7e6a' }}>
                Your paycheck is biweekly. Your budget should be too.
              </p>
            </div>

            <div style={fadeUp(380)}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="px-8 lg:px-10 py-3.5 lg:py-4 rounded-xl font-semibold text-white text-base lg:text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #3db86a 0%, #2e7d52 55%, #1f6040 100%)', animation: 'pulse-glow 3s ease-in-out 1200ms infinite' }}
                >
                  Take control — it's free
                </Link>
              </div>
              <p className="text-xs lg:text-sm mt-3" style={{ color: '#6a9070' }}>
                No credit card · Takes 2 minutes
              </p>
            </div>
          </div>

          {/* Right — video */}
          <div
            className="flex-shrink-0 w-full lg:w-[540px] flex items-center justify-center py-2 lg:py-0 lg:-ml-[25px]"
            style={{ background: '#f4ede0', ...fadeUp(260) }}
          >
            <div className="relative w-full max-w-[380px] lg:max-w-none" style={{ transform: 'translateZ(0)' }}>
              <video
                src="/videos/piggy-bank.mp4"
                autoPlay muted playsInline loop
                className="w-full"
                style={{ display: 'block', opacity: 0, transition: 'opacity 0.6s ease' }}
                onLoadedMetadata={e => { (e.currentTarget as HTMLVideoElement).currentTime = 0.5; }}
                onLoadedData={e => { (e.currentTarget as HTMLVideoElement).style.opacity = '1'; }}
              />
              <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(to right, #f4ede0, transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(to left, #f4ede0, transparent)' }} />
              <div className="absolute inset-x-0 top-0 h-1/4 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #f4ede0, transparent)' }} />
              <div className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none" style={{ background: 'linear-gradient(to top, #f4ede0, transparent)' }} />
            </div>
          </div>

        </div>

        {/* Section label */}
        <div className="flex items-center gap-4 px-6 pt-2 pb-1" style={fadeUp(500)}>
          <div className="flex-1 h-px" style={{ background: '#ddd5c8' }} />
          <p className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: '#a09080' }}>
            Wisdom from the world's top finance books
          </p>
          <div className="flex-1 h-px" style={{ background: '#ddd5c8' }} />
        </div>

        {/* Feature strip — book-advice cards */}
        <div className="px-6 lg:px-10 py-5 lg:py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { icon: '💸', quote: 'A budget is telling your money where to go instead of wondering where it went.', author: 'Dave Ramsey' },
            { icon: '🎉', quote: 'Automate your finances so the right money moves happen without you thinking about it.', author: 'Ramit Sethi' },
            { icon: '🎯', quote: 'Pay yourself first. Make saving automatic, and you\'ll never miss the money.', author: 'David Bach' },
            { icon: '💳', quote: 'The borrower is servant to the lender. Financial freedom starts with eliminating debt.', author: 'Robert Kiyosaki' },
          ].map((f, i) => (
            <Appear key={f.author} delay={i * 120} duration={600}>
              <div
                className="rounded-2xl p-5 lg:p-7 flex flex-col gap-4 lg:gap-5 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl h-full"
                style={{ background: 'linear-gradient(145deg, #52c97a 0%, #34a85a 45%, #1f8040 100%)' }}
              >
                <span className="text-2xl lg:text-3xl">{f.icon}</span>
                <p className="text-sm lg:text-base font-semibold leading-snug text-white flex-1">"{f.quote}"</p>
                <div
                  className="rounded-full px-3 py-1.5 text-center text-xs lg:text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.92)', color: '#1a7038' }}
                >
                  📚 {f.author}
                </div>
              </div>
            </Appear>
          ))}
        </div>

      </div>

      <footer className="text-center py-4 px-6" style={fadeUp(600)}>
        <p className="text-xs text-gray-400 mb-1">
          <Link href="/contact" className="font-medium text-gray-500 hover:text-[#2e7d52] transition-colors">Contact Us</Link>
        </p>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} <span className="font-medium text-gray-500">Happy Hero Space</span>. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0px); }
          50%       { transform: scale(1.08) translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 14px rgba(46,125,82,0.30); }
          50%       { box-shadow: 0 4px 26px rgba(46,125,82,0.58); }
        }
      `}</style>

    </main>
  );
}
