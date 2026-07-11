import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { restaurant } from '@/data/restaurant';
import { getFeaturedDishes } from '@/data/dishes';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/Button';
import { Glass } from '@/components/ui/Glass';
import { formatPrice } from '@/utils/format';

export function WelcomeScreen() {
  const { tableNumber, setView, selectDish, requestStaffEntry } = useApp();
  const featured = getFeaturedDishes().slice(0, 3);

  /** Hidden owner entry: long-press monogram (~700ms) or 5 quick taps */
  const [tapCount, setTapCount] = useState(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapReset = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerStaffGate = () => {
    requestStaffEntry();
    setTapCount(0);
  };

  const onLogoPointerDown = () => {
    pressTimer.current = setTimeout(triggerStaffGate, 700);
  };

  const onLogoPointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onLogoClick = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapReset.current) clearTimeout(tapReset.current);
    if (next >= 5) {
      triggerStaffGate();
      return;
    }
    tapReset.current = setTimeout(() => setTapCount(0), 1200);
  };

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,120,40,0.18),_transparent_55%)]" />
        <div className="absolute -left-20 top-40 h-64 w-64 rounded-full bg-amber-700/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-900/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-10 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-white/40">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[11px] tracking-[0.2em] uppercase">
              Table {tableNumber}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 text-center"
        >
          <button
            type="button"
            onClick={onLogoClick}
            onPointerDown={onLogoPointerDown}
            onPointerUp={onLogoPointerUp}
            onPointerLeave={onLogoPointerUp}
            onPointerCancel={onLogoPointerUp}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/25 bg-gradient-to-br from-amber-400/15 to-transparent select-none"
            aria-label={restaurant.name}
          >
            <span className="font-serif text-xl text-amber-300">आ</span>
          </button>
          <p className="text-[11px] uppercase tracking-[0.4em] text-amber-200/50">
            Welcome to
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[0.12em] text-white sm:text-6xl">
            {restaurant.name}
          </h1>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <p className="mt-5 text-sm leading-relaxed text-white/45">
            {restaurant.tagline}
          </p>
          <p className="mt-1 text-xs text-white/25">{restaurant.cuisine}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-10"
        >
          <Button
            fullWidth
            size="lg"
            variant="gold"
            onClick={() => setView('menu')}
            className="h-14 text-sm tracking-[0.18em] uppercase"
          >
            Explore Menu
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-12"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400/70" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                Chef&apos;s Selections
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {featured.map((dish, i) => (
                <motion.button
                  key={dish.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  onClick={() => selectDish(dish.id)}
                  className="group w-44 shrink-0 text-left"
                >
                  <Glass
                    intensity="soft"
                    className="overflow-hidden transition duration-300 group-hover:border-amber-400/25"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs font-medium text-amber-200">
                        {formatPrice(dish.price)}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm text-white/90">{dish.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">
                        {dish.category}
                      </p>
                    </div>
                  </Glass>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-auto pt-10 text-center text-[10px] tracking-[0.2em] text-white/20"
        >
          SCAN · VIEW IN AR · ORDER TO TABLE
        </motion.p>
      </div>
    </div>
  );
}
