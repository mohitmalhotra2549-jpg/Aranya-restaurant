import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Radio,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import {
  getStage,
  nextStage,
  stageIndex,
  trackingStages,
} from '@/data/orderTracking';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Order, OrderStatus } from '@/types';

export function LiveTrackingPanel() {
  const { orders, updateOrderStatus, setOrderLiveTracking } = useApp();
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [flashId, setFlashId] = useState<string | null>(null);

  const trackable = useMemo(
    () => orders.filter((o) => o.status !== 'completed'),
    [orders],
  );

  const pushStatus = (
    order: Order,
    status: OrderStatus,
    withNote?: string,
  ) => {
    const stage = getStage(status);
    updateOrderStatus(order.id, status, {
      liveTracking: true,
      statusNote: withNote?.trim() || stage.guestMessage,
    });
    setFlashId(order.id);
    setTimeout(() => setFlashId(null), 1200);
  };

  const pushNoteOnly = (order: Order) => {
    const note = (noteDrafts[order.id] || '').trim();
    if (!note) return;
    updateOrderStatus(order.id, order.status, {
      liveTracking: true,
      statusNote: note,
    });
    setNoteDrafts((d) => ({ ...d, [order.id]: '' }));
    setFlashId(order.id);
    setTimeout(() => setFlashId(null), 1200);
  };

  if (trackable.length === 0) {
    return (
      <Glass className="flex flex-col items-center px-6 py-16 text-center">
        <Radio className="mb-4 h-6 w-6 text-white/25" />
        <p className="font-serif text-lg text-white/70">No live orders</p>
        <p className="mt-1 text-sm text-white/35">
          When guests place orders, push real-time status from here
        </p>
      </Glass>
    );
  }

  return (
    <div className="space-y-4">
      <Glass intensity="soft" className="flex items-start gap-3 p-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
          <Radio className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-white/90">Live Tracking</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/40">
            Advance each stage to update the guest&apos;s phone instantly.
            Turn Live on so customers see kitchen progress on their table menu.
          </p>
        </div>
      </Glass>

      {trackable.map((order) => {
        const current = stageIndex(order.status);
        const next = nextStage(order.status);
        const live = order.liveTracking !== false;
        const stage = getStage(order.status);

        return (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Glass
              intensity="medium"
              className={cn(
                'overflow-hidden p-4 transition',
                flashId === order.id && 'border-emerald-400/40',
                live && 'ring-1 ring-emerald-400/15',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-lg text-white">
                      Table {order.tableNumber}
                    </span>
                    <Badge tone={live ? 'veg' : 'muted'}>
                      {live ? 'Live to guest' : 'Hidden'}
                    </Badge>
                    <Badge tone="gold">{stage.shortLabel}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    {formatTime(order.createdAt)} · {formatPrice(order.total)} ·
                    updated {formatTime(order.updatedAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOrderLiveTracking(order.id, !live)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition',
                    live
                      ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-white/40',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      live ? 'animate-pulse bg-emerald-400' : 'bg-white/25',
                    )}
                  />
                  {live ? 'Live' : 'Off'}
                </button>
              </div>

              {/* Stage stepper — staff can jump or advance */}
              <div className="mt-4 flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {trackingStages
                  .filter((s) => s.key !== 'completed' || order.status === 'completed')
                  .map((s, i) => {
                    const active = s.key === order.status;
                    const done = i <= current;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => pushStatus(order, s.key)}
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition',
                          active
                            ? 'border-amber-400/40 bg-amber-500/20 text-amber-100'
                            : done
                              ? 'border-white/10 bg-white/8 text-white/60 hover:border-amber-400/25'
                              : 'border-white/8 bg-transparent text-white/30 hover:text-white/50',
                        )}
                      >
                        {s.shortLabel}
                      </button>
                    );
                  })}
              </div>

              <p className="mt-3 text-xs text-white/45">
                Guest sees:{' '}
                <span className="text-amber-200/80">
                  {order.statusNote || stage.guestMessage}
                </span>
              </p>

              <ul className="mt-3 space-y-1 border-t border-white/8 pt-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-white/70">
                    <span className="text-amber-300">{item.quantity}×</span>{' '}
                    {item.dishName}
                  </li>
                ))}
              </ul>

              {/* Push next stage */}
              {next && (
                <Button
                  fullWidth
                  variant="gold"
                  className="mt-4"
                  onClick={() => pushStatus(order, next.key)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Live update · {next.staffAction}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}

              {order.status === 'served' && (
                <Button
                  fullWidth
                  variant="secondary"
                  className="mt-2"
                  onClick={() => pushStatus(order, 'completed')}
                >
                  <Check className="h-3.5 w-3.5" />
                  Complete & clear for guest
                </Button>
              )}

              {/* Custom message to guest */}
              <div className="mt-3 flex gap-2">
                <input
                  value={noteDrafts[order.id] ?? ''}
                  onChange={(e) =>
                    setNoteDrafts((d) => ({
                      ...d,
                      [order.id]: e.target.value,
                    }))
                  }
                  placeholder="Optional note for guest…"
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/30"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={!(noteDrafts[order.id] || '').trim()}
                  onClick={() => pushNoteOnly(order)}
                  aria-label="Send note to guest"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Glass>
          </motion.div>
        );
      })}
    </div>
  );
}
