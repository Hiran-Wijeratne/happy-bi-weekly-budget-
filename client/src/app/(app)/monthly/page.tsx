'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { SkeletonList } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { MonthlySummary } from '@/types/api';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function MonthlyPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [allocMap, setAllocMap] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data: summary, isLoading } = useQuery<MonthlySummary>({
    queryKey: ['monthly-summary', year, month],
    queryFn:  () => apiFetch(`/monthly-budgets/summary?year=${year}&month=${month}`),
  });

  useEffect(() => {
    if (!summary) return;
    const map: Record<string, string> = {};
    summary.categories.forEach(c => {
      map[c.category_id] = c.planned > 0 ? String(c.planned) : '';
    });
    setAllocMap(map);
    setSaved(false);
  }, [summary]);

  const navigate = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1;  y += 1; }
    if (m < 1)  { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

  const save = useMutation({
    mutationFn: () => apiFetch(`/monthly-budgets/${year}/${month}`, {
      method: 'PUT',
      body: JSON.stringify({
        allocations: (summary?.categories ?? []).map(c => ({
          category_id: c.category_id,
          planned:     Number(allocMap[c.category_id] ?? 0),
        })),
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-summary', year, month] });
      setSaved(true);
    },
  });

  const copyPrev = useMutation({
    mutationFn: () => apiFetch(`/monthly-budgets/${year}/${month}/copy`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monthly-summary', year, month] }),
  });

  const autofillBiweekly = () => {
    if (!summary) return;
    const map: Record<string, string> = { ...allocMap };
    summary.categories.forEach(c => {
      if (c.biweekly_total > 0) map[c.category_id] = String(c.biweekly_total);
    });
    setAllocMap(map);
    setSaved(false);
  };

  const hasBiweeklyHints = summary?.categories.some(c => c.biweekly_total > 0);
  const totalPlanned = summary?.categories.reduce((s, c) => s + Number(allocMap[c.category_id] ?? 0), 0) ?? 0;
  const totalActual  = summary?.categories.reduce((s, c) => s + c.actual, 0) ?? 0;
  const income       = summary?.income ?? 0;

  return (
    <div>
      <Header title="Monthly Budget" subtitle="Plan and track your full calendar month" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Month navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >←</button>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900">{MONTH_NAMES[month - 1]} {year}</p>
            {year === now.getFullYear() && month === now.getMonth() + 1 && (
              <span className="text-xs text-brand-600 font-medium">Current month</span>
            )}
          </div>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >→</button>
        </div>

        {isLoading ? (
          <SkeletonList count={5} />
        ) : summary ? (
          <>
            {/* Summary cards — 2×2 on mobile, 4-across on md */}
            <Appear><div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <Card padding="sm" className="text-center">
                <p className="text-xs text-gray-400 mb-1">Income</p>
                <p className="font-bold text-green-600 text-sm">{formatCurrency(income)}</p>
                {income === 0 && <p className="text-xs text-gray-300 mt-0.5">No periods yet</p>}
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-gray-400 mb-1">Budgeted</p>
                <p className="font-bold text-brand-600 text-sm">{formatCurrency(totalPlanned)}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-gray-400 mb-1">Spent</p>
                <p className="font-bold text-red-600 text-sm">{formatCurrency(totalActual)}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-gray-400 mb-1">Remaining</p>
                <p className={`font-bold text-sm ${totalPlanned - totalActual >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {formatCurrency(totalPlanned - totalActual)}
                </p>
              </Card>
            </div></Appear>

            {/* Category budget editor */}
            <Appear delay={60}><Card>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <CardTitle>Budget by category</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {hasBiweeklyHints && (
                    <Button size="sm" variant="ghost" onClick={autofillBiweekly}>
                      ⚡ Fill from biweekly
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" loading={copyPrev.isPending}
                    onClick={() => copyPrev.mutate()}>
                    ↩ Copy last month
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {summary.categories.map(c => {
                  const planned = Number(allocMap[c.category_id] ?? 0);
                  const actual  = c.actual;
                  const over    = actual > planned && planned > 0;
                  const pct     = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;

                  return (
                    <div key={c.category_id}>
                      {/* Row: icon | name+spent(mobile below) | input */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-lg w-7 text-center flex-shrink-0">{c.icon}</span>

                        {/* Name — on mobile, "spent" lives below it */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-sm font-medium text-gray-700 truncate"
                              style={{ color: c.color ?? undefined }}
                            >
                              {c.category_name}
                            </span>
                            {over && <Badge variant="danger">Over</Badge>}
                          </div>
                          {/* Spent — shown below name on all sizes to keep row tight */}
                          {actual > 0 && (
                            <p className={`text-xs mt-0.5 ${over ? 'text-red-500' : 'text-gray-400'}`}>
                              {formatCurrency(actual)} spent
                            </p>
                          )}
                        </div>

                        {/* Budget input — narrower on mobile */}
                        <div className="relative w-24 sm:w-28 flex-shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number" min="0" step="1"
                            className="w-full border border-[#e8e3d8] rounded-lg pl-6 sm:pl-7 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
                            value={allocMap[c.category_id] ?? ''}
                            onChange={e => { setAllocMap(prev => ({ ...prev, [c.category_id]: e.target.value })); setSaved(false); }}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Progress bar — indented to align with name */}
                      {planned > 0 && (
                        <div className="ml-9 mt-1.5">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-brand-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {pct}% used · {formatCurrency(Math.max(0, planned - actual))} left
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#e8e3d8]">
                {saved
                  ? <p className="text-sm text-green-600 font-medium">Saved!</p>
                  : <span />
                }
                <Button onClick={() => save.mutate()} loading={save.isPending}>
                  Save monthly budget
                </Button>
              </div>
            </Card></Appear>

            {/* Spending breakdown */}
            {totalActual > 0 && (
              <Appear delay={120}><Card>
                <CardTitle className="mb-4">Spending breakdown</CardTitle>
                <div className="space-y-2">
                  {summary.categories
                    .filter(c => c.actual > 0)
                    .sort((a, b) => b.actual - a.actual)
                    .map(c => {
                      const sharePct = Math.round((c.actual / totalActual) * 100);
                      return (
                        <div key={c.category_id} className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base w-6 text-center flex-shrink-0">{c.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs text-gray-600 mb-0.5 gap-2">
                              <span className="truncate">{c.category_name}</span>
                              <span className="flex-shrink-0 tabular-nums">{formatCurrency(c.actual)} ({sharePct}%)</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-brand-400"
                                style={{ width: `${sharePct}%`, backgroundColor: c.color ?? undefined }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card></Appear>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
