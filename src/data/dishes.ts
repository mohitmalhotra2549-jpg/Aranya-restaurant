import type { Dish } from '@/types';

/**
 * MENU DATA — single source of truth
 * ----------------------------------
 * Add, edit, or remove dishes here only.
 * The UI and app logic read from this file automatically.
 *
 * Required fields: id, name, price, description, category, image,
 * model3d, dietary, spiceLevel, ingredients, allergens, prepTime, calories
 *
 * Optional: featured, available (defaults to true)
 */
export const dishes: Dish[] = [
  {
    id: 'paneer-tikka',
    name: 'Grilled Sandwich',
    price: 420,
    description:
      'Hand-cut cottage cheese marinated in aged Kashmiri chilli, smoked yoghurt and royal spices, finished in a charcoal tandoor and served with mint chutney.',
    category: 'Starters',
    image:
      './images/grilled-sandwich.jpg',
    model3d: './models/grilled-sandwich.glb',
    dietary: 'veg',
    spiceLevel: 2,
    ingredients: [
      'Paneer',
      'Hung curd',
      'Kashmiri chilli',
      'Garam masala',
      'Bell peppers',
      'Mint chutney',
    ],
    allergens: ['Dairy'],
    prepTime: 18,
    calories: 320,
    featured: true,
    available: true,
  },
  {
    id: 'butter-chicken',
    name: 'Chocolate Cake',
    price: 580,
    description:
      'Slow-braised free-range chicken in a velvety tomato-cashew gravy, tempered with white butter and fenugreek. A signature of the house.',
    category: 'Mains',
    image:
      './images/chocolate-cake.jpg',
    model3d: './models/chocolate-cake.glb',
    dietary: 'non-veg',
    spiceLevel: 2,
    ingredients: [
      'Chicken thigh',
      'Tomato',
      'Cashew',
      'White butter',
      'Kasuri methi',
      'Cream',
    ],
    allergens: ['Dairy', 'Tree nuts'],
    prepTime: 25,
    calories: 540,
    featured: true,
    available: true,
  },
  {
    id: 'hyderabadi-biryani',
    name: 'Pastry',
    price: 640,
    description:
      'Fragrant basmati layered with tender lamb, saffron milk and caramelised onions, sealed and slow-cooked in the traditional dum style.',
    category: 'Rice',
    image:
      './images/pastry.jpg',
    model3d: './models/pastry.glb',
    dietary: 'non-veg',
    spiceLevel: 3,
    ingredients: [
      'Basmati rice',
      'Lamb',
      'Saffron',
      'Fried onions',
      'Mint',
      'Yoghurt',
      'Whole spices',
    ],
    allergens: ['Dairy'],
    prepTime: 35,
    calories: 720,
    featured: true,
    available: true,
  },
  {
    id: 'garlic-naan',
    name: 'Zinger Burger',
    price: 120,
    description:
      'Soft leavened flatbread brushed with clarified butter, roasted garlic and fresh coriander, baked against the walls of our clay tandoor.',
    category: 'Breads',
    image:
      'https://images.pexels.com/photos/20446413/pexels-photo-20446413.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200',
    model3d: './models/zinger-burger.glb',
    dietary: 'veg',
    spiceLevel: 0,
    ingredients: ['Maida', 'Yeast', 'Garlic', 'Ghee', 'Coriander', 'Nigella seeds'],
    allergens: ['Gluten', 'Dairy'],
    prepTime: 12,
    calories: 280,
    featured: false,
    available: true,
  },
  {
    id: 'mango-lassi',
    name: 'Kulcha with Bhaji',
    price: 220,
    description:
      'Silken yoghurt blended with sun-ripened Alphonso mangoes, a whisper of cardamom and crushed pistachio. Served chilled.',
    category: 'Beverages',
    image:
      './images/kulcha-with-bhaji.jpg',
    model3d: './models/kulcha-with-bhaji.glb',
    dietary: 'veg',
    spiceLevel: 0,
    ingredients: ['Alphonso mango', 'Yoghurt', 'Cardamom', 'Honey', 'Pistachio'],
    allergens: ['Dairy', 'Tree nuts'],
    prepTime: 8,
    calories: 260,
    featured: false,
    available: true,
  },

  {
    id: 'momos',
    name: 'Momos',
    price: 190,
    description:
      'Steamed dumplings filled with seasoned vegetables and served with a fiery house chilli dip.',
    category: 'Snacks',
    image:
      'https://images.pexels.com/photos/18803177/pexels-photo-18803177.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200',
    model3d: './models/momos.glb',
    dietary: 'veg',
    spiceLevel: 2,
    ingredients: [
      'Flour',
      'Cabbage',
      'Carrot',
      'Spring onion',
      'Garlic',
      'Chilli dip',
    ],
    allergens: ['Gluten'],
    prepTime: 15,
    calories: 290,
    featured: false,
    available: true,
  },
];

/** Helper: get dish by id */
export function getDishById(id: string): Dish | undefined {
  return dishes.find((d) => d.id === id);
}

/** Helper: filter by category (use "All" for everything) */
export function getDishesByCategory(category: string): Dish[] {
  if (category === 'All') return dishes.filter((d) => d.available !== false);
  return dishes.filter((d) => d.category === category && d.available !== false);
}

/** Helper: featured dishes for welcome highlights */
export function getFeaturedDishes(): Dish[] {
  return dishes.filter((d) => d.featured && d.available !== false);
}
