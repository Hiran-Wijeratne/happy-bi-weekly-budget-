'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState, useMemo } from 'react';

interface DayPoint { date: string; total: number }

const RANGES = [30, 60, 90] as const;
type Range = typeof RANGES[number];

const FMT_DAY  = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const FMT_LONG = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1px solid #e4ede8', borderRadius: 12,
      padding: '10px 14px', boxShadow: '0 8px 28px rgba(58,144,104,0.13)',
    }}>
      <p style={{ color: '#9ab0a4', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 4 }}>
        {FMT_LONG(d.payload.date)}
      </p>
      <p style={{ fontSize: 16, fontWeight: 800, color: d.fill }}>{formatCurrency(d.value)}</p>
    </div>
  );
}

export function DailySpendingChart({ data }: { data: DayPoint[] }) {
  const [range, setRange] = useState<Range>(30);

  const slice = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-range);
  }, [data, range]);

  if (data.length === 0) {
    return <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No daily data yet</p>;
  }

  const avg    = slice.reduce((s, d) => s + d.total, 0) / slice.length;
  const maxDay = Math.max(...slice.map(d => d.total));

  /* Show every Nth label to avoid clutter */
  const labelEvery = range <= 30 ? 3 : range <= 60 ? 7 : 10;

  return (
    <div>
      {/* Range toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            transition: 'all 0.18s',
            background: range === r ? '#3a9068' : '#f0f8f4',
            color:      range === r ? '#fff'     : '#5a7a68',
          }}>Last {r} days</button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={slice} margin={{ top: 6, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
          <XAxis
            dataKey="date"
            tickFormatter={(d, i) => i % labelEvery === 0 ? FMT_DAY(d) : ''}
            tick={{ fontSize: 10, fill: '#9ab0a4' }}
            axisLine={false} tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={v => v === 0 ? '' : `$${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 10, fill: '#c8e0d4' }}
            axisLine={false} tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,224,212,0.14)' }} />
          <ReferenceLine
            y={avg}
            stroke="#b86a80" strokeDasharray="4 3" strokeWidth={1.5} strokeOpacity={0.6}
            label={{ value: 'avg', position: 'insideTopRight', fill: '#b86a80', fontSize: 9 }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={18}>
            {slice.map((d, i) => (
              <Cell
                key={i}
                fill={d.total >= avg * 1.5 ? '#b86a80'
                    : d.total >= avg       ? '#cc8fa4'
                    :                        '#3a9068'}
                fillOpacity={d.total === maxDay ? 1 : 0.82}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Daily avg',  value: formatCurrency(avg),    color: '#3a9068' },
          { label: 'Highest day', value: formatCurrency(maxDay), color: '#b86a80' },
          { label: 'Total',      value: formatCurrency(slice.reduce((s, d) => s + d.total, 0)), color: '#5a7a68' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 9, color: '#9ab0a4', fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
