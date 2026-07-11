import { restaurant } from '@/data/restaurant';

export function formatPrice(amount: number): string {
  return `${restaurant.currencySymbol}${amount.toLocaleString('en-IN')}`;
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function spiceLabel(level: number): string {
  if (level <= 0) return 'Mild';
  if (level === 1) return 'Gentle';
  if (level === 2) return 'Medium';
  if (level === 3) return 'Spicy';
  if (level === 4) return 'Hot';
  return 'Fiery';
}
