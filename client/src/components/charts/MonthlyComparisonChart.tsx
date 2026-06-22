'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import type { PaycheckPeriod } from '@/types/api';

type Period = PaycheckPeriod & { total_spent: string; total_budgeted: string };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function groupByMonth(periods: Period[]) {
  const map = new Map<number, { income: number; spent: number; budgeted: number; name: string }>();
  for (const p of periods) {
    const m = new Date(p.start_date + 'T00:00:00').getMonth();
    const cur = map.get(m) ?? { income: 0, spent: 0, budgeted: 0, name: MONTHS[m] };
    map.set(m, {
      name:     cur.name,
      income:   cur.income + Number(p.primary_income ?? 0) + Number(p.partner_income ?? 0),
      spent:    cur.spent  + Number(p.total_spent ?? 0),
      budgeted: cur.budgeted + Number(p.total_budgeted ?? 0),
    });
  }
  return [...map.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const income   = payload.find((p: any) => p.dataKey === 'income')?.value ?? 0;
  const spent    = payload.find((p: any) => p.dataKey === 'spent')?.value  ?? 0;
  const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value ?? 0;
  const rate     = income > 0 ? Math.round((spent / income) * 100) : 0;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e4ede8', borderRadius: 12,
      padding: '10px 16px', boxShadow: '0 8px 28px rgba(58,144,104,0.13)', minWidth: 180,
    }}>
      <p style={{ color: '#3a9068', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{label}</p>
      {[
        { k: 'income',   label: 'Income',   color: '#6aaf90', v: income   },
        { k: 'budgeted', label: 'Budgeted', color: '#c8e0d4', v: budgeted },
        { k: 'spent',    label: 'Spent',    color: '#b86a80', v: spent    },
      ].map(r => (
        <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 3 }}>
          <span style={{ fontSize: 11, color: '#9ab0a4' }}>{r.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{formatCurrency(r.v)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #f0f8f4', paddingTop: 6, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: spent > income ? '#b86a80' : '#3a9068', fontWeight: 600 }}>
          {rate}% of income spent
        </span>
      </div>
    </div>
  );
}

export function MonthlyComparisonChart({ periods }: { periods: Period[] }) {
  const [metric, setMetric] = useState<'spent' | 'net'>('spent');

  const monthly = groupByMonth(periods.filter(p =>
    Number(p.primary_income) > 0 || Number(p.total_spent) > 0,
  ));

  const chartData = monthly.map(m => ({
    ...m,
    net: m.income - m.spent,
  }));

  if (chartData.length === 0) {
    return <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No monthly data yet</p>;
  }

  const avgSpent = chartData.reduce((s, d) => s + d.spent, 0) / chartData.length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['spent', 'Spending by month'], ['net', 'Monthly net']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMetric(m)} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            transition: 'all 0.18s',
            background: metric === m ? '#3a9068' : '#f0f8f4',
            color:      metric === m ? '#fff'     : '#5a7a68',
          }}>{label}</button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ab0a4' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => v === 0 ? '' : `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#c8e0d4' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,224,212,0.14)' }} />

          {metric === 'spent' ? (
            <>
              <ReferenceLine y={avgSpent} stroke="#b86a80" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.5} />
              <Bar dataKey="income"   fill="#e8f4ee" radius={[6,6,0,0]} barSize={14} />
              <Bar dataKey="spent" radius={[6,6,0,0]} barSize={14}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.spent > d.income ? '#b86a80' : '#3a9068'} />
                ))}
              </Bar>
            </>
          ) : (
            <Bar dataKey="net" radius={[6,6,0,0]} barSize={18}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.net >= 0 ? '#3a9068' : '#b86a80'} fillOpacity={0.85} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        {(metric === 'spent'
          ? [{ color: '#e8f4ee', label: 'Monthly income' }, { color: '#3a9068', label: 'Spending (on track)' }, { color: '#b86a80', label: 'Spending (over)' }]
          : [{ color: '#3a9068', label: 'Positive net' }, { color: '#b86a80', label: 'Deficit month' }]
        ).map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: '#9ab0a4' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
