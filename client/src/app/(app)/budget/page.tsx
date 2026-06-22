'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPeriodOption } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { PaycheckPeriod, ExpenseCategory, BudgetAllocation } from '@/types/api';

const YEAR = new Date().getFullYear();

/* ── Smart budget allocation rules (% of biweekly income) ── */
const PLAN_RULES: Record<string, { pct: number; group: 'needs' | 'wants'; minIncome?: number }> = {
  'Housing':        { pct: 0.25, group: 'needs' },
  'Transportation': { pct: 0.10, group: 'needs' },
  'Groceries':      { pct: 0.08, group: 'needs' },
  'Utilities':      { pct: 0.06, group: 'needs' },
  'Insurance':      { pct: 0.08, group: 'needs' },
  'Healthcare':     { pct: 0.04, group: 'needs' },
  'Personal Care':  { pct: 0.03, group: 'wants' },
  'Miscellaneous':  { pct: 0.04, group: 'wants' },
  'Dining Out':     { pct: 0.04, group: 'wants', minIncome: 1800 },
  'Clothing':       { pct: 0.03, group: 'wants', minIncome: 1500 },
  'Entertainment':  { pct: 0.03, group: 'wants', minIncome: 2000 },
  'Subscriptions':  { pct: 0.02, group: 'wants', minIncome: 2000 },
};

function generatePlan(income: number, categories: ExpenseCategory[]): Record<string, string> {
  const result: Record<string, string> = {};
  let usedPct = 0;
  const unmatched: string[] = [];

  for (const c of categories) {
    const rule = PLAN_RULES[c.name];
    if (rule) {
      const skip = rule.minIncome !== undefined && income < rule.minIncome;
      result[c.id] = skip ? '0' : String(Math.round(income * rule.pct));
      if (!skip) usedPct += rule.pct;
    } else {
      unmatched.push(c.id);
    }
  }

  if (unmatched.length > 0) {
    const spare = Math.max(0, (0.95 - usedPct) / unmatched.length);
    for (const id of unmatched) result[id] = String(Math.round(income * spare));
  }

  return result;
}

export default function BudgetPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [allocMap, setAllocMap]   = useState<Record<string, string>>({});
  const [rolloverApplied, setRolloverApplied] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Ref guards auto-fill so it only fires once per period load
  const fillState = useRef<'pending' | 'filled' | 'cleared'>('pending');

  const { data: periods = [], isLoading: loadingPeriods } = useQuery<PaycheckPeriod[]>({
    queryKey: ['periods', YEAR],
    queryFn:  () => apiFetch(`/periods?year=${YEAR}`),
  });

  const { data: categories = [], isLoading: loadingCats } = useQuery<ExpenseCategory[]>({
    queryKey: ['categories'],
    queryFn:  () => apiFetch('/categories'),
  });

  const { data: allocations = [] } = useQuery<BudgetAllocation[]>({
    queryKey: ['allocations', selectedPeriodId],
    queryFn:  () => apiFetch(`/allocations?period_id=${selectedPeriodId}`),
    enabled:  !!selectedPeriodId,
  });

  // Sync server allocations → allocMap, and auto-fill plan on first blank load
  useEffect(() => {
    const map: Record<string, string> = {};
    allocations.forEach(a => { map[a.category_id] = String(Number(a.planned)); });

    const allBlank = allocations.length === 0 || allocations.every(a => Number(a.planned) === 0);

    if (allBlank && income > 0 && categories.length > 0 && fillState.current === 'pending') {
      const plan = generatePlan(income, categories);
      Object.assign(map, plan);
      fillState.current = 'filled';
      setAutoFilled(true);
    }

    setAllocMap(map);
    setRolloverApplied(allocations.some(a => Number(a.rolled_over_amount) > 0));
  // income is derived below but needed here — computed before effect runs on re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations, categories]);

  useEffect(() => {
    if (!selectedPeriodId && periods.length > 0) {
      const paramId = searchParams.get('period');
      if (paramId && periods.find(p => p.id === paramId)) {
        setSelectedPeriodId(paramId);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const current = periods.find(p => p.start_date <= today && today <= p.end_date);
        setSelectedPeriodId((current ?? periods[0]).id);
      }
    }
  }, [periods, selectedPeriodId, searchParams]);

  const resetFillState = () => {
    fillState.current = 'pending';
    setAutoFilled(false);
  };

  const save = useMutation({
    mutationFn: () => apiFetch(`/allocations/period/${selectedPeriodId}`, {
      method: 'PUT',
      body: JSON.stringify({
        allocations: categories.map(c => ({
          category_id: c.id,
          planned:     Number(allocMap[c.id] ?? 0),
        })),
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allocations', selectedPeriodId] });
      setAutoFilled(false);
    },
  });

  const applyRollover = useMutation({
    mutationFn: () => apiFetch(`/allocations/period/${selectedPeriodId}/rollover`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations', selectedPeriodId] }),
  });

  const toggleRollover = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiFetch(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ rollover_enabled: enabled }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const total = categories.reduce((s, c) => s + Number(allocMap[c.id] ?? 0), 0);
  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
  const income = selectedPeriod
    ? Number(selectedPeriod.primary_income ?? 0) + Number(selectedPeriod.partner_income ?? 0)
    : 0;

  const rolloverCategories = categories.filter(c => c.rollover_enabled);
  const allocationMap = Object.fromEntries(allocations.map(a => [a.category_id, a]));

  const recalculate = () => {
    if (!income || !categories.length) return;
    setAllocMap(generatePlan(income, categories));
    fillState.current = 'filled';
    setAutoFilled(true);
  };

  const clearAll = () => {
    setAllocMap({});
    fillState.current = 'cleared';
    setAutoFilled(false);
  };

  // Which wants categories were excluded due to low income
  const skipped = categories.filter(c => {
    const r = PLAN_RULES[c.name];
    return r?.minIncome !== undefined && income > 0 && income < r.minIncome;
  });

  if (loadingPeriods || loadingCats) return <PageLoader cards={3} />;

  return (
    <div>
      <Header title="Budget Planner" subtitle="Allocate your paycheck before you spend it" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Period selector */}
        <Card padding="sm">
          <label className="text-sm font-medium text-gray-700 block mb-2">Pay period</label>
          <select
            className="w-full border border-[#e8e3d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
            value={selectedPeriodId}
            onChange={e => {
              setSelectedPeriodId(e.target.value);
              setRolloverApplied(false);
              resetFillState();
            }}
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>
                {formatPeriodOption(p.period_number, p.start_date, p.end_date, p.is_three_paycheck_month)}
              </option>
            ))}
          </select>
        </Card>

        {/* Rollover banner */}
        {rolloverCategories.length > 0 && (
          <Card className="bg-brand-50 border-brand-200">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-xl flex-shrink-0">♻️</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {rolloverApplied
                      ? 'Rollover applied — surplus from last period added'
                      : `${rolloverCategories.length} categor${rolloverCategories.length === 1 ? 'y has' : 'ies have'} rollover enabled`}
                  </p>
                  {!rolloverApplied && (
                    <p className="text-xs text-brand-600 mt-0.5">Apply to carry unspent budget into this period</p>
                  )}
                </div>
              </div>
              {!rolloverApplied && (
                <Button size="sm" variant="secondary" loading={applyRollover.isPending}
                  onClick={() => applyRollover.mutate()}>
                  Apply rollover
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Income vs allocated */}
        {income > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-400 mb-1">Income</p>
              <p className="font-bold text-green-600 text-sm sm:text-base">{formatCurrency(income)}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-400 mb-1">Allocated</p>
              <p className="font-bold text-brand-600 text-sm sm:text-base">{formatCurrency(total)}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs text-gray-400 mb-1">Left</p>
              <p className={`font-bold text-sm sm:text-base ${income - total >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                {formatCurrency(income - total)}
              </p>
            </Card>
          </div>
        )}

        {/* Category allocation editor */}
        {categories.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <CardTitle>Allocate by category</CardTitle>
              {income > 0 && (
                <button
                  onClick={recalculate}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition flex items-center gap-1"
                >
                  ✨ Recalculate
                </button>
              )}
            </div>

            {/* Auto-fill banner */}
            {autoFilled && (
              <div className="flex items-start justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4 animate-fade-in">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">✨ Smart budget applied</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Amounts distributed based on your {formatCurrency(income)} paycheck.
                    {skipped.length > 0 && (
                      <> <strong>{skipped.map(c => c.name).join(' & ')}</strong> excluded — income below threshold.</>
                    )}
                    {' '}Edit any amount below, then save.
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-500 transition flex-shrink-0 mt-0.5"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="space-y-3">
              {categories.map((c, i) => {
                const alloc = allocationMap[c.id];
                const rolledOver = alloc ? Number(alloc.rolled_over_amount) : 0;
                return (
                  <Appear key={c.id} delay={i * 35}><div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg w-7 text-center flex-shrink-0">{c.icon}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium text-gray-700 truncate" style={{ color: c.color ?? undefined }}>
                          {c.name}
                        </span>
                        <button
                          title={c.rollover_enabled ? 'Rollover on — click to disable' : 'Enable rollover'}
                          onClick={() => toggleRollover.mutate({ id: c.id, enabled: !c.rollover_enabled })}
                          className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors flex-shrink-0 ${
                            c.rollover_enabled
                              ? 'bg-brand-100 text-brand-700 border-brand-300'
                              : 'bg-[#f4ede0] text-[#6a7e6a] border-[#e8e3d8] hover:border-[#6aaf90] hover:text-[#2e7d52]'
                          }`}
                        >♻️</button>
                      </div>
                      {rolledOver > 0 && (
                        <Badge variant="info" className="mt-0.5">+{formatCurrency(rolledOver)} rolled</Badge>
                      )}
                    </div>

                    <div className="relative w-24 sm:w-32 flex-shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number" min="0" step="0.01"
                        className="w-full border border-[#e8e3d8] rounded-lg pl-6 sm:pl-7 pr-2 sm:pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
                        value={allocMap[c.id] ?? ''}
                        onChange={e => setAllocMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div></Appear>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e8e3d8]">
              <p className="text-xs text-gray-400 mb-4">
                ♻️ = rollover enabled — surplus from previous period carries forward automatically
              </p>
              <div className="flex justify-end">
                <Button onClick={() => save.mutate()} loading={save.isPending}>Save allocations</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
