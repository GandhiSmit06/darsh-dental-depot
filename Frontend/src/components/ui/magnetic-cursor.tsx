import React, { useRef, useEffect, useState, type FC, type ReactNode } from "react";
import gsap from "gsap";
import { vec2 } from "vecteur";

export interface MagneticCursorProps {
  children: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  blendMode?: string;
  contrastBoost?: number;
}

type Vec2Instance = ReturnType<typeof vec2>;

interface CursorState {
  ringEl: HTMLDivElement | null;
  dotEl: HTMLDivElement | null;
  pos: {
    current: Vec2Instance;
    target: Vec2Instance;
    previous: Vec2Instance;
  };
  hover: { isHovered: boolean };
  isDetaching: boolean;
  isOverInput: boolean;
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.15,
  magneticFactor = 0.22,
  hoverPadding = 6,
  hoverAttribute = "data-magnetic",
  cursorSize = 32,
  disableOnTouch = true,
  speedMultiplier = 0.025,
  maxScaleX = 0.6,
  maxScaleY = 0.25,
}) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cursorStateRef = useRef<CursorState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(true);

  const configRef = useRef({
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
  });

  useEffect(() => {
    configRef.current = {
      magneticFactor,
      speedMultiplier,
      maxScaleX,
      maxScaleY,
      cursorSize,
      lerpAmount,
      hoverPadding,
    };
  }, [
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
  ]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      setHasFinePointer(mq.matches);

      const onChange = (e: MediaQueryListEvent) => {
        setHasFinePointer(e.matches);
      };
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (disableOnTouch && !hasFinePointer) return;

    const ringEl = ringRef.current;
    const dotEl = dotRef.current;
    if (!ringEl || !dotEl) return;

    gsap.set(ringEl, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(dotEl, { xPercent: -50, yPercent: -50, opacity: 0 });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detachDuration = prefersReducedMotion ? 0.05 : 0.28;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        ringEl,
        dotEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
        isOverInput: false,
      };
    }

    const isDarkMode = () =>
      document.documentElement.classList.contains("dark");

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } =
        configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      // Dot follows raw mouse position directly for instantaneous tactile response
      gsap.set(state.dotEl, {
        x: state.pos.target.x,
        y: state.pos.target.y,
        overwrite: "auto",
      });

      if (state.isDetaching || prefersReducedMotion) {
        gsap.set(state.ringEl, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          overwrite: "auto",
        });
      } else {
        const speed =
          Math.sqrt(delta.x * delta.x + delta.y * delta.y) * speedMultiplier;
        gsap.set(state.ringEl, {
          x: state.pos.current.x,
          y: state.pos.current.y,
          rotate: Math.atan2(delta.y, delta.x) * (180 / Math.PI),
          scaleX: 1 + Math.min(speed, maxScaleX),
          scaleY: 1 - Math.min(speed, maxScaleY),
          overwrite: "auto",
        });
      }
    };

    const initializePosition = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const state = cursorStateRef.current;
      if (!state) return;
      const x = event.clientX;
      const y = event.clientY;
      state.pos.current.x = x;
      state.pos.current.y = y;
      state.pos.target.x = x;
      state.pos.target.y = y;
      state.pos.previous.x = x;
      state.pos.previous.y = y;
      gsap.set(ringEl, { x, y, opacity: 1 });
      gsap.set(dotEl, { x, y, opacity: 1 });
    };

    const onMouseMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const state = cursorStateRef.current;
      if (!state) return;

      state.pos.target.x = event.clientX;
      state.pos.target.y = event.clientY;

      const isInViewport =
        event.clientX >= 0 &&
        event.clientX <= window.innerWidth &&
        event.clientY >= 0 &&
        event.clientY <= window.innerHeight;

      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          window.getComputedStyle(target).cursor === "text");

      state.isOverInput = !!isInput;

      if (!state.hover.isHovered) {
        if (isInput) {
          // Native I-beam text editing: fade cursor down completely to avoid visual obstruction
          gsap.to(ringEl, { opacity: 0, duration: 0.15, overwrite: "auto" });
          gsap.to(dotEl, { opacity: 0, duration: 0.15, overwrite: "auto" });
        } else {
          gsap.to(ringEl, {
            opacity: isInViewport ? 1 : 0,
            duration: 0.15,
            overwrite: "auto",
          });
          gsap.to(dotEl, {
            opacity: isInViewport ? 1 : 0,
            duration: 0.15,
            overwrite: "auto",
          });
        }
      }
    };

    const handleMouseLeave = () => {
      gsap.to([ringEl, dotEl], { opacity: 0, duration: 0.2, overwrite: "auto" });
    };

    const handleMouseEnter = () => {
      const state = cursorStateRef.current;
      if (state && !state.isOverInput) {
        gsap.to([ringEl, dotEl], { opacity: 1, duration: 0.2, overwrite: "auto" });
      }
    };

    gsap.ticker.add(update);
    window.addEventListener("pointermove", onMouseMove, { passive: true });
    window.addEventListener("pointermove", initializePosition, {
      once: true,
      passive: true,
    });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    /* ─── Robust Dynamic MutationObserver for SPA / Route Navigation ─── */
    const boundElements = new Map<HTMLElement, { cleanup: () => void }>();

    const bindMagneticElement = (el: HTMLElement) => {
      if (boundElements.has(el)) return;

      const xTo = gsap.quickTo(el, "x", {
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: prefersReducedMotion ? 0.1 : 0.5,
        ease: "power2.out",
      });

      let rafId: number | null = null;

      const handlePointerEnter = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const state = cursorStateRef.current;
        if (!state) return;
        const { magneticFactor, hoverPadding } = configRef.current;

        state.hover.isHovered = true;
        state.isDetaching = false;

        const bounds = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        const dynamicPadding = hoverPadding * (1 + magneticFactor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        // Shape determination:
        // A. Explicit shape override (circle, pill, rounded)
        const explicitShape = el.getAttribute("data-magnetic-shape");
        const isCircular =
          explicitShape === "circle" ||
          (Math.abs(bounds.width - bounds.height) <= 8 &&
            (computedStyle.borderRadius.includes("50%") ||
              computedStyle.borderRadius.includes("9999px") ||
              parseFloat(computedStyle.borderRadius) >= bounds.height / 2 - 2 ||
              el.classList.contains("rounded-full")));

        const isPill =
          explicitShape === "pill" ||
          (!isCircular &&
            (computedStyle.borderRadius.includes("9999px") ||
              parseFloat(computedStyle.borderRadius) >= bounds.height / 2 - 2 ||
              el.classList.contains("rounded-full")));

        let targetWidth = bounds.width + dynamicPadding * 2;
        let targetHeight = bounds.height + dynamicPadding * 2;
        let targetRadius = computedStyle.borderRadius || "12px";

        if (isCircular) {
          const maxDim = Math.max(bounds.width, bounds.height);
          targetWidth = maxDim + dynamicPadding * 2;
          targetHeight = maxDim + dynamicPadding * 2;
          targetRadius = "50%";
        } else if (isPill) {
          targetRadius = "9999px";
        }

        // Theme colors adhering to Clinical Luminary design system:
        // Dark Mode: Clinical Mint (#3FD1B3) / Deep Obsidian
        // Light Mode: Cerulean Sky (#0284c7)
        const isDark = isDarkMode();
        const customColor = el.getAttribute("data-magnetic-color");

        const targetBg = customColor
          ? customColor
          : isDark
            ? "rgba(63, 209, 179, 0.10)"
            : "rgba(2, 132, 199, 0.08)";

        const targetBorder = isDark
          ? "1.5px solid rgba(63, 209, 179, 0.38)"
          : "1.5px solid rgba(2, 132, 199, 0.32)";

        const targetShadow = isDark
          ? "0 0 24px rgba(18, 164, 136, 0.22)"
          : "0 0 18px rgba(2, 132, 199, 0.16)";

        // Hide inner dot while snapped to element; expand ring to encompass target smoothly
        gsap.to(dotEl, { opacity: 0, duration: 0.15, overwrite: "auto" });

        gsap.killTweensOf(ringEl);
        gsap.to(ringEl, {
          x: centerX,
          y: centerY,
          width: targetWidth,
          height: targetHeight,
          borderRadius: targetRadius,
          backgroundColor: targetBg,
          border: targetBorder,
          boxShadow: targetShadow,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0.08 : 0.28,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const handlePointerLeave = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const state = cursorStateRef.current;
        if (!state) return;

        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        xTo(0);
        yTo(0);

        const currentX = gsap.getProperty(ringEl, "x") as number;
        const currentY = gsap.getProperty(ringEl, "y") as number;

        state.pos.current.x = currentX;
        state.pos.current.y = currentY;
        state.pos.previous.x = currentX;
        state.pos.previous.y = currentY;

        state.hover.isHovered = false;
        state.isDetaching = true;

        const { cursorSize } = configRef.current;
        const isDark = isDarkMode();

        const restBorder = isDark
          ? "1.5px solid rgba(63, 209, 179, 0.45)"
          : "1.5px solid rgba(2, 132, 199, 0.40)";

        const restBg = isDark
          ? "rgba(18, 164, 136, 0.08)"
          : "rgba(2, 132, 199, 0.06)";

        gsap.killTweensOf(ringEl);
        gsap.to(ringEl, {
          width: cursorSize,
          height: cursorSize,
          borderRadius: "50%",
          backgroundColor: restBg,
          border: restBorder,
          boxShadow: "none",
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: "power3.out",
          overwrite: "auto",
          onComplete: () => {
            state.isDetaching = false;
          },
        });

        // Re-reveal center dot smoothly
        gsap.to(dotEl, { opacity: 1, duration: 0.2, overwrite: "auto" });
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (prefersReducedMotion) return;
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          const { magneticFactor } = configRef.current;
          // Magnetically pull the hovered element subtly toward the mouse
          xTo((clientX - (left + width / 2)) * magneticFactor);
          yTo((clientY - (top + height / 2)) * magneticFactor);
          rafId = null;
        });
      };

      el.addEventListener("pointerenter", handlePointerEnter as EventListener);
      el.addEventListener("pointerleave", handlePointerLeave as EventListener);
      el.addEventListener("pointermove", handlePointerMove as EventListener);

      const cleanup = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        el.removeEventListener("pointerenter", handlePointerEnter as EventListener);
        el.removeEventListener("pointerleave", handlePointerLeave as EventListener);
        el.removeEventListener("pointermove", handlePointerMove as EventListener);
        gsap.killTweensOf(el);
        gsap.set(el, { x: 0, y: 0, clearProps: "x,y" });
      };

      boundElements.set(el, { cleanup });
    };

    const scanAndBind = () => {
      const elements = document.querySelectorAll<HTMLElement>(
        `[${hoverAttribute}]`
      );
      elements.forEach(bindMagneticElement);

      // Clean up stale removed DOM elements
      boundElements.forEach((val, element) => {
        if (!document.body.contains(element)) {
          val.cleanup();
          boundElements.delete(element);
        }
      });
    };

    scanAndBind();

    const observer = new MutationObserver(() => {
      scanAndBind();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointermove", initializePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();

      boundElements.forEach((val) => {
        val.cleanup();
      });
      boundElements.clear();

      if (ringEl) gsap.killTweensOf(ringEl);
      if (dotEl) gsap.killTweensOf(dotEl);
    };
  }, [disableOnTouch, hasFinePointer, hoverAttribute, mounted]);

  if (!mounted || (disableOnTouch && !hasFinePointer)) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Outer Magnetic Ring / Snapping Capsule */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[99999] pointer-events-none select-none will-change-[transform,width,height,border-radius] border border-primary/40 dark:border-[#3FD1B3]/45 bg-primary/5 dark:bg-[#12A488]/10 rounded-full"
        style={{
          width: cursorSize,
          height: cursorSize,
        }}
        aria-hidden="true"
      />
      {/* Inner Precision Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[99999] pointer-events-none select-none will-change-[transform] w-1.5 h-1.5 rounded-full bg-[#0284c7] dark:bg-[#3FD1B3] shadow-[0_0_8px_rgba(2,132,199,0.8)] dark:shadow-[0_0_8px_rgba(63,209,179,0.9)]"
        aria-hidden="true"
      />
      {children}
    </>
  );
};
