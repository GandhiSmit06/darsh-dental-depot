import { useEffect, useState, useRef, useCallback } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useIsFetching } from "@tanstack/react-query";

/* ── Easing: slow-start, smooth middle, gentle ease-out ── */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function PageLoader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Initial cold-start loader: ONLY shown ONCE per session!
  const [showInitial, setShowInitial] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem("ddd_initial_seen");
    } catch {
      return false;
    }
  });

  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const wavePhaseRef = useRef(0);
  const dprRef = useRef(1);

  const LOAD_DURATION = 1400; // Snappy cold-start duration

  const drawFrame = useCallback((timestamp: number) => {
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
    const rawProgress = easedT * 100;
    setProgress(Math.floor(rawProgress));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    ctx.clearRect(0, 0, W, H);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
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
    grad.addColorStop(0, "#0284c7");
    grad.addColorStop(0.3, "#0ea5e9");
    grad.addColorStop(0.6, "#38bdf8");
    grad.addColorStop(0.85, "#bae6fd");
    grad.addColorStop(1, "#ffffff");
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
    grad2.addColorStop(1, "rgba(255, 255, 255, 0.2)");
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
      ctx.save();
      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(line1, cx, y1);
      ctx.fillText(line2, cx, y2);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Remember that the initial loader was seen in this session!
      setTimeout(() => {
        setFadeOut(true);
        try {
          sessionStorage.setItem("ddd_initial_seen", "true");
        } catch {}
      }, 250);
      setTimeout(() => setShowInitial(false), 800);
    }
  }, []);

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

  /* ── Start animation loop ── */
  useEffect(() => {
    if (!showInitial) return;
    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showInitial, drawFrame]);

  /* ── Route Navigation & Page Loading with loading.svg ── */
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading });
  const isFetching = useIsFetching();

  // Exactly 1 complete animation loop of loading.svg (SMIL dur="5s")
  const ANIM_CYCLE_MS = 5000;

  const [routeProgress, setRouteProgress] = useState(false);
  const [routeFadeOut, setRouteFadeOut] = useState(false);
  const [animKey, setAnimKey] = useState(1);
  const [imgError, setImgError] = useState(false);

  const prevPathRef = useRef(pathname);
  const showInitialRef = useRef(showInitial);
  showInitialRef.current = showInitial;

  const activeLoadingRef = useRef(false);
  const loadStartTimeRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWorkInProgress = isRouterLoading || isFetching > 0;
  const isWorkInProgressRef = useRef(isWorkInProgress);
  isWorkInProgressRef.current = isWorkInProgress;

  const triggerLoad = useCallback(() => {
    if (showInitialRef.current) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    setRouteFadeOut(false);

    if (!activeLoadingRef.current) {
      activeLoadingRef.current = true;
      loadStartTimeRef.current = Date.now();
      setAnimKey((k) => k + 1);
      setRouteProgress(true);
    }
  }, []);

  const finishLoad = useCallback(() => {
    if (!activeLoadingRef.current || showInitialRef.current) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const elapsed = Date.now() - loadStartTimeRef.current;
    // Hold for at least 1 full animation cycle if loading was fast
    const remaining = Math.max(0, ANIM_CYCLE_MS - elapsed);

    closeTimerRef.current = setTimeout(() => {
      // If work is still active, wait until work actually completes
      if (isWorkInProgressRef.current) return;

      setRouteFadeOut(true);
      fadeTimerRef.current = setTimeout(() => {
        setRouteProgress(false);
        setRouteFadeOut(false);
        activeLoadingRef.current = false;
        closeTimerRef.current = null;
        fadeTimerRef.current = null;
      }, 300);
    }, remaining);
  }, []);

  // Detect route changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (!showInitial) {
        triggerLoad();
        finishLoad();
      }
    }
  }, [pathname, showInitial, triggerLoad, finishLoad]);

  // Detect query / background work state changes
  useEffect(() => {
    if (showInitial) return;

    if (isWorkInProgress) {
      triggerLoad();
    } else if (activeLoadingRef.current) {
      finishLoad();
    }
  }, [isWorkInProgress, showInitial, triggerLoad, finishLoad]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // If not in initial load and not navigating/loading, render nothing
  if (!showInitial && !routeProgress) return null;

  // Active page load / navigation: Render loading.svg overlay
  if (!showInitial && routeProgress) {
    return (
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
                key={animKey}
                src={`/loading.svg?k=${animKey}`}
                alt="Loading animation"
                width={132}
                height={132}
                onError={() => setImgError(true)}
                className="relative z-10 w-32 h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_4px_24px_rgba(18,164,136,0.3)] select-none pointer-events-none"
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
    );
  }

  // Initial cold-start wave text loader (only once per session)
  return (
    <div
      className={`neoleaf-loader-overlay ${fadeOut ? "neoleaf-fade-out" : ""}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div className="neoleaf-progress">
        loading...{" "}
        <span className="neoleaf-progress-num">{progress}</span> %
      </div>
    </div>
  );
}
