import { useMemo } from 'react';
import { dishes } from '@/data/dishes';
import { useApp } from '@/store/AppContext';
import type { Dish } from '@/types';

export function useFilteredDishes(category: string, search = ''): Dish[] {
  const { menuAvailability } = useApp();

  return useMemo(() => {
    const q = search.trim().toLowerCase();
    return dishes.filter((d) => {
      const available =
        menuAvailability[d.id] !== undefined
          ? menuAvailability[d.id]
          : d.available !== false;
      if (!available) return false;
      if (category !== 'All' && d.category !== category) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q)
      );
    });
  }, [category, search, menuAvailability]);
}

export function useDish(id: string | null): Dish | undefined {
  const { menuAvailability } = useApp();
  return useMemo(() => {
    if (!id) return undefined;
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return undefined;
    const available =
      menuAvailability[dish.id] !== undefined
        ? menuAvailability[dish.id]
        : dish.available !== false;
    return { ...dish, available };
  }, [id, menuAvailability]);
}
