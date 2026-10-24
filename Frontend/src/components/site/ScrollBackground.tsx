import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  // Snappy spring for 120 FPS latency-free scroll tracking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.15,
  });

  // ─── 1. Teeth Design: Refined footprint, Anchored to the RIGHT side ───
  // Stays cleanly within the right-hand margin/rail so it NEVER crosses or disturbs the main center content.
  const toothX = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["0px", "-35px", "18px", "-25px", "0px"]
  );

  // Glides gracefully down the right side with user scrolling
  const toothY = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["0px", "90px", "190px", "290px", "390px"]
  );

  // Subtle natural angle rotation as it floats along the right rail
  const toothRotate = useTransform(
    smoothProgress,
    [0, 0.3, 0.65, 1],
    [-8, 6, -9, 4]
  );

  // Size breathing: compact and respectful of content
  const toothScale = useTransform(
    smoothProgress,
    [0, 0.25, 0.75, 1],
    [1, 0.92, 0.86, 0.94]
  );

  // Context-aware opacity: prominent in the open hero right stage, softens automatically
  // into an unobtrusive ambient watermark when user scrolls through products & carousels
  const toothOpacity = useTransform(
    smoothProgress,
    [0, 0.12, 0.75, 1],
    [0.9, 0.38, 0.32, 0.45]
  );

  // ─── 2. Wavy Ribbon Line: Subtle, peripheral flow along the right & bottom ───
  const lineX = useTransform(smoothProgress, [0, 1], ["0px", "-220px"]);
  const lineY = useTransform(smoothProgress, [0, 1], ["0px", "140px"]);
  const lineOpacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.8, 1],
    [0.7, 0.25, 0.20, 0.32]
  );

  // ─── 3. Atmospheric Background Glow ───
  const bgAuraY = useTransform(smoothProgress, [0, 1], ["0px", "100px"]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden select-none"
      style={{ contain: "strict" }}
      aria-hidden="true"
    >
      {/* ─── Shared SVG Defs (Gradients, Shapes, Patterns) ─── */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Dark Gradients */}
          <linearGradient id="dark-bg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#070B0A" />
            <stop offset=".55" stopColor="#0A1713" />
            <stop offset="1" stopColor="#030706" />
          </linearGradient>
          <radialGradient id="dark-mint-aura">
            <stop stopColor="#12A488" stopOpacity=".28" />
            <stop offset=".55" stopColor="#12A488" stopOpacity=".08" />
            <stop offset="1" stopColor="#12A488" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dark-enamel-grad" x1=".1" y1="0" x2=".9" y2="1">
            <stop stopColor="#F4FFFC" />
            <stop offset=".45" stopColor="#BDEFE3" />
            <stop offset=".78" stopColor="#64CDB8" />
            <stop offset="1" stopColor="#247E6C" />
          </linearGradient>
          <linearGradient id="dark-shade-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFFFFF" stopOpacity=".85" />
            <stop offset=".5" stopColor="#C9F6EB" stopOpacity=".12" />
            <stop offset="1" stopColor="#0B594B" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="dark-ribbon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#12A488" stopOpacity="0" />
            <stop offset=".1" stopColor="#12A488" stopOpacity=".3" />
            <stop offset=".5" stopColor="#3FD1B3" stopOpacity=".75" />
            <stop offset=".9" stopColor="#12A488" stopOpacity=".3" />
            <stop offset="1" stopColor="#12A488" stopOpacity="0" />
          </linearGradient>
          <pattern id="dark-dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#A5F3E2" opacity=".20" />
          </pattern>

          {/* Light Gradients */}
          <linearGradient id="light-bg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F8FAFC" />
            <stop offset=".55" stopColor="#F0FAF7" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <radialGradient id="light-mint-aura">
            <stop stopColor="#028A72" stopOpacity=".18" />
            <stop offset=".55" stopColor="#028A72" stopOpacity=".04" />
            <stop offset="1" stopColor="#028A72" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="light-enamel-grad" x1=".1" y1="0" x2=".9" y2="1">
            <stop stopColor="#FFFFFF" />
            <stop offset=".45" stopColor="#E0F7F1" />
            <stop offset=".78" stopColor="#8DDCCB" />
            <stop offset="1" stopColor="#3B9C88" />
          </linearGradient>
          <linearGradient id="light-shade-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFFFFF" stopOpacity=".85" />
            <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".12" />
            <stop offset="1" stopColor="#287F70" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="light-ribbon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#028A72" stopOpacity="0" />
            <stop offset=".1" stopColor="#028A72" stopOpacity=".25" />
            <stop offset=".5" stopColor="#12A488" stopOpacity=".65" />
            <stop offset=".9" stopColor="#028A72" stopOpacity=".25" />
            <stop offset="1" stopColor="#028A72" stopOpacity="0" />
          </linearGradient>
          <pattern id="light-dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#087F6B" opacity=".20" />
          </pattern>

          {/* Master 3D Anatomical Molar Tooth Vector Path */}
          <path
            id="molar-tooth-geometry"
            d="M-83 -84 C-112 -119 -155 -100 -158 -55 C-162 -12 -137 23 -123 51 C-113 73 -108 113 -87 117 C-63 121 -58 68 -37 65 C-16 63 -10 116 13 117 C38 118 44 74 55 47 C70 12 91 -20 81 -57 C70 -98 31 -115 0 -88 C-27 -66 -52 -66 -83 -84Z"
          />
        </defs>
      </svg>

      {/* ─── Static / Subtle Ambient Base Background ─── */}
      <div className="absolute inset-0 w-full h-full">
        {/* Dark Mode Background Fill */}
        <div className="hidden dark:block absolute inset-0 bg-[#070B0A]" />
        {/* Light Mode Background Fill */}
        <div className="block dark:hidden absolute inset-0 bg-[#F8FAFC]" />

        {/* Ambient Glowing Aurora Disc in the upper right margin */}
        <motion.div
          className="absolute -top-[10%] right-[0%] w-[70vw] h-[70vw] max-w-[850px] max-h-[850px] rounded-full pointer-events-none opacity-35 dark:opacity-45"
          style={{
            y: bgAuraY,
            background:
              "radial-gradient(circle, rgba(18,164,136,0.18) 0%, rgba(63,209,179,0.04) 45%, rgba(18,164,136,0) 70%)",
            willChange: "transform",
          }}
        />

        {/* Subtle upper right dot grid */}
        <svg
          className="absolute top-0 right-0 w-[45vw] h-[380px] pointer-events-none opacity-25 dark:opacity-35"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100%" height="100%" fill="url(#dark-dot-grid)" className="hidden dark:block" />
          <rect width="100%" height="100%" fill="url(#light-dot-grid)" className="block dark:hidden" />
        </svg>
      </div>

      {/* ─── Dynamic Wavy Ribbon Lines: Soft, Peripheral Wave Flow ─── */}
      <motion.div
        className="absolute inset-0 w-[2200px] h-full pointer-events-none"
        style={{
          x: lineX,
          y: lineY,
          opacity: lineOpacity,
          willChange: "transform, opacity",
        }}
      >
        <svg
          viewBox="0 0 2200 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Broad Ambient Energy Wave Stream */}
          <path
            d="M-200 680 C180 500 320 280 580 370 S880 740 1140 610 S1460 310 1780 430 S2080 750 2380 580"
            stroke="#12A488"
            strokeOpacity="0.08"
            strokeWidth="48"
            strokeLinecap="round"
          />

          {/* Primary High-Gloss Ribbon Line (Dark) */}
          <path
            d="M-220 700 C160 530 300 270 560 350 S860 710 1130 600 S1440 320 1760 410 S2060 720 2360 570"
            stroke="url(#dark-ribbon-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="hidden dark:block"
          />

          {/* Primary High-Gloss Ribbon Line (Light) */}
          <path
            d="M-220 700 C160 530 300 270 560 350 S860 710 1130 600 S1440 320 1760 410 S2060 720 2360 570"
            stroke="url(#light-ribbon-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="block dark:hidden"
          />

          {/* Secondary Shimmer Wave Line */}
          <path
            d="M-220 740 C170 570 340 310 590 390 S890 740 1160 640 S1460 360 1780 440 S2090 740 2390 610"
            stroke="url(#dark-ribbon-grad)"
            strokeWidth="1.2"
            strokeDasharray="8 8"
            opacity="0.45"
            className="hidden dark:block"
          />
          <path
            d="M-220 740 C170 570 340 310 590 390 S890 740 1160 640 S1460 360 1780 440 S2090 740 2390 610"
            stroke="url(#light-ribbon-grad)"
            strokeWidth="1.2"
            strokeDasharray="8 8"
            opacity="0.45"
            className="block dark:hidden"
          />
        </svg>
      </motion.div>

      {/* ─── Compact, Elegant Teeth Assembly: Anchored to the RIGHT Rail ─── */}
      <motion.div
        className="absolute top-[14%] sm:top-[16%] lg:top-[18%] right-[1%] sm:right-[3%] lg:right-[5%] w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] lg:w-[320px] lg:h-[320px] pointer-events-none"
        style={{
          x: toothX,
          y: toothY,
          rotate: toothRotate,
          scale: toothScale,
          opacity: toothOpacity,
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        <svg
          viewBox="-240 -240 480 480"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ambient Radial Mint Glow Disc under Tooth */}
          <circle r="190" fill="url(#dark-mint-aura)" className="hidden dark:block" />
          <circle r="190" fill="url(#light-mint-aura)" className="block dark:hidden" />

          {/* Concentric Dental Orbit Ring 1 (Smooth, GPU CSS animation) */}
          <circle
            r="165"
            stroke="#3FD1B3"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="3 14"
            className="hidden dark:block animate-spin"
            style={{ animationDuration: "80s" }}
          />
          <circle
            r="165"
            stroke="#12A488"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="3 14"
            className="block dark:hidden animate-spin"
            style={{ animationDuration: "80s" }}
          />

          {/* Concentric Dental Orbit Ring 2 */}
          <circle
            r="138"
            stroke="#3FD1B3"
            strokeOpacity="0.48"
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="70 20 8 20"
            className="hidden dark:block animate-spin"
            style={{ animationDuration: "50s", animationDirection: "reverse" }}
          />
          <circle
            r="138"
            stroke="#12A488"
            strokeOpacity="0.48"
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="70 20 8 20"
            className="block dark:hidden animate-spin"
            style={{ animationDuration: "50s", animationDirection: "reverse" }}
          />

          {/* Concentric Dental Orbit Ring 3 */}
          <circle
            r="115"
            stroke="#A5F3E2"
            strokeOpacity="0.16"
            strokeWidth="1"
            fill="none"
            className="hidden dark:block"
          />
          <circle
            r="115"
            stroke="#087F6B"
            strokeOpacity="0.16"
            strokeWidth="1"
            fill="none"
            className="block dark:hidden"
          />

          {/* ─── 3D Anatomical Tooth Core (Dark Theme) ─── */}
          <g className="hidden dark:block" transform="translate(0, 2) rotate(-10)">
            <use href="#molar-tooth-geometry" fill="#3FD1B3" opacity="0.18" />
            <use
              href="#molar-tooth-geometry"
              fill="url(#dark-enamel-grad)"
              stroke="#D7FFF5"
              strokeOpacity="0.80"
              strokeWidth="2"
            />
            <use href="#molar-tooth-geometry" fill="url(#dark-shade-grad)" opacity="0.60" />

            {/* Anatomical Enamel Fissures */}
            <path
              d="M-91 -72 C-72 -92 -49 -84 -30 -72 S10 -62 28 -78 S68 -80 76 -53"
              stroke="#FFFFFF"
              strokeOpacity="0.80"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-42 -57 C-27 -38 -25 -15 -40 0 M22 -56 C7 -33 13 -14 31 1"
              stroke="#3A9D88"
              strokeOpacity="0.45"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-65 45 C-56 67 -58 94 -47 105 M38 44 C27 70 31 91 20 106"
              stroke="#0D6656"
              strokeOpacity="0.45"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* ─── 3D Anatomical Tooth Core (Light Theme) ─── */}
          <g className="block dark:hidden" transform="translate(0, 2) rotate(-10)">
            <use href="#molar-tooth-geometry" fill="#12A488" opacity="0.18" />
            <use
              href="#molar-tooth-geometry"
              fill="url(#light-enamel-grad)"
              stroke="#FFFFFF"
              strokeOpacity="0.85"
              strokeWidth="2"
            />
            <use href="#molar-tooth-geometry" fill="url(#light-shade-grad)" opacity="0.60" />

            <path
              d="M-91 -72 C-72 -92 -49 -84 -30 -72 S10 -62 28 -78 S68 -80 76 -53"
              stroke="#FFFFFF"
              strokeOpacity="0.80"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-42 -57 C-27 -38 -25 -15 -40 0 M22 -56 C7 -33 13 -14 31 1"
              stroke="#62BDAA"
              strokeOpacity="0.45"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-65 45 C-56 67 -58 94 -47 105 M38 44 C27 70 31 91 20 106"
              stroke="#5BAF9E"
              strokeOpacity="0.45"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Enamel Gloss Highlight */}
          <ellipse
            cx="-22"
            cy="-104"
            rx="65"
            ry="22"
            fill="#FFFFFF"
            opacity="0.14"
            transform="rotate(-20)"
          />

          {/* Sparkle Nodes */}
          <circle cx="132" cy="-85" r="4" fill="#A5F3E2" className="hidden dark:block animate-pulse" />
          <circle cx="132" cy="-85" r="4" fill="#087F6B" className="block dark:hidden animate-pulse" />
          <circle cx="-150" cy="55" r="3" fill="#3FD1B3" className="hidden dark:block animate-ping" style={{ animationDuration: "4s" }} />
          <circle cx="-150" cy="55" r="3" fill="#12A488" className="block dark:hidden animate-ping" style={{ animationDuration: "4s" }} />
        </svg>
      </motion.div>
    </div>
  );
}
