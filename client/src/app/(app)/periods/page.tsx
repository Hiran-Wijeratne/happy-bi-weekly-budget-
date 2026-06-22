'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils';
import { SkeletonList } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { PaycheckPeriod } from '@/types/api';

const YEAR = new Date().getFullYear();

export default function PeriodsPage() {
  const qc = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [payStart, setPayStart] = useState('');

  const { data: periods = [], isLoading } = useQuery<PaycheckPeriod[]>({
    queryKey: ['periods', YEAR],
    queryFn:  () => apiFetch(`/periods?year=${YEAR}`),
  });

  const generate = useMutation({
    mutationFn: () => apiFetch('/periods/generate', {
      method: 'POST',
      body: JSON.stringify({ year: YEAR, pay_start_date: payStart }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periods'] });
      setShowGenerate(false);
    },
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Header
        title="Pay Periods"
        subtitle={`${YEAR} — 26 biweekly periods`}
        action={
          periods.length === 0
            ? <Button size="sm" onClick={() => setShowGenerate(true)}>Generate periods</Button>
            : undefined
        }
      />

      <div className="p-6">
        {isLoading ? (
          <SkeletonList count={6} />
        ) : periods.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold text-gray-700 mb-1">No pay periods yet</p>
            <p className="text-sm text-gray-500 mb-4">Enter your first paycheck date to generate all 26 periods for {YEAR}.</p>
            <Button onClick={() => setShowGenerate(true)}>Generate my {YEAR} periods</Button>
          </Card>
        ) : (
          <>
          {/* Banner when no income is set on any period */}
          {periods.every(p => !Number(p.primary_income)) && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 animate-fade-in">
              <span className="text-lg flex-shrink-0">💡</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Set your paycheck income</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Tap any period below to enter your income — it powers your smart budget plan and personalized financial advice.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {periods.map((p, i) => {
              const isActive  = p.start_date <= today && today <= p.end_date;
              const isPast    = p.end_date < today;
              const hasIncome = Number(p.primary_income) > 0;
              return (
                <Appear key={p.id} delay={i * 40}>
                  <Card padding="sm" className={`flex items-center justify-between hover:border-brand-300 transition-colors ${isActive ? 'border-brand-400 bg-brand-50' : ''}`}>
                    <Link href={`/periods/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {p.period_number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatShortDate(p.start_date)} – {formatShortDate(p.end_date)}
                        </p>
                        {hasIncome ? (
                          <p className="text-xs text-gray-500">
                            Income: {formatCurrency(Number(p.primary_income) + Number(p.partner_income ?? 0))}
                          </p>
                        ) : (
                          <p className="text-xs text-brand-500 font-medium">+ Set income</p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {p.is_three_paycheck_month && <Badge variant="purple">3rd paycheck month 🎉</Badge>}
                      {isActive && <Badge variant="success">Current</Badge>}
                      {isPast && !isActive && <Badge>Past</Badge>}
                      {hasIncome && (
                        <Link href={`/budget?period=${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-2.5 py-1 transition-colors"
                        >
                          Budget
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </Card>
                </Appear>
              );
            })}
          </div>
          </>
        )}
      </div>

      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title={`Generate ${YEAR} pay periods`}>
        <p className="text-sm text-gray-500 mb-4">
          Enter the date of your <strong>first paycheck</strong> in {YEAR}. We'll generate all 26 biweekly periods automatically.
        </p>
        <Input
          label="First paycheck date"
          type="date"
          value={payStart}
          onChange={e => setPayStart(e.target.value)}
          helper="The date you received or will receive your first paycheck this year"
        />
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setShowGenerate(false)}>Cancel</Button>
          <Button className="flex-1" loading={generate.isPending} onClick={() => generate.mutate()} disabled={!payStart}>
            Generate
          </Button>
        </div>
      </Modal>
    </div>
  );
}
