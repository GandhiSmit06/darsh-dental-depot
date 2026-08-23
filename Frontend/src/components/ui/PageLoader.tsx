import { useEffect, useState, useRef, useCallback } from "react";
import { useRouterState } from "@tanstack/react-router";

export function PageLoader() {
  const isRouteLoading = useRouterState({ select: (s) => s.isLoading });
  const [showInitial, setShowInitial] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const waveOffsetRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);

  const LOAD_DURATION = 2400; // ms for 0→100%

  // Wave drawing on canvas (clipped by text)
  const drawFrame = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const rawProgress = Math.min((elapsed / LOAD_DURATION) * 100, 100);
    setProgress(Math.floor(rawProgress));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ── Text metrics ──
    const fontSize = Math.min(W * 0.135, 140);
    ctx.font = `900 ${fontSize}px 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = "Darsh Dental";
    const text2 = "Depot";
    const lineGap = fontSize * 0.15;
    const totalTextH = fontSize * 2 + lineGap;
    const textY1 = H / 2 - totalTextH / 2 + fontSize / 2;
    const textY2 = textY1 + fontSize + lineGap;

    // ── 1. Draw dark ghost text (background) ──
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillText(text, W / 2, textY1);
    ctx.fillText(text2, W / 2, textY2);
    ctx.restore();

    // ── 2. Create text-shaped clipping mask ──
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillText(text, W / 2, textY1);
    ctx.fillText(text2, W / 2, textY2);
    // Use composite to clip subsequent draws to only the text pixels
    ctx.globalCompositeOperation = "source-atop";

    // ── 3. Draw the wave fill inside the text ──
    // Wave rises from bottom of text area to top
    const textTop = textY1 - fontSize * 0.55;
    const textBottom = textY2 + fontSize * 0.55;
    const textRange = textBottom - textTop;
    const fillLevel = textBottom - (rawProgress / 100) * textRange;

    // Animate wave offset horizontally
    waveOffsetRef.current += 2.5;
    const waveAmp = 8 + (1 - rawProgress / 100) * 12; // Wave gets calmer as it fills
    const waveFreq = 0.02;

    // Draw wave path
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, fillLevel);
    for (let x = 0; x <= W; x += 2) {
      const y =
        fillLevel +
        Math.sin(x * waveFreq + waveOffsetRef.current * 0.04) * waveAmp +
        Math.sin(x * waveFreq * 1.8 + waveOffsetRef.current * 0.025) *
          (waveAmp * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    // Gradient fill (brand colors)
    const grad = ctx.createLinearGradient(0, textBottom, 0, textTop);
    grad.addColorStop(0, "#0ea5e9");    // sky-500
    grad.addColorStop(0.4, "#38bdf8");  // sky-400
    grad.addColorStop(0.7, "#7dd3fc");  // sky-300
    grad.addColorStop(1, "#ffffff");    // white at top
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();

    if (rawProgress < 100) {
      animFrameRef.current = requestAnimationFrame(drawFrame);
    } else {
      // Draw one final solid frame at 100%
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.fillText(text, W / 2, textY1);
      ctx.fillText(text2, W / 2, textY2);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Trigger fade-out after brief pause
      setTimeout(() => setFadeOut(true), 350);
      setTimeout(() => setShowInitial(false), 1100);
    }
  }, []);

  // Start animation
  useEffect(() => {
    if (!showInitial) return;
    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showInitial, drawFrame]);

  // Handle canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Route-change mini-loader (thin progress bar at top)
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

  // Route-change progress bar (after initial load)
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

  // ── Initial page-load NeoLeaf-style wave loader ──
  return (
    <div
      className={`neoleaf-loader-overlay ${fadeOut ? "neoleaf-fade-out" : ""}`}
    >
      {/* Canvas for wave-filled text */}
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

      {/* Progress counter */}
      <div className="neoleaf-progress">
        loading...{" "}
        <span className="neoleaf-progress-num">{progress}</span> %
      </div>
    </div>
  );
}
