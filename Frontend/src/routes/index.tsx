import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
  Search,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  HorizontalRail,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Darsh Dental Depot — Precision Dental Technology & Materials" },
      {
        name: "description",
        content:
          "Vadodara's premier dental materials supplier. Factory-certified restorative composites, Japanese Mani diamond burs, rotary files, and same-day clinic delivery.",
      },
    ],
  }),
  component: HomePage,
});

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

const featuredBrands = [
  { name: "Mani Medical Japan", tag: "Diamond Burs & K-Files", origin: "Japan" },
  { name: "GC Corporation", tag: "Gold Label & Fuji GIC", origin: "Japan" },
  { name: "3M Oral Care", tag: "Filtek Composites & Adper", origin: "USA" },
  { name: "Ivoclar Vivadent", tag: "Tetric N-Ceram & Cements", origin: "Liechtenstein" },
  { name: "Dentsply Sirona", tag: "ProTaper & Prime&Bond", origin: "USA" },
  { name: "Septodont", tag: "Local Anesthetics & Needles", origin: "France" },
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/products" });
  };

  return (
    <PublicLayout>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 01 — Cinematic Asymmetrical Hero
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="hero-gradient pt-12 pb-20 md:pt-20 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Asymmetrical Typography & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 dark:bg-white/[0.04] border border-border/80 dark:border-white/10 text-xs font-semibold backdrop-blur-md"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-foreground">Siyabaug Central Depot</span>
                <span className="text-muted-foreground">• Same-Day Clinic Delivery in Vadodara</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-2xl text-foreground font-extrabold"
              >
                Precision Dental Supplies. <br />
                <span className="text-gradient">Direct to Your Clinic.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                Procure authentic restorative composites, Japanese Mani diamond burs, rotary files, and clinical consumables with guaranteed same-day 2-hour delivery across all Vadodara clinics.
              </motion.p>

              {/* Instant Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleHeroSearch}
                className="max-w-xl p-1.5 rounded-2xl bg-card border border-border/80 dark:border-white/10 shadow-lg flex items-center gap-2"
              >
                <div className="pl-3 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search Mani burs, GC Fuji IX, composites, files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/70"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl px-5 h-9 bg-primary hover:bg-primary/90 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Search
                </Button>
              </motion.form>

              {/* Quick Suggestion Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1"
              >
                <span className="font-semibold text-foreground mr-1">Popular:</span>
                {["Mani Diamond Burs", "GC Gold Label 1", "Tetric N-Ceram", "Protaper Gold", "Alginate"].map((tag) => (
                  <Link
                    key={tag}
                    to="/products"
                    className="px-2.5 py-1 rounded-lg bg-secondary/60 dark:bg-white/[0.03] hover:bg-primary/10 hover:text-primary border border-border/60 text-[11px] font-medium transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </motion.div>

              {/* Trust Callout Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                className="pt-6 border-t border-border/50 dark:border-white/8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+91 97270 76119</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Direct Order</span>
                </div>
                <div className="flex items-center gap-1 text-mono-data text-foreground font-semibold">
                  <span>DL: GJ-VAD-215550</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Studio Hero Product Showcase */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-md lg:max-w-none"
              >
                {/* Main Glass Frame */}
                <div className="relative rounded-3xl overflow-hidden glass-card border border-border/80 dark:border-white/10 shadow-2xl p-2.5 bg-card">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted/40">
                    <img
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                      alt="Darsh Dental Depot Central Store"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className="bg-primary text-white text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md border-0">
                          Direct Depot Store
                        </Badge>
                        <Badge className="bg-emerald-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md border-0">
                          100% Genuine Certified
                        </Badge>
                      </div>
                      <div className="font-heading font-extrabold text-lg leading-tight">
                        Darsh Dental Depot • Shiyabaug
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Mon–Sat: 10:00 AM – 8:30 PM • Same-Day Clinic Dispatch in Vadodara
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Widget: Live Doctor Dispatch Alert */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -left-5 glass-card border border-border/80 dark:border-white/10 shadow-xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl bg-card max-w-[230px]"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="leading-tight text-xs">
                    <div className="font-bold text-foreground truncate">Dr. Patel • Alkapuri</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">3M Filtek Restorative Kit</div>
                    <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Dispatched • In Transit
                    </span>
                  </div>
                </motion.div>

                {/* Floating Widget: Tally GST Compliance */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-5 -right-5 glass-card border border-border/80 dark:border-white/10 shadow-xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl bg-card"
                >
                  <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="leading-tight text-xs">
                    <div className="font-bold text-foreground">Tally ERP GST Bills</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Full HSN tax input credit</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 02 — Editorial Manifesto
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 border-y border-border/60 dark:border-white/8 bg-secondary/30 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
          <ScrollReveal>
            <span className="text-caption-eyebrow text-primary">The Clinical Standard</span>
            <h2 className="text-display-xl font-bold text-foreground tracking-tight mt-2 leading-tight">
              "Every restorative composite. Every surgical diamond bur. Factory-sealed and delivered to your clinic within 2 hours."
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
              We eliminate counterfeit risks and supply delays for Vadodara dental surgeons through direct authorized distribution, certified drug licensure, and physical depot stock.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 03 — Specialty Category Explorer
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="container mx-auto px-4 py-20">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-caption-eyebrow text-primary">Structured Catalog</span>
            <h2 className="text-heading-1 font-bold text-foreground tracking-tight mt-1">
              Explore by Clinical Specialty
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Original dental materials and instruments categorized for rapid clinic procurement.
            </p>
          </div>
          <Button variant="ghost" asChild className="rounded-full hover:text-primary font-bold text-xs">
            <Link to="/products">
              View All Categories <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.07} className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <StaggerItem key={cat} scale>
              <Link to="/products" className="block group h-full">
                <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 hover:border-primary/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {cat}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                      <span>Depot Stock</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 04 — Featured Clinical Supplies (Real API Product Rail)
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-caption-eyebrow text-primary">Live Inventory</span>
            <h2 className="text-heading-1 font-bold text-foreground tracking-tight mt-1">
              Featured Dental Materials
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              High-demand Japanese diamond burs, GIC cements, and universal restoratives in stock today.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {["All", "Restorative", "Endodontics", "Impression"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === tab
                    ? "bg-primary text-white shadow-xs"
                    : "bg-secondary/70 dark:bg-white/[0.04] text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Product Rail / Grid */}
        <StaggerContainer staggerDelay={0.08} className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.slice(0, 8).map((product: any) => (
            <StaggerItem key={product._id || product.id} scale>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2} className="mt-10 text-center">
          <Button
            size="lg"
            asChild
            className="rounded-full px-7 h-11 bg-secondary/80 hover:bg-secondary text-foreground border border-border/80 font-bold text-xs"
          >
            <Link to="/products">
              Explore Complete 1,000+ Item Dental Catalog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 05 — Certified Global Manufacturers Matrix
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 border-y border-border/60 dark:border-white/8 bg-secondary/20 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-caption-eyebrow text-primary">Certified Ecosystem</span>
            <h2 className="text-heading-1 font-bold text-foreground tracking-tight mt-1">
              Authorized Manufacturer Distribution
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Direct factory partnerships guaranteeing batch traceability, seal integrity, and manufacturer warranty.
            </p>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredBrands.map((b) => (
              <StaggerItem key={b.name} scale>
                <div className="p-4 rounded-2xl bg-card border border-border/70 dark:border-white/8 text-center space-y-1 hover:border-primary/40 transition-colors">
                  <div className="font-heading font-extrabold text-xs text-foreground truncate">{b.name}</div>
                  <div className="text-[10px] text-primary font-semibold truncate">{b.tag}</div>
                  <div className="text-[9.5px] text-muted-foreground">Origin: {b.origin}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 06 — Logistics, Drug Licensure & Tally ERP Compliance
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="container mx-auto px-4 py-20">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-caption-eyebrow text-primary">Depot Credentials</span>
          <h2 className="text-heading-1 font-bold text-foreground tracking-tight mt-1">
            Built for Vadodara Dental Clinics
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Compliant commercial operations with transparent tax billing and prompt local dispatch.
          </p>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.09} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground">Drug Licensed Depot</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Licensed by the Food & Drugs Control Administration Gujarat under DL No. <strong>GJ-VAD-215550</strong> & <strong>GJ-VAD-215551</strong>.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-bold text-primary">
                100% Certified Genuine
              </div>
            </div>
          </StaggerItem>

          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 grid place-items-center mb-4">
                  <Truck className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground">Same-Day Local Transit</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Direct dispatch to clinics across Alkapuri, Akota, Gotri, Karelibaug, Manjalpur, and Vasna within 2 hours.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                Vadodara Express Delivery
              </div>
            </div>
          </StaggerItem>

          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center mb-4">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground">Tally ERP GST Invoices</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Computer-generated GST sales bills with HSN breakdown for instant input tax credit on clinic tax filings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                GSTIN: 24ANKPG4381M1ZP
              </div>
            </div>
          </StaggerItem>

          <StaggerItem scale>
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground">Depot Timings (Mon–Sat)</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Operating Monday to Saturday, 10:00 AM – 8:30 PM. Available on call for emergency surgical cases.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Siyabaug, Vadodara
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 07 — Doctor Case Trust & Clinic Reviews
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 border-t border-border/60 dark:border-white/8 bg-secondary/30 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-caption-eyebrow text-primary">Doctor Feedback</span>
            <h2 className="text-heading-1 font-bold text-foreground tracking-tight mt-1">
              Trusted by Vadodara Dental Surgeons
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Verified clinical experiences from dental practices across Vadodara.
            </p>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <StaggerItem key={t.name} scale>
                <div className="p-6 rounded-2xl bg-card border border-border/70 dark:border-white/10 flex flex-col justify-between h-full shadow-xs">
                  <div>
                    <div className="flex text-amber-400 mb-3.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold text-xs grid place-items-center shrink-0">
                      {t.name.split(" ")[1]?.[0] || t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-foreground">{t.name}</div>
                      <div className="text-[11px] text-primary font-medium">{t.clinic} (Vadodara)</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       * SECTION 08 — High-Impact Conversion Action Portal
       * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="container mx-auto px-4 py-20">
        <ScaleReveal>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-sky-600 to-primary p-8 sm:p-14 text-white shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-5">
              <Badge className="bg-white/20 text-white border-0 text-xs font-bold px-3 py-1">
                📍 Vadodara Clinic Network
              </Badge>

              <h2 className="text-display-xl font-extrabold text-white tracking-tight leading-tight">
                Need Urgent Dental Supplies For Your Clinic Today?
              </h2>

              <p className="text-sky-100 text-xs sm:text-sm leading-relaxed">
                Connect directly with Hetal Uncle & Smit Gandhi at <strong>{PHONE_NUMBER}</strong> or register your clinic account for direct online ordering.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="rounded-xl h-11 px-6 bg-white text-primary hover:bg-sky-50 font-bold text-xs shadow-lg"
                >
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Quick Order
                  </a>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-xl h-11 px-6 border-white/40 text-white hover:bg-white/10 font-bold text-xs backdrop-blur-xs"
                >
                  <Link to="/register">Register Dental Clinic</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScaleReveal>
      </section>
    </PublicLayout>
  );
}
