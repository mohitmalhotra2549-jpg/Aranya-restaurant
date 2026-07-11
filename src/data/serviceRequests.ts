import type { RequestType } from '@/types';

/**
 * Guest service options shown when tapping "Waiter".
 * Add / edit / remove items here — UI updates automatically.
 */
export interface ServiceOption {
  id: string;
  type: RequestType;
  label: string;
  description: string;
  /** Icon key used by the waiter assist sheet */
  icon: 'bell' | 'droplets' | 'utensils' | 'napkin' | 'flame' | 'message' | 'receipt';
  message: string;
}

export const waiterServiceOptions: ServiceOption[] = [
  {
    id: 'call-waiter',
    type: 'waiter',
    label: 'Call Waiter',
    description: 'Someone will come to your table',
    icon: 'bell',
    message: 'Please assist this table',
  },
  {
    id: 'water',
    type: 'water',
    label: 'Call for Water',
    description: 'Fresh water for the table',
    icon: 'droplets',
    message: 'Please bring water',
  },
  {
    id: 'cutlery',
    type: 'cutlery',
    label: 'Call for Cutlery',
    description: 'Spoons, forks, knives, or plates',
    icon: 'utensils',
    message: 'Please bring cutlery',
  },
  {
    id: 'tissues',
    type: 'tissues',
    label: 'Tissues / Napkins',
    description: 'Extra napkins for the table',
    icon: 'napkin',
    message: 'Please bring tissues / napkins',
  },
  {
    id: 'spices',
    type: 'spices',
    label: 'Spices & Condiments',
    description: 'Chilli, salt, chutney, pickle',
    icon: 'flame',
    message: 'Please bring spices / condiments',
  },
  {
    id: 'other',
    type: 'other',
    label: 'Something Else',
    description: 'Send a short note to staff',
    icon: 'message',
    message: '',
  },
];

export function requestTypeLabel(type: RequestType, message?: string): string {
  switch (type) {
    case 'waiter':
      return 'Call waiter';
    case 'bill':
      return 'Request bill';
    case 'water':
      return 'Water';
    case 'cutlery':
      return 'Cutlery';
    case 'tissues':
      return 'Tissues / napkins';
    case 'spices':
      return 'Spices & condiments';
    case 'other':
      return message?.trim() ? `Other · ${message}` : 'Other request';
    default:
      return type;
  }
}
