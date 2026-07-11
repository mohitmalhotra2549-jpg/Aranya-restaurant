import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Radio,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { WaiterAssistSheet } from '@/components/WaiterAssistSheet';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatTime } from '@/utils/format';
import {
  getStage,
  guestProgressStages,
  stageIndex,
} from '@/data/orderTracking';
import type { OrderStatus as Status } from '@/types';
import { cn } from '@/utils/cn';

const stepIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Check,
  preparing: ChefHat,
  ready: Sparkles,
  served: Utensils,
};

export function OrderStatusScreen() {
  const { tableOrders, setView, tableNumber, createRequest, orders } = useApp();
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});

  // Keep guest view feeling “live” while kitchen updates status
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 2000);
    return () => window.clearInterval(t);
  }, []);

  // Celebrate kitchen status changes for this table
  useEffect(() => {
    for (const order of tableOrders) {
      const prev = lastSeen[order.id];
      if (prev && prev !== order.status) {
        const stage = getStage(order.status);
        setToast(stage.guestMessage);
        setTimeout(() => setToast(null), 3200);
      }
    }
    const next: Record<string, string> = {};
    tableOrders.forEach((o) => {
      next[o.id] = o.status;
    });
    setLastSeen(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableOrders, orders, tick]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-dvh pb-10">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0908]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => setView('menu')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/8"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-serif text-xl text-white">Live Tracking</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
              Table {tableNumber}
            </p>
          </div>
          {tableOrders.some((o) => o.liveTracking !== false) && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-5">
        {tableOrders.length === 0 ? (
          <Glass className="p-10 text-center">
            <p className="text-sm text-white/40">No active orders</p>
            <Button
              variant="gold"
              className="mt-5"
              onClick={() => setView('menu')}
            >
              Browse Menu
            </Button>
          </Glass>
        ) : (
          tableOrders.map((order, oi) => {
            const current = stageIndex(order.status as Status);
            const stage = getStage(order.status);
            const live = order.liveTracking !== false;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: oi * 0.08 }}
              >
                <Glass
                  intensity="medium"
                  className={cn(
                    'overflow-hidden p-5',
                    live && 'ring-1 ring-emerald-400/15',
                  )}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        Order · {formatTime(order.createdAt)}
                      </p>
                      <p className="mt-1 font-serif text-lg text-white">
                        {formatPrice(order.total)}
                      </p>
                      <p className="mt-1 text-[11px] text-white/35">
                        Updated {formatTime(order.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider',
                          order.status === 'served'
                            ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
                            : 'border-amber-400/30 bg-amber-500/15 text-amber-200',
                        )}
                      >
                        {stage.label}
                      </span>
                      {live && (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300/80">
                          <Radio className="h-3 w-3" />
                          From kitchen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Live message from kitchen */}
                  <div className="mb-5 rounded-xl border border-amber-400/15 bg-amber-500/10 px-3.5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/50">
                      Kitchen update
                    </p>
                    <p className="mt-1 text-sm text-amber-50/90">
                      {order.statusNote || stage.guestMessage}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mb-6 flex items-center justify-between">
                    {guestProgressStages.map((step, i) => {
                      const Icon = stepIcons[step.key] || Clock;
                      const done = i <= current;
                      const active = i === current;
                      return (
                        <div
                          key={step.key}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div className="relative flex w-full items-center justify-center">
                            {i > 0 && (
                              <div
                                className={cn(
                                  'absolute right-1/2 top-1/2 h-px w-full -translate-y-1/2',
                                  i <= current
                                    ? 'bg-amber-400/50'
                                    : 'bg-white/10',
                                )}
                              />
                            )}
                            <div
                              className={cn(
                                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition',
                                done
                                  ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                                  : 'border-white/10 bg-white/5 text-white/25',
                                active && 'ring-2 ring-amber-400/30',
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          </div>
                          <span
                            className={cn(
                              'mt-2 text-[9px] uppercase tracking-wider',
                              done ? 'text-white/60' : 'text-white/25',
                            )}
                          >
                            {step.shortLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="space-y-2 border-t border-white/8 pt-4">
                    {order.items.map((item) => (
                      <li
                        key={item.dishId + item.specialInstructions}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-white/70">
                          <span className="text-amber-300/80">
                            {item.quantity}×
                          </span>{' '}
                          {item.dishName}
                        </span>
                        <span className="text-white/40">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <p className="mt-3 text-xs text-white/35">
                      Note: {order.notes}
                    </p>
                  )}
                </Glass>
              </motion.div>
            );
          })
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setWaiterOpen(true)}
          >
            Need Assist
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              createRequest('bill');
              showToast('Bill request sent');
            }}
          >
            Request Bill
          </Button>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          >
            <Glass className="max-w-xs px-5 py-2.5 text-center text-sm text-amber-100">
              {toast}
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>

      <WaiterAssistSheet
        open={waiterOpen}
        onClose={() => setWaiterOpen(false)}
        onSent={(label) => showToast(`${label} sent to staff`)}
      />
    </div>
  );
}
