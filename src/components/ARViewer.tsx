import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ShoppingBag,
  Info,
  Camera,
  ScanLine,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useDish } from '@/hooks/useFilteredDishes';
import { Button } from '@/components/ui/Button';
import { Glass } from '@/components/ui/Glass';
import { formatPrice } from '@/utils/format';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean | string;
          'ar-modes'?: string;
          'camera-controls'?: boolean | string;
          'touch-action'?: string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          exposure?: string;
          'environment-image'?: string;
          'auto-rotate'?: boolean | string;
          'rotation-per-second'?: string;
          'camera-orbit'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'field-of-view'?: string;
          'interaction-prompt'?: string;
          loading?: string;
          reveal?: string;
          poster?: string;
          scale?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

export function ARViewer() {
  const { selectedDishId, setView, addToCart, cart } = useApp();
  const dish = useDish(selectedDishId);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [openingCamera, setOpeningCamera] = useState(false);
  const [arUnavailable, setArUnavailable] = useState(false);

  // Prevent Android Chrome pull-to-refresh while using AR gestures.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previous = {
      htmlOverscroll: html.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyTouchAction: body.style.touchAction,
    };

    html.style.overscrollBehavior = 'none';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    return () => {
      html.style.overscrollBehavior = previous.htmlOverscroll;
      html.style.overflow = previous.htmlOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.style.overflow = previous.bodyOverflow;
      body.style.touchAction = previous.bodyTouchAction;
    };
  }, []);

  useEffect(() => {
    if (customElements.get('model-viewer')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src =
      'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !scriptLoaded) return;

    const onLoad = () => setReady(true);
    const onError = () => setLoadError(true);
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, [scriptLoaded, dish?.model3d]);

  useEffect(() => {
    const el = viewerRef.current as HTMLElement & {
      cameraOrbit?: string;
      fieldOfView?: string;
    } | null;
    if (!el) return;
    const fov = Math.max(18, Math.min(45, 30 / zoom));
    el.setAttribute('field-of-view', `${fov}deg`);
  }, [zoom]);

  if (!dish) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Button variant="secondary" onClick={() => setView('menu')}>
          Back to menu
        </Button>
      </div>
    );
  }

  const resetView = () => {
    const el = viewerRef.current;
    if (!el) return;
    el.setAttribute('camera-orbit', '0deg 75deg 105%');
    el.setAttribute('field-of-view', '30deg');
    setZoom(1);
  };

  const alreadyInCart = cart.some((item) => item.dishId === dish.id);

  const handleAdd = () => {
    addToCart(dish.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const goToCart = () => setView('cart');

  const viewOnTable = async () => {
    const viewer = viewerRef.current as HTMLElement & {
      activateAR?: () => Promise<void> | void;
    } | null;

    if (!viewer?.activateAR) return;

    setOpeningCamera(true);

    try {
      await viewer.activateAR();
    } finally {
      setTimeout(() => setOpeningCamera(false), 700);
    }
  };

  const arButtonLabel = justAdded
    ? 'Added to cart'
    : alreadyInCart
      ? 'Order again'
      : 'Add to cart';

  return (
    <div className="ar-viewer fixed inset-0 flex h-dvh flex-col overflow-hidden bg-[#080706]">
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4">
        <button
          onClick={() => setView('dish')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Glass intensity="strong" className="px-4 py-2">
          <p className="text-xs font-medium text-white/90">{dish.name}</p>
          <p className="text-[10px] text-amber-300/80">{formatPrice(dish.price)}</p>
        </Glass>
        <div className="w-10" />
      </div>

      {/* 3D Stage */}
      <div className="relative min-h-0 flex-1 touch-none overflow-hidden">
        {!ready && !loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
            <p className="text-xs tracking-[0.2em] text-white/40">
              LOADING 3D MODEL
            </p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <img
              src={dish.image}
              alt={dish.name}
              className="h-48 w-48 rounded-2xl object-cover shadow-2xl"
            />
            <p className="text-sm text-white/50">
              3D preview unavailable — showing photo
            </p>
          </div>
        )}

        {scriptLoaded && !loadError && (
          // @ts-expect-error model-viewer web component
          <model-viewer
            ref={viewerRef as React.RefObject<HTMLElement>}
            src={dish.model3d}
            alt={dish.name}
            ar
            ar-modes="webxr quick-look"
            camera-controls
            touch-action="none"
            shadow-intensity="1"
            shadow-softness="0.8"
            exposure="1.1"
            auto-rotate
            rotation-per-second="18deg"
            camera-orbit="0deg 75deg 105%"
            field-of-view="30deg"
            interaction-prompt="auto"
            loading="eager"
            poster={dish.image}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100%',
              touchAction: 'none',
              overscrollBehavior: 'none',
              background:
                'radial-gradient(ellipse at center, #1a1510 0%, #080706 70%)',
              '--poster-color': 'transparent',
            } as React.CSSProperties}
          />
        )}

        {/* Floor glow */}
        <div className="pointer-events-none absolute bottom-[18%] left-1/2 h-8 w-40 -translate-x-1/2 rounded-[100%] bg-amber-500/15 blur-xl" />

        {showHint && ready && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-36 left-1/2 z-20 -translate-x-1/2"
          >
            <Glass className="flex items-center gap-2 px-4 py-2">
              <Info className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[11px] text-white/70">
                Drag to rotate · Pinch to zoom · View on Table for camera
              </span>
            </Glass>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
        <div className="mx-auto max-w-md space-y-3">
          <motion.button
            type="button"
            onClick={viewOnTable}
            disabled={!ready || openingCamera}
            whileTap={{ scale: 0.98 }}
            animate={
              ready
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(251,191,36,0)',
                      '0 0 0 8px rgba(251,191,36,0.08)',
                      '0 0 0 0 rgba(251,191,36,0)',
                    ],
                  }
                : undefined
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 font-semibold text-stone-950 shadow-xl shadow-amber-900/40 disabled:cursor-wait disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />

            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-stone-950/10">
              {openingCamera ? (
                <ScanLine className="h-4 w-4 animate-pulse" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </span>

            <span className="relative text-left">
              <span className="block text-sm uppercase tracking-[0.14em]">
                {openingCamera ? 'Opening Camera...' : 'View on Table'}
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-stone-800/70">
                Place this dish in your real space
              </span>
            </span>
          </motion.button>

          <div className="flex items-center justify-center gap-2">
            <ControlBtn
              icon={<ZoomOut className="h-4 w-4" />}
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              label="Zoom out"
            />
            <ControlBtn
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={resetView}
              label="Reset"
            />
            <ControlBtn
              icon={<ZoomIn className="h-4 w-4" />}
              onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
              label="Zoom in"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setView('dish')}
            >
              Details
            </Button>
            <Button variant="gold" fullWidth onClick={handleAdd}>
              <ShoppingBag className="h-4 w-4" />
              {arButtonLabel}
            </Button>
          </div>
          {(alreadyInCart || justAdded || cart.length > 0) && (
            <Button
              variant="secondary"
              fullWidth
              onClick={goToCart}
              className="mt-2"
            >
              Go to cart · Place order
            </Button>
          )}
        </div>
      </div>

      {arUnavailable && (
        <div className="absolute inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm">
          <Glass
            intensity="strong"
            className="w-full max-w-sm border-amber-400/25 p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">
              3D Preview Available
            </p>
            <h2 className="mt-2 font-serif text-2xl text-white">
              Camera AR is not supported
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              No installation is needed. You can still rotate, zoom and inspect
              this dish in the interactive 3D preview.
            </p>
            <Button
              variant="gold"
              fullWidth
              className="mt-5"
              onClick={() => setArUnavailable(false)}
            >
              Continue in 3D
            </Button>
          </Glass>
        </div>
      )}
    </div>
  );
}

function ControlBtn({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/50 text-white/80 backdrop-blur-md transition hover:border-amber-400/30 hover:text-amber-200"
    >
      {icon}
    </button>
  );
}
