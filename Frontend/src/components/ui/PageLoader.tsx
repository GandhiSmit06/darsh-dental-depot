import { useEffect, useState, useRef, useCallback } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ShieldAlert, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

/* ── Safe In-Memory Session Fallback (Protects against disabled or throwing sessionStorage) ── */
let memorySessionSeen = false;

function isSessionSeenSafe(): boolean {
  if (memorySessionSeen) return true;
  try {
    if (typeof window !== "undefined") {
      return (
        window.sessionStorage?.getItem("ddd_initial_seen") === "true" ||
        document.documentElement.classList.contains("ddd-seen")
      );
    }
  } catch {
    return memorySessionSeen;
  }
  return false;
}

function markSessionSeenSafe(): void {
  memorySessionSeen = true;
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("ddd_initial_seen", "true");
    }
  } catch {
    // sessionStorage is unavailable; memorySessionSeen ensures current tab/session is remembered
  }
}

/* ── Easing: slow-start, smooth middle, gentle ease-out ── */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function PageLoader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const authLoading = auth?.isLoading ?? false;

  // Initial cold-start loader: Default true for deterministic SSR rendering
  const [showInitial, setShowInitial] = useState(true);
  const [fgFadeOut, setFgFadeOut] = useState(false);
  const [bgFadeOut, setBgFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  // Authentication readiness state
  const [waveComplete, setWaveComplete] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const wavePhaseRef = useRef(0);
  const dprRef = useRef(1);
  const isFinishedRef = useRef(false);

  // Robust timer tracking: ensure zero leaks across unmounts and nested callbacks
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const registerTimer = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      fn();
    }, ms);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const clearTimer = useCallback((timer: ReturnType<typeof setTimeout> | null | undefined) => {
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(timer);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  const LOAD_DURATION = 1350; // Visual duration of wave progression

  /* ── Staged Finalization Sequence ──
   * Phase 1: Fade out foreground completely (canvas, logo text, progress indicator).
   * Phase 2: Reveal app content (ddd-app-ready) and smoothly dissolve solid background.
   * Phase 3: Unmount loader overlay and record session as seen after background finishes.
   * Result: Absolutely zero oversized logo or text ever overlaps the homepage.
   */
  const finishInitialLoader = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Phase 1: Dissolve foreground (canvas text, fallback, progress indicator) completely
    setFgFadeOut(true);

    // Phase 2: Once foreground is completely faded out (300ms), reveal app & dissolve background
    registerTimer(() => {
      document.documentElement.classList.add("ddd-app-ready");
      setBgFadeOut(true);

      // Phase 3: Once background has fully dissolved (380ms), mark seen & unmount
      registerTimer(() => {
        markSessionSeenSafe();
        document.documentElement.classList.add("ddd-seen");
        setShowInitial(false);
      }, 400);
    }, 300);
  }, [registerTimer]);

  /* ── Session Verification on Client Mount ── */
  useEffect(() => {
    if (isSessionSeenSafe()) {
      // Returning session: ensure app content is visible immediately and unmount loader
      document.documentElement.classList.add("ddd-app-ready", "ddd-seen");
      setShowInitial(false);
      return;
    }

    // Fresh session (even if sessionStorage is disabled):
    // Start auth verification watch timer
    const authTimeoutTimer = registerTimer(() => {
      if (!isFinishedRef.current && authLoading) {
        setAuthTimedOut(true);
      }
    }, 6000);

    return () => {
      clearTimer(authTimeoutTimer);
    };
  }, [authLoading, clearTimer, registerTimer]);

  /* ── Canvas wave frame drawer ── */
  const drawFrame = useCallback(
    (timestamp: number) => {
      if (isFinishedRef.current) return;

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        prevTimeRef.current = timestamp;
      }
      const dt = (timestamp - prevTimeRef.current) / 1000;
      prevTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const linearT = Math.min(elapsed / LOAD_DURATION, 1);
      const easedT = easeInOutCubic(linearT);
      const rawProgress = Math.floor(easedT * 100);
      setProgress(rawProgress);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const isDarkMode = document.documentElement.classList.contains("dark");

      /* Text layout */
      const fontSize = Math.min(W * 0.13, 150);
      const fontStr = `900 ${fontSize}px 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const line1 = "Darsh Dental";
      const line2 = "Depot";
      const lineGap = fontSize * 0.18;
      const blockH = fontSize * 2 + lineGap;
      const y1 = H / 2 - blockH / 2 + fontSize / 2;
      const y2 = y1 + fontSize + lineGap;
      const cx = W / 2;

      /* 1. Ghost text */
      ctx.save();
      ctx.fillStyle = isDarkMode
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(15, 23, 42, 0.08)";
      ctx.fillText(line1, cx, y1);
      ctx.fillText(line2, cx, y2);
      ctx.restore();

      /* 2. Text mask + wave fill */
      ctx.save();
      ctx.fillStyle = "#000";
      ctx.fillText(line1, cx, y1);
      ctx.fillText(line2, cx, y2);
      ctx.globalCompositeOperation = "source-atop";

      const textTop = y1 - fontSize * 0.6;
      const textBot = y2 + fontSize * 0.6;
      const range = textBot - textTop;
      const fillLevel = textBot - easedT * range;

      wavePhaseRef.current += dt * 1.8;

      const ampDecay = 1 - easedT * 0.85;
      const amp1 = 10 * ampDecay;
      const amp2 = 5 * ampDecay;
      const freq1 = 0.018;
      const freq2 = 0.032;
      const phase = wavePhaseRef.current;

      ctx.beginPath();
      ctx.moveTo(-2, H + 2);
      ctx.lineTo(-2, fillLevel);
      for (let x = 0; x <= W + 2; x += 1) {
        const wave =
          Math.sin(x * freq1 + phase) * amp1 +
          Math.sin(x * freq2 - phase * 0.7) * amp2;
        ctx.lineTo(x, fillLevel + wave);
      }
      ctx.lineTo(W + 2, H + 2);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, textBot, 0, textTop);
      if (isDarkMode) {
        grad.addColorStop(0, "#0284c7");
        grad.addColorStop(0.3, "#0ea5e9");
        grad.addColorStop(0.6, "#38bdf8");
        grad.addColorStop(0.85, "#bae6fd");
        grad.addColorStop(1, "#ffffff");
      } else {
        grad.addColorStop(0, "#0369a1");
        grad.addColorStop(0.3, "#0284c7");
        grad.addColorStop(0.6, "#0ea5e9");
        grad.addColorStop(0.85, "#38bdf8");
        grad.addColorStop(1, "#0f172a");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-2, H + 2);
      ctx.lineTo(-2, fillLevel + 4);
      for (let x = 0; x <= W + 2; x += 1) {
        const wave2 =
          Math.sin(x * freq1 * 1.3 + phase * 1.4 + 1.5) * (amp1 * 0.6) +
          Math.sin(x * freq2 * 0.8 - phase * 0.5 + 3.0) * (amp2 * 0.8);
        ctx.lineTo(x, fillLevel + 4 + wave2);
      }
      ctx.lineTo(W + 2, H + 2);
      ctx.closePath();

      const grad2 = ctx.createLinearGradient(0, textBot, 0, textTop);
      grad2.addColorStop(0, "rgba(14, 165, 233, 0.4)");
      grad2.addColorStop(0.5, "rgba(56, 189, 248, 0.3)");
      grad2.addColorStop(1, isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)");
      ctx.fillStyle = grad2;
      ctx.fill();

      ctx.restore();

      /* 3. Glow */
      ctx.save();
      ctx.globalAlpha = 0.12 * ampDecay;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 30;
      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "transparent";
      ctx.fillText(line1, cx, y1);
      ctx.fillText(line2, cx, y2);
      ctx.restore();

      if (linearT < 1) {
        animFrameRef.current = requestAnimationFrame(drawFrame);
      } else {
        // Wave filled to 100%!
        ctx.save();
        ctx.font = fontStr;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDarkMode ? "#ffffff" : "#0f172a";
        ctx.fillText(line1, cx, y1);
        ctx.fillText(line2, cx, y2);
        ctx.restore();

        setWaveComplete(true);
      }
    },
    [LOAD_DURATION]
  );

  /* ── Canvas resize handler ── */
  useEffect(() => {
    if (!showInitial) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [showInitial]);

  /* ── Start animation loop or respect reduced motion ── */
  useEffect(() => {
    if (!showInitial) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(100);
      setWaveComplete(true);
      return;
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showInitial, drawFrame]);

  /* ── Synchronize Wave Completion with Authentication Readiness ── */
  useEffect(() => {
    if (!showInitial || isFinishedRef.current) return;

    // Both wave animation must be 100% AND auth must have completed initialization
    if (waveComplete && !authLoading) {
      finishInitialLoader();
    }
  }, [showInitial, waveComplete, authLoading, finishInitialLoader]);

  /* ── Safe Recovery Action when Auth Verification Hangs ── */
  const handleContinueAsGuest = useCallback(() => {
    console.warn("[Auth] User opted to continue in guest mode after verification timeout.");
    toast.info("Continuing in guest mode. Please sign in if you wish to access your doctor account.");
    finishInitialLoader();
  }, [finishInitialLoader]);

  /* ── Route Navigation Timer Tracking & Cleanup ── */
  const routeFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRouteTimers = useCallback(() => {
    if (routeFadeTimerRef.current) {
      clearTimer(routeFadeTimerRef.current);
      routeFadeTimerRef.current = null;
    }
    if (routeHideTimerRef.current) {
      clearTimer(routeHideTimerRef.current);
      routeHideTimerRef.current = null;
    }
  }, [clearTimer]);

  /* ── Master Cleanup on Unmount ── */
  useEffect(() => {
    return () => {
      clearRouteTimers();
      clearAllTimers();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [clearAllTimers, clearRouteTimers]);

  /* ── Route Navigation Overlay with loading.svg ── */
  const [routeProgress, setRouteProgress] = useState(false);
  const [routeFadeOut, setRouteFadeOut] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prevPathRef = useRef(pathname);

  // Trigger loading state on route change ONLY (decoupled from background React Query fetches)
  useEffect(() => {
    if (showInitial) return;

    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      // Cancel any pending timers from previous navigations to prevent older timers
      // from prematurely hiding the loader during rapid navigation
      clearRouteTimers();

      setRouteFadeOut(false);
      setRouteProgress(true);

      routeFadeTimerRef.current = registerTimer(() => {
        routeFadeTimerRef.current = null;
        setRouteFadeOut(true);

        routeHideTimerRef.current = registerTimer(() => {
          routeHideTimerRef.current = null;
          setRouteProgress(false);
          setRouteFadeOut(false);
        }, 250);
      }, 400);

      return () => {
        clearRouteTimers();
      };
    }
  }, [pathname, showInitial, clearRouteTimers, registerTimer]);

  /* ── Initial Cold-Start Wave Text Loader (SSR Deterministic Shell + Hydration) ── */
  const initialOverlay = showInitial ? (
    <div
      id="ddd-initial-loader"
      className={`neoleaf-loader-overlay ${bgFadeOut ? "neoleaf-bg-fade-out" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`neoleaf-loader-foreground ${fgFadeOut ? "neoleaf-fg-fade-out" : ""}`}
      >
        <div className="neoleaf-ssr-fallback select-none" aria-hidden="true">
          <div className="neoleaf-ssr-title">Darsh Dental</div>
          <div className="neoleaf-ssr-subtitle">Depot</div>
        </div>

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
        />

        {/* Numerical Progress Indicator */}
        <div className="neoleaf-progress" style={{ zIndex: 3 }}>
          loading...{" "}
          <span className="neoleaf-progress-num">{progress}</span> %
        </div>

        {/* Gentle Status when wave is 100% but authentication check is still resolving */}
        {waveComplete && authLoading && !authTimedOut && (
          <div className="neoleaf-auth-waiting">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#12A488]" />
            <span>Verifying clinic session...</span>
          </div>
        )}

        {/* Explicit Safe Recovery Card when authentication check exceeds safety limit */}
        {authTimedOut && authLoading && (
          <div className="neoleaf-auth-timeout-card">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Authentication Taking Longer
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
              We are having trouble establishing a secure session with depot servers. You can retry verification or continue in guest mode.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
              <button
                onClick={handleContinueAsGuest}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#12A488] text-white hover:bg-[#0fa083] transition-colors cursor-pointer"
              >
                Continue as Guest &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  /* ── Active Page Navigation Overlay (loading.svg) ── */
  const routeOverlay =
    !showInitial && routeProgress ? (
      <div
        className={`route-transition-overlay ${routeFadeOut ? "route-transition-fade-out" : ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="route-transition-content">
          <div className="relative flex items-center justify-center">
            {/* Ambient clinical glow behind loader */}
            <div className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-60 bg-gradient-to-tr from-[#12A488]/30 via-[#3FD1B3]/25 to-sky-500/20" />

            {!imgError ? (
              <img
                src="/loading.svg"
                alt="Loading animation"
                width={128}
                height={128}
                onError={() => setImgError(true)}
                className="relative z-10 w-32 h-32 object-contain drop-shadow-[0_4px_24px_rgba(18,164,136,0.3)]"
                loading="eager"
              />
            ) : (
              <div className="relative z-10 flex items-center justify-center rounded-full border border-[#12A488]/30 bg-[#12A488]/10 text-[#3FD1B3] w-24 h-24">
                <div className="w-10 h-10 rounded-full border-2 border-[#12A488] border-t-[#3FD1B3] animate-spin" />
              </div>
            )}
          </div>

          <p className="mt-4 text-sm font-semibold tracking-wide text-foreground/90 font-heading">
            Loading...
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80 tracking-wider uppercase font-medium">
            Darsh Dental Depot
          </p>
        </div>
      </div>
    ) : null;

  return (
    <>
      {initialOverlay}
      {routeOverlay}
    </>
  );
}
