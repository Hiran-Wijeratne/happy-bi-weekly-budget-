import { cn } from '@/lib/utils';

interface CardProps {
  children:    React.ReactNode;
  className?:  string;
  style?:      React.CSSProperties;
  padding?:    'none' | 'sm' | 'md' | 'lg';
  hover?:      boolean;
  animate?:    boolean;
}

export function Card({ children, className, style, padding = 'md', hover = false, animate = false }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  const defaultStyle: React.CSSProperties = { borderColor: '#e8e3d8', ...style };
  return (
    <div style={defaultStyle} className={cn(
      'bg-white rounded-2xl border shadow-sm',
      'transition-all duration-200',
      hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      animate && 'animate-fade-in',
      paddings[padding],
      className,
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-semibold', className)} style={{ color: '#2e7d52' }}>{children}</h3>;
}
