'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import { AdviceCard } from '@/components/ui/AdviceCard';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { PaycheckPeriod, BudgetAllocation, Expense } from '@/types/api';

export default function PeriodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [editIncome, setEditIncome] = useState(false);
  const [primaryIncome,  setPrimary]  = useState('');
  const [partnerIncome,  setPartner]  = useState('');

  const { data: period } = useQuery<PaycheckPeriod>({
    queryKey: ['period', id],
    queryFn:  () => apiFetch(`/periods/${id}`),
    enabled:  !!id,
  });

  const { data: allocations = [] } = useQuery<BudgetAllocation[]>({
    queryKey: ['allocations', id],
    queryFn:  () => apiFetch(`/allocations?period_id=${id}`),
    enabled:  !!id,
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ['expenses', id],
    queryFn:  () => apiFetch(`/expenses?period_id=${id}`),
    enabled:  !!id,
  });

  const updatePeriod = useMutation({
    mutationFn: (data: object) => apiFetch(`/periods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['period', id] });
      setEditIncome(false);
    },
  });

  if (!period) return <PageLoader cards={3} />;

  const totalIncome  = Number(period.primary_income ?? 0) + Number(period.partner_income);
  const monthlyIncome = Math.round(totalIncome * 26 / 12);
  const totalPlanned = allocations.reduce((s, a) => s + Number(a.planned), 0);
  const totalSpent   = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining    = totalIncome - totalSpent;

  return (
    <div>
      <Header
        title={
          <span className="flex items-center gap-2">
            Paycheck
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">
              {period.period_number}
            </span>
          </span>
        }
        subtitle={`${formatShortDate(period.start_date)} – ${formatShortDate(period.end_date)}`}
      />
      <div className="p-6 space-y-6">

        {period.is_three_paycheck_month && (
          <Card className="bg-purple-50 border-purple-200">
            <div className="flex gap-3 items-center">
              <span className="text-2xl">🎉</span>
              <p className="font-medium text-purple-800">This is a 3-paycheck month! Consider putting extra toward debt or savings.</p>
            </div>
          </Card>
        )}

        {/* Income */}
        <Appear><Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Income</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => { setPrimary(period.primary_income ?? ''); setPartner(period.partner_income); setEditIncome(true); }}>
              Edit
            </Button>
          </div>
          {editIncome ? (
            <div className="space-y-3">
              <Input label="Primary income" type="number" min="0" step="0.01" value={primaryIncome} onChange={e => setPrimary(e.target.value)} />
              <Input label="Partner income (optional)" type="number" min="0" step="0.01" value={partnerIncome} onChange={e => setPartner(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditIncome(false)}>Cancel</Button>
                <Button size="sm" loading={updatePeriod.isPending} onClick={() => updatePeriod.mutate({ primary_income: Number(primaryIncome), partner_income: Number(partnerIncome) })}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Primary</p>
                <p className="font-semibold">{formatCurrency(Number(period.primary_income ?? 0))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Partner</p>
                <p className="font-semibold">{formatCurrency(Number(period.partner_income))}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          )}
        </Card></Appear>

        {/* Personalized advice based on this paycheck's income */}
        {totalIncome > 0 && <Appear delay={60}><AdviceCard monthlyIncome={monthlyIncome} /></Appear>}

        {/* Summary */}
        <Appear delay={80}><div className="grid grid-cols-3 gap-4">
          <Card padding="sm" className="text-center">
            <p className="text-xs text-gray-400 mb-1">Budgeted</p>
            <p className="font-semibold">{formatCurrency(totalPlanned)}</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-gray-400 mb-1">Spent</p>
            <p className="font-semibold text-red-600">{formatCurrency(totalSpent)}</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-gray-400 mb-1">Left</p>
            <p className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(remaining)}</p>
          </Card>
        </div></Appear>

        {/* Allocations vs actual */}
        {allocations.length > 0 && (
          <Appear delay={100}><Card>
            <CardTitle className="mb-4">Budget vs. actual</CardTitle>
            <div className="space-y-3">
              {allocations.map(a => {
                const spent = expenses.filter(e => e.category_id === a.category_id).reduce((s, e) => s + Number(e.amount), 0);
                const pct   = Number(a.planned) > 0 ? Math.min(100, Math.round(spent / Number(a.planned) * 100)) : 0;
                const over  = spent > Number(a.planned);
                return (
                  <div key={a.id} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-base w-6 text-center flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs text-gray-700 truncate">{a.category_name}</span>
                        <span className="text-xs text-gray-500 tabular-nums flex-shrink-0 whitespace-nowrap">
                          {formatCurrency(spent)} / {formatCurrency(Number(a.planned))}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {over && <Badge variant="danger" className="flex-shrink-0">Over</Badge>}
                  </div>
                );
              })}
            </div>
          </Card></Appear>
        )}

        {/* Expenses list */}
        {expenses.length > 0 && (
          <Appear delay={120}><Card>
            <CardTitle className="mb-4">Transactions</CardTitle>
            <div className="space-y-0">
              {expenses.map(e => (
                <div key={e.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-[#e8e3d8] last:border-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex-shrink-0">{e.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.description || e.category_name}</p>
                      <p className="text-xs text-gray-400 truncate">{formatShortDate(e.expense_date)} · {e.category_name}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-gray-800 flex-shrink-0 tabular-nums">{formatCurrency(Number(e.amount))}</p>
                </div>
              ))}
            </div>
          </Card></Appear>
        )}
      </div>
    </div>
  );
}
