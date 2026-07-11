import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurant } from '@/data/restaurant';
import { useApp } from '@/store/AppContext';

export function LoadingScreen() {
  const { completeLoading } = useApp();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const phrases = [0, 1, 2];
    let p = 0;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12 + 4;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, 180);

    const phaseTimer = setInterval(() => {
      p = (p + 1) % phrases.length;
      setPhase(p);
    }, 900);

    return () => {
      clearInterval(progressTimer);
      clearInterval(phaseTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(completeLoading, 500);
      return () => clearTimeout(t);
    }
  }, [progress, completeLoading]);

  const labels = ['Preparing your table', 'Curating the menu', 'Lighting the tandoor'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0a0908]">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-orange-700/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center px-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-transparent"
        >
          <span className="font-serif text-2xl text-amber-300">आ</span>
        </motion.div>

        <h1 className="font-serif text-4xl tracking-[0.2em] text-white sm:text-5xl">
          {restaurant.name.toUpperCase()}
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.35em] text-amber-200/50">
          {restaurant.tagline}
        </p>

        <div className="mt-14 w-48">
          <div className="h-[1px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
          <div className="mt-4 h-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-[11px] tracking-[0.2em] text-white/35"
              >
                {labels[phase]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
