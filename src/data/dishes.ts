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
      
      'Crisp golden bread layered with fresh vegetables, melted cheese and our signature herb spread, grilled to perfection.',
    category: 'Snacks',
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
      
      'A rich and indulgent chocolate cake with a moist crumb, silky ganache and a delicate cocoa finish.',
    category: 'Desserts',
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
      
      'A light, flaky pastry finished with smooth cream and an elegant touch of sweetness.',
    category: 'Desserts',
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
      
      'A crunchy spiced chicken fillet with crisp lettuce, cheese and creamy sauce, served inside a toasted sesame bun.',
    category: 'Burgers',
    image:
      './images/zinger-burger.jpg',
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
      
      'Tandoor-baked kulcha served with deeply spiced bhaji, fresh onions and house pickle.',
    category: 'Indian',
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
      
      'Delicate steamed dumplings filled with seasoned vegetables and served with a fiery house chilli dip.',
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
