"use client";

import { type ReactNode, type CSSProperties } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Shared spring / easing presets
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Direction = "up" | "down" | "left" | "right";

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. ScrollReveal — Fade + Slide on scroll
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  /** Use spring physics instead of easeOut */
  spring?: boolean;
  /** Distance in px */
  distance?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  style,
  spring = false,
  distance,
  once = true,
}: ScrollRevealProps) {
  const shouldReduce = useReducedMotion();
  const offset = directionOffset[direction];
  const dist = distance ?? 40;
  const scale = dist / 40; // scale offset proportionally

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * scale,
      y: offset.y * scale,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: spring ? { ...SPRING_SMOOTH, delay } : { duration, delay, ease: EASE_OUT_EXPO },
    },
  };

  if (shouldReduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 2. StaggerContainer — Staggers children entrance
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  /** Base delay before stagger starts */
  delay?: number;
}

const staggerContainerVariants = (staggerDelay: number, delay: number): Variants => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: delay,
      staggerChildren: staggerDelay,
    },
  },
});

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  style,
  once = true,
  delay = 0,
}: StaggerContainerProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainerVariants(staggerDelay, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3. StaggerItem — Individual child inside a StaggerContainer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  direction?: Direction;
  /** Also add a slight scale effect */
  scale?: boolean;
}

export function StaggerItem({
  children,
  className,
  style,
  direction = "up",
  scale: withScale = false,
}: StaggerItemProps) {
  const offset = directionOffset[direction];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * 0.6,
      y: offset.y * 0.6,
      ...(withScale && { scale: 0.92 }),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      ...(withScale && { scale: 1 }),
      transition: { duration: 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={className}
      style={{ willChange: "transform, opacity", ...style }}
    >
      {children}
    </motion.div>
  );
}
