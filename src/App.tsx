import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from '@/store/AppContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { MenuScreen } from '@/components/MenuScreen';
import { DishDetail } from '@/components/DishDetail';
import { ARViewer } from '@/components/ARViewer';
import { CartScreen } from '@/components/CartScreen';
import { OrderSuccess } from '@/components/OrderSuccess';
import { OrderStatusScreen } from '@/components/OrderStatus';
import { Dashboard } from '@/components/Dashboard';
import { StaffGate } from '@/components/StaffGate';
import { GuestLiveTrackingHost } from '@/components/GuestLiveTrackingHost';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

function AppShell() {
  const { view, staffMode, staffEntryRequested } = useApp();

  // Unlocked kitchen — full dashboard only
  if (staffMode) {
    return (
      <div className="min-h-dvh bg-[#0a0908] text-white antialiased">
        <Dashboard />
      </div>
    );
  }

  // Staff URL / gate open — show PIN on top of everything (skip customer chrome)
  if (staffEntryRequested) {
    return (
      <div className="min-h-dvh bg-[#0a0908] text-white antialiased">
        <StaffGate />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0a0908] text-white antialiased">
      <StaffGate />
      <GuestLiveTrackingHost />
      <AnimatePresence mode="wait">
        {view === 'loading' && (
          <motion.div key="loading" {...pageTransition}>
            <LoadingScreen />
          </motion.div>
        )}
        {view === 'welcome' && (
          <motion.div key="welcome" {...pageTransition}>
            <WelcomeScreen />
          </motion.div>
        )}
        {view === 'menu' && (
          <motion.div key="menu" {...pageTransition}>
            <MenuScreen />
          </motion.div>
        )}
        {view === 'dish' && (
          <motion.div key="dish" {...pageTransition}>
            <DishDetail />
          </motion.div>
        )}
        {view === 'ar' && (
          <motion.div key="ar" className="min-h-dvh" {...pageTransition}>
            <ARViewer />
          </motion.div>
        )}
        {view === 'cart' && (
          <motion.div key="cart" {...pageTransition}>
            <CartScreen />
          </motion.div>
        )}
        {view === 'order-success' && (
          <motion.div key="order-success" {...pageTransition}>
            <OrderSuccess />
          </motion.div>
        )}
        {view === 'order-status' && (
          <motion.div key="order-status" {...pageTransition}>
            <OrderStatusScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
