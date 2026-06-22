'use client';

import { formatCurrency } from '@/lib/utils';
import type { PaycheckPeriod } from '@/types/api';

type Period = PaycheckPeriod & { total_spent: string; total_budgeted: string };

interface Props {
  periods: Period[];
  summary: { total_income: number; total_spent: number; net: number };
  year: number;
}

const TOTAL_PERIODS = 26;

function StatCard({
  label, value, sub, color, highlight,
}: { label: string; value: string; sub: string; color: string; highlight?: boolean }) {
  return (
    <div style={{
      flex: '1 1 180px',
      padding: '18px 20px',
      borderRadius: 16,
      background: highlight ? color + '12' : '#ffffff',
      border: `1.5px solid ${highlight ? color + '44' : '#e4ede8'}`,
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#9ab0a4', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1, marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: '#9ab0a4' }}>{sub}</p>
    </div>
  );
}

function ConfidenceBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#e4ede8', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: '#9ab0a4', minWidth: 32 }}>{pct}% confidence</span>
    </div>
  );
}

export function PredictionsPanel({ periods, summary, year }: Props) {
  const completed = periods.filter(p => Number(p.primary_income) > 0);
  const completedCount = completed.length;

  if (completedCount === 0) {
    return (
      <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
        Add income to at least one period to see forecasts
      </p>
    );
  }

  const remaining = TOTAL_PERIODS - completedCount;
  const avgIncome  = summary.total_income / completedCount;
  const avgSpent   = summary.total_spent  / completedCount;
  const avgNet     = avgIncome - avgSpent;

  const projIncome  = summary.total_income + avgIncome * remaining;
  const projSpent   = summary.total_spent  + avgSpent  * remaining;
  const projNet     = projIncome - projSpent;
  const projSavePct = projIncome > 0 ? Math.round((projNet / projIncome) * 100) : 0;

  const currentSavePct = summary.total_income > 0
    ? Math.round(((summary.total_income - summary.total_spent) / summary.total_income) * 100)
    : 0;

  // Confidence: the more periods completed, the higher the confidence
  const confidence = Math.min(95, Math.round((completedCount / TOTAL_PERIODS) * 100 + 15));

  // On-track assessment
  const onTrack = projNet > 0;
  const periodsSinceStart = completedCount;

  // Monthly run-rate
  const monthlySpend = avgSpent * 26 / 12;

  const cards = [
    {
      label:     'Projected year-end net',
      value:     formatCurrency(projNet),
      sub:       `Based on ${completedCount} completed periods`,
      color:     projNet >= 0 ? '#3a9068' : '#b86a80',
      highlight: true,
    },
    {
      label:     'Projected total income',
      value:     formatCurrency(projIncome),
      sub:       `${formatCurrency(avgIncome)} avg per period`,
      color:     '#6aaf90',
      highlight: false,
    },
    {
      label:     'Projected total spending',
      value:     formatCurrency(projSpent),
      sub:       `${formatCurrency(avgSpent)} avg per period`,
      color:     '#b86a80',
      highlight: false,
    },
    {
      label:     'Projected savings rate',
      value:     `${projSavePct}%`,
      sub:       `Currently at ${currentSavePct}% year-to-date`,
      color:     projSavePct >= 20 ? '#3a9068' : projSavePct >= 10 ? '#6aaf90' : '#b86a80',
      highlight: projSavePct >= 20,
    },
    {
      label:     'Monthly spending run-rate',
      value:     formatCurrency(monthlySpend),
      sub:       'Based on biweekly average × 26 ÷ 12',
      color:     '#5a7a68',
      highlight: false,
    },
    {
      label:     'Avg net per paycheck',
      value:     formatCurrency(avgNet),
      sub:       `${remaining} periods remaining in ${year}`,
      color:     avgNet >= 0 ? '#3a9068' : '#b86a80',
      highlight: false,
    },
  ];

  return (
    <div>
      {/* Confidence indicator */}
      <div style={{ marginBottom: 20 }}>
        <ConfidenceBar pct={confidence} color={confidence > 60 ? '#3a9068' : '#b86a80'} />
        <p style={{ fontSize: 10, color: '#9ab0a4', marginTop: 4 }}>
          Forecast based on {completedCount} of {TOTAL_PERIODS} periods — {remaining} periods remaining
        </p>
      </div>

      {/* Assessment banner */}
      <div style={{
        padding: '12px 18px',
        borderRadius: 12,
        background: onTrack ? '#f0f8f4' : '#f7edf0',
        border: `1px solid ${onTrack ? '#c8e0d4' : '#eedadf'}`,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{onTrack ? '✅' : '⚠️'}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: onTrack ? '#3a9068' : '#b86a80' }}>
            {onTrack
              ? `On track to save ${formatCurrency(projNet)} by end of ${year}`
              : `Spending is projected to exceed income by ${formatCurrency(Math.abs(projNet))}`}
          </p>
          <p style={{ fontSize: 11, color: '#9ab0a4', marginTop: 2 }}>
            {onTrack
              ? `That's a ${projSavePct}% savings rate — keep it up!`
              : 'Consider reducing spending in upcoming periods.'}
          </p>
        </div>
      </div>

      {/* Stat cards grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {cards.map(c => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
