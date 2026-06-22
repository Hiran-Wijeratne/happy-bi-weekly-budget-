'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import type { PaycheckPeriod } from '@/types/api';

type Period = PaycheckPeriod & { total_spent: string; total_budgeted: string };

interface Props { periods: Period[] }

const FMT = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const income  = payload.find((p: any) => p.dataKey === 'income')?.value  ?? 0;
  const spent   = payload.find((p: any) => p.dataKey === 'spent')?.value   ?? 0;
  const savings = income - spent;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e4ede8', borderRadius: 12,
      padding: '10px 16px', boxShadow: '0 8px 28px rgba(58,144,104,0.13)', minWidth: 180,
    }}>
      <p style={{ color: '#9ab0a4', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#9ab0a4' }}>Income</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6aaf90' }}>{formatCurrency(income)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#9ab0a4' }}>Spent</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#b86a80' }}>{formatCurrency(spent)}</span>
      </div>
      <div style={{ borderTop: '1px solid #f0f8f4', paddingTop: 6, marginTop: 2, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
        <span style={{ fontSize: 11, color: '#9ab0a4' }}>Saved</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: savings >= 0 ? '#3a9068' : '#b86a80' }}>{formatCurrency(savings)}</span>
      </div>
    </div>
  );
}

export function SpendingTrendChart({ periods }: Props) {
  const [mode, setMode] = useState<'all' | 'active'>('active');

  const data = periods
    .filter(p => mode === 'all' || Number(p.primary_income) > 0 || Number(p.total_spent) > 0)
    .map(p => ({
      label:  FMT(p.start_date),
      income: Number(p.primary_income ?? 0) + Number(p.partner_income ?? 0),
      spent:  Number(p.total_spent ?? 0),
      period: p.period_number,
    }));

  if (data.length === 0) {
    return <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No period data yet</p>;
  }

  const avgSpent = data.reduce((s, d) => s + d.spent, 0) / data.length;

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['active', 'all'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            transition: 'all 0.18s',
            background: mode === m ? '#3a9068' : '#f0f8f4',
            color:      mode === m ? '#fff'     : '#5a7a68',
          }}>
            {m === 'active' ? 'Active periods' : 'All 26 periods'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6aaf90" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6aaf90" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#b86a80" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#b86a80" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke="#f0f8f4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ab0a4' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#9ab0a4' }} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avgSpent} stroke="#b86a80" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'avg spend', position: 'insideTopRight', fill: '#b86a80', fontSize: 9 }} />
          <Area type="monotone" dataKey="income" stroke="#6aaf90" strokeWidth={2} fill="url(#gradIncome)" dot={false} activeDot={{ r: 5, fill: '#6aaf90', strokeWidth: 0 }} />
          <Area type="monotone" dataKey="spent"  stroke="#b86a80" strokeWidth={2} fill="url(#gradSpent)"  dot={false} activeDot={{ r: 5, fill: '#b86a80', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        {[{ color: '#6aaf90', label: 'Income per period' }, { color: '#b86a80', label: 'Spending per period' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 20, height: 2, background: l.color, display: 'inline-block', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: '#9ab0a4' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
