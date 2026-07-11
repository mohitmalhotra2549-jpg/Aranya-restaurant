import { AnimatePresence, motion } from 'framer-motion';
import { Radio, X } from 'lucide-react';
import type { GuestTrackingNotice } from '@/hooks/useGuestTrackingNotifications';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/utils/cn';

interface GuestTrackingToastProps {
  notice: GuestTrackingNotice | null;
  onDismiss: () => void;
  onOpenTracking: () => void;
}

export function GuestTrackingToast({
  notice,
  onDismiss,
  onOpenTracking,
}: GuestTrackingToastProps) {
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, y: -18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="pointer-events-auto fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[90] w-[min(100%-1.25rem,24rem)] -translate-x-1/2"
        >
          <Glass
            intensity="strong"
            className="overflow-hidden border-emerald-400/25 shadow-2xl shadow-black/50"
          >
            <button
              type="button"
              onClick={onOpenTracking}
              className="flex w-full items-start gap-3 p-3.5 text-left"
            >
              <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                <Radio className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">
                    Live tracking
                  </span>
                  <span
                    className={cn(
                      'rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-amber-200/90',
                    )}
                  >
                    {notice.statusLabel}
                  </span>
                </span>
                <span className="mt-0.5 block font-serif text-base text-white">
                  {notice.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/55">
                  {notice.message}
                </span>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-amber-300/70">
                  Tap to open tracking →
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="absolute right-2 top-2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/8 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Glass>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
