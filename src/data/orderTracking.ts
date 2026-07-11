import type { OrderStatus } from '@/types';

/**
 * Live tracking stages — kitchen advances these; guests see them in real time.
 * Edit labels/messages here only.
 */
export interface TrackingStage {
  key: OrderStatus;
  label: string;
  shortLabel: string;
  guestMessage: string;
  staffAction: string;
}

export const trackingStages: TrackingStage[] = [
  {
    key: 'pending',
    label: 'Received',
    shortLabel: 'New',
    guestMessage: 'Your order has reached the kitchen',
    staffAction: 'Mark received',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    guestMessage: 'Kitchen has confirmed your order',
    staffAction: 'Confirm order',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    shortLabel: 'Cooking',
    guestMessage: 'Our chefs are preparing your dishes',
    staffAction: 'Start preparing',
  },
  {
    key: 'ready',
    label: 'Ready',
    shortLabel: 'Ready',
    guestMessage: 'Your order is ready and on the way to your table',
    staffAction: 'Mark ready',
  },
  {
    key: 'served',
    label: 'Served',
    shortLabel: 'Served',
    guestMessage: 'Enjoy your meal — bon appétit',
    staffAction: 'Mark served',
  },
  {
    key: 'completed',
    label: 'Completed',
    shortLabel: 'Done',
    guestMessage: 'This order is complete. Thank you for dining with us',
    staffAction: 'Complete order',
  },
];

export function getStage(status: OrderStatus): TrackingStage {
  return (
    trackingStages.find((s) => s.key === status) ?? trackingStages[0]
  );
}

export function stageIndex(status: OrderStatus): number {
  const i = trackingStages.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export function nextStage(status: OrderStatus): TrackingStage | null {
  const i = stageIndex(status);
  if (i < 0 || i >= trackingStages.length - 1) return null;
  return trackingStages[i + 1];
}

/** Guest-facing progress steps (hide completed terminal from the path UI) */
export const guestProgressStages = trackingStages.filter(
  (s) => s.key !== 'completed',
);
