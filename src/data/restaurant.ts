import type { RestaurantInfo } from '@/types';

export const restaurant: RestaurantInfo = {
  name: 'Aaranya',
  tagline: 'A Sanctuary of Indian Flavours',
  cuisine: 'Contemporary Indian',
  location: 'Table-side dining experience',
  currency: 'INR',
  currencySymbol: '₹',
};

/**
 * Kitchen / owner access
 * ----------------------
 * Change this PIN anytime. Staff open the dashboard with:
 *   1. Secret URL (append to your live app URL):
 *        ?staff=1
 *        ?mode=kitchen
 *        #staff
 *   2. Or long-press the आ monogram on the welcome screen / tap it 5 times
 * Both paths require this PIN. Customers never see a Staff button.
 *
 * Example: if the app is at https://example.com then open
 *          https://example.com/?staff=1
 *          then enter the PIN below.
 */
export const STAFF_PIN = '2468';

/** How long a successful staff login stays active on this device (hours) */
export const STAFF_SESSION_HOURS = 12;

export const categories = [
  'All',
  'Starters',
  'Mains',
  'Breads',
  'Rice',
  'Beverages',
] as const;

export type Category = (typeof categories)[number];
