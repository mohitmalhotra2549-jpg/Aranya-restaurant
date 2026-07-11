import { useEffect, useRef, useState } from 'react';
import { getStage } from '@/data/orderTracking';
import {
  playGuestTrackingChime,
  unlockGuestAudio,
} from '@/utils/guestNotifySound';
import type { Order } from '@/types';

export interface GuestTrackingNotice {
  id: string;
  orderId: string;
  title: string;
  message: string;
  statusLabel: string;
  at: number;
}

type Snapshot = {
  status: string;
  note: string;
  updatedAt: string;
  live: boolean;
};

/**
 * Watches this table's orders and emits guest notifications when kitchen
 * pushes live tracking updates (status / note changes).
 */
export function useGuestTrackingNotifications(
  enabled: boolean,
  tableOrders: Order[],
) {
  const [notice, setNotice] = useState<GuestTrackingNotice | null>(null);
  const [queue, setQueue] = useState<GuestTrackingNotice[]>([]);
  const seeded = useRef(false);
  const snapshots = useRef<Map<string, Snapshot>>(new Map());

  // Unlock audio after first guest tap (mobile browsers)
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => {
      void unlockGuestAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [enabled]);

  // Seed without notifying for existing history
  useEffect(() => {
    if (!enabled) return;
    if (!seeded.current) {
      const map = new Map<string, Snapshot>();
      tableOrders.forEach((o) => {
        map.set(o.id, {
          status: o.status,
          note: o.statusNote || '',
          updatedAt: o.updatedAt,
          live: o.liveTracking !== false,
        });
      });
      snapshots.current = map;
      seeded.current = true;
      return;
    }

    const nextNotices: GuestTrackingNotice[] = [];

    for (const order of tableOrders) {
      if (order.liveTracking === false) {
        snapshots.current.set(order.id, {
          status: order.status,
          note: order.statusNote || '',
          updatedAt: order.updatedAt,
          live: false,
        });
        continue;
      }

      const prev = snapshots.current.get(order.id);
      const stage = getStage(order.status);
      const note = order.statusNote || stage.guestMessage;

      if (!prev) {
        // Brand-new order for this session — soft notify once
        nextNotices.push({
          id: `${order.id}_${order.updatedAt}_new`,
          orderId: order.id,
          title: 'Order received',
          message: note,
          statusLabel: stage.label,
          at: Date.now(),
        });
      } else {
        const statusChanged = prev.status !== order.status;
        const noteChanged =
          prev.note !== (order.statusNote || '') &&
          (order.statusNote || '') !== '';
        const bumped =
          prev.updatedAt !== order.updatedAt &&
          (statusChanged || noteChanged || prev.live === false);

        if (bumped || statusChanged || noteChanged) {
          nextNotices.push({
            id: `${order.id}_${order.updatedAt}`,
            orderId: order.id,
            title: statusChanged
              ? `Order ${stage.label.toLowerCase()}`
              : 'Kitchen update',
            message: note,
            statusLabel: stage.label,
            at: Date.now(),
          });
        }
      }

      // At this point live tracking is enabled for the order
      snapshots.current.set(order.id, {
        status: order.status,
        note: order.statusNote || '',
        updatedAt: order.updatedAt,
        live: true,
      });
    }

    // Drop snapshots for orders no longer active
    const activeIds = new Set(tableOrders.map((o) => o.id));
    for (const id of snapshots.current.keys()) {
      if (!activeIds.has(id)) snapshots.current.delete(id);
    }

    if (nextNotices.length) {
      setQueue((q) => [...q, ...nextNotices]);
    }
  }, [enabled, tableOrders]);

  // Drain queue one at a time
  useEffect(() => {
    if (!enabled) return;
    if (notice || queue.length === 0) return;
    const [head, ...rest] = queue;
    setNotice(head);
    setQueue(rest);
    playGuestTrackingChime();
  }, [enabled, notice, queue]);

  // Auto dismiss
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(t);
  }, [notice]);

  const dismiss = () => setNotice(null);

  return { notice, dismiss };
}
