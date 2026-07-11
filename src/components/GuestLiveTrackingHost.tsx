import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useGuestTrackingNotifications } from '@/hooks/useGuestTrackingNotifications';
import { GuestTrackingToast } from '@/components/GuestTrackingToast';
import { getStage } from '@/data/orderTracking';
import { cn } from '@/utils/cn';

/**
 * Global guest overlay:
 * - Toast when kitchen pushes live tracking updates
 * - Floating pill to open Live Tracking anytime there is an active order
 */
export function GuestLiveTrackingHost() {
  const { tableOrders, setView, view, staffMode } = useApp();
  const enabled = !staffMode && view !== 'loading';
  const { notice, dismiss } = useGuestTrackingNotifications(
    enabled,
    tableOrders,
  );

  const activeLive = tableOrders.filter(
    (o) => o.status !== 'completed' && o.liveTracking !== false,
  );
  const latest = activeLive[0];
  const hideFloat =
    !latest ||
    view === 'order-status' ||
    view === 'order-success' ||
    view === 'loading' ||
    view === 'ar';

  const openTracking = () => {
    dismiss();
    setView('order-status');
  };

  if (!enabled) return null;

  return (
    <>
      <GuestTrackingToast
        notice={notice}
        onDismiss={dismiss}
        onOpenTracking={openTracking}
      />

      <AnimatePresence>
        {!hideFloat && latest && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={openTracking}
            className={cn(
              'fixed right-4 z-[55] flex max-w-[min(100%-2rem,16rem)] items-center gap-2 rounded-full border border-emerald-400/30 bg-[#0f0e0c]/92 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-xl',
              // Sit above bottom action bar on menu, lower elsewhere
              view === 'menu' || view === 'cart' || view === 'dish'
                ? 'bottom-24'
                : 'bottom-6',
            )}
            aria-label="Open live order tracking"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Radio className="h-3.5 w-3.5" />
              <span className="absolute right-0 top-0 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-emerald-300/70">
                Live · {getStage(latest.status).shortLabel}
              </span>
              <span className="block truncate text-xs text-white/80">
                {latest.statusNote || getStage(latest.status).guestMessage}
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
