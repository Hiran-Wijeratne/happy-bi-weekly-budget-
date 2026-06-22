'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api-client';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { BudgetVsActualBar } from '@/components/charts/BudgetVsActualBar';
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparisonChart';
import { DailySpendingChart } from '@/components/charts/DailySpendingChart';
import { PredictionsPanel } from '@/components/charts/PredictionsPanel';
import { formatCurrency } from '@/lib/utils';
import { NavDrawer } from '@/components/layout/NavDrawer';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { DashboardData, FinancialAdvice } from '@/types/api';

const YEAR = new Date().getFullYear();

/* ── Design tokens ───────────────────────────────────────────── */
const C = {
  bg:        '#f4ede0',
  dark:      '#1c2e1c',
  green:     '#2e7d52',
  greenLt:   '#4a9a6a',
  pink:      '#c97082',
  muted:     '#6a7e6a',
  label:     '#6a9070',
  card:      '#ffffff',
  shadow:    '0 1px 8px rgba(28,46,28,0.07)',
  track:     '#e2dcd4',
  border:    '#e8e3d8',
  navBorder: '1px solid #e8e3d8',
} as const;

const SERIF = 'var(--font-lora), Georgia, "Times New Roman", serif';

/* ── Savings ring ────────────────────────────────────────────── */
function SavingsRing({ pct, color = C.green }: { pct: number; color?: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(pct / 100, 1) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="my-4">
      <circle cx="44" cy="44" r={r} fill="none" stroke={C.track} strokeWidth="5" />
      <circle cx="44" cy="44" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
}

/* ── Thin section label ──────────────────────────────────────── */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: C.label, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </p>
  );
}

/* ── Section heading ─────────────────────────────────────────── */
function SectionHeading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: sub ? 8 : 32 }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: C.dark, lineHeight: 1.15, margin: 0 }}>
        {children}
      </h2>
      {sub && <p style={{ color: C.muted, fontSize: 14, marginTop: 6, marginBottom: 32 }}>{sub}</p>}
    </div>
  );
}

/* ── White card ──────────────────────────────────────────────── */
function Card({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, boxShadow: C.shadow, ...style }}>
      {children}
    </div>
  );
}

/* ── Thin progress bar ───────────────────────────────────────── */
function ThinBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(pct, 100)), delay + 400);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height: 6, borderRadius: 4, background: C.track, overflow: 'hidden', marginTop: 8 }}>
      <div style={{
        height: '100%', borderRadius: 4, background: color,
        width: `${w}%`, transition: `width 1s ease ${delay}ms`,
      }} />
    </div>
  );
}

/* ── Mason jar ───────────────────────────────────────────────── */
function MoneyJar({ remainingPct, net }: { remainingPct: number; net: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(Math.min(Math.max(remainingPct, 0), 100)), 400);
    return () => clearTimeout(t);
  }, [remainingPct]);

  const FILL_H = 142;
  const translateY = FILL_H * (1 - pct / 100);
  const textSub = (42 + translateY) < 112;
  const liqColor = net >= 0 ? C.green : C.pink;
  const liqLight = net >= 0 ? C.greenLt : '#d9899a';

  const wp = `M -70,${FILL_H + 10} L -70,8 ` +
    'C -60.33,2 -62.17,2 -52.5,2 C -42.83,2 -44.67,8 -35,8 ' +
    'C -25.33,14 -27.17,14 -17.5,14 C -7.83,14 -9.67,8 0,8 ' +
    'C 9.67,2 7.83,2 17.5,2 C 27.17,2 25.33,8 35,8 ' +
    'C 44.67,14 42.83,14 52.5,14 C 62.17,14 60.33,8 70,8 ' +
    'C 79.67,2 77.83,2 87.5,2 C 97.17,2 95.33,8 105,8 ' +
    'C 114.67,14 112.83,14 122.5,14 C 132.17,14 130.33,8 140,8 ' +
    'C 149.67,2 147.83,2 157.5,2 C 167.17,2 165.33,8 175,8 ' +
    'C 184.67,14 182.83,14 192.5,14 C 202.17,14 200.33,8 210,8 ' +
    'C 219.67,2 217.83,2 227.5,2 C 237.17,2 235.33,8 245,8 ' +
    'C 254.67,14 252.83,14 262.5,14 C 272.17,14 270.33,8 280,8 ' +
    `L 280,${FILL_H + 10} Z`;

  return (
    <svg width="140" height="204" viewBox="0 0 140 204">
      <defs>
        <clipPath id="jarFillV">
          <rect x="38" y="42" width="64" height="22" />
          <rect x="12" y="58" width="116" height="126" rx="9" />
        </clipPath>
        <linearGradient id="liqGradV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={liqLight} stopOpacity="0.85" />
          <stop offset="100%" stopColor={liqColor} />
        </linearGradient>
      </defs>
      <rect x="8"  y="58" width="124" height="130" rx="12" fill="#f8f4ee" />
      <rect x="34" y="40" width="72"  height="22"          fill="#f8f4ee" />
      <g clipPath="url(#jarFillV)">
        <g style={{ transform: `translateY(${translateY}px)`, transition: 'transform 1.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s' }}>
          <g className="jar-wave"><path d={wp} fill="url(#liqGradV)" /></g>
          <rect x="15" y="8" width="10" height={FILL_H + 10} fill="white" opacity="0.15" rx="4" />
        </g>
      </g>
      <rect x="8"  y="58" width="124" height="130" rx="12" fill="none" stroke="#d4cfc4" strokeWidth="1.5" />
      <rect x="34" y="40" width="72"  height="22"          fill="none" stroke="#d4cfc4" strokeWidth="1.5" />
      <rect x="12" y="62" width="8"   height="118"         rx="4" fill="white" opacity="0.18" />
      <rect x="24" y="22" width="92"  height="20" rx="6"   fill="#dde8e0" stroke="#c8d8cc" strokeWidth="1" />
      <rect x="38" y="8"  width="64"  height="16" rx="5"   fill="#c8d8cc" stroke="#b8ccc0" strokeWidth="1" />
      <text x="70" y="122" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="system-ui"
        style={{ fill: textSub ? 'white' : liqColor, transition: 'fill 0.3s' }}>
        {Math.round(pct)}%
      </text>
      <text x="70" y="141" textAnchor="middle" fontSize="8" fontWeight="600" fontFamily="system-ui"
        style={{ fill: textSub ? 'rgba(255,255,255,0.6)' : C.muted, letterSpacing: '0.1em', transition: 'fill 0.3s' }}>
        REMAINING
      </text>
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', YEAR],
    queryFn:  () => apiFetch(`/dashboard?year=${YEAR}`),
  });

  /* ── derived values ── */
  const s      = data?.summary;
  const income = s?.total_income ?? 0;
  const spent  = s?.total_spent  ?? 0;
  const net    = s?.net          ?? 0;
  const savedPct = income > 0 ? Math.max(0, Math.round(((income - spent) / income) * 100)) : 0;

  /* Normalise date values: Neon may return Date objects at runtime despite TypeScript saying string */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateStr = (d: any): string => {
    if (!d) return '';
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  };
  const toMs = (d: unknown) => { const s = dateStr(d); return s ? new Date(s + 'T00:00:00').getTime() : NaN; };

  const sortedPeriods = [...(data?.periods ?? [])].sort((a, b) => b.period_number - a.period_number);
  const ascPeriods    = [...sortedPeriods].reverse();
  const today = new Date().toISOString().split('T')[0];

  const currentPeriod =
    ascPeriods.find(p => dateStr(p.start_date) <= today && dateStr(p.end_date) >= today) ??  // exact match
    ascPeriods.find(p => dateStr(p.start_date) > today) ??                                    // next upcoming
    sortedPeriods[0];                                                                          // most recent past
  const periodIncome = Number(currentPeriod?.primary_income ?? 0) + Number(currentPeriod?.partner_income ?? 0);
  const periodSpent  = Number(currentPeriod?.total_spent ?? 0);
  const periodNet    = periodIncome - periodSpent;
  const periodRemPct = periodIncome > 0 ? Math.max(0, Math.round(((periodIncome - periodSpent) / periodIncome) * 100)) : 0;

  const recentWithIncome = sortedPeriods.find(p => Number(p.primary_income) > 0);
  const biweeklyHH = recentWithIncome
    ? Number(recentWithIncome.primary_income ?? 0) + Number(recentWithIncome.partner_income)
    : 0;
  const monthlyIncome = Math.round(biweeklyHH * 26 / 12);

  /* period day label: "Jun · Day 7 of 14" */
  const fmtShort = (d: unknown) => new Date(dateStr(d) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  const periodDayTotal = currentPeriod?.start_date && currentPeriod?.end_date
    ? Math.round((toMs(currentPeriod.end_date) - toMs(currentPeriod.start_date)) / 86400000) + 1
    : 14;
  const periodDayCurrent = currentPeriod?.start_date
    ? Math.max(1, Math.round((Date.now() - toMs(currentPeriod.start_date)) / 86400000) + 1)
    : 1;
  const periodMonthLabel = currentPeriod?.start_date ? fmtShort(currentPeriod.start_date) : '';

  /* days left + daily allowance */
  const daysLeft = currentPeriod?.end_date
    ? Math.max(0, Math.ceil((toMs(currentPeriod.end_date) - Date.now()) / 86400000))
    : 0;
  const dailyAllowance = daysLeft > 0 && periodNet > 0 ? Math.round(periodNet / daysLeft) : 0;

  /* three-paycheck */
  const threePaycheckPeriods = (data?.periods ?? []).filter(p => p.is_three_paycheck_month);

  /* spending categories */
  const allCategories = (data?.spending_by_category ?? [])
    .filter(c => Number(c.total_budgeted) > 0 || Number(c.total_spent) > 0);
  const overBudget = allCategories.filter(c => Number(c.total_spent) > Number(c.total_budgeted) && Number(c.total_budgeted) > 0);
  const mostOver = [...overBudget].sort((a, b) =>
    (Number(b.total_spent) / Number(b.total_budgeted)) - (Number(a.total_spent) / Number(a.total_budgeted))
  )[0];

  /* chart data */
  const pieData = (data?.spending_by_category ?? [])
    .filter(c => Number(c.total_spent) > 0)
    .map(c => ({ name: c.name, value: Number(c.total_spent), color: c.color ?? C.green }));

  const barData = allCategories.slice(0, 8)
    .map(c => ({ name: c.name, budgeted: Number(c.total_budgeted), actual: Number(c.total_spent) }));

  /* forecast */
  const completedPeriods = (data?.periods ?? []).filter(p => Number(p.total_spent) > 0);
  const avgSpent = completedPeriods.length > 0
    ? completedPeriods.reduce((s, p) => s + Number(p.total_spent), 0) / completedPeriods.length
    : 0;
  const projSpend   = Math.round(avgSpent * 26);
  const projIncome  = Math.round(biweeklyHH * 26);
  const projSavings = Math.max(0, projIncome - projSpend);
  const confidence  = Math.min(95, Math.round((completedPeriods.length / 26) * 100 + 15));

  /* debt */
  const debts = data?.debts ?? [];
  const totalDebt    = debts.reduce((s, d) => s + Number(d.current_balance), 0);
  const totalPaid    = debts.reduce((s, d) => s + Number(d.total_paid), 0);
  const monthlyDebt  = debts.reduce((s, d) => s + Number(d.minimum_payment ?? 0), 0);
  const debtFreeDate = monthlyDebt > 0
    ? new Date(Date.now() + Math.ceil(totalDebt / monthlyDebt) * 30 * 86400000)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  /* savings */
  const savings = data?.savings ?? [];
  const RING_COLORS = ['#2e7d52', '#c97082', '#4a9a6a', '#8a6a2e', '#2e5a7d', '#7d2e6a'];

  /* advice from books */
  const { data: advice } = useQuery<FinancialAdvice>({
    queryKey: ['advice', monthlyIncome],
    queryFn:  () => apiFetch(`/advice?monthly_income=${monthlyIncome}`),
    enabled:  monthlyIncome > 0,
  });

  if (isLoading) return <PageLoader cards={4} />;

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── TOP NAV ────────────────────────────────────────────── */}
      <header style={{ background: C.card, borderBottom: C.navBorder, position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 4.5 }}
            aria-label="Open menu"
          >
            <span style={{ display: 'block', width: 20, height: 1.5, background: C.dark, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 1.5, background: C.dark, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 1.5, background: C.dark, borderRadius: 2 }} />
          </button>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>🌿</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: C.dark }}>BudgetFlow</span>
          </div>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontSize: 18, color: C.muted }}>
            🔔
          </button>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px 100px' }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <Appear><section style={{ marginBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13, marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                {periodMonthLabel} · Day {periodDayCurrent} of {periodDayTotal}
              </p>

              <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', fontWeight: 700, color: C.dark, lineHeight: 1.12, margin: '0 0 16px' }}>
                {periodNet >= 0 ? (
                  <>You have{' '}
                    <span style={{ color: C.green }}>{formatCurrency(periodNet)}</span>{' '}
                    left to breathe with.
                  </>
                ) : (
                  <>You're{' '}
                    <span style={{ color: C.pink }}>{formatCurrency(Math.abs(periodNet))}</span>{' '}
                    over budget this paycheck.
                  </>
                )}
              </h1>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, marginBottom: 36, maxWidth: 420 }}>
                A gentle look at the paycheck so far — every dollar earned, spent, and saved, arranged calmly.
              </p>

              {/* Empty-state nudge when no income is set */}
              {periodIncome === 0 && currentPeriod && (
                <div style={{
                  background: '#edf6f0', border: '1px solid #b0d0bc', borderLeft: `3px solid ${C.green}`,
                  borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 2 }}>
                      Set your paycheck income to see real numbers
                    </p>
                    <p style={{ fontSize: 12, color: C.muted }}>
                      Go to <a href="/periods" style={{ color: C.green, fontWeight: 600, textDecoration: 'underline' }}>Pay Periods</a>, open your current period, and tap <strong>Edit</strong> under Income.
                    </p>
                  </div>
                </div>
              )}

              {/* 3 stat chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'INCOME',   value: formatCurrency(periodIncome), sub: `+0% vs last`, color: C.green },
                  { label: 'SPENDING', value: formatCurrency(periodSpent),  sub: periodIncome > 0 ? `${Math.round((periodSpent/periodIncome)*100)}% of income` : '—', color: C.pink },
                  { label: 'SAVED',    value: formatCurrency(Math.max(0, periodNet)), sub: `${periodRemPct}% of income`, color: C.green },
                ].map(st => (
                  <Card key={st.label} style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', marginBottom: 8 }}>{st.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{st.value}</p>
                    <p style={{ fontSize: 11, color: st.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>↗</span>{st.sub}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right — jar + sub-stats */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <MoneyJar remainingPct={periodRemPct} net={periodNet} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', minWidth: 260 }}>
                {[
                  { label: 'FILLED',          value: `${periodRemPct}%` },
                  { label: 'DAYS LEFT',        value: `${daysLeft}` },
                  { label: 'DAILY ALLOWANCE',  value: dailyAllowance > 0 ? `$${dailyAllowance}` : '—' },
                ].map(st => (
                  <div key={st.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{st.value}</p>
                    <p style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>{st.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section></Appear>

        {/* ── PAYCHECK RHYTHM ──────────────────────────────────── */}
        <Appear delay={60}><section style={{ marginBottom: 80 }}>
          <SectionLabel>Paycheck Rhythm</SectionLabel>
          <SectionHeading sub="Recurring income, monthly equivalents, and the savings flowing into your goals.">
            Your month at a glance
          </SectionHeading>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'PER PAYCHECK',     value: formatCurrency(biweeklyHH),    sub: 'Bi-weekly · net' },
              { label: 'MONTHLY EQUIV.',   value: formatCurrency(monthlyIncome),  sub: '2.17 paychecks' },
              { label: 'PAY PERIODS LEFT', value: `${26 - (data?.periods ?? []).filter(p => Number(p.total_spent) > 0).length}`, sub: currentPeriod?.end_date ? `Next: ${new Date(dateStr(currentPeriod.end_date) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '—' },
              { label: 'AUTO-SAVING',      value: formatCurrency(Math.round(biweeklyHH * 0.1)), sub: '10% of income' },
            ].map(st => (
              <Card key={st.label} style={{ padding: '22px 20px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', marginBottom: 10 }}>{st.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{st.value}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{st.sub}</p>
              </Card>
            ))}
          </div>

          {/* Alert cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {threePaycheckPeriods.length > 0 && (
              <div style={{ background: '#edf6f0', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, marginTop: 1 }}>✨</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 4 }}>A three-paycheck month is coming</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                    You have {threePaycheckPeriods.length} bonus paycheck {threePaycheckPeriods.length === 1 ? 'month' : 'months'} this year.
                    That's an extra {formatCurrency(biweeklyHH)} to allocate toward your goals!
                  </p>
                </div>
              </div>
            )}
            {mostOver && (
              <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, marginTop: 1 }}>🔔</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 4 }}>
                    {mostOver.name} is {Math.round((Number(mostOver.total_spent) / Number(mostOver.total_budgeted)) * 100) - 100}% over budget
                  </p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                    You've spent {formatCurrency(Number(mostOver.total_spent))} of your {formatCurrency(Number(mostOver.total_budgeted))} budget.
                    Consider adjusting to get back on track.
                  </p>
                </div>
              </div>
            )}
            {!threePaycheckPeriods.length && !mostOver && savedPct >= 15 && (
              <div style={{ background: '#edf6f0', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, marginTop: 1 }}>✅</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 4 }}>Saving {savedPct}% of income</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                    {savedPct >= 20 ? 'Excellent — you\'re beating the 20% benchmark.' : 'You\'re on track with the 15% savings recommendation.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section></Appear>

        {/* ── SPENDING BY CATEGORY ─────────────────────────────── */}
        {allCategories.length > 0 && (
          <Appear delay={40}><section style={{ marginBottom: 80 }}>
            <SectionHeading sub="Hover each bar to see remaining budget. Pink means you're outpacing the plan.">
              Spending by category
            </SectionHeading>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

              {/* Category list */}
              <Card style={{ padding: '8px 0' }}>
                {allCategories.map((cat, i) => {
                  const budgeted = Number(cat.total_budgeted);
                  const catSpent = Number(cat.total_spent);
                  const catPct   = budgeted > 0 ? (catSpent / budgeted) * 100 : 0;
                  const isOver   = catSpent > budgeted && budgeted > 0;
                  return (
                    <div key={cat.id}
                      className="group"
                      style={{ padding: '14px 24px', borderBottom: i < allCategories.length - 1 ? `1px solid ${C.border}` : 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color ?? C.green}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          {cat.icon ?? '💰'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{cat.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? C.pink : C.green, marginLeft: 12 }}>
                              {Math.round(catPct)}%
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: C.muted }}>
                            {formatCurrency(catSpent)} of {formatCurrency(budgeted)}
                          </span>
                          <ThinBar pct={catPct} color={isOver ? C.pink : (cat.color ?? C.green)} delay={i * 40} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Card>

              {/* Insight card */}
              <Card style={{ padding: '24px', position: 'sticky', top: 72 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.label, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Insight for you
                </p>
                {mostOver ? (
                  <>
                    <h3 style={{ fontFamily: SERIF, fontSize: '1.25rem', fontWeight: 700, color: C.dark, lineHeight: 1.25, marginBottom: 12 }}>
                      Move {formatCurrency(Number(mostOver.total_spent) - Number(mostOver.total_budgeted))} from{' '}
                      <span style={{ color: C.pink }}>{mostOver.name}</span> back on track this period.
                    </h3>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                      Your {mostOver.name} spending is running {Math.round((Number(mostOver.total_spent) / Number(mostOver.total_budgeted)) * 100) - 100}% over plan.
                      Small adjustments now keep the rest of your goals intact.
                    </p>
                    <ul style={{ paddingLeft: 0, listStyle: 'none', margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <li style={{ fontSize: 13, color: C.muted, display: 'flex', gap: 8 }}>
                        <span style={{ color: C.green, fontWeight: 700, marginTop: 1 }}>•</span>
                        Review recent {mostOver.name} transactions
                      </li>
                      <li style={{ fontSize: 13, color: C.muted, display: 'flex', gap: 8 }}>
                        <span style={{ color: C.green, fontWeight: 700, marginTop: 1 }}>•</span>
                        Pause non-essential {mostOver.name} spending
                      </li>
                      <li style={{ fontSize: 13, color: C.muted, display: 'flex', gap: 8 }}>
                        <span style={{ color: C.green, fontWeight: 700, marginTop: 1 }}>•</span>
                        You're {savedPct}% ahead on savings rate overall
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontFamily: SERIF, fontSize: '1.25rem', fontWeight: 700, color: C.dark, lineHeight: 1.25, marginBottom: 12 }}>
                      You're within budget across all categories.
                    </h3>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                      Nice work — every category is tracking at or below plan. Consider routing the surplus to your top savings goal.
                    </p>
                  </>
                )}
                <button style={{ width: '100%', padding: '12px', background: C.green, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  View all transactions →
                </button>
              </Card>
            </div>
          </section></Appear>
        )}

        {/* ── THE SHAPE OF YOUR MONEY ──────────────────────────── */}
        <Appear delay={40}><section style={{ marginBottom: 80 }}>
          <SectionLabel>The shape of your money</SectionLabel>
          <SectionHeading sub="Six perspectives, one calm picture.">
            Visual breakdown
          </SectionHeading>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Spending breakdown</h3>
                  <p style={{ fontSize: 12, color: C.muted }}>This year, by category</p>
                </div>
                <span style={{ background: C.green, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                  {formatCurrency(spent).replace('.00', '')}
                </span>
              </div>
              <SpendingPieChart data={pieData} />
            </Card>

            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Budget vs actual</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Where you're under or over</p>
              <BudgetVsActualBar data={barData} />
            </Card>

            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Monthly trends</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Income, spending and savings</p>
              <MonthlyComparisonChart periods={data?.periods ?? []} />
            </Card>

            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Daily spending</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Last 30 days · pattern view</p>
              <DailySpendingChart data={data?.daily_spending ?? []} />
            </Card>
          </div>
        </section></Appear>

        {/* ── LOOKING AHEAD ────────────────────────────────────── */}
        <Appear delay={40}><section style={{ marginBottom: 80 }}>
          <SectionLabel>Looking ahead</SectionLabel>
          <SectionHeading sub="Projections assume current habits hold steady.">
            Three months from now
          </SectionHeading>

          {/* Two charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Spending over time</h3>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Cumulative this year</p>
              <SpendingTrendChart periods={data?.periods ?? []} />
            </Card>
            <Card style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Forecast</h3>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Projected next 4 months</p>
                </div>
                <span style={{ background: C.green, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                  {confidence}% confidence
                </span>
              </div>
              <PredictionsPanel periods={data?.periods ?? []} summary={data?.summary ?? { total_income: 0, total_spent: 0, net: 0 }} year={YEAR} />
            </Card>
          </div>

          {/* 4 projection cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'PROJECTED SAVINGS',  value: formatCurrency(projSavings),  sub: `+${formatCurrency(Math.max(0, projSavings - net))} from today`, color: C.green },
              { label: 'PROJECTED SPENDING', value: formatCurrency(projSpend),    sub: `Avg ${formatCurrency(Math.round(projSpend / 12))} / mo`,       color: C.pink  },
              { label: 'PROJECTED INCOME',   value: formatCurrency(projIncome),   sub: threePaycheckPeriods.length > 0 ? 'Includes bonus months' : 'Based on current rate', color: C.green },
              { label: 'CONFIDENCE',         value: `${confidence}%`,            sub: `Based on ${completedPeriods.length} mo history`,               color: C.muted },
            ].map(st => (
              <Card key={st.label} style={{ padding: '20px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', marginBottom: 10 }}>{st.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: st.color, marginBottom: 4 }}>{st.value}</p>
                <p style={{ fontSize: 11, color: C.muted }}>{st.sub}</p>
              </Card>
            ))}
          </div>
        </section></Appear>

        {/* ── ADVICE FROM THE BOOKS ────────────────────────────── */}
        {advice && (
          <Appear delay={40}><section style={{ marginBottom: 80 }}>
            <SectionLabel>Financial wisdom</SectionLabel>
            <SectionHeading sub="Matched to your income level, from the minds that redefined personal finance.">
              Advice from the books
            </SectionHeading>

            <div style={{
              background: 'linear-gradient(140deg, #236642 0%, #2e7d52 55%, #3a9068 100%)',
              borderRadius: 20,
              padding: 'clamp(28px, 4vw, 48px)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* subtle texture ring */}
              <div style={{
                position: 'absolute', top: -60, right: -60,
                width: 280, height: 280, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                pointerEvents: 'none',
              }} />

              {/* Book attribution row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.75 }}>
                  {advice.emoji} From the books
                </span>
                <span style={{ opacity: 0.35, fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, opacity: 0.85, fontStyle: 'italic' }}>
                  {advice.book_title}
                </span>
                <span style={{ fontSize: 13, opacity: 0.6 }}>
                  by {advice.book_author}
                </span>
                <span style={{
                  marginLeft: 4,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  {advice.subtitle}
                </span>
              </div>

              {/* Main title */}
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 20,
                maxWidth: 680,
              }}>
                {advice.title}
              </h2>

              {/* Body text */}
              <p style={{ fontSize: 15, lineHeight: 1.75, opacity: 0.9, maxWidth: 740, marginBottom: 28 }}>
                {advice.advice_text}
              </p>

              {/* This-paycheck action box */}
              <div style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.20)',
                borderLeft: '3px solid rgba(255,255,255,0.55)',
                borderRadius: 12,
                padding: '18px 22px',
                marginBottom: 28,
                maxWidth: 740,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.65, marginBottom: 8 }}>
                  This paycheck →
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.95 }}>
                  {advice.action_tip}
                </p>
              </div>

              {/* Encouragement quote */}
              <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.60, fontStyle: 'italic', maxWidth: 680 }}>
                {advice.encouragement}
              </p>
            </div>
          </section></Appear>
        )}

        {/* ── SAVING WITH INTENTION ────────────────────────────── */}
        {savings.length > 0 && (
          <Appear delay={40}><section style={{ marginBottom: 80 }}>
            <SectionLabel>Saving with intention</SectionLabel>
            <SectionHeading sub="Each ring fills as you contribute.">
              Your goals are growing
            </SectionHeading>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {savings.map((goal, i) => {
                const current = Number(goal.current_amount);
                const target  = Number(goal.target_amount);
                const pct     = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                const toGo    = Math.max(0, target - current);
                const ringColor = goal.color ?? RING_COLORS[i % RING_COLORS.length];
                return (
                  <Card key={goal.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Goal</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ringColor, background: `${ringColor}18`, padding: '2px 8px', borderRadius: 20 }}>
                        {pct}%
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: C.dark, marginTop: 4, marginBottom: 0 }}>{goal.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <SavingsRing pct={pct} color={ringColor} />
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: C.dark }}>{formatCurrency(current)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
                      <p style={{ fontSize: 12, color: C.muted }}>of {formatCurrency(target)}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{formatCurrency(toGo)} to go</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section></Appear>
        )}

        {/* ── PAYING IT DOWN ───────────────────────────────────── */}
        {debts.length > 0 && (
          <Appear delay={40}><section style={{ marginBottom: 80 }}>
            <SectionLabel>Paying it down</SectionLabel>
            <SectionHeading>
              Debt payoff
            </SectionHeading>
            <p style={{ fontSize: 14, color: C.muted, marginTop: -20, marginBottom: 32 }}>
              Total balance is{' '}
              <span style={{ color: C.green, fontWeight: 600 }}>shrinking</span>
              {' '}— keep going.
            </p>

            <Card>
              {/* Summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${C.border}` }}>
                {[
                  { label: 'TOTAL BALANCE', value: formatCurrency(totalDebt) },
                  { label: 'PAID THIS YEAR', value: formatCurrency(totalPaid) },
                  { label: 'EST. DEBT-FREE', value: debtFreeDate ?? '—' },
                ].map((st, i) => (
                  <div key={st.label} style={{
                    padding: '20px 24px',
                    borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.14em', marginBottom: 8 }}>{st.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: C.dark }}>{st.value}</p>
                  </div>
                ))}
              </div>

              {/* Debt rows */}
              {debts.map((d, i) => {
                const original = Number(d.original_balance ?? 0);
                const balance  = Number(d.current_balance);
                const paid     = original > 0 ? original - balance : Number(d.total_paid);
                const pct      = original > 0 ? Math.min(100, Math.round((paid / original) * 100)) : 0;
                const apr      = Number(d.interest_rate ?? 0);
                return (
                  <div key={d.id} style={{
                    padding: '18px 24px',
                    borderBottom: i < debts.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 3 }}>{d.name}</p>
                        <p style={{ fontSize: 12, color: C.muted }}>
                          {formatCurrency(paid)} paid · {formatCurrency(balance)} remaining
                          {apr > 0 ? ` · ${(apr * 100).toFixed(1)}% APR` : ''}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.green }}>{pct}%</span>
                    </div>
                    <ThinBar pct={pct} color={C.green} delay={i * 80} />
                  </div>
                );
              })}
            </Card>
          </section></Appear>
        )}

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer style={{ textAlign: 'center', paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 12, color: C.muted }}>
            BudgetFlow · A calmer way to budget · {YEAR}
          </p>
        </footer>

      </main>
    </div>
  );
}
