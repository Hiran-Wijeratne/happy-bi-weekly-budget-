'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type { FinancialAdvice } from '@/types/api';

interface AdviceCardProps {
  monthlyIncome: number;
}

export function AdviceCard({ monthlyIncome }: AdviceCardProps) {
  const [expanded,      setExpanded]      = useState(false);
  const [paycheckInput, setPaycheckInput] = useState('');
  const [localMonthly,  setLocalMonthly]  = useState(0);

  // Use real period income if set; fall back to whatever the user typed in
  const effectiveMonthly = monthlyIncome || localMonthly;

  const { data: advice, isLoading } = useQuery<FinancialAdvice>({
    queryKey: ['advice', Math.round(effectiveMonthly / 100) * 100],
    queryFn:  () => apiFetch(`/advice?monthly_income=${Math.round(effectiveMonthly)}`),
    enabled:  effectiveMonthly > 0,
    staleTime: Infinity,
  });

  const handleGetAdvice = () => {
    const biweekly = parseFloat(paycheckInput);
    if (biweekly > 0) setLocalMonthly(Math.round(biweekly * 26 / 12));
  };

  /* ── Teaser: no income set yet ───────────────────────────── */
  if (!effectiveMonthly) {
    return (
      <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📖</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base">Get personalized financial advice</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Enter your biweekly paycheck below to instantly unlock advice matched to your income — drawn from the world's top personal finance books.
            </p>

            {/* ── Inline CTA ── */}
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={paycheckInput}
                  onChange={e => setPaycheckInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGetAdvice()}
                  placeholder="Paycheck amount"
                  className="w-full border border-brand-200 rounded-lg pl-7 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <button
                onClick={handleGetAdvice}
                disabled={!paycheckInput || parseFloat(paycheckInput) <= 0}
                className="flex-shrink-0 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 active:scale-95 transition disabled:opacity-40 whitespace-nowrap"
              >
                See my advice →
              </button>
            </div>

            {/* Author pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Dave Ramsey', 'Ramit Sethi', 'David Bach', 'Robert Kiyosaki'].map(a => (
                <span key={a} className="inline-flex items-center gap-1 bg-white/70 border border-brand-100 rounded-full px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  📚 {a}
                </span>
              ))}
            </div>

            {/* Link to save it permanently */}
            <p className="text-xs text-gray-400 mt-3">
              Want to save your income?{' '}
              <Link href="/periods" className="text-brand-500 hover:underline font-medium">
                Open a pay period →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading after user typed income ── */
  if (isLoading || !advice) return null;

  const usingLocalIncome = !monthlyIncome && localMonthly > 0;

  /* ── Full advice card ─────────────────────────────────────── */
  return (
    <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0 mt-0.5">{advice.emoji}</span>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-base leading-tight">{advice.title}</p>
              <p className="text-xs text-brand-600 font-medium mt-0.5">{advice.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex-shrink-0 text-xs text-brand-400 hover:text-brand-600 font-medium transition-colors mt-1"
          >
            {expanded ? 'Less ↑' : 'Read more ↓'}
          </button>
        </div>

        {/* Book badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/70 border border-brand-100 rounded-full px-3 py-1">
          <span className="text-xs">📚</span>
          <span className="text-xs font-semibold text-brand-700">{advice.book_title}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{advice.book_author}</span>
        </div>
      </div>

      {/* Advice text — fades between truncated and full via key-swap */}
      <div className="px-5">
        <p key={String(expanded)} className="text-sm text-gray-700 leading-relaxed animate-fade-in">
          {expanded
            ? advice.advice_text
            : truncateToSentences(advice.advice_text, 1)}
        </p>
      </div>

      {/* Expanded content — smooth max-height slide */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: expanded ? '500px' : '0px',
          opacity:   expanded ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        }}
      >
        <div className="px-5 mt-4 space-y-4">
          <div className="bg-brand-600 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-brand-100 uppercase tracking-wide mb-1.5">
              Your action this paycheck
            </p>
            <p className="text-sm text-white leading-relaxed">{advice.action_tip}</p>
          </div>
          <blockquote className="border-l-4 border-brand-300 pl-4 py-1">
            <p className="text-sm text-gray-600 italic leading-relaxed">{advice.encouragement}</p>
          </blockquote>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 mt-3 bg-white/50 border-t border-brand-100 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400 min-w-0">
          {usingLocalIncome ? (
            <>
              Preview only —{' '}
              <Link href="/periods" className="text-brand-500 hover:underline">
                save your income in Pay Periods
              </Link>
            </>
          ) : (
            <>Based on ~{formatMonthlyLabel(effectiveMonthly)} / month</>
          )}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-brand-500 font-medium hover:text-brand-700 transition-colors flex-shrink-0"
        >
          {expanded ? 'Collapse' : 'See your action plan →'}
        </button>
      </div>
    </div>
  );
}

function truncateToSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, count).join(' ').trim() + (sentences.length > count ? '…' : '');
}

function formatMonthlyLabel(monthly: number): string {
  if (monthly < 1000) return `$${Math.round(monthly)}`;
  return `$${(monthly / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}
