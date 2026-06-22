'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface DataPoint { name: string; value: number; color: string }

const PALETTE = [
  '#3a9068', '#b86a80',
  '#6aaf90', '#cc8fa4',
  '#4a9e7a', '#a35068',
  '#96c8b0', '#ddb4be',
  '#2d7050', '#853a52',
];

/* Expanded + glow slice rendered when active */
function ActiveSlice(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 11}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 18}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.22} />
    </g>
  );
}

export function SpendingPieChart({ data }: { data: DataPoint[] }) {
  const [hoverIdx, setHoverIdx]  = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <p style={{ color: '#9ab0a4', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>No spending data yet</p>;
  }

  const total      = data.reduce((s, d) => s + d.value, 0);
  const displayIdx = lockedIdx ?? hoverIdx;
  const active     = displayIdx !== null ? data[displayIdx] : null;

  const centerColor = active ? PALETTE[displayIdx! % PALETTE.length] : '#3a9068';
  const centerLabel = active ? active.name : 'Total spent';
  const centerValue = active ? formatCurrency(active.value) : formatCurrency(total);
  const centerSub   = active
    ? `${((active.value / total) * 100).toFixed(1)}% of spending`
    : `${data.length} categories`;

  const handleEnter = (_: any, i: number) => { if (lockedIdx === null) setHoverIdx(i); };
  const handleLeave = () => { if (lockedIdx === null) setHoverIdx(null); };
  const handleClick = (_: any, i: number) => {
    setLockedIdx(prev => (prev === i ? null : i));
    setHoverIdx(null);
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={68} outerRadius={98}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              startAngle={90} endAngle={-270}
              activeIndex={displayIdx ?? undefined}
              activeShape={ActiveSlice}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onClick={handleClick}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={PALETTE[i % PALETTE.length]}
                  style={{
                    opacity: displayIdx === null || displayIdx === i ? 1 : 0.35,
                    transition: 'opacity 0.22s',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Dynamic center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#9ab0a4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>
            {centerLabel}
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: centerColor, lineHeight: 1.1 }}>
            {centerValue}
          </p>
          <p style={{ fontSize: 9, color: '#9ab0a4', marginTop: 3 }}>
            {centerSub}
          </p>
          {lockedIdx !== null && (
            <p style={{ fontSize: 8, color: '#c8e0d4', marginTop: 5, letterSpacing: '0.08em' }}>
              CLICK TO DESELECT
            </p>
          )}
        </div>
      </div>

      {/* Clickable legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 2 }}>
        {data.slice(0, 8).map((d, i) => (
          <button
            key={d.name}
            onClick={() => setLockedIdx(prev => prev === i ? null : i)}
            onMouseEnter={() => { if (lockedIdx === null) setHoverIdx(i); }}
            onMouseLeave={() => { if (lockedIdx === null) setHoverIdx(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              opacity: displayIdx === null || displayIdx === i ? 1 : 0.35,
              transition: 'opacity 0.22s',
            }}
          >
            <span style={{
              width: lockedIdx === i ? 10 : 8,
              height: lockedIdx === i ? 10 : 8,
              borderRadius: '50%',
              background: PALETTE[i % PALETTE.length],
              flexShrink: 0, display: 'inline-block',
              transition: 'width 0.18s, height 0.18s',
              boxShadow: lockedIdx === i ? `0 0 0 2px ${PALETTE[i % PALETTE.length]}44` : 'none',
            }} />
            <span style={{ fontSize: 11, color: '#5a7a68' }}>{d.name}</span>
          </button>
        ))}
        {data.length > 8 && (
          <span style={{ fontSize: 11, color: '#9ab0a4' }}>+{data.length - 8} more</span>
        )}
      </div>
    </div>
  );
}
