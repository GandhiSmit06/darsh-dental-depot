import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Search,
  UserPlus,
  Headphones,
  Tag,
  ShoppingCart,
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

const clinicalSpecialties = [
  {
    title: "Restorative",
    desc: "Composites, Cements, Bonding Agents...",
    image: "/design-assets/cat-restorative.jpg",
    category: "Composites",
  },
  {
    title: "Endodontics",
    desc: "Files, Sealers, Obturation Materials...",
    image: "/design-assets/cat-endodontics.jpg",
    category: "Endodontics",
  },
  {
    title: "Impression Materials",
    desc: "Putty, Light Body, Trays, Accessories...",
    image: "/design-assets/cat-impression.jpg",
    category: "Impression Materials",
  },
  {
    title: "Orthodontics",
    desc: "Brackets, Wires, Tubes, Elastics...",
    image: "/design-assets/cat-orthodontics.jpg",
    category: "Orthodontics",
  },
  {
    title: "Instruments",
    desc: "Examination, Extraction, Diagnostic...",
    image: "/design-assets/cat-instruments.jpg",
    category: "Instruments",
  },
  {
    title: "Disposables",
    desc: "Masks, Gloves, Syringes, Tips...",
    image: "/design-assets/cat-disposables.jpg",
    category: "Disposables",
  },
  {
    title: "Cements & Adhesives",
    desc: "Luting Cements, Self-Adhesive Cements...",
    image: "/design-assets/cat-cements.jpg",
    category: "Cements & Adhesives",
  },
  {
    title: "Whitening",
    desc: "Bleaching Gels, Accessories...",
    image: "/design-assets/cat-whitening.jpg",
    category: "Whitening",
  },
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate({ to: "/products", search: { search: heroSearch.trim() } as any });
    } else {
      navigate({ to: "/products" });
    }
  };

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
    <PublicLayout hideAnnouncementBar={true}>
      {/* ─── Hero Section (Redesigned per Mockup) ─────────────────────────── */}
      <section className="bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 dark:from-[#070B0A] dark:via-[#0A100F] dark:to-[#070B0A] pt-12 pb-14 md:pt-16 md:pb-18 relative overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Subtitle, Search, CTA, Trust Badges */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Green status pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs backdrop-blur-xs"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Exclusively Serving Dentists & Dental Clinics in Vadodara</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight font-heading leading-[1.08] text-slate-900 dark:text-white"
              >
                Vadodara's Most Trusted{" "}
                <span className="bg-gradient-to-r from-[#0055d4] via-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent block sm:inline">
                  Dental Depot
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
              >
                Premium dental materials, instruments and consumables from leading global brands. Direct procurement, genuine products, and fast 2-hour clinic delivery across Vadodara.
              </motion.p>

              {/* Integrated Hero Search Pill */}
              <motion.form
                onSubmit={handleHeroSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl w-full"
              >
                <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-sky-950/5 p-1.5 pl-5 focus-within:ring-2 focus-within:ring-[#0284c7]/40 focus-within:border-[#0284c7] transition-all">
                  <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for products, brands or categories..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-10 w-10 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105"
                    aria-label="Search Depot"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>

              {/* CTA Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3.5 pt-1"
              >
                <Button
                  size="lg"
                  asChild
                  className="rounded-full h-12 px-7 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/25 transition-transform hover:scale-[1.02]"
                >
                  <Link to="/products" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Explore Dental Catalog</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full h-12 px-7 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-xs transition-transform hover:scale-[1.02]"
                >
                  <Link to="/register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-slate-500" />
                    <span>Register Vadodara Clinic</span>
                  </Link>
                </Button>
              </motion.div>

              {/* 4 Horizontal Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/70 dark:border-slate-800/70"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">100%</span>
                    <span className="text-slate-500 text-[11px]">Genuine Products</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">Same-Day</span>
                    <span className="text-slate-500 text-[11px]">Clinic Delivery</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">Best Wholesale</span>
                    <span className="text-slate-500 text-[11px]">Prices for Doctors</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">Dedicated</span>
                    <span className="text-slate-500 text-[11px]">Doctor Support</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: 3D Glossy Tooth & Marble Pedestal + Floating Interactive Cards */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Script watermark behind visual */}
              <div className="absolute -top-6 right-2 sm:right-6 text-sky-800/15 dark:text-sky-300/15 font-serif italic text-3xl sm:text-4xl pointer-events-none select-none tracking-tight">
                Better Tools Brighter Smiles
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto max-w-lg"
              >
                {/* Subtle ambient cyan glow behind tooth */}
                <div className="absolute -inset-4 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl opacity-60 -z-10 pointer-events-none" />

                {/* 3D Tooth on Marble Pedestal centerpiece */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
                  <img
                    src="/design-assets/hero-tooth-pedestal-hd.jpg"
                    alt="Darsh Dental Depot Tooth and Pedestal Showcase"
                    className="w-full h-auto object-cover rounded-3xl transform hover:scale-[1.01] transition-transform duration-500"
                  />
                </div>

                {/* Floating Card 1 (Top Left / Depot status & hours) */}
                <motion.a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -left-2 sm:-left-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-3 max-w-[260px] z-20 group hover:border-[#0284c7]/50 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#0284c7] grid place-items-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="text-xs leading-snug">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>Darsh Dental Depot</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                          Open Now
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Shiyabaug, Vadodara</p>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                        <div>Mon - Sat: 10:00 AM - 8:30 PM</div>
                        <div className="text-slate-400 dark:text-slate-500">Sunday: Closed (Emergency on Call)</div>
                      </div>
                    </div>
                  </div>
                </motion.a>

                {/* Floating Card 2 (Right Center / 2-Hour Delivery) */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-[40%] -right-2 sm:-right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-3 flex items-center gap-3 z-20"
                >
                  <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-[#0284c7] grid place-items-center shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">2-Hour Clinic Delivery</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Across Vadodara</div>
                  </div>
                </motion.div>

                {/* Floating Card 3 (Bottom Right / WhatsApp Orders) */}
                <motion.a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-4 right-0 sm:right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-2xl p-3 flex items-center gap-3 z-20 group hover:border-emerald-500/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-emerald-500 text-white grid place-items-center shrink-0 shadow-md">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      +91 97270 76119
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Direct Call / WhatsApp for Orders
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Brand Logos Ribbon (Matching Mockup) ─────────────────────────── */}
      <div className="container mx-auto px-4 -mt-3 mb-10 relative z-20">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="h-7 w-7 rounded-lg bg-sky-50 dark:bg-slate-800 text-[#0284c7] grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Authorized Distributor For Leading Global Brands</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <span className="font-black text-red-600 text-xl font-sans tracking-tighter">3M</span>
            <span className="font-bold text-[#008f9f] text-lg tracking-tight lowercase">ivoclar</span>
            <span className="font-black italic text-[#006f4e] text-xl">'GC'</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border-2 border-current" /> Dentsply Sirona
            </span>
            <span className="font-black text-slate-900 dark:text-white text-lg tracking-wider">MANI.</span>
            <span className="font-bold text-red-600 text-base italic">Zhermack</span>
            <span className="font-bold text-red-600 text-sm flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-red-600 inline-block" /> septodont
            </span>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>And Many More...</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── Explore by Clinical Speciality (8 Specialty Cards Grid) ──────── */}
      <section className="container mx-auto px-4 py-8 mb-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-100 dark:border-sky-900/60 mb-2">
                Structured Catalog
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white">
                Explore by Clinical Speciality
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
                Original dental materials and equipment organized for clinical precision.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-sky-200 dark:border-sky-800 text-[#0284c7] hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold px-4 h-9"
            >
              <Link to="/products">
                View Complete Catalog <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <StaggerContainer
          staggerDelay={0.06}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
        >
          {clinicalSpecialties.map((item) => (
            <StaggerItem key={item.title} scale>
              <Link
                to="/products"
                search={{ category: item.category } as any}
                className="group block h-full"
              >
                <div className="h-full bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs hover:shadow-md hover:border-[#0284c7]/50 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="h-20 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center p-1.5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-2.5 group-hover:text-[#0284c7] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-2.5 flex justify-end">
                    <span className="h-5 w-5 rounded-full border border-slate-200 dark:border-slate-700 group-hover:border-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white text-slate-400 grid place-items-center transition-all">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
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
              <Badge variant="outline" className="mb-2 text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10">
                Verified Depot
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-foreground">
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
                      ? "bg-primary text-primary-foreground dark:bg-[#12A488] dark:text-[#04110E] shadow-md shadow-primary/25 dark:shadow-[#12A488]/25 font-bold"
                      : "bg-secondary hover:bg-secondary/80 dark:bg-[#0B1210] dark:text-[#9DB0A9] hover:dark:text-[#F2F6F4] text-muted-foreground hover:text-foreground border border-border/50 dark:border-white/10"
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
            className="rounded-full px-8 h-12 bg-secondary hover:bg-secondary/80 dark:bg-[#0B1210] dark:text-[#F2F6F4] dark:border-white/10 hover:dark:bg-[#10201C] text-foreground border border-border/80 font-bold text-sm"
          >
            <Link to="/products">
              Browse All Dental Supplies <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </section>

      {/* ─── Why Choose Us: Feature Cards ────────────────────────────────── */}
      <section className="bg-secondary/30 dark:bg-[#0B1210] border-y border-border/50 dark:border-white/10 py-20 relative">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="Why Vadodara Doctors Choose Us"
            title="Local Excellence & Authentic Sourcing"
            subtitle="Direct physical store in Vadodara with fast same-day clinic deliveries."
            badgeClassName="text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10"
            className="mb-16"
          />

          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 dark:bg-[#12A488]/15 text-primary dark:text-[#3FD1B3] grid place-items-center mb-5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">100% Genuine Batches</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Direct manufacturer authorization from 3M, Ivoclar, GC, Mani, Dentsply Sirona, and Septodont.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 dark:bg-[#12A488]/15 text-sky-500 dark:text-[#3FD1B3] grid place-items-center mb-5">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">Same-Day Local Transit</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Immediate delivery directly to your dental clinic across Alkapuri, Akota, Gotri, Karelibaug and all Vadodara areas.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 dark:bg-[#12A488]/15 text-indigo-500 dark:text-[#3FD1B3] grid place-items-center mb-5">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">Depot Timings (Mon–Sat)</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Open Monday to Saturday, 10:00 AM to 8:30 PM. Available on call for emergency Sunday clinical procedures.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 dark:bg-[#12A488]/15 text-emerald-500 dark:text-[#3FD1B3] grid place-items-center mb-5">
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
          badgeClassName="text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10"
          className="mb-14"
        />

        <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} scale>
              <Card className="p-6 glass-card rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] flex flex-col justify-between h-full">
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

                <div className="mt-6 pt-4 border-t border-border/40 dark:border-white/10 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-sky-600 dark:from-[#12A488] dark:to-[#10201C] text-white dark:text-[#3FD1B3] font-bold text-sm grid place-items-center shadow-sm">
                    {t.name.split(" ")[1]?.[0] || t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.name}</div>
                    <div className="text-xs text-primary dark:text-[#3FD1B3] font-medium">{t.clinic} (Vadodara)</div>
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
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
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
                  className="glass-card border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] rounded-2xl px-5 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:no-underline py-4 text-foreground hover:text-primary dark:hover:text-[#3FD1B3]">
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
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-sky-600 to-indigo-700 dark:from-[#10201C] dark:via-[#0B1210] dark:to-[#070B0A] dark:border dark:border-white/15 p-8 sm:p-14 text-white shadow-2xl">
          {/* Subtle clinical teal ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-[#12A488]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-white/20 dark:bg-[#12A488]/20 text-white dark:text-[#3FD1B3] dark:border-[#12A488]/30 backdrop-blur-md border-0 text-xs font-semibold px-3 py-1">
              📍 Vadodara Doctor Network
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight leading-tight">
              Need Urgent Dental Supplies For Your Clinic Today?
            </h2>

            <p className="text-sky-100 dark:text-[#9DB0A9] text-sm sm:text-base leading-relaxed">
              Call or WhatsApp Darsh Dental Depot directly at <strong>{PHONE_NUMBER}</strong> for instant clinic dispatch across Vadodara.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="rounded-2xl h-12 px-7 bg-white dark:bg-[#12A488] text-primary dark:text-[#04110E] hover:bg-sky-50 hover:dark:bg-[#3FD1B3] font-bold text-sm shadow-lg btn-shine"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> Order on WhatsApp
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-2xl h-12 px-6 border-white/40 dark:border-white/20 text-white hover:bg-white/10 dark:hover:bg-white/10 font-semibold text-sm backdrop-blur-sm"
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
