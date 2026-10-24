import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  // Silky smooth spring interpolation for scroll reaction
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.0005,
  });

  // Dynamic parallax transforms that move the SVG background with user scrolling
  // Negative Y moves the background upwards as the page scrolls down (parallax depth)
  const y = useTransform(smoothProgress, [0, 1], ["0%", "-28%"]);
  const x = useTransform(smoothProgress, [0, 0.5, 1], ["0%", "-2.5%", "1.5%"]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1.02, 1.08, 1.04]);
  const rotate = useTransform(smoothProgress, [0, 1], [0, -3]);

  // Secondary ambient glow that drifts at a distinct parallax rate for rich 3D clinical depth
  const ambientGlowY = useTransform(smoothProgress, [0, 1], ["0px", "-380px"]);
  const ambientGlowScale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.12, 1.02]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden select-none"
      style={{
        contain: "strict",
      }}
      aria-hidden="true"
    >
      {/* ─── Parallax Animated Background SVG Canvas ─── */}
      <motion.div
        className="absolute w-[116%] h-[132%] -top-[12%] -left-[8%] pointer-events-none"
        style={{
          y,
          x,
          scale,
          rotate,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* Dark Mode Clinical Mint SVG Background */}
        <img
          src="/design-assets/hero-clinical-dark.svg"
          alt=""
          className="hidden dark:block w-full h-full object-cover object-top pointer-events-none select-none"
          loading="eager"
          decoding="async"
        />

        {/* Light Mode Clinical Mint SVG Background */}
        <img
          src="/design-assets/hero-clinical-light.svg"
          alt=""
          className="block dark:hidden w-full h-full object-cover object-top pointer-events-none select-none"
          loading="eager"
          decoding="async"
        />
      </motion.div>

      {/* ─── Secondary Ambient Parallax Depth Layer ─── */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none opacity-35 dark:opacity-45"
        style={{
          y: ambientGlowY,
          scale: ambientGlowScale,
          background:
            "radial-gradient(circle, rgba(18,164,136,0.22) 0%, rgba(63,209,179,0.06) 45%, rgba(18,164,136,0) 70%)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
