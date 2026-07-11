import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { getDishById } from '@/data/dishes';
import { Button } from '@/components/ui/Button';
import { Glass } from '@/components/ui/Glass';
import { DietaryIcon } from '@/components/ui/DietaryIcon';
import { formatPrice } from '@/utils/format';

export function CartScreen() {
  const {
    cart,
    updateCartItem,
    removeFromCart,
    cartTotal,
    placeOrder,
    setView,
    tableNumber,
  } = useApp();
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlace = () => {
    setPlacing(true);
    setTimeout(() => {
      placeOrder(notes || undefined);
      setPlacing(false);
    }, 600);
  };

  return (
    <div className="relative min-h-dvh pb-40">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0908]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => setView('menu')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/8"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl text-white">Your Order</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
              Table {tableNumber}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5">
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-20 text-center"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ShoppingBag className="h-6 w-6 text-white/30" />
            </div>
            <p className="font-serif text-xl text-white/70">Your cart is empty</p>
            <p className="mt-2 text-sm text-white/35">
              Explore the menu and add dishes to your table order
            </p>
            <Button
              variant="gold"
              className="mt-8"
              onClick={() => setView('menu')}
            >
              Browse Menu
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  const dish = getDishById(item.dishId);
                  if (!dish) return null;
                  return (
                    <motion.div
                      key={item.dishId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0 }}
                    >
                      <Glass intensity="soft" className="overflow-hidden p-3">
                        <div className="flex gap-3">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="h-20 w-20 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <DietaryIcon type={dish.dietary} size="sm" />
                                  <h3 className="truncate font-serif text-base text-white">
                                    {dish.name}
                                  </h3>
                                </div>
                                <p className="mt-0.5 text-sm text-amber-300/90">
                                  {formatPrice(dish.price)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.dishId)}
                                className="rounded-lg p-1.5 text-white/30 transition hover:bg-rose-500/10 hover:text-rose-300"
                                aria-label="Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                                <button
                                  onClick={() =>
                                    updateCartItem(item.dishId, {
                                      quantity: item.quantity - 1,
                                    })
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-white/60"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartItem(item.dishId, {
                                      quantity: item.quantity + 1,
                                    })
                                  }
                                  className="flex h-8 w-8 items-center justify-center text-white/60"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-sm font-medium text-white/80">
                                {formatPrice(dish.price * item.quantity)}
                              </span>
                            </div>

                            {item.specialInstructions && (
                              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-white/40">
                                <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </Glass>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/40">
                Notes for the kitchen
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, timing preferences..."
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/30"
              />
            </div>

            <Glass intensity="medium" className="mt-6 space-y-3 p-4">
              <div className="flex justify-between text-sm text-white/50">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/50">
                <span>Service</span>
                <span className="text-emerald-400/80">Included</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between">
                <span className="font-serif text-lg text-white">Total</span>
                <span className="font-serif text-xl text-amber-300">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </Glass>
          </>
        )}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0a0908]/90 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl">
            <Button
              fullWidth
              size="lg"
              variant="gold"
              disabled={placing}
              onClick={handlePlace}
              className="h-13 text-sm tracking-[0.12em] uppercase"
            >
              {placing
                ? 'Sending to kitchen…'
                : `Place final order · ${formatPrice(cartTotal)}`}
            </Button>
            <p className="mt-2 text-center text-[10px] text-white/25">
              Review items above, then place your final order for Table{' '}
              {tableNumber}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
