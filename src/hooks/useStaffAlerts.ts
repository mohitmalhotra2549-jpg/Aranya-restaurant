import { useEffect, useRef, useState } from 'react';
import { playNotifySound, unlockNotifyAudio } from '@/utils/notifySound';
import type { Order, TableRequest } from '@/types';

const MUTE_KEY = 'aaranya_staff_alerts_muted';
const SEEN_ORDERS_KEY = 'aaranya_seen_order_ids';
const SEEN_REQUESTS_KEY = 'aaranya_seen_request_ids';

function loadIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveIdSet(key: string, set: Set<string>) {
  try {
    // Keep last 200 ids to avoid unbounded growth
    const arr = Array.from(set).slice(-200);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export interface StaffAlert {
  id: string;
  kind: 'order' | 'assist';
  title: string;
  detail: string;
  at: number;
}

/**
 * Kitchen-only: pings when new orders or assist requests appear.
 * Safe on first load (seeds seen ids without sounding for history).
 */
export function useStaffAlerts(
  enabled: boolean,
  orders: Order[],
  requests: TableRequest[],
) {
  const [muted, setMutedState] = useState(readMuted);
  const [banner, setBanner] = useState<StaffAlert | null>(null);
  const seeded = useRef(false);
  const seenOrders = useRef<Set<string>>(new Set());
  const seenRequests = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    // Unlock audio after first staff interaction with the page
    const unlock = () => {
      void unlockNotifyAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    // Best-effort unlock (works if browser already allowed audio)
    void unlockNotifyAudio();
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (!seeded.current) {
      const storedOrders = loadIdSet(SEEN_ORDERS_KEY);
      const storedReqs = loadIdSet(SEEN_REQUESTS_KEY);
      orders.forEach((o) => storedOrders.add(o.id));
      requests.forEach((r) => storedReqs.add(r.id));
      seenOrders.current = storedOrders;
      seenRequests.current = storedReqs;
      saveIdSet(SEEN_ORDERS_KEY, storedOrders);
      saveIdSet(SEEN_REQUESTS_KEY, storedReqs);
      seeded.current = true;
      return;
    }

    // New orders
    const freshOrders = orders.filter((o) => !seenOrders.current.has(o.id));
    for (const order of freshOrders) {
      seenOrders.current.add(order.id);
      if (!muted) playNotifySound('order');
      const itemSummary = order.items
        .map((i) => `${i.quantity}× ${i.dishName}`)
        .join(', ');
      setBanner({
        id: order.id,
        kind: 'order',
        title: `New order · Table ${order.tableNumber}`,
        detail: itemSummary || 'Items received',
        at: Date.now(),
      });
    }
    if (freshOrders.length) saveIdSet(SEEN_ORDERS_KEY, seenOrders.current);

    // New assist / bill requests
    const freshReqs = requests.filter((r) => !seenRequests.current.has(r.id));
    for (const req of freshReqs) {
      seenRequests.current.add(req.id);
      if (!muted) playNotifySound('assist');
      setBanner({
        id: req.id,
        kind: 'assist',
        title: `Table ${req.tableNumber} needs help`,
        detail: req.message || req.type,
        at: Date.now(),
      });
    }
    if (freshReqs.length) saveIdSet(SEEN_REQUESTS_KEY, seenRequests.current);
  }, [enabled, orders, requests, muted]);

  // Auto-hide banner
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4500);
    return () => clearTimeout(t);
  }, [banner]);

  const setMuted = (value: boolean) => {
    setMutedState(value);
    try {
      localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!value) {
      void unlockNotifyAudio().then(() => playNotifySound('test'));
    }
  };

  const dismissBanner = () => setBanner(null);

  return { muted, setMuted, banner, dismissBanner };
}
