import { useEffect, useState, useRef, useCallback } from "react";
import { useRouterState } from "@tanstack/react-router";

/* ── Easing: slow-start, smooth middle, gentle ease-out ── */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function PageLoader() {
  const isRouteLoading = useRouterState({ select: (s) => s.isLoading });
  const [showInitial, setShowInitial] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  const wavePhaseRef = useRef(0);
  const dprRef = useRef(1);

  const LOAD_DURATION = 2800; // slightly longer for smoother feel

  const drawFrame = useCallback((timestamp: number) => {
    /* ── Timing ── */
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      prevTimeRef.current = timestamp;
    }
    const dt = (timestamp - prevTimeRef.current) / 1000; // delta in seconds
    prevTimeRef.current = timestamp;

    const elapsed = timestamp - startTimeRef.current;
    const linearT = Math.min(elapsed / LOAD_DURATION, 1);
    const easedT = easeInOutCubic(linearT);          // smooth eased 0→1
    const rawProgress = easedT * 100;
    setProgress(Math.floor(rawProgress));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Use CSS pixel dimensions (canvas is already scaled by DPR in resize handler)
    const W = window.innerWidth;
    const H = window.innerHeight;

    ctx.clearRect(0, 0, W, H);

    /* ── Enable sub-pixel anti-aliasing ── */
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

    /* ── 1. Ghost text (subtle dark silhouette) ── */
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.fillText(line1, cx, y1);
    ctx.fillText(line2, cx, y2);
    ctx.restore();

    /* ── 2. Text mask + wave fill ── */
    ctx.save();
    // Draw text as mask
    ctx.fillStyle = "#000";
    ctx.fillText(line1, cx, y1);
    ctx.fillText(line2, cx, y2);
    ctx.globalCompositeOperation = "source-atop";

    // Wave geometry
    const textTop = y1 - fontSize * 0.6;
    const textBot = y2 + fontSize * 0.6;
    const range = textBot - textTop;
    const fillLevel = textBot - easedT * range;

    // Smooth wave phase advancement (time-based, not frame-based)
    wavePhaseRef.current += dt * 1.8; // radians per second

    // Wave amplitude decays smoothly as fill rises
    const ampDecay = 1 - easedT * 0.85;
    const amp1 = 10 * ampDecay;
    const amp2 = 5 * ampDecay;
    const freq1 = 0.018;
    const freq2 = 0.032;
    const phase = wavePhaseRef.current;

    // Primary wave path
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

    // Gradient: brand-coloured liquid
    const grad = ctx.createLinearGradient(0, textBot, 0, textTop);
    grad.addColorStop(0, "#0284c7");   // sky-600 (deep)
    grad.addColorStop(0.3, "#0ea5e9"); // sky-500
    grad.addColorStop(0.6, "#38bdf8"); // sky-400
    grad.addColorStop(0.85, "#bae6fd"); // sky-200
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fill();

    // ── Secondary wave layer for depth (offset + transparent) ──
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

    /* ── 3. Subtle glow around wave edge ── */
    ctx.save();
    ctx.globalAlpha = 0.12 * ampDecay;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 30;
    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "transparent";
    // draw invisible text just for the shadow
    ctx.fillText(line1, cx, y1);
    ctx.fillText(line2, cx, y2);
    ctx.restore();

    /* ── Continue or finish ── */
    if (linearT < 1) {
      animFrameRef.current = requestAnimationFrame(drawFrame);
    } else {
      // Final frame: fully white text
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

      // Gentle fade-out
      setTimeout(() => setFadeOut(true), 400);
      setTimeout(() => setShowInitial(false), 1200);
    }
  }, []);

  /* ── Canvas resize handler (DPR-aware) ── */
  useEffect(() => {
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
  }, []);

  /* ── Start animation loop ── */
  useEffect(() => {
    if (!showInitial) return;
    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showInitial, drawFrame]);

  /* ── Route-change mini-loader ── */
  const [routeProgress, setRouteProgress] = useState(false);
  useEffect(() => {
    if (isRouteLoading && !showInitial) {
      setRouteProgress(true);
    } else {
      const t = setTimeout(() => setRouteProgress(false), 400);
      return () => clearTimeout(t);
    }
  }, [isRouteLoading, showInitial]);

  if (!showInitial && !routeProgress) return null;

  if (!showInitial && routeProgress) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-primary to-cyan-400"
          style={{
            animation: "routeBar 1.8s ease-in-out infinite",
            transformOrigin: "left",
          }}
        />
      </div>
    );
  }

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
