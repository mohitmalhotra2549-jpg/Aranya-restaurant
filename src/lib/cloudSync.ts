import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  type Database,
  type Unsubscribe,
} from 'firebase/database';
import {
  CLOUD_ROOM_ID,
  firebaseWebConfig,
  isFirebaseConfigured,
} from '@/data/firebaseConfig';
import type { Order, TableRequest } from '@/types';

export type CloudPayload = {
  orders: Order[];
  requests: TableRequest[];
  menuAvailability: Record<string, boolean>;
  updatedAt: number;
};

export type CloudSyncStatus =
  | 'disabled'
  | 'connecting'
  | 'online'
  | 'error'
  | 'local-only';

let app: FirebaseApp | null = null;
let db: Database | null = null;

function getDb(): Database | null {
  if (!isFirebaseConfigured()) return null;
  try {
    if (!app) {
      app = getApps().length ? getApps()[0]! : initializeApp(firebaseWebConfig);
    }
    if (!db) db = getDatabase(app);
    return db;
  } catch (e) {
    console.error('[Aaranya cloud] Firebase init failed', e);
    return null;
  }
}

function roomPath(segment: string) {
  return `restaurants/${CLOUD_ROOM_ID}/${segment}`;
}

function toMap<T extends { id: string }>(list: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const item of list) map[item.id] = item;
  return map;
}

function fromMap<T>(value: unknown): T[] {
  if (!value || typeof value !== 'object') return [];
  return Object.values(value as Record<string, T>).filter(Boolean);
}

/** Merge two order lists by id, keeping the newest updatedAt */
export function mergeByUpdatedAt<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  local: T[],
  remote: T[],
): T[] {
  const map = new Map<string, T>();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) {
    const prev = map.get(item.id);
    if (!prev) {
      map.set(item.id, item);
      continue;
    }
    const prevT = Date.parse(prev.updatedAt || prev.createdAt || '') || 0;
    const nextT = Date.parse(item.updatedAt || item.createdAt || '') || 0;
    if (nextT >= prevT) map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => {
    const ta = Date.parse(b.updatedAt || b.createdAt || '') || 0;
    const tb = Date.parse(a.updatedAt || a.createdAt || '') || 0;
    return ta - tb;
  });
}

export function subscribeCloud(
  onData: (data: CloudPayload) => void,
  onStatus: (status: CloudSyncStatus, detail?: string) => void,
): Unsubscribe | (() => void) {
  if (!isFirebaseConfigured()) {
    onStatus('local-only', 'Firebase not configured');
    return () => undefined;
  }

  const database = getDb();
  if (!database) {
    onStatus('error', 'Could not start Firebase');
    return () => undefined;
  }

  onStatus('connecting');
  const root = ref(database, roomPath('state'));

  const unsub = onValue(
    root,
    (snap) => {
      const val = snap.val() as Partial<CloudPayload> | null;
      onStatus('online');
      if (!val) {
        onData({
          orders: [],
          requests: [],
          menuAvailability: {},
          updatedAt: Date.now(),
        });
        return;
      }
      // Support both array and map shapes
      const orders = Array.isArray(val.orders)
        ? (val.orders as Order[])
        : fromMap<Order>((val as { orders?: unknown }).orders);
      const requests = Array.isArray(val.requests)
        ? (val.requests as TableRequest[])
        : fromMap<TableRequest>((val as { requests?: unknown }).requests);

      onData({
        orders,
        requests,
        menuAvailability: val.menuAvailability || {},
        updatedAt: val.updatedAt || Date.now(),
      });
    },
    (err) => {
      console.error('[Aaranya cloud] listen error', err);
      onStatus('error', err.message);
    },
  );

  return unsub;
}

export async function pushCloud(data: {
  orders: Order[];
  requests: TableRequest[];
  menuAvailability: Record<string, boolean>;
}): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const database = getDb();
  if (!database) return false;

  try {
    // Store as maps for stable Firebase paths + arrays for easy clients
    const payload = {
      orders: toMap(data.orders),
      requests: toMap(data.requests),
      menuAvailability: data.menuAvailability,
      updatedAt: Date.now(),
    };
    await set(ref(database, roomPath('state')), payload);
    return true;
  } catch (e) {
    console.error('[Aaranya cloud] push failed', e);
    return false;
  }
}

/**
 * Atomic writes used for actions that must never be lost between phones.
 * Unlike replacing the whole state, one guest cannot overwrite another
 * guest's order while the kitchen is updating a different order.
 */
export async function upsertCloudOrder(order: Order): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const database = getDb();
  if (!database) return false;

  try {
    await Promise.all([
      set(ref(database, `${roomPath('state/orders')}/${order.id}`), order),
      set(ref(database, roomPath('state/updatedAt')), Date.now()),
    ]);
    return true;
  } catch (e) {
    console.error('[Aaranya cloud] order write failed', e);
    return false;
  }
}

export async function upsertCloudRequest(
  request: TableRequest,
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const database = getDb();
  if (!database) return false;

  try {
    await Promise.all([
      set(
        ref(database, `${roomPath('state/requests')}/${request.id}`),
        request,
      ),
      set(ref(database, roomPath('state/updatedAt')), Date.now()),
    ]);
    return true;
  } catch (e) {
    console.error('[Aaranya cloud] request write failed', e);
    return false;
  }
}

export async function pushCloudMenuAvailability(
  availability: Record<string, boolean>,
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const database = getDb();
  if (!database) return false;

  try {
    await update(ref(database, roomPath('state')), {
      menuAvailability: availability,
      updatedAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error('[Aaranya cloud] menu write failed', e);
    return false;
  }
}

export function cloudSyncLabel(status: CloudSyncStatus): string {
  switch (status) {
    case 'online':
      return 'Cloud sync · multi-phone';
    case 'connecting':
      return 'Connecting cloud…';
    case 'error':
      return 'Cloud error · local only';
    case 'local-only':
      return 'Local only · same phone';
    default:
      return 'Cloud off';
  }
}
