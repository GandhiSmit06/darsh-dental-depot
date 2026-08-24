import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Sparkles, ShieldCheck, MapPin, Phone, MessageSquare } from "lucide-react";
import { PageTransition } from "@/components/animations/PageTransition";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Ambient background glow orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-delayed" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-primary/95 via-sky-600 to-indigo-600 text-white text-xs font-medium py-1.5 px-4 shadow-sm z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold">
              <MapPin className="h-3.5 w-3.5 text-amber-300" /> Exclusively Serving Vadodara Dental Clinics
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-200" /> Same-Day Local Clinic Dispatch
            </span>
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Darsh Dental Depot • Direct Depot Pricing For Vadodara Doctors</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-white">
            <a
              href="tel:+919727076119"
              className="text-[11px] bg-white/20 hover:bg-white/30 transition-colors px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-sm"
            >
              <Phone className="h-3 w-3" /> +91 97270 76119
            </a>
            <a
              href="https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20doctor%20in%20Vadodara%20inquiring%20about%20dental%20materials."
              target="_blank"
              rel="noreferrer"
              className="text-[11px] bg-emerald-500 hover:bg-emerald-600 transition-colors px-2 py-0.5 rounded-full font-bold flex items-center gap-1 text-white shadow-sm"
            >
              <MessageSquare className="h-3 w-3" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}

