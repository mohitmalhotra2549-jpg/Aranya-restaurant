import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Radio, UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/Button';
import { restaurant } from '@/data/restaurant';

export function OrderSuccess() {
  const { setView, tableNumber, tableOrders } = useApp();
  const latest = tableOrders[0];

  useEffect(() => {
    // subtle confetti-like particles via CSS only — no lib
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-amber-600/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative mb-8 flex h-24 w-24 items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.2, repeat: 1 }}
          className="absolute inset-0 rounded-full border border-emerald-400/40"
        />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border border-emerald-400/40">
          <Check className="h-9 w-9 text-emerald-300" strokeWidth={2.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 max-w-sm text-center"
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/60">
          Order received
        </p>
        <h1 className="mt-3 font-serif text-3xl text-white">
          On its way to the kitchen
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/45">
          Your order for Table {tableNumber} has been sent to{' '}
          {restaurant.name}. We&apos;ll prepare it with care.
        </p>

        {latest && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
              Order {latest.id.slice(-6).toUpperCase()}
            </p>
            <ul className="mt-2 space-y-1">
              {latest.items.map((item) => (
                <li
                  key={item.dishId}
                  className="flex justify-between text-sm text-white/70"
                >
                  <span>
                    {item.quantity}× {item.dishName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            variant="gold"
            size="lg"
            fullWidth
            onClick={() => setView('order-status')}
          >
            <Radio className="h-4 w-4" />
            Live Tracking
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setView('menu')}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Continue Browsing
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
