import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ShoppingBag, Volume2, X } from 'lucide-react';
import type { StaffAlert } from '@/hooks/useStaffAlerts';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/utils/cn';

interface StaffAlertBannerProps {
  alert: StaffAlert | null;
  onDismiss: () => void;
}

export function StaffAlertBanner({ alert, onDismiss }: StaffAlertBannerProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.id + alert.at}
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="pointer-events-auto fixed left-1/2 top-4 z-[70] w-[min(100%-1.5rem,28rem)] -translate-x-1/2"
        >
          <Glass
            intensity="strong"
            className={cn(
              'flex items-start gap-3 p-3.5 shadow-2xl',
              alert.kind === 'order'
                ? 'border-amber-400/30'
                : 'border-sky-400/30',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                alert.kind === 'order'
                  ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                  : 'border-sky-400/30 bg-sky-500/15 text-sky-200',
              )}
            >
              {alert.kind === 'order' ? (
                <ShoppingBag className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                <Volume2 className="h-3 w-3 text-amber-300/70" />
                Live alert
              </div>
              <p className="mt-0.5 font-serif text-base text-white">{alert.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/50">{alert.detail}</p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/8 hover:text-white"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </Glass>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
