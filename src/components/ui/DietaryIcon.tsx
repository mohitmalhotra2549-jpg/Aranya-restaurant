import { cn } from '@/utils/cn';
import type { DietaryType } from '@/types';

export function DietaryIcon({
  type,
  className,
  size = 'md',
}: {
  type: DietaryType;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const isVeg = type === 'veg' || type === 'vegan';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-sm border-2',
        isVeg ? 'border-emerald-500' : 'border-rose-500',
        size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
        className,
      )}
      title={type}
      aria-label={type}
    >
      <span
        className={cn(
          'rounded-full',
          isVeg ? 'bg-emerald-500' : 'bg-rose-500',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
        )}
      />
    </span>
  );
}
