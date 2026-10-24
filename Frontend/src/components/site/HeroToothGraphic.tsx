import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function HeroToothGraphic() {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full select-none"
    >
      {/* Ambient Pulsing Glow behind Graphic */}
      <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-emerald-500/20 via-[#12A488]/25 to-sky-500/20 dark:from-[#12A488]/25 dark:via-[#3FD1B3]/20 dark:to-teal-500/15 rounded-3xl blur-2xl opacity-75 -z-10 pointer-events-none animate-pulse" />

      {/* Main Interactive Animated Graphic Container */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.015 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/60 dark:bg-[#070B0A]/85 backdrop-blur-md group"
      >
        {/* Dark Mode Animated SVG */}
        <img
          src="/design-assets/hero-clinical-dark.svg"
          alt="Darsh Dental Depot Animated Clinical Showcase - Dark"
          className="hidden dark:block w-full h-auto aspect-[16/10] sm:aspect-[1440/900] object-cover rounded-2xl sm:rounded-3xl transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          loading="eager"
        />

        {/* Light Mode Animated SVG */}
        <img
          src="/design-assets/hero-clinical-light.svg"
          alt="Darsh Dental Depot Animated Clinical Showcase - Light"
          className="block dark:hidden w-full h-auto aspect-[16/10] sm:aspect-[1440/900] object-cover rounded-2xl sm:rounded-3xl transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          loading="eager"
        />

        {/* Top Floating Clinical Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/80 dark:bg-[#070B0A]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/15 shadow-sm text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-[#3FD1B3]">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#12A488] dark:text-[#3FD1B3] animate-spin" style={{ animationDuration: "12s" }} />
          <span>Active Depot Visualizer</span>
        </div>

        {/* Bottom Verification Accent Badge */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/10 dark:bg-[#12A488]/15 backdrop-blur-md border border-emerald-500/30 dark:border-[#3FD1B3]/30 text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-[#3FD1B3]" />
          <span>100% Genuine Supplies</span>
        </div>

        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/15 dark:to-white/5 pointer-events-none rounded-2xl sm:rounded-3xl" />
      </motion.div>
    </motion.div>
  );
}

export default HeroToothGraphic;
