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
import type { SavingsGoal, PaycheckPeriod } from '@/types/api';

const YEAR = new Date().getFullYear();
const COLORS = ['#339966','#55b280','#8ecfaa','#f59e0b','#10b981','#ef4444','#f97316','#ec4899'];

const W = {
  page:   '#f4ede0',
  card:   '#ffffff',
  border: '#e8e3d8',
  label:  '#6a7e6a',
  title:  '#2e7d52',
};

export default function SavingsPage() {
  const qc = useQueryClient();
  const [showAdd,     setShowAdd]     = useState(false);
  const [showContrib, setShowContrib] = useState<SavingsGoal | null>(null);
  const [form,        setForm]        = useState({ name:'', target_amount:'', target_date:'', icon:'🎯', color: COLORS[0] });
  const [contrib,     setContrib]     = useState({ period_id:'', amount:'', contributed_date: new Date().toISOString().split('T')[0] });
  const [error,       setError]       = useState('');

  const { data: goals = [], isLoading } = useQuery<SavingsGoal[]>({ queryKey: ['savings'], queryFn: () => apiFetch('/savings') });
  const { data: periods = [] } = useQuery<PaycheckPeriod[]>({ queryKey: ['periods', YEAR], queryFn: () => apiFetch(`/periods?year=${YEAR}`) });

  const addGoal = useMutation({
    mutationFn: () => apiFetch('/savings', {
      method: 'POST',
      body: JSON.stringify({ ...form, target_amount: Number(form.target_amount), target_date: form.target_date || undefined }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); setShowAdd(false); setForm({ name:'',target_amount:'',target_date:'',icon:'🎯',color:COLORS[0] }); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteGoal = useMutation({
    mutationFn: (id: string) => apiFetch(`/savings/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });

  const addContrib = useMutation({
    mutationFn: () => apiFetch(`/savings/${showContrib!.id}/contributions`, {
      method: 'POST',
      body: JSON.stringify({ ...contrib, amount: Number(contrib.amount) }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); setShowContrib(null); setContrib(f => ({ ...f, amount:'' })); },
    onError: (e: Error) => setError(e.message),
  });

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  if (isLoading) return <PageLoader cards={3} />;

  return (
    <div style={{ background: W.page, minHeight: '100vh' }}>
      <Header
        title="Savings Goals"
        subtitle="Build your future, one paycheck at a time"
        action={<Button size="sm" onClick={() => setShowAdd(true)}>+ New goal</Button>}
      />

      <div className="p-4 sm:p-6 space-y-4">

        {/* Hero banner — piggy bank video + total saved */}
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{ background: 'linear-gradient(to right, #e8ede8 20%, #ffffff 80%)', border: `1px solid ${W.border}` }}
        >
          <div className="flex items-stretch">
            <div className="flex-1 px-5 py-5 flex flex-col justify-between">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#2e7d52' }}>
                Your savings progress
              </p>
              {totalSaved > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#6a7e6a' }}>Total saved across all goals</p>
                    <p className="text-3xl font-bold tabular-nums" style={{ color: W.title }}>{formatCurrency(totalSaved)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#6a7e6a' }}>{goals.length} active goal{goals.length !== 1 ? 's' : ''}</p>
                    <p className="font-semibold text-base" style={{ color: W.label }}>
                      {goals.filter(g => g.is_completed).length} completed
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold text-lg" style={{ color: W.title }}>
                    Start saving with intention
                  </p>
                  <p className="text-sm" style={{ color: '#6a7e6a' }}>
                    Set a goal and allocate a little from each paycheck. Small habits, big results.
                  </p>
                  <Button size="sm" onClick={() => setShowAdd(true)}>
                    Create first goal
                  </Button>
                </div>
              )}
            </div>

            {/* Piggy bank video */}
            <div className="w-40 sm:w-52 flex-shrink-0 flex items-end justify-center">
              <div className="relative w-full">
                <video
                  src="/videos/piggy-bank.mp4"
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="w-full"
                  style={{ display: 'block', maxHeight: '200px', background: '#ffffff', opacity: 0, transition: 'opacity 0.4s ease' }}
                  onLoadedMetadata={e => { (e.currentTarget as HTMLVideoElement).currentTime = 0.5; }}
                  onLoadedData={e => { (e.currentTarget as HTMLVideoElement).style.opacity = '1'; }}
                />
                {/* Cover right edge */}
                <div className="absolute top-0 right-0 h-full" style={{ background: '#ffffff', width: '12%' }} />
                {/* Cover bottom edge */}
                <div className="absolute bottom-0 left-0 w-full h-3" style={{ background: '#ffffff' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Goals grid */}
        {goals.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center animate-fade-in-up"
            style={{ background: W.card, border: `1px solid ${W.border}`, animationDelay: '80ms' }}
          >
            <p className="text-sm mb-4" style={{ color: W.label }}>
              No savings goals yet — create one to start tracking your progress.
            </p>
            <Button onClick={() => setShowAdd(true)}>Create goal</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g, i) => {
              const current = Number(g.current_amount);
              const target  = Number(g.target_amount);
              const p       = pct(current, target);
              return (
                <Appear key={g.id} delay={i * 60}>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: W.card, border: `1px solid ${W.border}` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: W.title }}>{g.name}</p>
                        {g.target_date && <p className="text-xs mt-0.5" style={{ color: W.label }}>Target: {formatDate(g.target_date)}</p>}
                      </div>
                    </div>
                    {g.is_completed && <Badge variant="success">Complete!</Badge>}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: W.label }}>{formatCurrency(current)} saved</span>
                    <span className="font-medium" style={{ color: W.title }}>of {formatCurrency(target)}</span>
                  </div>
                  <ProgressBar value={current} max={target} color={g.color ?? undefined} />
                  <p className="text-xs mt-1" style={{ color: W.label }}>{p}% complete</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => { setContrib(f => ({ ...f, period_id:'', amount:'' })); setShowContrib(g); }}
                    >
                      Add contribution
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteGoal.mutate(g.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                </Appear>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New savings goal">
        <div className="space-y-4">
          <Input label="Goal name" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="e.g. Emergency fund" />
          <Input label="Target amount ($)" type="number" min="1" step="1" value={form.target_amount} onChange={e => setForm(f => ({...f,target_amount:e.target.value}))} placeholder="5000" />
          <Input label="Target date (optional)" type="date" value={form.target_date} onChange={e => setForm(f => ({...f,target_date:e.target.value}))} />
          <Input label="Icon (emoji)" value={form.icon} onChange={e => setForm(f => ({...f,icon:e.target.value}))} placeholder="🎯" />
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: W.title }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({...f,color:c}))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color===c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400':''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="flex-1" loading={addGoal.isPending} onClick={() => addGoal.mutate()} disabled={!form.name||!form.target_amount}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Contribution Modal */}
      <Modal open={!!showContrib} onClose={() => setShowContrib(null)} title={`Add contribution — ${showContrib?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: W.title }}>Pay period</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d52]"
              style={{ borderColor: W.border }}
              value={contrib.period_id}
              onChange={e => setContrib(f => ({...f,period_id:e.target.value}))}
            >
              <option value="">Select period…</option>
              {periods.map(p => (
                <option key={p.id} value={p.id}>{formatPeriodOption(p.period_number, p.start_date, p.end_date, p.is_three_paycheck_month)}</option>
              ))}
            </select>
          </div>
          <Input label="Amount ($)" type="number" min="0.01" step="0.01" value={contrib.amount} onChange={e => setContrib(f => ({...f,amount:e.target.value}))} placeholder="0.00" />
          <Input label="Date" type="date" value={contrib.contributed_date} onChange={e => setContrib(f => ({...f,contributed_date:e.target.value}))} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowContrib(null)}>Cancel</Button>
            <Button className="flex-1" loading={addContrib.isPending} onClick={() => addContrib.mutate()} disabled={!contrib.amount||!contrib.period_id}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
