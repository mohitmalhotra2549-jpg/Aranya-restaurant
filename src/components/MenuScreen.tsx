import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Bell,
  Receipt,
  Radio,
  X,
} from 'lucide-react';
import { categories } from '@/data/restaurant';
import { restaurant } from '@/data/restaurant';
import { useFilteredDishes } from '@/hooks/useFilteredDishes';
import { useApp } from '@/store/AppContext';
import { DishCard } from '@/components/DishCard';
import { WaiterAssistSheet } from '@/components/WaiterAssistSheet';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';

export function MenuScreen() {
  const {
    tableNumber,
    setView,
    cartCount,
    cartTotal,
    createRequest,
    tableOrders,
  } = useApp();
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const filtered = useFilteredDishes(category, search);

  const activeOrders = useMemo(
    () =>
      tableOrders.filter(
        (o) => o.status !== 'served' && o.status !== 'completed',
      ),
    [tableOrders],
  );

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 2500);
  };

  const requestBill = () => {
    createRequest('bill');
    showToast('Bill request sent');
  };

  return (
    <div className={cn('relative min-h-dvh', cartCount > 0 ? 'pb-40' : 'pb-28')}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0908]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={() => setView('welcome')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/25 bg-amber-500/10">
              <span className="font-serif text-sm text-amber-300">आ</span>
            </div>
            <div>
              <p className="font-serif text-base tracking-wide text-white">
                {restaurant.name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                Table {tableNumber}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white"
              aria-label="Search"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            {activeOrders.length > 0 && (
              <button
                onClick={() => setView('order-status')}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-emerald-300/80 transition hover:bg-emerald-500/10 hover:text-emerald-200"
                aria-label="Live tracking"
                title="Live tracking"
              >
                <Radio className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              </button>
            )}
            <button
              onClick={() => setView('cart')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/8 hover:text-white"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-stone-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dishes, ingredients..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-400/30"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.14em] transition',
                category === cat
                  ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-stone-950'
                  : 'border border-white/10 bg-white/5 text-white/50 hover:text-white/80',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl text-white">
              {category === 'All' ? 'Our Menu' : category}
            </h2>
            <p className="mt-0.5 text-xs text-white/35">
              {filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Glass className="p-10 text-center">
            <p className="text-sm text-white/40">No dishes found</p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
              className="mt-3 text-xs text-amber-300/70 underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </Glass>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((dish, i) => (
              <DishCard key={dish.id} dish={dish} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Floating action bar — cart is the path to final place order */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
        <div className="mx-auto max-w-2xl space-y-2">
          {cartCount > 0 && (
            <button
              type="button"
              onClick={() => setView('cart')}
              className="flex w-full items-center justify-between rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent px-4 py-3 text-left backdrop-blur-xl transition hover:border-amber-400/40"
            >
              <span>
                <span className="block text-[10px] uppercase tracking-[0.18em] text-amber-200/60">
                  Ready to place order
                </span>
                <span className="mt-0.5 block text-sm text-white">
                  {cartCount} item{cartCount === 1 ? '' : 's'} in cart ·{' '}
                  {formatPrice(cartTotal)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-950">
                Cart
                <ShoppingBag className="h-3.5 w-3.5" />
              </span>
            </button>
          )}
          <Glass
            intensity="strong"
            className="flex items-center gap-2 p-2 shadow-2xl shadow-black/50"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWaiterOpen(true)}
              className="flex-1"
            >
              <Bell className="h-3.5 w-3.5" />
              Assist
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={requestBill}
              className="flex-1"
            >
              <Receipt className="h-3.5 w-3.5" />
              Bill
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <Button
              variant="gold"
              size="sm"
              onClick={() => setView('cart')}
              className="flex-1"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartCount > 0 ? `Place order · ${cartCount}` : 'Cart'}
            </Button>
          </Glass>
        </div>
      </div>

      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <Glass className="px-5 py-2.5 text-sm text-amber-100">
              {actionToast}
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
