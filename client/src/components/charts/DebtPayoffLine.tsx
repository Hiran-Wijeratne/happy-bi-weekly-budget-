'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface DataPoint { label: string; balance: number }

export function DebtPayoffLine({ data }: { data: DataPoint[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No debt data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Line type="monotone" dataKey="balance" stroke="#ef4444" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
