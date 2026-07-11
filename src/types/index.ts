export type DietaryType = 'veg' | 'non-veg' | 'vegan';
export type SpiceLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';
export type RequestType =
  | 'waiter'
  | 'bill'
  | 'water'
  | 'cutlery'
  | 'tissues'
  | 'spices'
  | 'other';
export type RequestStatus = 'open' | 'acknowledged' | 'resolved';

export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  model3d: string;
  dietary: DietaryType;
  spiceLevel: SpiceLevel;
  ingredients: string[];
  allergens: string[];
  prepTime: number;
  calories: number;
  featured?: boolean;
  available?: boolean;
}

export interface CartItem {
  dishId: string;
  quantity: number;
  specialInstructions: string;
}

export interface OrderItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  specialInstructions: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  /** Optional kitchen note pushed with live tracking updates */
  statusNote?: string;
  /** Whether kitchen is actively broadcasting this order to the guest */
  liveTracking?: boolean;
}

export interface TableRequest {
  id: string;
  tableNumber: number;
  type: RequestType;
  message?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  cuisine: string;
  location: string;
  currency: string;
  currencySymbol: string;
}

export type AppView =
  | 'loading'
  | 'welcome'
  | 'menu'
  | 'dish'
  | 'ar'
  | 'cart'
  | 'order-success'
  | 'order-status'
  | 'dashboard';
