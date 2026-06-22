'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, pct, formatPeriodOption } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { DebtAccount, PaycheckPeriod } from '@/types/api';

const YEAR = new Date().getFullYear();
const ACCOUNT_TYPES = ['credit_card','student_loan','auto_loan','mortgage','personal_loan','medical','other'];

export default function DebtsPage() {
  const qc = useQueryClient();
  const [showAdd,    setShowAdd]    = useState(false);
  const [showPay,    setShowPay]    = useState<DebtAccount | null>(null);
  const [form,       setForm]       = useState({ name: '', account_type: 'credit_card', original_balance: '', current_balance: '', interest_rate: '', minimum_payment: '' });
  const [payForm,    setPayForm]    = useState({ period_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0] });
  const [error,      setError]      = useState('');

  const { data: debts = [], isLoading } = useQuery<DebtAccount[]>({ queryKey: ['debts'], queryFn: () => apiFetch('/debts') });
  const { data: periods = [] } = useQuery<PaycheckPeriod[]>({ queryKey: ['periods', YEAR], queryFn: () => apiFetch(`/periods?year=${YEAR}`) });

  const addDebt = useMutation({
    mutationFn: () => apiFetch('/debts', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        original_balance: form.original_balance ? Number(form.original_balance) : undefined,
        current_balance:  Number(form.current_balance),
        interest_rate:    form.interest_rate ? Number(form.interest_rate) / 100 : undefined,
        minimum_payment:  form.minimum_payment ? Number(form.minimum_payment) : undefined,
      }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['debts'] }); setShowAdd(false); setForm({ name:'',account_type:'credit_card',original_balance:'',current_balance:'',interest_rate:'',minimum_payment:'' }); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteDebt = useMutation({
    mutationFn: (id: string) => apiFetch(`/debts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  });

  const logPayment = useMutation({
    mutationFn: () => apiFetch(`/debts/${showPay!.id}/payments`, {
      method: 'POST',
      body: JSON.stringify({ ...payForm, amount: Number(payForm.amount) }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['debts'] }); setShowPay(null); setPayForm(f => ({ ...f, amount: '' })); },
    onError: (e: Error) => setError(e.message),
  });

  const totalDebt = debts.filter(d => !d.is_paid_off).reduce((s, d) => s + Number(d.current_balance), 0);

  if (isLoading) return <PageLoader cards={3} />;

  return (
    <div>
      <Header title="Debt Tracker" subtitle="Track balances and log payments each paycheck" action={<Button size="sm" onClick={() => setShowAdd(true)}>+ Add debt</Button>} />
      <div className="p-6 space-y-4">

        {totalDebt > 0 && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-sm text-red-700 font-medium">Total remaining debt</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalDebt)}</p>
          </Card>
        )}

        {debts.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-gray-500 text-sm mb-4">No debts tracked yet. Add your first account.</p>
            <Button size="sm" onClick={() => setShowAdd(true)}>Add debt account</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {debts.map((d, i) => {
              const orig = Number(d.original_balance ?? d.current_balance);
              const curr = Number(d.current_balance);
              const paid = orig - curr;
              const progress = pct(paid, orig);
              return (
                <Appear key={d.id} delay={i * 60}><Card>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{d.name}</p>
                        {d.is_paid_off && <Badge variant="success" className="flex-shrink-0">Paid off!</Badge>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d.account_type.replace(/_/g,' ')}
                        {d.interest_rate ? ` · ${(Number(d.interest_rate)*100).toFixed(2)}% APR` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-red-600 tabular-nums">{formatCurrency(curr)}</p>
                      {d.minimum_payment && (
                        <p className="text-xs text-gray-400">Min: {formatCurrency(Number(d.minimum_payment))}</p>
                      )}
                    </div>
                  </div>
                  <ProgressBar value={paid} max={orig} color="#22c55e" size="md" />
                  <p className="text-xs text-gray-400 mt-1">{progress}% paid off · {formatCurrency(paid)} paid</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setPayForm(f => ({ ...f, period_id: '', amount: String(d.minimum_payment ?? '') })); setShowPay(d); }}>
                      Log payment
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteDebt.mutate(d.id)}>Remove</Button>
                  </div>
                </Card></Appear>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add debt account">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chase Visa" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}>
              {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
          </div>
          <Input label="Current balance ($)" type="number" min="0" step="0.01" value={form.current_balance} onChange={e => setForm(f => ({ ...f, current_balance: e.target.value }))} placeholder="0.00" />
          <Input label="Original balance ($, optional)" type="number" min="0" step="0.01" value={form.original_balance} onChange={e => setForm(f => ({ ...f, original_balance: e.target.value }))} placeholder="0.00" />
          <Input label="APR %" type="number" min="0" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} placeholder="e.g. 24.99" />
          <Input label="Minimum payment ($)" type="number" min="0" step="0.01" value={form.minimum_payment} onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} placeholder="0.00" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={addDebt.isPending} onClick={() => addDebt.mutate()} disabled={!form.name || !form.current_balance}>Add</Button>
          </div>
        </div>
      </Modal>

      {/* Log Payment Modal */}
      <Modal open={!!showPay} onClose={() => setShowPay(null)} title={`Log payment — ${showPay?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay period</label>
            <select className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              value={payForm.period_id} onChange={e => setPayForm(f => ({ ...f, period_id: e.target.value }))}>
              <option value="">Select period…</option>
              {periods.map(p => <option key={p.id} value={p.id}>{formatPeriodOption(p.period_number, p.start_date, p.end_date, p.is_three_paycheck_month)}</option>)}
            </select>
          </div>
          <Input label="Amount ($)" type="number" min="0.01" step="0.01" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          <Input label="Payment date" type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPay(null)}>Cancel</Button>
            <Button className="flex-1" loading={logPayment.isPending} onClick={() => logPayment.mutate()} disabled={!payForm.amount || !payForm.period_id}>Log payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
