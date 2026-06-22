'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface DataPoint { name: string; budgeted: number; actual: number }

type Filter = 'all' | 'over';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value ?? 0;
  const actual   = payload.find((p: any) => p.dataKey === 'actual')?.value ?? 0;
  const over     = actual > budgeted;
  const diff     = Math.abs(actual - budgeted);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e4ede8',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(58,144,104,0.14)',
      minWidth: 170,
    }}>
      <p style={{ color: '#3a9068', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#9ab0a4' }}>Budgeted</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#96c8b0' }}>{formatCurrency(budgeted)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
        <span style={{ fontSize: 11, color: '#9ab0a4' }}>Actual</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: over ? '#b86a80' : '#3a9068' }}>
          {formatCurrency(actual)}
        </span>
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f8f4' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: over ? '#b86a80' : '#3a9068' }}>
          {over ? `▲ ${formatCurrency(diff)} over` : `▼ ${formatCurrency(diff)} under`}
        </span>
      </div>
    </div>
  );
}

function truncate(s: string, n = 11) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function BudgetVsActualBar({ data }: { data: DataPoint[] }) {
  const [filter, setFilter]   = useState<Filter>('all');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No budget data yet</p>;
  }

  const display = (filter === 'over' ? data.filter(d => d.actual > d.budgeted) : data)
    .map(d => ({ ...d, _shortName: truncate(d.name) }));

  const overCount = data.filter(d => d.actual > d.budgeted).length;

  return (
    <div>
      {/* Filter toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['all', 'over'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: 11, fontWeight: 600,
              padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
              transition: 'all 0.18s',
              background: filter === f ? '#3a9068' : '#f0f8f4',
              color:      filter === f ? '#ffffff'  : '#5a7a68',
            }}
          >
            {f === 'all' ? 'All categories' : `Over budget${overCount > 0 ? ` (${overCount})` : ''}`}
          </button>
        ))}
      </div>

      {display.length === 0 ? (
        <p style={{ color: '#6aaf90', textAlign: 'center', padding: '24px 0', fontSize: 13, fontWeight: 600 }}>
          ✓ All categories are on or under budget
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, display.length * 40)}>
          <BarChart
            data={display}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            barCategoryGap="30%"
            barGap={3}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <XAxis
              type="number"
              tickFormatter={v => v === 0 ? '' : `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#c8e0d4' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="_shortName"
              tick={{ fontSize: 11, fill: '#5a7a68' }}
              axisLine={false} tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,224,212,0.15)' }} />

            {/* Budgeted — soft mint track */}
            <Bar dataKey="budgeted" name="Budgeted" radius={[0, 6, 6, 0]} barSize={7}>
              {display.map((_, i) => (
                <Cell
                  key={i}
                  fill="#c8e0d4"
                  style={{ opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4, transition: 'opacity 0.18s' }}
                  onMouseEnter={() => setHoverIdx(i)}
                />
              ))}
            </Bar>

            {/* Actual — green or pink per bar */}
            <Bar dataKey="actual" name="Actual" radius={[0, 6, 6, 0]} barSize={7}>
              {display.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.actual > d.budgeted ? '#b86a80' : '#3a9068'}
                  style={{ opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4, transition: 'opacity 0.18s' }}
                  onMouseEnter={() => setHoverIdx(i)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
        {[
          { color: '#c8e0d4', label: 'Budgeted' },
          { color: '#3a9068', label: 'On track' },
          { color: '#b86a80', label: 'Over budget' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: '#9ab0a4' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
