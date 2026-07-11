import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Flame,
  Plus,
  Minus,
  ShoppingBag,
  View,
  Leaf,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useDish } from '@/hooks/useFilteredDishes';
import { Button } from '@/components/ui/Button';
import { Glass } from '@/components/ui/Glass';
import { Badge } from '@/components/ui/Badge';
import { DietaryIcon } from '@/components/ui/DietaryIcon';
import { SpiceMeter } from '@/components/ui/SpiceMeter';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

export function DishDetail() {
  const { selectedDishId, setView, addToCart, selectDish, cart, cartCount } =
    useApp();
  const dish = useDish(selectedDishId);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  if (!dish) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Button variant="secondary" onClick={() => setView('menu')}>
          Back to menu
        </Button>
      </div>
    );
  }

  const alreadyInCart = cart.some((item) => item.dishId === dish.id);
  const inCartQty = cart.find((item) => item.dishId === dish.id)?.quantity ?? 0;

  const goToCart = () => {
    selectDish(null);
    setView('cart');
  };

  const handleAdd = () => {
    addToCart(dish.id, qty, instructions);
    setJustAdded(true);
    // Keep "Added" feedback briefly, then invite cart for final order
    setTimeout(() => setJustAdded(false), 1600);
  };

  const primaryLabel = justAdded
    ? 'Added to cart'
    : alreadyInCart
      ? `Order again · ${formatPrice(dish.price * qty)}`
      : `Add to cart · ${formatPrice(dish.price * qty)}`;

  return (
    <div
      className={cn(
        'relative min-h-dvh',
        alreadyInCart || justAdded || cartCount > 0 ? 'pb-44' : 'pb-36',
      )}
    >
      {/* Hero image */}
      <div className="relative h-[42vh] min-h-[280px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          src={dish.image}
          alt={dish.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/40 to-black/30" />

        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => {
              selectDish(null);
              setView('menu');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setView('ar')}
            className="backdrop-blur-md"
          >
            <View className="h-3.5 w-3.5" />
            View in AR
          </Button>
        </div>
      </div>

      <div className="relative z-10 -mt-10 px-4">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DietaryIcon type={dish.dietary} size="md" />
              <Badge tone={dish.dietary === 'non-veg' ? 'nonveg' : 'veg'}>
                {dish.dietary}
              </Badge>
              <Badge tone="muted">{dish.category}</Badge>
              {dish.featured && <Badge tone="gold">Signature</Badge>}
            </div>

            <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
              {dish.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="font-serif text-2xl text-amber-300">
                {formatPrice(dish.price)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <Clock className="h-3.5 w-3.5" />
                {dish.prepTime} min
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <Flame className="h-3.5 w-3.5" />
                {dish.calories} kcal
              </span>
            </div>

            <div className="mt-4">
              <SpiceMeter level={dish.spiceLevel} />
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/55">
              {dish.description}
            </p>

            {/* Ingredients */}
            <Glass intensity="soft" className="mt-6 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5 text-emerald-400/70" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                  Ingredients
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-white/60"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </Glass>

            {dish.allergens.length > 0 && (
              <Glass intensity="soft" className="mt-3 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400/70" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                    Allergens
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-200/80"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </Glass>
            )}

            {/* Special instructions */}
            <div className="mt-6">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/40">
                Special instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. less spicy, no onions..."
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/30"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky bottom add + cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0a0908]/90 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl space-y-2">
          <div className="flex items-center gap-3">
            <Glass intensity="medium" className="flex items-center gap-1 p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-white">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </Glass>

            <Button
              fullWidth
              size="lg"
              variant="gold"
              onClick={handleAdd}
              className="h-12"
            >
              <ShoppingBag className="h-4 w-4" />
              {primaryLabel}
            </Button>
          </div>

          {(alreadyInCart || justAdded || cartCount > 0) && (
            <div className="flex items-center gap-2">
              {alreadyInCart && !justAdded && (
                <p className="flex-1 text-[11px] text-white/40">
                  {inCartQty} in cart · order again or place final order
                </p>
              )}
              {justAdded && (
                <p className="flex-1 text-[11px] text-emerald-300/70">
                  Added · open cart to place final order
                </p>
              )}
              {!alreadyInCart && !justAdded && cartCount > 0 && (
                <p className="flex-1 text-[11px] text-white/40">
                  {cartCount} item{cartCount === 1 ? '' : 's'} waiting in cart
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={goToCart}
                className="shrink-0"
              >
                Go to cart
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
