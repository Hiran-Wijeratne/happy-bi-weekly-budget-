import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value:      number;
  max?:       number;
  color?:     string;
  size?:      'sm' | 'md';
  showLabel?: boolean;
  className?: string;
  animate?:   boolean;
}

export function ProgressBar({ value, max = 100, color, size = 'md', showLabel, className, animate = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2.5' };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full',
            animate ? 'transition-all duration-700 ease-out' : 'transition-none',
            !color && 'bg-brand-500',
          )}
          style={{ width: `${pct}%`, backgroundColor: color || undefined }}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 mt-1 block">{pct}%</span>}
    </div>
  );
}
