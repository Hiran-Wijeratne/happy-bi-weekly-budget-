'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { RecurringBill } from '@/types/api';

const FREQ_LABEL: Record<string, string> = {
  weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly',
  quarterly: 'Quarterly', semi_annual: 'Semi-annual', annual: 'Annual',
};

const FREQ_ANNUAL: Record<string, number> = {
  weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, semi_annual: 2, annual: 1,
};

export default function BillsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', amount: '', due_day: '', frequency: 'monthly', icon: '📄', notes: '',
  });
  const [error, setError] = useState('');

  const { data: bills = [], isLoading } = useQuery<RecurringBill[]>({
    queryKey: ['bills'],
    queryFn: () => apiFetch('/bills'),
  });

  const addBill = useMutation({
    mutationFn: () => apiFetch('/bills', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        amount:  Number(form.amount),
        due_day: form.due_day ? Number(form.due_day) : undefined,
        notes:   form.notes || undefined,
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      setShowAdd(false);
      setForm({ name:'', amount:'', due_day:'', frequency:'monthly', icon:'📄', notes:'' });
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiFetch(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });

  const deleteBill = useMutation({
    mutationFn: (id: string) => apiFetch(`/bills/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });

  if (isLoading) return <PageLoader cards={2} />;

  const active   = bills.filter(b => b.is_active);
  const inactive = bills.filter(b => !b.is_active);

  const monthlyTotal = active.reduce((sum, b) => {
    const annual = Number(b.amount) * (FREQ_ANNUAL[b.frequency] ?? 12);
    return sum + annual / 12;
  }, 0);

  const annualTotal = active.reduce((sum, b) => {
    return sum + Number(b.amount) * (FREQ_ANNUAL[b.frequency] ?? 12);
  }, 0);

  return (
    <div>
      <Header
        title="Recurring Bills"
        subtitle="Track your fixed bills so nothing sneaks up on you"
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Add bill</Button>}
      />
      <div className="p-6 space-y-4">

        {/* Summary */}
        {active.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-400 mb-1">Monthly avg (active)</p>
              <p className="font-bold text-gray-900">{formatCurrency(monthlyTotal)}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-400 mb-1">Annual total</p>
              <p className="font-bold text-gray-900">{formatCurrency(annualTotal)}</p>
            </Card>
          </div>
        )}

        {bills.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-gray-500 text-sm mb-4">No recurring bills yet. Add rent, utilities, subscriptions…</p>
            <Button size="sm" onClick={() => setShowAdd(true)}>Add first bill</Button>
          </Card>
        ) : (
          <>
            {active.length > 0 && (
              <Card>
                <CardTitle className="mb-4">Active bills</CardTitle>
                <div className="space-y-0">
                  {active.map((b, i) => (
                    <Appear key={b.id} delay={i * 40}><div className="flex items-center gap-3 py-2.5 border-b border-[#e8e3d8] last:border-0 group">
                      <span className="text-lg w-7 text-center flex-shrink-0">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {FREQ_LABEL[b.frequency] ?? b.frequency}
                          {b.due_day ? ` · due ${b.due_day}${ordinal(b.due_day)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(b.amount))}</span>
                        {/* Always visible on touch, hover-reveal on desktop */}
                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-gray-400 hover:text-yellow-600 px-1 py-1"
                            onClick={() => toggleActive.mutate({ id: b.id, is_active: false })}>Pause</button>
                          <button className="text-gray-300 hover:text-red-500 transition-colors px-1 py-1"
                            onClick={() => deleteBill.mutate(b.id)}>✕</button>
                        </div>
                      </div>
                    </div></Appear>
                  ))}
                </div>
              </Card>
            )}

            {inactive.length > 0 && (
              <Card>
                <CardTitle className="mb-4">Paused bills</CardTitle>
                <div className="space-y-0">
                  {inactive.map((b, i) => (
                    <Appear key={b.id} delay={i * 40}><div className="flex items-center gap-3 py-2.5 border-b border-[#e8e3d8] last:border-0 group opacity-50">
                      <span className="text-lg w-7 text-center flex-shrink-0">{b.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.name}</p>
                        <p className="text-xs text-gray-400">{FREQ_LABEL[b.frequency] ?? b.frequency}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold text-sm text-gray-400 tabular-nums">{formatCurrency(Number(b.amount))}</span>
                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-brand-600 hover:underline px-1 py-1"
                            onClick={() => toggleActive.mutate({ id: b.id, is_active: true })}>Resume</button>
                          <button className="text-gray-300 hover:text-red-500 px-1 py-1"
                            onClick={() => deleteBill.mutate(b.id)}>✕</button>
                        </div>
                      </div>
                    </div></Appear>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Add Bill Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add recurring bill">
        <div className="space-y-4">
          <Input label="Bill name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Netflix, Rent, Car insurance" />
          <Input label="Amount ($)" type="number" min="0.01" step="0.01" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              {Object.entries(FREQ_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <Input label="Due day of month (1–28, optional)" type="number" min="1" max="28" value={form.due_day}
            onChange={e => setForm(f => ({ ...f, due_day: e.target.value }))} placeholder="e.g. 15" />
          <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="📄" />
          <Input label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. Cancel before renewal" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={addBill.isPending} onClick={() => addBill.mutate()}
              disabled={!form.name || !form.amount}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
