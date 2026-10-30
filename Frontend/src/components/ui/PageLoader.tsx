import { useEffect, useState, useRef, useCallback } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

/* ── Easing: slow-start, smooth middle, gentle ease-out ── */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function PageLoader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const authLoading = auth?.isLoading ?? false;

  // Initial cold-start loader: Default true for deterministic SSR rendering!
  // Client pre-hydration head script hides it on Frame 0 via .ddd-seen CSS if already seen.
  const [showInitial, setShowInitial] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const wavePhaseRef = useRef(0);
  const dprRef = useRef(1);
  const isFinishedRef = useRef(false);
  const authReadyRef = useRef(!authLoading);

  const LOAD_DURATION = 1350; // Optimized duration for wave animation

  // Keep track of auth loading state in ref to avoid re-creating callbacks
  useEffect(() => {
    if (!authLoading) {
      authReadyRef.current = true;
    }
  }, [authLoading]);

  // Synchronous mount verification: If this session already completed initial loading,
  // skip the canvas loop immediately so client state matches .ddd-seen CSS class.
  useEffect(() => {
    try {
      const alreadySeen =
        sessionStorage.getItem("ddd_initial_seen") === "true" ||
        document.documentElement.classList.contains("ddd-seen");
      if (alreadySeen) {
        setShowInitial(false);
        return;
      }
    } catch {
      setShowInitial(false);
      return;
    }

    // Safety timeout: Ensure page NEVER gets locked regardless of slow network or auth hang
    const safetyTimer = setTimeout(() => {
      finishInitialLoader();
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, []);

  const finishInitialLoader = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    setFadeOut(true);
    try {
      sessionStorage.setItem("ddd_initial_seen", "true");
      document.documentElement.classList.add("ddd-seen");
    } catch {}

    // Wait for CSS fade-out transition to complete before unmounting canvas
    setTimeout(() => {
      setShowInitial(false);
    }, 650);
  }, []);

  const drawFrame = useCallback(
    (timestamp: number) => {
      if (isFinishedRef.current) return;

      /* ── Timing ── */
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

      /* ── Text layout ── */
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

      /* ── 1. Ghost text ── */
      ctx.save();
      ctx.fillStyle = isDarkMode
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(15, 23, 42, 0.08)";
      ctx.fillText(line1, cx, y1);
      ctx.fillText(line2, cx, y2);
      ctx.restore();

      /* ── 2. Text mask + wave fill ── */
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

      /* ── 3. Glow ── */
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
        // Animation finished!
        ctx.save();
        ctx.font = fontStr;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDarkMode ? "#ffffff" : "#0f172a";
        ctx.fillText(line1, cx, y1);
        ctx.fillText(line2, cx, y2);
        ctx.restore();

        // Check if auth is ready or wait briefly
        if (authReadyRef.current) {
          finishInitialLoader();
        } else {
          // Poll briefly for auth state
          const checkAuthInterval = setInterval(() => {
            if (authReadyRef.current) {
              clearInterval(checkAuthInterval);
              finishInitialLoader();
            }
          }, 80);
          setTimeout(() => {
            clearInterval(checkAuthInterval);
            finishInitialLoader();
          }, 800);
        }
      }
    },
    [finishInitialLoader]
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

    // Check for prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setProgress(100);
      const timer = setTimeout(() => {
        finishInitialLoader();
      }, 350);
      return () => clearTimeout(timer);
    }

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showInitial, drawFrame, finishInitialLoader]);

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
      setRouteFadeOut(false);
      setRouteProgress(true);

      const navTimer = setTimeout(() => {
        setRouteFadeOut(true);
        const hideTimer = setTimeout(() => {
          setRouteProgress(false);
          setRouteFadeOut(false);
        }, 250);
        return () => clearTimeout(hideTimer);
      }, 400);

      return () => clearTimeout(navTimer);
    }
  }, [pathname, showInitial]);

  // Initial cold-start wave text loader (SSR deterministic shell + hydration)
  const initialOverlay = showInitial ? (
    <div
      id="ddd-initial-loader"
      className={`neoleaf-loader-overlay ${fadeOut ? "neoleaf-fade-out" : ""}`}
      role="status"
      aria-live="polite"
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
      <div className="neoleaf-progress" style={{ zIndex: 3 }}>
        loading...{" "}
        <span className="neoleaf-progress-num">{progress}</span> %
      </div>
    </div>
  ) : null;

  // Active page navigation overlay (loading.svg)
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
