import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { categories, faqs, testimonials } from "@/lib/mock-data";
import { useState } from "react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ScaleReveal,
  TextReveal,
  SectionHeading,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/")({ component: HomePage });

const MAPS_URL = "https://maps.app.goo.gl/7czn6gwYUgdSm8b46";
const PHONE_NUMBER = "+91 97270 76119";
const PHONE_RAW = "+919727076119";
const WHATSAPP_URL =
  "https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20doctor%20in%20Vadodara%20inquiring%20about%20dental%20materials.";

const vadodaraAreas = [
  "Alkapuri",
  "Akota",
  "Gotri",
  "Old Padra Road",
  "Karelibaug",
  "Manjalpur",
  "Fatehgunj",
  "Shiyabaug",
  "Waghodia Road",
  "Vasna-Bhayli",
  "Nizampura",
  "Subhanpura",
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: featuredResponse } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getProducts(true),
    enabled: isAuthenticated,
  });

  const apiProducts = featuredResponse?.data || [];
  const displayProducts = apiProducts;

  const filteredProducts = displayProducts.filter((p: any) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesCategory;
  });

  return (
    <PublicLayout>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-16 pb-24 md:pt-24 md:pb-32 relative overflow-hidden">
        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                <span>Exclusively for Dentists & Dental Clinics in Vadodara</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.08] text-foreground"
              >
                Vadodara's Trusted <span className="text-gradient block sm:inline">Dental Depot</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
              >
                Direct procurement from <strong>Darsh Dental Depot</strong> (Shiyabaug / Kevdabaug, Vadodara). Genuine composites, endodontic rotary files, impression materials, and clinic consumables with <strong>same-day 2-hour clinic delivery</strong> across Vadodara.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button
                  size="lg"
                  asChild
                  className="rounded-2xl h-13 px-8 text-base font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/25 btn-shine"
                >
                  <Link to="/products">
                    Explore Dental Catalog <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-2xl h-13 px-7 text-base font-semibold glass-card border-border/80 hover:bg-secondary"
                >
                  <Link to="/register">Register Vadodara Clinic</Link>
                </Button>
              </motion.div>

              {/* Direct Support & Trust Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="pt-6 border-t border-border/40 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-muted-foreground"
              >
                <a
                  href={`tel:${PHONE_RAW}`}
                  className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span>{PHONE_NUMBER}</span>
                </a>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 grid place-items-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span>WhatsApp Quick Order</span>
                </a>

                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                >
                  <span>Shiyabaug Store</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            </div>

            {/* Right Column: 3D Floating Hero Showcase */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                {/* Glow Backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-3xl blur-2xl opacity-70 -z-10 animate-pulse-slow" />

                {/* Main Card Frame */}
                <div className="relative rounded-3xl overflow-hidden glass-card border border-border/80 shadow-2xl p-2 bg-gradient-to-b from-card to-background">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                      alt="Darsh Dental Depot Vadodara"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <Badge className="bg-primary text-white text-[10px] uppercase font-bold tracking-wider mb-1">
                        Vadodara Central Depot
                      </Badge>
                      <div className="font-heading font-bold text-lg leading-tight">
                        Darsh Dental Depot • Shiyabaug
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Open Mon–Sat: 10:00 AM – 8:30 PM • Same-Day Clinic Dispatch
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Widget 1: Local Order Notification */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 sm:-left-8 glass-card border border-border/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-xl bg-card/90 max-w-[240px]"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shrink-0 shadow-md">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-foreground">Dr. Patel (Alkapuri)</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">3M Composite Kit</div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Dispatched • 2-Hour Delivery
                    </span>
                  </div>
                </motion.div>

                {/* Floating Widget 2: Doctor Wholesale Card */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -right-4 sm:-right-6 glass-card border border-border/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-xl bg-card/90"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white grid place-items-center shrink-0 shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Direct Depot Pricing</div>
                    <div className="text-[11px] text-primary font-bold">Wholesale Rates for Doctors</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Store Location & Operational Timings Bar ────────────────────────────── */}
      <ScaleReveal className="container mx-auto px-4 py-8 -mt-10 relative z-20">
        <Card className="p-6 glass-card rounded-3xl border border-border/80 shadow-xl bg-card/90">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block text-sm">Physical Store in Vadodara:</span>
                <p className="text-muted-foreground mt-0.5 leading-snug">
                  FF-10/11, Vraj Vihar Complex, Shiyabaug, Kevdabaug, Vadodara 390001
                </p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-bold inline-flex items-center gap-1 mt-1 hover:underline text-[11px]"
                >
                  Open in Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 md:border-x md:border-border/40 md:px-6">
              <div className="h-11 w-11 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block text-sm">Depot Working Hours:</span>
                <p className="text-foreground font-semibold mt-0.5">Mon – Sat: 10:00 AM – 8:30 PM</p>
                <p className="text-muted-foreground text-[11px]">Sunday: Closed (Surgeries on Call)</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-foreground block text-sm">Direct Owner Contact:</span>
                <a
                  href={`tel:${PHONE_RAW}`}
                  className="text-primary font-extrabold text-sm hover:underline block mt-0.5"
                >
                  {PHONE_NUMBER}
                </a>
                <span className="text-[11px] text-muted-foreground">Direct call / WhatsApp ordering</span>
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 transition-colors"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </Card>
      </ScaleReveal>

      {/* ─── Vadodara Clinic Delivery Coverage ────────────────────────────── */}
      <ScrollReveal className="container mx-auto px-4 py-12">
        <div className="p-6 rounded-3xl bg-secondary/40 border border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold text-base text-foreground">
                Same-Day Delivery Across All Vadodara Dental Clinics:
              </span>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              ⚡ 2-Hour Emergency Dispatch Available
            </Badge>
          </div>

          <StaggerContainer staggerDelay={0.04} className="flex flex-wrap gap-2">
            {vadodaraAreas.map((area) => (
              <StaggerItem key={area}>
                <span className="px-3 py-1 rounded-full bg-background border border-border/60 text-xs font-medium text-foreground inline-block">
                  📍 {area}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </ScrollReveal>

      {/* ─── Shop By Specialty ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                Structured Catalog
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
                Explore by Clinical Specialty
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                Original dental materials and equipment organized for clinical precision.
              </p>
            </div>
            <Button variant="ghost" asChild className="rounded-full hover:text-primary font-semibold text-sm">
              <Link to="/products">
                View Complete Catalog <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08} className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <StaggerItem key={cat} scale>
              <Link to="/products" className="block group">
                <Card className="p-5 glass-card glass-card-hover border border-border/60 hover:border-primary/50 rounded-2xl transition-all duration-300">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="font-bold font-heading text-base text-foreground group-hover:text-primary transition-colors">
                    {cat}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>In-Stock Depot</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ─── Featured Products Section ───────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/30">
                Verified Depot
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
                Featured Dental Materials
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Factory-certified composites, files, and adhesives ready for immediate Vadodara dispatch.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Restorative", "Endodontics", "Impression"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === tab
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <StaggerContainer staggerDelay={0.1} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.slice(0, 8).map((product: any) => (
            <StaggerItem key={product._id || product.id} scale>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2} className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="rounded-full px-8 h-12 bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 font-bold text-sm"
          >
            <Link to="/products">
              Browse All Dental Supplies <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </section>

      {/* ─── Why Choose Us: Feature Cards ────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border/50 py-20 relative">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="Why Vadodara Doctors Choose Us"
            title="Local Excellence & Authentic Sourcing"
            subtitle="Direct physical store in Vadodara with fast same-day clinic deliveries."
            className="mb-16"
          />

          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 h-full">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">100% Genuine Batches</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Direct manufacturer authorization from 3M, Ivoclar, GC, Mani, Dentsply Sirona, and Septodont.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 h-full">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-500 grid place-items-center mb-5">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">Same-Day Local Transit</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Immediate delivery directly to your dental clinic across Alkapuri, Akota, Gotri, Karelibaug and all Vadodara areas.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 h-full">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center mb-5">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">Depot Timings (Mon–Sat)</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Open Monday to Saturday, 10:00 AM to 8:30 PM. Available on call for emergency Sunday clinical procedures.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 h-full">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 grid place-items-center mb-5">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">GST Invoicing</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Instant digital and printed tax invoices with GST input credit for clinic accounts.
                </p>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Doctor Testimonials ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeading
          badge="Vadodara Dentist Feedback"
          title="Trusted by Practicing Dental Surgeons"
          subtitle="Read what doctors across Vadodara have to say about Darsh Dental Depot."
          className="mb-14"
        />

        <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} scale>
              <Card className="p-6 glass-card rounded-2xl border border-border/60 flex flex-col justify-between h-full">
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-sky-600 text-white font-bold text-sm grid place-items-center shadow-sm">
                    {t.name.split(" ")[1]?.[0] || t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-primary font-medium">{t.clinic} (Vadodara)</div>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm">
              Depot location, opening hours, Vadodara clinic delivery, and ordering.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08}>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((f, i) => (
              <StaggerItem key={f.q}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="glass-card border border-border/60 rounded-2xl px-5 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline py-4">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              </StaggerItem>
            ))}
          </Accordion>
        </StaggerContainer>
      </section>

      {/* ─── Bottom CTA Banner ───────────────────────────────── */}
      <ScaleReveal className="container mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-sky-600 to-indigo-700 p-8 sm:p-14 text-white shadow-2xl">
          {/* Decorative floating blur orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-white/20 text-white backdrop-blur-md border-0 text-xs font-semibold px-3 py-1">
              📍 Vadodara Doctor Network
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
              Need Urgent Dental Supplies For Your Clinic Today?
            </h2>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Call or WhatsApp Darsh Dental Depot directly at <strong>{PHONE_NUMBER}</strong> for instant clinic dispatch across Vadodara.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="rounded-2xl h-12 px-7 bg-white text-primary hover:bg-sky-50 font-bold text-sm shadow-lg btn-shine"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> Order on WhatsApp
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-2xl h-12 px-6 border-white/40 text-white hover:bg-white/10 font-semibold text-sm backdrop-blur-sm"
              >
                <a href={MAPS_URL} target="_blank" rel="noreferrer">
                  <MapPin className="mr-2 h-4 w-4" /> View Store on Google Maps
                </a>
              </Button>
            </div>
          </div>
        </div>
      </ScaleReveal>
    </PublicLayout>
  );
}
