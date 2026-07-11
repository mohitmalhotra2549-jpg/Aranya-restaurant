import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'veg' | 'nonveg' | 'gold' | 'muted';
}

const tones = {
  default: 'bg-white/10 text-white/80 border-white/10',
  veg: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
  nonveg: 'bg-rose-500/15 text-rose-300 border-rose-400/25',
  gold: 'bg-amber-500/15 text-amber-200 border-amber-400/25',
  muted: 'bg-white/5 text-white/50 border-white/8',
};

export function Badge({ children, className, tone = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
