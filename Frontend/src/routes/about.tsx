import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  FileText,
  Target,
  Eye,
  Heart,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Darsh Dental Depot — Authorized Dental Supplier Vadodara" },
      {
        name: "description",
        content:
          "Darsh Dental Depot is Vadodara's dedicated dental procurement depot, supplying 100% genuine composites, diamond burs, endodontic files, and equipment with Tally ERP GST invoices.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-caption-eyebrow text-primary">Dedicated Local Depot</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl font-extrabold font-heading tracking-tight text-foreground"
          >
            Empowering Vadodara’s Dental Practitioners with Authentic Materials.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Founded and operated in Vadodara by Hetal Gandhi & Smit Gandhi, Darsh Dental Depot provides dental surgeons with 100% genuine consumables, instruments, and materials with same-day express local delivery.
          </motion.p>
        </div>
      </section>

      {/* ─── Store Highlights Cards ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        <StaggerContainer staggerDelay={0.08} className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Our Clinical Purpose",
              desc: "Ensure no dental clinic in Vadodara has to delay a surgical or restorative procedure due to supply chain shortages or counterfeit products.",
            },
            {
              icon: Eye,
              title: "Local Depot Proximity",
              desc: "Strategically located at Siyabaug / Kevdabaug near Khanderao Market to dispatch orders directly to any clinic in Vadodara within 2 hours.",
            },
            {
              icon: Award,
              title: "100% Batch Authenticity",
              desc: "Every composite, diamond bur, and rotary file carries verifiable manufacturer lot numbers and Tally ERP GST tax invoices.",
            },
          ].map((v) => (
            <StaggerItem key={v.title} scale>
              <div className="p-6 rounded-2xl bg-card border border-border/70 dark:border-white/10 h-full shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground">{v.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ─── Legal & Regulatory Credentials ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <ScrollReveal className="p-6 sm:p-8 rounded-3xl bg-secondary/40 dark:bg-white/[0.02] border border-border/70 dark:border-white/10">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-2">
              <span className="text-caption-eyebrow text-primary">Compliance & Licensure</span>
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Authorized Gujarat Drug Licensure
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Operating strictly under official Food & Drugs Control Administration Gujarat standards with complete Tally ERP GST invoicing.
              </p>
            </div>

            <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/60 text-xs">
                <span className="text-muted-foreground text-[11px] block">Drug License Numbers</span>
                <span className="font-mono font-bold text-primary mt-1 block">
                  GJ-VAD-215550 & GJ-VAD-215551
                </span>
                <span className="text-muted-foreground text-[10.5px] mt-0.5 block">Form 20B & 21B Validated</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/60 text-xs">
                <span className="text-muted-foreground text-[11px] block">GSTIN / UIN Registration</span>
                <span className="font-mono font-bold text-foreground mt-1 block">
                  24ANKPG4381M1ZP
                </span>
                <span className="text-muted-foreground text-[10.5px] mt-0.5 block">State: Gujarat (Code: 24)</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/60 text-xs">
                <span className="text-muted-foreground text-[11px] block">Official Banking Partner</span>
                <span className="font-mono font-bold text-foreground mt-1 block">
                  IDBI BANK LTD (A/c: 0553102000031189)
                </span>
                <span className="text-muted-foreground text-[10.5px] mt-0.5 block">IFSC: IBKL0000553 (Siddhanath Branch)</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/60 text-xs">
                <span className="text-muted-foreground text-[11px] block">Physical Depot Location</span>
                <span className="font-semibold text-foreground mt-1 block">
                  FF-10/11, Vraj Vihar Complex, Siyabaug
                </span>
                <span className="text-muted-foreground text-[10.5px] mt-0.5 block">Vadodara, Gujarat 390001</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Call to Action ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 max-w-5xl text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border/70 dark:border-white/10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
            Ready to Streamline Your Clinic Material Orders?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Join verified dentists across Alkapuri, Akota, Gotri, and Old Padra Road who rely on Darsh Dental Depot.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild className="rounded-xl h-10 px-5 text-xs font-bold bg-primary text-white">
              <Link to="/register">
                Register Your Clinic <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl h-10 px-5 text-xs font-bold border-border/80">
              <Link to="/contact">Contact Depot</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
