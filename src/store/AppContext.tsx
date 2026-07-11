import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getDishById } from '@/data/dishes';
import { STAFF_SESSION_HOURS } from '@/data/restaurant';
import {
  cloudSyncLabel,
  mergeByUpdatedAt,
  pushCloudMenuAvailability,
  subscribeCloud,
  upsertCloudOrder,
  upsertCloudRequest,
  type CloudSyncStatus,
} from '@/lib/cloudSync';
import { isFirebaseConfigured } from '@/data/firebaseConfig';
import type {
  AppView,
  CartItem,
  Order,
  OrderStatus,
  TableRequest,
  RequestType,
} from '@/types';

const ORDERS_KEY = 'aaranya_orders';
const REQUESTS_KEY = 'aaranya_requests';
const MENU_EDITS_KEY = 'aaranya_menu_edits';
const STAFF_SESSION_KEY = 'aaranya_staff_session';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function parseTableFromUrl(): number {
  if (typeof window === 'undefined') return 12;
  const params = new URLSearchParams(window.location.search);
  const t = params.get('table') || params.get('t');
  const n = t ? parseInt(t, 10) : NaN;
  if (!Number.isNaN(n) && n > 0 && n < 500) return n;
  return 12;
}

/**
 * Detect staff/kitchen entry from several URL shapes so owners can bookmark easily:
 *   ?staff=1
 *   ?mode=kitchen
 *   ?kitchen=1
 *   #staff
 *   #/staff
 */
function wantsStaffEntryFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('staff') === '1' ||
      params.get('staff') === 'true' ||
      params.get('mode') === 'kitchen' ||
      params.get('kitchen') === '1'
    ) {
      return true;
    }
    const hash = (window.location.hash || '').toLowerCase().replace(/^#\/?/, '');
    if (hash === 'staff' || hash === 'kitchen' || hash.startsWith('staff')) {
      return true;
    }
    const path = (window.location.pathname || '').toLowerCase();
    if (path.endsWith('/staff') || path.endsWith('/kitchen')) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function readValidStaffSession(): boolean {
  try {
    const raw = localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
    if (typeof expiresAt !== 'number' || Date.now() > expiresAt) {
      localStorage.removeItem(STAFF_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function writeStaffSession() {
  const expiresAt = Date.now() + STAFF_SESSION_HOURS * 60 * 60 * 1000;
  saveJSON(STAFF_SESSION_KEY, { expiresAt });
}

function clearStaffSession() {
  try {
    localStorage.removeItem(STAFF_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

interface AppContextValue {
  tableNumber: number;
  staffMode: boolean;
  staffEntryRequested: boolean;
  requestStaffEntry: () => void;
  exitStaffEntry: () => void;
  unlockStaff: () => void;
  lockStaff: () => void;
  view: AppView;
  setView: (v: AppView) => void;
  selectedDishId: string | null;
  selectDish: (id: string | null, nextView?: AppView) => void;
  cart: CartItem[];
  addToCart: (dishId: string, qty?: number, instructions?: string) => void;
  updateCartItem: (dishId: string, patch: Partial<CartItem>) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  placeOrder: (notes?: string) => Order | null;
  orders: Order[];
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    options?: { statusNote?: string; liveTracking?: boolean },
  ) => void;
  setOrderLiveTracking: (orderId: string, live: boolean) => void;
  tableOrders: Order[];
  requests: TableRequest[];
  createRequest: (type: RequestType, message?: string) => void;
  resolveRequest: (id: string) => void;
  acknowledgeRequest: (id: string) => void;
  loadingComplete: boolean;
  completeLoading: () => void;
  menuAvailability: Record<string, boolean>;
  setDishAvailability: (dishId: string, available: boolean) => void;
  cloudStatus: CloudSyncStatus;
  cloudStatusLabel: string;
  cloudReady: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tableNumber] = useState(parseTableFromUrl);
  const urlWantsStaff = wantsStaffEntryFromUrl();
  const hadSession = readValidStaffSession();

  const [staffMode, setStaffMode] = useState(() => hadSession);
  const [staffEntryRequested, setStaffEntryRequested] = useState(
    () => urlWantsStaff && !hadSession,
  );
  // Skip customer splash when opening kitchen URL — go straight to PIN or dashboard
  const [view, setView] = useState<AppView>(() =>
    hadSession ? 'dashboard' : urlWantsStaff ? 'welcome' : 'loading',
  );
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => loadJSON(ORDERS_KEY, []));
  const [requests, setRequests] = useState<TableRequest[]>(() =>
    loadJSON(REQUESTS_KEY, []),
  );
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [menuAvailability, setMenuAvailability] = useState<Record<string, boolean>>(
    () => loadJSON(MENU_EDITS_KEY, {}),
  );
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>(() =>
    isFirebaseConfigured() ? 'connecting' : 'local-only',
  );
  const applyingRemote = useRef(false);
  const cloudReady = isFirebaseConfigured();

  useEffect(() => {
    saveJSON(ORDERS_KEY, orders);
  }, [orders]);

  useEffect(() => {
    saveJSON(REQUESTS_KEY, requests);
  }, [requests]);

  useEffect(() => {
    saveJSON(MENU_EDITS_KEY, menuAvailability);
  }, [menuAvailability]);

  // Same-browser tabs still sync via localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue) as Order[]);
        } catch {
          /* ignore */
        }
      }
      if (e.key === REQUESTS_KEY && e.newValue) {
        try {
          setRequests(JSON.parse(e.newValue) as TableRequest[]);
        } catch {
          /* ignore */
        }
      }
      if (e.key === MENU_EDITS_KEY && e.newValue) {
        try {
          setMenuAvailability(JSON.parse(e.newValue) as Record<string, boolean>);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Multi-phone cloud sync (Firebase Realtime Database)
  useEffect(() => {
    if (!cloudReady) {
      setCloudStatus('local-only');
      return;
    }

    const unsub = subscribeCloud(
      (remote) => {
        applyingRemote.current = true;
        setOrders((local) => mergeByUpdatedAt(local, remote.orders));
        setRequests((local) => {
          const merged = mergeByUpdatedAt(
            local.map((r) => ({ ...r, updatedAt: r.createdAt })),
            remote.requests.map((r) => ({ ...r, updatedAt: r.createdAt })),
          );
          return merged.map((item) => {
            const { updatedAt: _drop, ...rest } = item as TableRequest & {
              updatedAt?: string;
            };
            return rest as TableRequest;
          });
        });
        setMenuAvailability((local) => ({
          ...local,
          ...remote.menuAvailability,
        }));
        queueMicrotask(() => {
          applyingRemote.current = false;
        });
      },
      (status) => setCloudStatus(status),
    );

    return () => {
      unsub();
    };
  }, [cloudReady]);

  // Menu availability is a shared restaurant setting. Orders and requests
  // are written atomically at action time below, avoiding multi-phone races.
  useEffect(() => {
    if (!cloudReady || applyingRemote.current) return;
    const t = window.setTimeout(() => {
      void pushCloudMenuAvailability(menuAvailability).then((ok) => {
        if (!ok) setCloudStatus('error');
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [menuAvailability, cloudReady]);

  // Re-check staff URL on mount (covers late hydration / hash changes)
  useEffect(() => {
    const staffUrl = wantsStaffEntryFromUrl();
    if (!staffUrl) return;
    if (readValidStaffSession()) {
      setStaffMode(true);
      setStaffEntryRequested(false);
      setView('dashboard');
      return;
    }
    setStaffEntryRequested(true);
  }, []);

  const selectDish = useCallback((id: string | null, nextView: AppView = 'dish') => {
    setSelectedDishId(id);
    if (id) setView(nextView);
  }, []);

  const addToCart = useCallback(
    (dishId: string, qty = 1, instructions = '') => {
      setCart((prev) => {
        const existing = prev.find((i) => i.dishId === dishId);
        if (existing) {
          return prev.map((i) =>
            i.dishId === dishId
              ? {
                  ...i,
                  quantity: i.quantity + qty,
                  specialInstructions: instructions || i.specialInstructions,
                }
              : i,
          );
        }
        return [
          ...prev,
          { dishId, quantity: qty, specialInstructions: instructions },
        ];
      });
    },
    [],
  );

  const updateCartItem = useCallback((dishId: string, patch: Partial<CartItem>) => {
    setCart((prev) =>
      prev
        .map((i) => (i.dishId === dishId ? { ...i, ...patch } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    setCart((prev) => prev.filter((i) => i.dishId !== dishId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const dish = getDishById(item.dishId);
      return sum + (dish?.price ?? 0) * item.quantity;
    }, 0);
  }, [cart]);

  const placeOrder = useCallback(
    (notes?: string): Order | null => {
      if (cart.length === 0) return null;
      const items = cart
        .map((c) => {
          const dish = getDishById(c.dishId);
          if (!dish) return null;
          return {
            dishId: dish.id,
            dishName: dish.name,
            price: dish.price,
            quantity: c.quantity,
            specialInstructions: c.specialInstructions,
          };
        })
        .filter(Boolean) as Order['items'];

      if (items.length === 0) return null;

      const now = new Date().toISOString();
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const order: Order = {
        id: uid('ord'),
        tableNumber,
        items,
        status: 'pending',
        total,
        createdAt: now,
        updatedAt: now,
        notes,
        liveTracking: true,
        statusNote: 'Order received — waiting for kitchen confirmation',
      };

      setOrders((prev) => [order, ...prev]);
      if (cloudReady) {
        void upsertCloudOrder(order).then((ok) => {
          setCloudStatus(ok ? 'online' : 'error');
        });
      }
      setCart([]);
      setView('order-success');
      return order;
    },
    [cart, tableNumber, cloudReady],
  );

  const updateOrderStatus = useCallback(
    (
      orderId: string,
      status: OrderStatus,
      options?: { statusNote?: string; liveTracking?: boolean },
    ) => {
      const current = orders.find((o) => o.id === orderId);
      if (!current) return;
      const updated: Order = {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
        liveTracking: options?.liveTracking ?? current.liveTracking ?? true,
        statusNote:
          options?.statusNote !== undefined
            ? options.statusNote
            : current.statusNote,
      };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (cloudReady) {
        void upsertCloudOrder(updated).then((ok) => {
          setCloudStatus(ok ? 'online' : 'error');
        });
      }
    },
    [orders, cloudReady],
  );

  const setOrderLiveTracking = useCallback((orderId: string, live: boolean) => {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    const updated: Order = {
      ...current,
      liveTracking: live,
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    if (cloudReady) {
      void upsertCloudOrder(updated).then((ok) => {
        setCloudStatus(ok ? 'online' : 'error');
      });
    }
  }, [orders, cloudReady]);

  const tableOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.tableNumber === tableNumber && !['completed'].includes(o.status),
      ),
    [orders, tableNumber],
  );

  const createRequest = useCallback(
    (type: RequestType, message?: string) => {
      const req: TableRequest = {
        id: uid('req'),
        tableNumber,
        type,
        message,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [req, ...prev]);
      if (cloudReady) {
        void upsertCloudRequest(req).then((ok) => {
          setCloudStatus(ok ? 'online' : 'error');
        });
      }
    },
    [tableNumber, cloudReady],
  );

  const resolveRequest = useCallback((id: string) => {
    const current = requests.find((r) => r.id === id);
    if (!current) return;
    const updated: TableRequest = { ...current, status: 'resolved' };
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    if (cloudReady) {
      void upsertCloudRequest(updated).then((ok) => {
        setCloudStatus(ok ? 'online' : 'error');
      });
    }
  }, [requests, cloudReady]);

  const acknowledgeRequest = useCallback((id: string) => {
    const current = requests.find((r) => r.id === id);
    if (!current) return;
    const updated: TableRequest = { ...current, status: 'acknowledged' };
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    if (cloudReady) {
      void upsertCloudRequest(updated).then((ok) => {
        setCloudStatus(ok ? 'online' : 'error');
      });
    }
  }, [requests, cloudReady]);

  const completeLoading = useCallback(() => {
    setLoadingComplete(true);
    if (staffMode) {
      setView('dashboard');
      return;
    }
    // Keep staff PIN gate if owner opened via ?staff=1
    if (wantsStaffEntryFromUrl() && !readValidStaffSession()) {
      setStaffEntryRequested(true);
    }
    setView('welcome');
  }, [staffMode]);

  const setDishAvailability = useCallback((dishId: string, available: boolean) => {
    setMenuAvailability((prev) => ({ ...prev, [dishId]: available }));
  }, []);

  const requestStaffEntry = useCallback(() => {
    if (readValidStaffSession()) {
      setStaffMode(true);
      setView('dashboard');
      return;
    }
    setStaffEntryRequested(true);
  }, []);

  const exitStaffEntry = useCallback(() => {
    setStaffEntryRequested(false);
    // Strip staff query so refresh doesn't re-open gate
    if (typeof window !== 'undefined' && wantsStaffEntryFromUrl()) {
      const url = new URL(window.location.href);
      url.searchParams.delete('staff');
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const unlockStaff = useCallback(() => {
    writeStaffSession();
    setStaffMode(true);
    setStaffEntryRequested(false);
    setView('dashboard');
  }, []);

  const lockStaff = useCallback(() => {
    clearStaffSession();
    setStaffMode(false);
    setStaffEntryRequested(false);
    setView('welcome');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('staff');
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  /** Customers cannot open the kitchen dashboard without staff unlock */
  const navigate = useCallback(
    (v: AppView) => {
      if (v === 'dashboard' && !staffMode) {
        requestStaffEntry();
        return;
      }
      setView(v);
    },
    [staffMode, requestStaffEntry],
  );

  const value: AppContextValue = {
    tableNumber,
    staffMode,
    staffEntryRequested,
    requestStaffEntry,
    exitStaffEntry,
    unlockStaff,
    lockStaff,
    view,
    setView: navigate,
    selectedDishId,
    selectDish,
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    placeOrder,
    orders,
    updateOrderStatus,
    setOrderLiveTracking,
    tableOrders,
    requests,
    createRequest,
    resolveRequest,
    acknowledgeRequest,
    loadingComplete,
    completeLoading,
    menuAvailability,
    setDishAvailability,
    cloudStatus,
    cloudStatusLabel: cloudSyncLabel(cloudStatus),
    cloudReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
