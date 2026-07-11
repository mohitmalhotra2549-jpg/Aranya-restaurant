import { cn } from '@/utils/cn';
import { spiceLabel } from '@/utils/format';

export function SpiceMeter({
  level,
  className,
  showLabel = true,
}: {
  level: number;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors',
              i < level
                ? level >= 4
                  ? 'bg-rose-400'
                  : level >= 2
                    ? 'bg-orange-400'
                    : 'bg-amber-300'
                : 'bg-white/15',
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[11px] text-white/45 tracking-wide">
          {spiceLabel(level)}
        </span>
      )}
    </div>
  );
}
