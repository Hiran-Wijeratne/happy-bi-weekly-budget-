'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatPeriodOption } from '@/lib/utils';
import { SkeletonList } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { PaycheckPeriod, ExpenseCategory, Expense } from '@/types/api';

const YEAR = new Date().getFullYear();

function exportCsv(expenses: Expense[], label: string) {
  const header = 'Date,Category,Description,Amount';
  const rows = expenses.map(e =>
    [e.expense_date, e.category_name, `"${(e.description ?? '').replace(/"/g, '""')}"`, Number(e.amount).toFixed(2)].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `expenses-${label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [periodId, setPeriodId]   = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm]           = useState({ category_id: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
  const [error, setError]         = useState('');

  const { data: periods = [] } = useQuery<PaycheckPeriod[]>({
    queryKey: ['periods', YEAR],
    queryFn:  () => apiFetch(`/periods?year=${YEAR}`),
  });

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ['categories'],
    queryFn:  () => apiFetch('/categories'),
  });

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses', periodId],
    queryFn:  () => apiFetch(`/expenses?period_id=${periodId}`),
    enabled:  !!periodId,
  });

  useEffect(() => {
    if (!periodId && periods.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const current = periods.find(p => p.start_date <= today && today <= p.end_date);
      setPeriodId((current ?? periods[0]).id);
    }
  }, [periods, periodId]);

  useEffect(() => {
    if (categories.length > 0 && !form.category_id) {
      setForm(f => ({ ...f, category_id: categories[0].id }));
    }
  }, [categories, form.category_id]);

  const addExpense = useMutation({
    mutationFn: () => apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify({ ...form, period_id: periodId, amount: Number(form.amount) }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', periodId] });
      setShowAdd(false);
      setForm(f => ({ ...f, amount: '', description: '' }));
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses', periodId] }); setRemovingId(null); },
  });

  const handleDelete = (id: string) => {
    setRemovingId(id);
    setTimeout(() => deleteExpense.mutate(id), 220);
  };

  const exportYear = useQuery<Expense[]>({
    queryKey: ['expenses-year', YEAR],
    queryFn:  () => apiFetch(`/expenses?year=${YEAR}`),
    enabled:  false,
  });

  const handleExportYear = async () => {
    const data = await exportYear.refetch();
    if (data.data) {
      exportCsv(data.data, String(YEAR));
    }
  };

  const selectedPeriod = periods.find(p => p.id === periodId);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <Header
        title="Expenses"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleExportYear}>⬇ Export year CSV</Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>+ Add expense</Button>
          </div>
        }
      />
      <div className="p-6 space-y-4">

        {/* Period selector */}
        <Card padding="sm">
          <select
            className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
            value={periodId}
            onChange={e => setPeriodId(e.target.value)}
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {formatPeriodOption(p.period_number, p.start_date, p.end_date, p.is_three_paycheck_month)}
              </option>
            ))}
          </select>
        </Card>

        {isLoading ? (
          <SkeletonList count={5} />
        ) : expenses.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-gray-500 text-sm">No expenses for this period yet.</p>
            <Button className="mt-4" size="sm" onClick={() => setShowAdd(true)}>Add first expense</Button>
          </Card>
        ) : (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>Transactions</CardTitle>
              <div className="flex items-center gap-3">
                <button
                  className="text-xs text-brand-600 hover:underline"
                  onClick={() => exportCsv(expenses, selectedPeriod
                    ? `period-${selectedPeriod.period_number}-${YEAR}`
                    : 'period')}
                >
                  ⬇ Export period
                </button>
                <span className="text-sm font-semibold text-red-600">Total: {formatCurrency(total)}</span>
              </div>
            </div>
            <div className="space-y-0">
              {expenses.map((e, i) => (
                <Appear
                  key={e.id}
                  delay={i * 35}
                  className={`overflow-hidden transition-all duration-220 ease-in ${
                    removingId === e.id ? 'animate-slide-out' : ''
                  }`}
                >
                  <div className={`flex items-center gap-3 py-2.5 border-b border-[#e8e3d8] last:border-0 group ${
                    removingId !== e.id ? 'animate-fade-in' : ''
                  }`}
                    style={removingId !== e.id ? { animationDelay: `${i * 35}ms` } : undefined}
                  >
                    <span className="text-lg flex-shrink-0">{e.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.description || e.category_name}</p>
                      <p className="text-xs text-gray-400 truncate">{formatDate(e.expense_date)} · {e.category_name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(e.amount))}</span>
                      <button
                        className="text-gray-300 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100 touch-action-manipulation"
                        onClick={() => handleDelete(e.id)}
                      >✕</button>
                    </div>
                  </div>
                </Appear>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add expense">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <Input label="Amount ($)" type="number" min="0.01" step="0.01" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          <Input label="Description (optional)" type="text" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Grocery run" />
          <Input label="Date" type="date" value={form.expense_date}
            onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={addExpense.isPending} onClick={() => addExpense.mutate()}
              disabled={!form.amount || !form.category_id}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
