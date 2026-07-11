import { cn } from '@/utils/cn';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'soft' | 'medium' | 'strong';
  gold?: boolean;
}

const intensityMap = {
  soft: 'bg-white/[0.03] border-white/[0.06] backdrop-blur-md',
  medium: 'bg-white/[0.06] border-white/[0.1] backdrop-blur-xl',
  strong: 'bg-white/[0.09] border-white/[0.14] backdrop-blur-2xl',
};

export function Glass({
  children,
  className,
  intensity = 'medium',
  gold,
  ...props
}: GlassProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-2xl',
        intensityMap[intensity],
        gold && 'border-amber-400/20 shadow-amber-900/20',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
