import React, { useRef, useEffect, useState, type FC, type ReactNode } from "react";
import gsap from "gsap";
import { vec2, type Vec2 } from "vecteur";

export interface MagneticCursorProps {
  children: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: "difference" | "exclusion" | "normal" | "screen" | "overlay";
  cursorClassName?: string;
  shape?: "circle" | "square" | "rounded-square";
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  /**
   * Boosts background contrast before blending.
   * Default: 1.5 (150%)
   */
  contrastBoost?: number;
}

interface CursorState {
  el: HTMLDivElement | null;
  pos: {
    current: Vec2;
    target: Vec2;
    previous: Vec2;
  };
  hover: { isHovered: boolean };
  isDetaching: boolean;
}

export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.12,
  magneticFactor = 0.2,
  hoverPadding = 8,
  hoverAttribute = "data-magnetic",
  cursorSize = 26,
  cursorColor = "white", // Pure white works best with exclusion blend mode across both light and dark themes
  blendMode = "exclusion",
  cursorClassName = "",
  shape = "circle",
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 0.7,
  maxScaleY = 0.25,
  contrastBoost = 1.5,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
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
    cursorColor,
    shape,
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
      cursorColor,
      shape,
    };
  }, [
    magneticFactor,
    speedMultiplier,
    maxScaleX,
    maxScaleY,
    cursorSize,
    lerpAmount,
    hoverPadding,
    cursorColor,
    shape,
  ]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // Check if device supports hover and fine pointer (mouse, trackpad)
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

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50, opacity: 0 });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detachDuration = prefersReducedMotion ? 0.05 : 0.3;

    if (!cursorStateRef.current) {
      cursorStateRef.current = {
        el: cursorEl,
        pos: {
          current: vec2(-100, -100),
          target: vec2(-100, -100),
          previous: vec2(-100, -100),
        },
        hover: { isHovered: false },
        isDetaching: false,
      };
    }

    const update = () => {
      const state = cursorStateRef.current;
      if (!state || state.hover.isHovered) return;

      const { speedMultiplier, maxScaleX, maxScaleY, lerpAmount } =
        configRef.current;
      const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;

      state.pos.current.lerp(state.pos.target, effectiveLerp);
      const delta = state.pos.current.clone().sub(state.pos.previous);
      state.pos.previous.copy(state.pos.current);

      if (state.isDetaching || prefersReducedMotion) {
        gsap.set(state.el, {
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
        gsap.set(state.el, {
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
      gsap.set(cursorEl, { x, y, opacity: 1 });
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

      if (!state.hover.isHovered) {
        gsap.to(cursorEl, {
          opacity: isInViewport ? 1 : 0,
          duration: 0.15,
          overwrite: "auto",
        });
      }

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Handle form inputs so native text cursor (I-beam) and typing remain completely unobstructed
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        window.getComputedStyle(target).cursor === "text";

      if (isInput && !state.hover.isHovered && !state.isDetaching) {
        gsap.to(cursorEl, {
          opacity: 0.2,
          scale: 0.35,
          duration: 0.2,
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(cursorEl, { opacity: 0, duration: 0.2, overwrite: "auto" });
    };

    const handleMouseEnter = () => {
      gsap.to(cursorEl, { opacity: 1, duration: 0.2, overwrite: "auto" });
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
    const boundElements = new Map<
      HTMLElement,
      {
        cleanup: () => void;
      }
    >();

    const bindMagneticElement = (el: HTMLElement) => {
      if (boundElements.has(el)) return;

      const xTo = gsap.quickTo(el, "x", {
        duration: prefersReducedMotion ? 0.1 : 0.6,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: prefersReducedMotion ? 0.1 : 0.6,
        ease: "power2.out",
      });

      let rafId: number | null = null;

      const handlePointerEnter = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const state = cursorStateRef.current;
        if (!state) return;
        const { magneticFactor, hoverPadding, cursorColor } = configRef.current;

        state.hover.isHovered = true;
        state.isDetaching = false;

        const bounds = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        const magneticColor =
          el.getAttribute("data-magnetic-color") || cursorColor;
        const dynamicPadding = hoverPadding * (1 + magneticFactor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          x: centerX,
          y: centerY,
          width: bounds.width + dynamicPadding * 2,
          height: bounds.height + dynamicPadding * 2,
          borderRadius: computedStyle.borderRadius || "16px",
          backgroundColor: magneticColor,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0.1 : 0.3,
          ease: "power3.out",
          overwrite: "all",
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

        const currentX = gsap.getProperty(cursorEl, "x") as number;
        const currentY = gsap.getProperty(cursorEl, "y") as number;

        state.pos.current.x = currentX;
        state.pos.current.y = currentY;
        state.pos.previous.x = currentX;
        state.pos.previous.y = currentY;

        state.hover.isHovered = false;
        state.isDetaching = true;

        const { cursorSize, cursorColor, shape } = configRef.current;
        const shapeBorderRadius =
          shape === "circle" ? "50%" : shape === "square" ? "0" : "8px";

        gsap.killTweensOf(cursorEl);
        gsap.to(cursorEl, {
          width: cursorSize,
          height: cursorSize,
          borderRadius: shapeBorderRadius,
          backgroundColor: cursorColor,
          scaleX: 1,
          scaleY: 1,
          duration: detachDuration,
          ease: "power3.out",
          overwrite: "all",
          onComplete: () => {
            state.isDetaching = false;
          },
        });
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        if (prefersReducedMotion) return;
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
          const { clientX, clientY } = event;
          const { height, width, left, top } = el.getBoundingClientRect();
          const { magneticFactor } = configRef.current;
          xTo((clientX - (left + width / 2)) * magneticFactor);
          yTo((clientY - (top + height / 2)) * magneticFactor);
          rafId = null;
        });
      };

      const handlePointerOut = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointerenter", handlePointerEnter as EventListener);
      el.addEventListener("pointerleave", handlePointerLeave as EventListener);
      el.addEventListener("pointermove", handlePointerMove as EventListener);
      el.addEventListener("pointerout", handlePointerOut as EventListener);

      const cleanup = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        el.removeEventListener("pointerenter", handlePointerEnter as EventListener);
        el.removeEventListener("pointerleave", handlePointerLeave as EventListener);
        el.removeEventListener("pointermove", handlePointerMove as EventListener);
        el.removeEventListener("pointerout", handlePointerOut as EventListener);
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

      // Clean up any stale elements that were removed from DOM
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

      if (cursorEl) {
        gsap.killTweensOf(cursorEl);
      }
    };
  }, [disableOnTouch, hasFinePointer, hoverAttribute, mounted]);

  if (!mounted || (disableOnTouch && !hasFinePointer)) {
    return <>{children}</>;
  }

  const styles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 99999,
    pointerEvents: "none",
    willChange: "transform, width, height, border-radius",
    backgroundColor: cursorColor,
    mixBlendMode: blendMode as any,
    width: cursorSize,
    height: cursorSize,
    borderRadius:
      shape === "circle" ? "50%" : shape === "square" ? "0" : "8px",
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
    WebkitBackdropFilter:
      contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
  };

  return (
    <>
      <div
        ref={cursorRef}
        className={`magnetic-cursor select-none pointer-events-none ${cursorClassName}`}
        style={styles}
        aria-hidden="true"
      />
      {children}
    </>
  );
};
