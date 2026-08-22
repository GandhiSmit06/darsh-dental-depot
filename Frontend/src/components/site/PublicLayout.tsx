import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Sparkles, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Ambient background glow orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-delayed" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-primary/90 via-sky-600 to-indigo-600 text-white text-xs font-medium py-1.5 px-4 shadow-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-200" /> 100% Authentic Quality
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-sky-200" /> Pan-India Express Delivery
            </span>
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Special Doctor Wholesale Pricing Available Today</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-white/90">
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm">Helpline: +91 98765 43210</span>
          </div>
        </div>
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
