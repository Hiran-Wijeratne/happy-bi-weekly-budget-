'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, pct, formatPeriodOption } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { SinkingFund, PaycheckPeriod } from '@/types/api';

const YEAR = new Date().getFullYear();
const COLORS = ['#339966','#55b280','#8ecfaa','#f59e0b','#10b981','#ef4444','#f97316','#ec4899'];

const FREQ_LABEL: Record<string, string> = {
  monthly: 'monthly', biweekly: 'per paycheck', quarterly: 'quarterly',
  semi_annual: 'semi-annual', annual: 'annual',
};

export default function SinkingFundsPage() {
  const qc = useQueryClient();
  const [showAdd,    setShowAdd]    = useState(false);
  const [showContrib, setShowContrib] = useState<SinkingFund | null>(null);
  const [form, setForm] = useState({
    name: '', target_amount: '', per_period_amount: '', due_date: '', icon: '🏦', color: COLORS[0],
  });
  const [contrib, setContrib] = useState({
    period_id: '', amount: '', contributed_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const { data: funds = [], isLoading } = useQuery<SinkingFund[]>({
    queryKey: ['sinking-funds'],
    queryFn: () => apiFetch('/sinking-funds'),
  });
  const { data: periods = [] } = useQuery<PaycheckPeriod[]>({
    queryKey: ['periods', YEAR],
    queryFn: () => apiFetch(`/periods?year=${YEAR}`),
  });

  const addFund = useMutation({
    mutationFn: () => apiFetch('/sinking-funds', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        target_amount:     Number(form.target_amount),
        per_period_amount: Number(form.per_period_amount),
        due_date:          form.due_date || undefined,
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sinking-funds'] });
      setShowAdd(false);
      setForm({ name:'', target_amount:'', per_period_amount:'', due_date:'', icon:'🏦', color:COLORS[0] });
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteFund = useMutation({
    mutationFn: (id: string) => apiFetch(`/sinking-funds/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sinking-funds'] }),
  });

  const addContrib = useMutation({
    mutationFn: () => apiFetch(`/sinking-funds/${showContrib!.id}/contributions`, {
      method: 'POST',
      body: JSON.stringify({ ...contrib, amount: Number(contrib.amount) }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sinking-funds'] });
      setShowContrib(null);
      setContrib(f => ({ ...f, amount: '' }));
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const autoFillPerPeriod = () => {
    if (!form.target_amount || !form.due_date) return;
    const periodsLeft = periods.filter(p => p.start_date >= new Date().toISOString().split('T')[0]).length;
    if (periodsLeft > 0) {
      const perPeriod = (Number(form.target_amount) / periodsLeft).toFixed(2);
      setForm(f => ({ ...f, per_period_amount: perPeriod }));
    }
  };

  if (isLoading) return <PageLoader cards={3} />;

  return (
    <div>
      <Header
        title="Sinking Funds"
        subtitle="Save a little each paycheck for big irregular expenses"
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ New fund</Button>}
      />
      <div className="p-6 space-y-4">

        {/* Explainer */}
        {funds.length === 0 && (
          <Card className="bg-brand-50 border-brand-200">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">What's a sinking fund?</p>
                <p className="text-xs text-brand-700 mt-1">
                  A sinking fund sets aside a fixed amount every paycheck for a known future expense — car insurance,
                  holiday gifts, annual subscriptions. When the bill arrives, the money is already there.
                </p>
              </div>
            </div>
          </Card>
        )}

        {funds.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-3xl mb-2">🏦</p>
            <p className="text-gray-500 text-sm mb-4">No sinking funds yet.</p>
            <Button size="sm" onClick={() => setShowAdd(true)}>Create first fund</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.map((f, i) => {
              const current = Number(f.current_balance);
              const target  = Number(f.target_amount);
              const p       = pct(current, target);
              const remaining = Math.max(0, target - current);
              return (
                <Appear key={f.id} delay={i * 60}><Card>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{f.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(Number(f.per_period_amount))}/paycheck
                          {f.due_date ? ` · due ${formatDate(f.due_date)}` : ''}
                        </p>
                      </div>
                    </div>
                    {f.is_funded && <Badge variant="success">Funded!</Badge>}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">{formatCurrency(current)} saved</span>
                    <span className="font-medium text-gray-700">of {formatCurrency(target)}</span>
                  </div>
                  <ProgressBar value={current} max={target} color={f.color ?? undefined} />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">{p}% funded</p>
                    {remaining > 0 && <p className="text-xs text-gray-400">{formatCurrency(remaining)} to go</p>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" className="flex-1"
                      onClick={() => { setContrib(f2 => ({ ...f2, period_id: '', amount: String(f.per_period_amount) })); setShowContrib(f); }}>
                      Add contribution
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteFund.mutate(f.id)}>Remove</Button>
                  </div>
                </Card></Appear>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Fund Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New sinking fund">
        <div className="space-y-4">
          <Input label="Fund name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Car insurance, Holiday gifts" />
          <Input label="Total needed ($)" type="number" min="1" step="1" value={form.target_amount}
            onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} placeholder="600" />
          <Input label="Due date (optional)" type="date" value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          <div>
            <Input label="Save per paycheck ($)" type="number" min="0.01" step="0.01"
              value={form.per_period_amount}
              onChange={e => setForm(f => ({ ...f, per_period_amount: e.target.value }))} placeholder="50.00" />
            {form.target_amount && form.due_date && (
              <button className="text-xs text-brand-600 mt-1 hover:underline" onClick={autoFillPerPeriod}>
                Auto-calculate from remaining periods
              </button>
            )}
          </div>
          <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏦" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={addFund.isPending} onClick={() => addFund.mutate()}
              disabled={!form.name || !form.target_amount || !form.per_period_amount}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Contribution Modal */}
      <Modal open={!!showContrib} onClose={() => setShowContrib(null)} title={`Add to ${showContrib?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay period</label>
            <select className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              value={contrib.period_id} onChange={e => setContrib(f => ({ ...f, period_id: e.target.value }))}>
              <option value="">Select period…</option>
              {periods.map(p => (
                <option key={p.id} value={p.id}>
                  {formatPeriodOption(p.period_number, p.start_date, p.end_date, p.is_three_paycheck_month)}
                </option>
              ))}
            </select>
          </div>
          <Input label="Amount ($)" type="number" min="0.01" step="0.01" value={contrib.amount}
            onChange={e => setContrib(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          <Input label="Date" type="date" value={contrib.contributed_date}
            onChange={e => setContrib(f => ({ ...f, contributed_date: e.target.value }))} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowContrib(null)}>Cancel</Button>
            <Button className="flex-1" loading={addContrib.isPending} onClick={() => addContrib.mutate()}
              disabled={!contrib.amount || !contrib.period_id}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
