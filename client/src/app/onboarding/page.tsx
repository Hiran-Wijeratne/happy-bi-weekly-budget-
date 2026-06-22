'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation } from '@tanstack/react-query';
import type { User } from '@/types/api';

const YEAR = new Date().getFullYear();
const STEPS = ['Welcome', 'Pay schedule', 'Income', 'Done'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step,        setStep]        = useState(0);

  // Skip onboarding if already completed (handles all re-entry paths)
  useEffect(() => {
    apiFetch<User>('/users/me')
      .then(u => { if (u.onboarding_done) router.replace('/dashboard'); })
      .catch(() => {});
  }, [router]);
  const [payStart,    setPayStart]    = useState('');
  const [primary,     setPrimary]     = useState('');
  const [partner,     setPartner]     = useState('');
  const [currentPeriodId, setCurrentPeriodId] = useState('');

  const generatePeriods = useMutation({
    mutationFn: () => apiFetch<{ id: string; period_number: number; start_date: string; end_date: string }[]>('/periods/generate', {
      method: 'POST',
      body: JSON.stringify({ year: YEAR, pay_start_date: payStart }),
    }),
    onSuccess: (periods) => {
      const today = new Date().toISOString().split('T')[0];
      const current = periods.find(p => p.start_date <= today && today <= p.end_date);
      if (current) setCurrentPeriodId(current.id);
      setStep(2);
    },
  });

  const saveIncomeAndFinish = useMutation({
    mutationFn: async () => {
      if (currentPeriodId && primary) {
        await apiFetch(`/periods/${currentPeriodId}`, {
          method: 'PATCH',
          body: JSON.stringify({ primary_income: Number(primary), partner_income: Number(partner || 0) }),
        });
      }
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ pay_start_date: payStart, onboarding_done: true }),
      });
    },
    onSuccess: () => router.replace('/dashboard'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f4ede0' }}>
      <div className="w-full max-w-md">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors`}
                style={{ background: i <= step ? '#2e7d52' : '#e8e3d8', color: i <= step ? '#fff' : '#6a7e6a' }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="h-0.5 flex-1 transition-colors"
                style={{ background: i < step ? '#4a9a6a' : '#e8e3d8' }} />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1c2e1c' }}>Welcome to Happy BudgetFlow!</h1>
            <p className="text-sm mb-6" style={{ color: '#6a7e6a' }}>
              Let's get you set up in 2 quick steps. We'll generate your 26 biweekly pay periods
              and set up your first paycheck.
            </p>
            <Button className="w-full" onClick={() => setStep(1)}>Get started →</Button>
          </div>
        )}

        {/* Step 1: Pay schedule */}
        {step === 1 && (
          <div className="rounded-2xl p-8" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#1c2e1c' }}>When's your first paycheck?</h2>
            <p className="text-sm mb-6" style={{ color: '#6a7e6a' }}>
              Enter the date of your first paycheck of {YEAR}. We'll build all 26 pay periods from this anchor.
            </p>
            <Input
              label={`First paycheck date in ${YEAR}`}
              type="date"
              value={payStart}
              onChange={e => setPayStart(e.target.value)}
              helper="This is the day you receive (or received) your first paycheck of the year."
            />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" loading={generatePeriods.isPending} disabled={!payStart} onClick={() => generatePeriods.mutate()}>
                Generate periods
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Income */}
        {step === 2 && (
          <div className="rounded-2xl p-8" style={{ background: '#ffffff', border: '1px solid #e8e3d8', boxShadow: '0 1px 8px rgba(28,46,28,0.07)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#1c2e1c' }}>What's your typical paycheck?</h2>
            <p className="text-sm mb-6" style={{ color: '#6a7e6a' }}>
              Enter your take-home pay (after taxes). You can adjust this for each paycheck later.
            </p>
            <div className="space-y-4">
              <Input
                label="Primary paycheck amount ($)"
                type="number" min="0" step="0.01"
                value={primary}
                onChange={e => setPrimary(e.target.value)}
                placeholder="e.g. 1850.00"
              />
              <Input
                label="Partner paycheck amount ($ optional)"
                type="number" min="0" step="0.01"
                value={partner}
                onChange={e => setPartner(e.target.value)}
                placeholder="Leave blank if not applicable"
                helper="If you share finances with a partner, enter their biweekly take-home too."
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" loading={saveIncomeAndFinish.isPending} onClick={() => saveIncomeAndFinish.mutate()}>
                Go to dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
