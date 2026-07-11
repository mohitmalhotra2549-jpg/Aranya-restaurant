import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  ChefHat,
  ClipboardList,
  Droplets,
  Flame,
  LogOut,
  MessageSquare,
  Radio,
  Receipt,
  ScrollText,
  ToggleLeft,
  ToggleRight,
  Utensils,
  UtensilsCrossed,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { dishes } from '@/data/dishes';
import { restaurant } from '@/data/restaurant';
import { requestTypeLabel } from '@/data/serviceRequests';
import { getStage, nextStage } from '@/data/orderTracking';
import { useStaffAlerts } from '@/hooks/useStaffAlerts';
import { StaffAlertBanner } from '@/components/StaffAlertBanner';
import { LiveTrackingPanel } from '@/components/LiveTrackingPanel';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatTime } from '@/utils/format';
import type { RequestType } from '@/types';
import { cn } from '@/utils/cn';
import { unlockNotifyAudio, playNotifySound } from '@/utils/notifySound';

function requestIcon(type: RequestType) {
  switch (type) {
    case 'bill':
      return Receipt;
    case 'water':
      return Droplets;
    case 'cutlery':
      return Utensils;
    case 'tissues':
      return ScrollText;
    case 'spices':
      return Flame;
    case 'other':
      return MessageSquare;
    default:
      return Bell;
  }
}

function requestTone(type: RequestType) {
  if (type === 'bill') return 'border-amber-400/25 bg-amber-500/10 text-amber-300';
  if (type === 'water') return 'border-sky-400/25 bg-sky-500/10 text-sky-300';
  if (type === 'cutlery') return 'border-violet-400/25 bg-violet-500/10 text-violet-300';
  if (type === 'tissues') return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300';
  if (type === 'spices') return 'border-orange-400/25 bg-orange-500/10 text-orange-300';
  if (type === 'other') return 'border-white/15 bg-white/5 text-white/70';
  return 'border-rose-400/25 bg-rose-500/10 text-rose-300';
}

type Tab = 'orders' | 'live' | 'requests' | 'menu';

export function Dashboard() {
  const {
    orders,
    updateOrderStatus,
    setOrderLiveTracking,
    requests,
    acknowledgeRequest,
    resolveRequest,
    menuAvailability,
    setDishAvailability,
    lockStaff,
    cloudStatus,
    cloudStatusLabel,
    cloudReady,
  } = useApp();
  const [tab, setTab] = useState<Tab>('orders');
  const { muted, setMuted, banner, dismissBanner } = useStaffAlerts(
    true,
    orders,
    requests,
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'completed'),
    [orders],
  );
  const openRequests = useMemo(
    () => requests.filter((r) => r.status !== 'resolved'),
    [requests],
  );

  const toggleSound = async () => {
    if (muted) {
      await unlockNotifyAudio();
      setMuted(false);
      playNotifySound('test');
    } else {
      setMuted(true);
    }
  };

  return (
    <div className="min-h-dvh pb-10">
      <StaffAlertBanner alert={banner} onDismiss={dismissBanner} />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0908]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/25 bg-amber-500/10">
                <span className="font-serif text-sm text-amber-300">आ</span>
              </div>
              <div>
                <h1 className="font-serif text-xl text-white">
                  {restaurant.name} · Kitchen
                </h1>
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {cloudStatusLabel}
                  {muted ? ' · muted' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="gold">{activeOrders.length} active</Badge>
              {openRequests.length > 0 && (
                <Badge tone="nonveg">{openRequests.length} calls</Badge>
              )}
              <button
                type="button"
                onClick={toggleSound}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl border transition',
                  muted
                    ? 'border-white/10 bg-white/5 text-white/40 hover:text-white'
                    : 'border-amber-400/30 bg-amber-500/15 text-amber-200',
                )}
                title={muted ? 'Unmute kitchen alerts' : 'Mute kitchen alerts'}
                aria-label={muted ? 'Unmute alerts' : 'Mute alerts'}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={lockStaff}
                className="ml-0.5 flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] uppercase tracking-wider text-white/50 transition hover:border-rose-400/30 hover:text-rose-200"
                title="Sign out of kitchen"
              >
                <LogOut className="h-3.5 w-3.5" />
                Exit
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1">
            {(
              [
                { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
                { id: 'live' as const, label: 'Live', icon: Radio },
                { id: 'requests' as const, label: 'Requests', icon: Bell },
                { id: 'menu' as const, label: 'Menu', icon: UtensilsCrossed },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs transition',
                  tab === id
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
                {id === 'requests' && openRequests.length > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] text-white">
                    {openRequests.length}
                  </span>
                )}
                {id === 'live' && activeOrders.length > 0 && (
                  <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5">
        <AnimatePresence mode="wait">
          {tab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {!cloudReady && (
                <Glass intensity="soft" className="border-amber-400/20 p-3">
                  <p className="text-xs leading-relaxed text-amber-100/80">
                    <strong className="text-amber-200">Why two phones don’t sync:</strong>{' '}
                    orders are saved only on each phone right now. Add your free
                    Firebase config in{' '}
                    <code className="text-amber-200">src/data/firebaseConfig.ts</code>{' '}
                    so guest phone → kitchen phone works live.
                  </p>
                </Glass>
              )}
              {cloudReady && cloudStatus === 'online' && (
                <Glass intensity="soft" className="border-emerald-400/20 p-3">
                  <p className="text-xs text-emerald-100/80">
                    Cloud sync is ON — guest orders from any phone will appear here.
                  </p>
                </Glass>
              )}
              {activeOrders.length === 0 ? (
                <EmptyState
                  icon={<ChefHat className="h-6 w-6" />}
                  title="No active orders"
                  subtitle={
                    cloudReady
                      ? 'Waiting for guest phones on the same cloud room…'
                      : 'Same phone works now. Configure Firebase for multi-phone.'
                  }
                />
              ) : (
                activeOrders.map((order) => {
                  const stage = getStage(order.status);
                  const next = nextStage(order.status);
                  const live = order.liveTracking !== false;
                  return (
                    <Glass key={order.id} intensity="medium" className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-lg text-white">
                              Table {order.tableNumber}
                            </span>
                            <Badge
                              tone={
                                order.status === 'ready' ||
                                order.status === 'served'
                                  ? 'veg'
                                  : 'gold'
                              }
                            >
                              {stage.shortLabel}
                            </Badge>
                            {live && (
                              <Badge tone="veg">
                                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                Live
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-white/35">
                            {formatTime(order.createdAt)} ·{' '}
                            {formatPrice(order.total)}
                          </p>
                          <p className="mt-1 text-[11px] text-white/40">
                            Guest: {order.statusNote || stage.guestMessage}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setOrderLiveTracking(order.id, !live)
                            }
                            className={cn(
                              'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition',
                              live
                                ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                                : 'border-white/10 text-white/35',
                            )}
                          >
                            <Radio className="h-3 w-3" />
                            {live ? 'Live' : 'Off'}
                          </button>
                          {next && (
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() =>
                                updateOrderStatus(order.id, next.key, {
                                  liveTracking: true,
                                  statusNote: next.guestMessage,
                                })
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                              {next.staffAction}
                            </Button>
                          )}
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2 border-t border-white/8 pt-3">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-sm">
                            <div className="flex justify-between text-white/75">
                              <span>
                                <span className="font-medium text-amber-300">
                                  {item.quantity}×
                                </span>{' '}
                                {item.dishName}
                              </span>
                              <span className="text-white/40">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                            {item.specialInstructions && (
                              <p className="mt-0.5 text-xs text-amber-200/50">
                                “{item.specialInstructions}”
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <p className="mt-2 text-xs text-white/40">
                          Kitchen note: {order.notes}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setTab('live')}
                        className="mt-3 text-[11px] uppercase tracking-[0.16em] text-amber-300/70 transition hover:text-amber-200"
                      >
                        Open live tracking →
                      </button>
                    </Glass>
                  );
                })
              )}
            </motion.div>
          )}

          {tab === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <LiveTrackingPanel />
            </motion.div>
          )}

          {tab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {openRequests.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-6 w-6" />}
                  title="No open requests"
                  subtitle="Water, cutlery, waiter, and bill calls appear here"
                />
              ) : (
                openRequests.map((req) => {
                  const Icon = requestIcon(req.type);
                  return (
                    <Glass key={req.id} intensity="medium" className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-xl border',
                              requestTone(req.type),
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-serif text-base text-white">
                              Table {req.tableNumber}
                            </p>
                            <p className="text-sm text-white/50">
                              {requestTypeLabel(req.type, req.message)}
                            </p>
                            {req.message && req.type !== 'other' && (
                              <p className="mt-0.5 text-xs text-white/35">
                                {req.message}
                              </p>
                            )}
                            {req.type === 'other' && req.message && (
                              <p className="mt-0.5 text-xs text-amber-200/60">
                                “{req.message}”
                              </p>
                            )}
                            <p className="mt-0.5 text-[11px] text-white/30">
                              {formatTime(req.createdAt)} · {req.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {req.status === 'open' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => acknowledgeRequest(req.id)}
                            >
                              Ack
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => resolveRequest(req.id)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    </Glass>
                  );
                })
              )}
            </motion.div>
          )}

          {tab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="mb-2 text-xs text-white/40">
                Toggle availability. To add or edit dishes permanently, update{' '}
                <code className="text-amber-300/80">src/data/dishes.ts</code>
              </p>
              {dishes.map((dish) => {
                const available =
                  menuAvailability[dish.id] !== undefined
                    ? menuAvailability[dish.id]
                    : dish.available !== false;
                return (
                  <Glass
                    key={dish.id}
                    intensity="soft"
                    className="flex items-center gap-3 p-3"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base text-white">
                        {dish.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {dish.category} · {formatPrice(dish.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => setDishAvailability(dish.id, !available)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition',
                        available
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-white/5 text-white/40',
                      )}
                    >
                      {available ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      {available ? 'On' : 'Off'}
                    </button>
                  </Glass>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Glass className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 text-white/25">{icon}</div>
      <p className="font-serif text-lg text-white/70">{title}</p>
      <p className="mt-1 text-sm text-white/35">{subtitle}</p>
    </Glass>
  );
}
