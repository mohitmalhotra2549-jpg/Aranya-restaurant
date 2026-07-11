import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Lock, ShieldCheck } from 'lucide-react';
import { restaurant, STAFF_PIN } from '@/data/restaurant';
import { useApp } from '@/store/AppContext';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export function StaffGate() {
  const { unlockStaff, exitStaffEntry, staffEntryRequested } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (pin.length !== STAFF_PIN.length) return;
    if (pin === STAFF_PIN) {
      unlockStaff();
      return;
    }
    setError(true);
    setShaking(true);
    const t = setTimeout(() => {
      setPin('');
      setError(false);
      setShaking(false);
    }, 500);
    return () => clearTimeout(t);
  }, [pin, unlockStaff]);

  const press = (key: string) => {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      setError(false);
      return;
    }
    if (!key || pin.length >= STAFF_PIN.length) return;
    setPin((p) => p + key);
  };

  if (!staffEntryRequested) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0908] px-5">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Glass intensity="strong" className="overflow-hidden p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-300" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/50">
              {restaurant.name}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-white">Kitchen Access</h2>
            <p className="mt-1 text-xs text-white/40">
              Enter staff PIN to open the dashboard
            </p>
            <p className="mt-3 text-[10px] tracking-[0.2em] text-white/25">
              Default PIN · 2468
            </p>
          </div>

          <motion.div
            animate={shaking ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex justify-center gap-3"
          >
            {Array.from({ length: STAFF_PIN.length }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-3 w-3 rounded-full border transition',
                  i < pin.length
                    ? error
                      ? 'border-rose-400 bg-rose-400'
                      : 'border-amber-300 bg-amber-300'
                    : 'border-white/20 bg-transparent',
                )}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 text-center text-xs text-rose-300"
              >
                Incorrect PIN — try again
              </motion.p>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((key, i) =>
              key === '' ? (
                <div key={`empty-${i}`} />
              ) : (
                <button
                  key={key}
                  type="button"
                  onClick={() => press(key)}
                  className={cn(
                    'flex h-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg font-medium text-white transition active:scale-95 hover:bg-white/[0.08]',
                    key === 'del' && 'text-white/50',
                  )}
                  aria-label={key === 'del' ? 'Delete' : key}
                >
                  {key === 'del' ? <Delete className="h-5 w-5" /> : key}
                </button>
              ),
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={exitStaffEntry} className="flex-1">
              Cancel
            </Button>
            <div className="flex items-center gap-1.5 text-[10px] text-white/25">
              <ShieldCheck className="h-3 w-3" />
              Owner / staff only
            </div>
          </div>
        </Glass>
      </motion.div>
    </div>
  );
}
