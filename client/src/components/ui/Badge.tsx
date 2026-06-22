import { cn } from '@/lib/utils';

interface BadgeProps {
  children:   React.ReactNode;
  variant?:   'default' | 'success' | 'warning' | 'danger' | 'purple' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#e8e3d8] text-[#6a7e6a]',
    success: 'bg-[#dde8e0] text-[#2e7d52]',
    warning: 'bg-yellow-100 text-yellow-700',
    danger:  'bg-red-100 text-red-700',
    purple:  'bg-purple-100 text-purple-700',
    info:    'bg-[#dde8e0] text-[#2e7d52]',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium animate-bounce-in', variants[variant], className)}>
      {children}
    </span>
  );
}
