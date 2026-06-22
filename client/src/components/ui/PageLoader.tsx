'use client';

const BG   = '#f4ede0';
const CARD = '#ffffff';
const BORDER = '1px solid #e8e3d8';

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, #e8e3d8 0%, #f0e9de 40%, #e8e3d8 80%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s linear infinite',
  borderRadius: 8,
};

function Bone({ w, h, style = {} }: { w: number | string; h: number; style?: React.CSSProperties }) {
  return <div style={{ width: w, height: h, ...shimmer, ...style }} />;
}

function SkeletonCard({ rows = 2, children }: { rows?: number; children?: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: BORDER, borderRadius: 16, padding: '20px 24px' }}>
      {children ?? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Bone w="45%" h={16} />
          {Array.from({ length: rows }).map((_, i) => (
            <Bone key={i} w={i === rows - 1 ? '70%' : '100%'} h={12} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageLoader({ cards = 3 }: { cards?: number }) {
  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: CARD, borderBottom: '1px solid #e8e3d8', padding: '20px 24px 18px' }}>
        <Bone w={160} h={22} style={{ marginBottom: 10 }} />
        <Bone w={240} h={13} />
      </div>

      {/* Cards */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} rows={i === 0 ? 3 : 2} />
        ))}
      </div>
    </div>
  );
}

/** Inline skeleton for a list of rows (used inside already-rendered pages) */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div style={{ background: CARD, border: BORDER, borderRadius: 16, overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          padding: '14px 20px',
          borderBottom: i < count - 1 ? '1px solid #e8e3d8' : 'none',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, ...shimmer }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Bone w="55%" h={13} />
            <Bone w="35%" h={11} />
          </div>
          <Bone w={60} h={16} />
        </div>
      ))}
    </div>
  );
}

/** Two-column grid of skeleton cards */
export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  );
}
