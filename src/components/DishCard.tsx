import { motion } from 'framer-motion';
import { Clock, View } from 'lucide-react';
import type { Dish } from '@/types';
import { Glass } from '@/components/ui/Glass';
import { Badge } from '@/components/ui/Badge';
import { DietaryIcon } from '@/components/ui/DietaryIcon';
import { SpiceMeter } from '@/components/ui/SpiceMeter';
import { formatPrice } from '@/utils/format';
import { useApp } from '@/store/AppContext';

interface DishCardProps {
  dish: Dish;
  index?: number;
}

export function DishCard({ dish, index = 0 }: DishCardProps) {
  const { selectDish } = useApp();

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.06, 0.3),
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      <Glass
        intensity="soft"
        className="overflow-hidden transition duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]"
      >
        <button
          onClick={() => selectDish(dish.id)}
          className="w-full text-left"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={dish.image}
              alt={dish.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-black/20 to-transparent" />

            <div className="absolute left-3 top-3 flex items-center gap-2">
              <DietaryIcon type={dish.dietary} />
              {dish.featured && <Badge tone="gold">Signature</Badge>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                selectDish(dish.id, 'ar');
              }}
              className="absolute right-3 top-3 flex h-10 items-center justify-center gap-2 rounded-full border border-amber-300/60 bg-stone-950/90 px-4 text-[10px] font-semibold uppercase tracking-wider text-amber-100 shadow-xl shadow-black/50 backdrop-blur-xl transition hover:border-amber-200/80 hover:bg-black"
              aria-label="View in AR"
            >
              <View className="h-3.5 w-3.5" />
              View in AR
            </button>

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <span className="font-serif text-lg text-amber-200">
                {formatPrice(dish.price)}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/50">
                <Clock className="h-3 w-3" />
                {dish.prepTime} min
              </span>
            </div>
          </div>

          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg leading-snug text-white/95">
                {dish.name}
              </h3>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-white/40">
              {dish.description}
            </p>
            <div className="flex items-center justify-between pt-1">
              <SpiceMeter level={dish.spiceLevel} />
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                {dish.category}
              </span>
            </div>
          </div>
        </button>
      </Glass>
    </motion.article>
  );
}
