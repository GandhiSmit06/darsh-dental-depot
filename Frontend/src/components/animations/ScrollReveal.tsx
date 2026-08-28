import { type ReactNode, type CSSProperties } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Shared spring / easing presets
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 };
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Direction = "up" | "down" | "left" | "right";

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up:    { x: 0,   y: 40  },
  down:  { x: 0,   y: -40 },
  left:  { x: 40,  y: 0   },
  right: { x: -40, y: 0   },
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
      transition: spring
        ? { ...SPRING_SMOOTH, delay }
        : { duration, delay, ease: EASE_OUT_EXPO },
    },
  };

  if (shouldReduce) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      className={className}
      style={{ willChange: "transform, opacity", ...style }}
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
    return <div className={className} style={style}>{children}</div>;
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 4. ScaleReveal — Scale + Fade on scroll
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface ScaleRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
}

export function ScaleReveal({ children, delay = 0, className, style, once = true }: ScaleRevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
      className={className}
      style={{ willChange: "transform, opacity", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 5. TextReveal — Word-by-word heading reveal
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface TextRevealProps {
  text: string;
  className?: string;
  /** Tag to render */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  staggerDelay?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className,
  as: Tag = "h2",
  staggerDelay = 0.04,
  once = true,
}: TextRevealProps) {
  const shouldReduce = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <Tag className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-40px" }}
        aria-label={text}
        style={{ display: "flex", flexWrap: "wrap", gap: "0 0.3em" }}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={child}
            style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 6. ParallaxLayer — Subtle parallax on scroll
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface ParallaxLayerProps {
  children: ReactNode;
  /** How much to shift (negative = opposite scroll dir) */
  offset?: number;
  className?: string;
  style?: CSSProperties;
}

export function ParallaxLayer({
  children,
  offset = -30,
  className,
  style,
}: ParallaxLayerProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: offset }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0, type: "tween" }}
      className={className}
      style={{ willChange: "transform", ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 7. CountUp — Animated number counter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function CountUp({ to, duration = 2, className, suffix = "", prefix = "" }: CountUpProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <span className={className}>{prefix}{to}{suffix}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {prefix}
        <span>{to}</span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 8. SectionHeading — Reusable animated heading block
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  badgeClassName?: string;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  badgeClassName = "text-primary border-primary/30",
  className = "",
}: SectionHeadingProps) {
  const textAlign = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-2xl space-y-3 ${textAlign} ${className}`}>
      {badge && (
        <ScrollReveal delay={0}>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClassName}`}
          >
            {badge}
          </span>
        </ScrollReveal>
      )}
      <TextReveal
        text={title}
        as="h2"
        className="text-3xl sm:text-4xl font-bold font-heading tracking-tight"
      />
      {subtitle && (
        <ScrollReveal delay={0.15}>
          <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
        </ScrollReveal>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 9. HorizontalRail — Touch-friendly & physics-drag discovery rail
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface HorizontalRailProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalRail({ children, className = "" }: HorizontalRailProps) {
  return (
    <div className={`overflow-x-auto no-scrollbar flex items-stretch gap-5 pb-6 pt-2 snap-x snap-mandatory px-4 md:px-0 ${className}`}>
      {children}
    </div>
  );
}
