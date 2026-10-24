import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Sparkles, ShieldCheck, MapPin, Phone, MessageSquare } from "lucide-react";
import { PageTransition } from "@/components/animations/PageTransition";
import { GlassSurface } from "@/components/ui/GlassSurface";

export function PublicLayout({
  children,
  hideAnnouncementBar = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideAnnouncementBar?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background/20 text-foreground">
      {/* ─── Animated Clinical Mint SVG Background for Whole Website (Dark & Light) ─── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden select-none">
        {/* Dark Mode Animated Clinical Background */}
        <img
          src="/design-assets/hero-clinical-dark.svg"
          alt=""
          className="hidden dark:block w-full h-full object-cover object-top"
          aria-hidden="true"
        />
        {/* Light Mode Animated Clinical Background */}
        <img
          src="/design-assets/hero-clinical-light.svg"
          alt=""
          className="block dark:hidden w-full h-full object-cover object-top"
          aria-hidden="true"
        />
      </div>

      {/* Top micro announcement bar */}
      {!hideAnnouncementBar && (
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
      )}

      <Navbar />
      <main className="flex-1 relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Floating Refraction Glass Surface Quick Contact Pill for Vadodara Doctors */}
      <aside aria-label="Quick contact" className="fixed bottom-5 right-5 z-40 hidden md:block">
        <GlassSurface
          width="auto"
          height={46}
          borderRadius={23}
          distortionScale={-140}
          displace={0.4}
          blur={10}
          backgroundOpacity={0.16}
          className="shadow-2xl shadow-sky-950/15 dark:shadow-black/50 hover:scale-102 transition-transform"
        >
          <div className="flex items-center gap-3 px-4 py-1 select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="text-left text-xs leading-none">
              <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight">
                Shiyabaug Depot
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                2-Hour Vadodara Delivery
              </span>
            </div>
            <a
              href="https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20doctor%20in%20Vadodara%20inquiring%20about%20dental%20materials."
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#12A488] hover:bg-[#3FD1B3] text-[#04110E] shadow-xs transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>WhatsApp Depot</span>
            </a>
          </div>
        </GlassSurface>
      </aside>

      {!hideFooter && <Footer />}
    </div>
  );
}

