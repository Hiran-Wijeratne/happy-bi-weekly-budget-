'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { SavingsGoal } from '@/types/api';

const GOAL_PALETTE = [
  '#3a9068', '#b86a80', '#6aaf90', '#a35068',
  '#4a9e7a', '#cc8fa4', '#2d7050', '#853a52',
];

function AnimatedBar({ pct, color, active }: { pct: number; color: string; active: boolean }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setW(pct), 120);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct]);

  return (
    <div ref={ref} style={{ height: 12, borderRadius: 12, background: '#e4ede8', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        height: '100%',
        width: `${w}%`,
        borderRadius: 12,
        background: `linear-gradient(to right, ${color}88, ${color})`,
        transition: 'width 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '40%', borderRadius: 12,
          background: 'rgba(255,255,255,0.28)',
        }} />
      </div>
    </div>
  );
}

export function SavingsProgressBars({ goals }: { goals: SavingsGoal[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (goals.length === 0) {
    return (
      <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
        No savings goals yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((g, idx) => {
        const current    = Number(g.current_amount);
        const target     = Number(g.target_amount);
        const p          = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const color      = GOAL_PALETTE[idx % GOAL_PALETTE.length];
        const isComplete = p >= 100;
        const remaining  = Math.max(target - current, 0);
        const isActive   = activeIdx === idx;

        return (
          <div
            key={g.id}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              cursor: 'default',
              background: isActive ? '#f6faf8' : 'transparent',
              border: `1px solid ${isActive ? '#c8e0d4' : 'transparent'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{g.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#3a9068' }}>{g.name}</span>
                {isComplete && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                    color: '#fff', background: '#3a9068',
                    borderRadius: 20, padding: '2px 8px',
                  }}>COMPLETE</span>
                )}
              </div>
              <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color }}>{formatCurrency(current)}</span>
                <span style={{ fontSize: 12, color: '#9ab0a4' }}> / {formatCurrency(target)}</span>
              </div>
            </div>

            {/* Bar */}
            <AnimatedBar pct={p} color={color} active={isActive} />

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, minHeight: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{p}%</span>

              {/* Expanded detail on hover */}
              {isActive && !isComplete && remaining > 0 && (
                <span style={{ fontSize: 11, color: '#9ab0a4', animation: 'fadeIn 0.18s ease' }}>
                  {formatCurrency(remaining)} to go
                </span>
              )}
              {isActive && isComplete && (
                <span style={{ fontSize: 11, color: '#3a9068', fontWeight: 600 }}>
                  Goal reached 🎉
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
