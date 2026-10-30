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
  Package,
  Layers,
  LayoutGrid,
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
import { ProductCard, type ProductCardProps } from "@/components/site/ProductCard";
import { DepthCarousel } from "@/components/ui/DepthCarousel";
import { GlassSurface } from "@/components/ui/GlassSurface";
import LogoLoop, { type LogoItem } from "@/components/ui/LogoLoop";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { faqs, testimonials } from "@/lib/mock-data";
import { useState, useEffect } from "react";
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

const dentalBrandLogos: LogoItem[] = [
  {
    title: "3M Oral Care",
    href: "/products?brand=3M",
    hoverColor: "#ED1C24",
    node: (
      <span className="font-black text-red-600 dark:text-red-500 text-xl font-sans tracking-tighter">
        3M
      </span>
    ),
  },
  {
    title: "Ivoclar Vivadent",
    href: "/products?brand=Ivoclar",
    hoverColor: "#008F9F",
    node: (
      <span className="font-bold text-[#008f9f] dark:text-[#3FD1B3] text-lg tracking-tight lowercase">
        ivoclar
      </span>
    ),
  },
  {
    title: "GC Dental Corporation",
    href: "/products?brand=GC",
    hoverColor: "#008C4A",
    node: (
      <span className="font-black italic text-[#008C4A] dark:text-[#3FD1B3] text-xl">
        'GC'
      </span>
    ),
  },
  {
    title: "Dentsply Sirona",
    href: "/products?brand=Dentsply",
    hoverColor: "#00A3E0",
    node: (
      <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5 whitespace-nowrap">
        <span className="h-2 w-2 rounded-full border-2 border-current inline-block" />
        Dentsply Sirona
      </span>
    ),
  },
  {
    title: "MANI Micro-Instruments",
    href: "/products?brand=MANI",
    hoverColor: "#E60012",
    node: (
      <span className="font-black text-slate-900 dark:text-white text-lg tracking-wider">
        MANI.
      </span>
    ),
  },
  {
    title: "Zhermack Dental",
    href: "/products?brand=Zhermack",
    hoverColor: "#005A9C",
    node: (
      <span className="font-bold text-red-600 dark:text-slate-200 text-base italic tracking-tight">
        Zhermack
      </span>
    ),
  },
  {
    title: "Septodont Pharmaceuticals",
    href: "/products?brand=Septodont",
    hoverColor: "#E30613",
    node: (
      <span className="font-bold text-red-600 dark:text-slate-200 text-sm flex items-center gap-1.5 whitespace-nowrap">
        <span className="h-2.5 w-2.5 rounded-full bg-red-600 dark:bg-slate-200 inline-block" />
        septodont
      </span>
    ),
  },
  {
    title: "Kerr Dental",
    href: "/products?brand=Kerr",
    hoverColor: "#00529B",
    node: (
      <span className="font-black text-blue-700 dark:text-sky-400 text-lg tracking-tight uppercase">
        Kerr
      </span>
    ),
  },
  {
    title: "Kuraray Noritake",
    href: "/products?brand=Kuraray",
    hoverColor: "#003366",
    node: (
      <span className="font-bold text-slate-800 dark:text-slate-200 text-base tracking-wide">
        kuraray
      </span>
    ),
  },
  {
    title: "VOCO Dental",
    href: "/products?brand=VOCO",
    hoverColor: "#004F9F",
    node: (
      <span className="font-black text-[#004F9F] dark:text-sky-300 text-lg tracking-wider">
        VOCO
      </span>
    ),
  },
  {
    title: "Shofu Dental",
    href: "/products?brand=Shofu",
    hoverColor: "#C8102E",
    node: (
      <span className="font-extrabold text-red-600 dark:text-red-400 text-base tracking-widest uppercase">
        SHOFU
      </span>
    ),
  },
  {
    title: "Coltène / Whaledent",
    href: "/products?brand=Coltene",
    hoverColor: "#003865",
    node: (
      <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
        COLTENE
      </span>
    ),
  },
  {
    title: "Kulzer Mitsui Chemicals",
    href: "/products?brand=Kulzer",
    hoverColor: "#0088CE",
    node: (
      <span className="font-black text-sky-600 dark:text-sky-400 text-lg tracking-tight">
        KULZER
      </span>
    ),
  },
  {
    title: "Ultradent Products",
    href: "/products?brand=Ultradent",
    hoverColor: "#008080",
    node: (
      <span className="font-extrabold text-teal-700 dark:text-teal-300 text-base tracking-wider uppercase">
        ULTRADENT
      </span>
    ),
  },
  {
    title: "Hu-Friedy Instruments",
    href: "/products?brand=Hu-Friedy",
    hoverColor: "#990000",
    node: (
      <span className="font-bold text-slate-800 dark:text-slate-200 text-base italic tracking-tight">
        Hu-Friedy
      </span>
    ),
  },
  {
    title: "BISCO Dental",
    href: "/products?brand=Bisco",
    hoverColor: "#D97706",
    node: (
      <span className="font-black text-amber-600 dark:text-amber-400 text-base tracking-wider uppercase">
        BISCO
      </span>
    ),
  },
  {
    title: "Straumann Dental Implants",
    href: "/products?brand=Straumann",
    hoverColor: "#008F9F",
    node: (
      <span className="font-black text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1">
        <span className="text-[#008f9f] lowercase">straumann</span>
      </span>
    ),
  },
  {
    title: "Tokuyama Dental",
    href: "/products?brand=Tokuyama",
    hoverColor: "#2563EB",
    node: (
      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm tracking-widest uppercase">
        TOKUYAMA
      </span>
    ),
  },
  {
    title: "SDI Dental",
    href: "/products?brand=SDI",
    hoverColor: "#1D4ED8",
    node: (
      <span className="font-black text-blue-800 dark:text-sky-400 text-lg tracking-tighter">
        SDI
      </span>
    ),
  },
  {
    title: "Woodpecker Medical",
    href: "/products?brand=Woodpecker",
    hoverColor: "#059669",
    node: (
      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm tracking-tight flex items-center gap-1.5 whitespace-nowrap">
        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
        WOODPECKER
      </span>
    ),
  },
];

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
  const [specialtyViewMode, setSpecialtyViewMode] = useState<"carousel" | "grid">("carousel");
  const [depotStatus, setDepotStatus] = useState<{ isOpen: boolean; label: string }>({
    isOpen: false,
    label: "Mon–Sat Depot • Vadodara",
  });

  useEffect(() => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const day = parts.find((p) => p.type === "weekday")?.value;
      const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
      const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
      const totalMinutes = hour * 60 + minute;

      // Mon–Sat: 10:00 AM (600 mins) to 8:30 PM (1230 mins)
      const isSunday = day === "Sun";
      const isDuringHours = totalMinutes >= 600 && totalMinutes < 1230;

      if (!isSunday && isDuringHours) {
        setDepotStatus({ isOpen: true, label: "Open Now • Vadodara" });
      } else if (isSunday) {
        setDepotStatus({ isOpen: false, label: "Opens Mon 10 AM • Vadodara" });
      } else if (totalMinutes < 600) {
        setDepotStatus({ isOpen: false, label: "Opens 10 AM • Vadodara" });
      } else {
        setDepotStatus({ isOpen: false, label: "Opens Tomorrow 10 AM • Vadodara" });
      }
    } catch {
      setDepotStatus({ isOpen: false, label: "Mon–Sat 10AM–8:30PM • Vadodara" });
    }
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate({
        to: "/products",
        search: { search: heroSearch.trim() } as Record<string, unknown>,
      });
    } else {
      navigate({ to: "/products" });
    }
  };

  const { data: featuredResponse } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getProducts(true),
  });

  const apiProducts = featuredResponse?.data || [];
  const displayProducts = apiProducts;

  const filteredProducts = displayProducts.filter((p: NonNullable<ProductCardProps["product"]>) => {
    const category = typeof p.category === "string" ? p.category : "";
    const matchesCategory =
      selectedCategory === "All" || category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesCategory;
  });

  return (
    <PublicLayout hideAnnouncementBar={true}>
      {/* ─── Hero Section (Redesigned with Full Animated SVG Background) ─── */}
      <section className="bg-transparent pt-12 pb-14 md:pt-16 md:pb-24 relative overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Subtitle, Search, CTA, Trust Badges */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Green status pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
              >
                <GlassSurface
                  width="auto"
                  height={36}
                  borderRadius={18}
                  distortionScale={-80}
                  displace={0.2}
                  blur={6}
                  backgroundOpacity={0.12}
                  className="px-3.5 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-xs font-semibold select-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Exclusively Serving Dentists & Dental Clinics in Vadodara</span>
                  </div>
                </GlassSurface>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight font-heading leading-[1.08] text-slate-900 dark:text-white max-w-2xl"
              >
                Vadodara's Most Trusted{" "}
                <span className="text-[#0284c7] dark:text-[#3FD1B3] block sm:inline-block whitespace-nowrap">
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
                Premium dental materials, instruments and consumables from leading global brands.
                Direct procurement, genuine products, and fast 2-hour clinic delivery across
                Vadodara.
              </motion.p>

              {/* Integrated Hero Search Pill */}
              <motion.form
                data-magnetic
                onSubmit={handleHeroSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl w-full"
              >
                <GlassSurface
                  width="100%"
                  height={56}
                  borderRadius={28}
                  distortionScale={-140}
                  displace={0.35}
                  blur={8}
                  backgroundOpacity={0.15}
                  className="shadow-xl shadow-sky-950/5 dark:shadow-black/40 hover:shadow-2xl transition-all"
                >
                  <div className="relative flex items-center w-full px-2 pl-3">
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
                      className="h-10 w-10 rounded-full bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105"
                      aria-label="Search Depot"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </GlassSurface>
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
                  data-magnetic
                  className="rounded-md h-11 px-6 text-xs sm:text-sm font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs btn-shine transition-colors dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] dark:text-[#04110E] dark:font-bold"
                >
                  <Link to="/products" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Explore Dental Catalog</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>

                <Link to="/register" data-magnetic className="inline-block">
                  <InteractiveHoverButton
                    text="Register Vadodara Clinic"
                    className="h-11 px-6 text-xs sm:text-sm font-semibold border-slate-300/80 dark:border-white/10"
                  />
                </Link>
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
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      100%
                    </span>
                    <span className="text-slate-500 text-[11px]">Genuine Products</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      Same-Day
                    </span>
                    <span className="text-slate-500 text-[11px]">Clinic Delivery</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      Best Wholesale
                    </span>
                    <span className="text-slate-500 text-[11px]">Prices for Doctors</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] grid place-items-center shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div className="text-xs leading-tight">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      Dedicated
                    </span>
                    <span className="text-slate-500 text-[11px]">Doctor Support</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Open Transparent Stage for Background Animated Tooth + Proof Rail */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex flex-col justify-end min-h-[300px] sm:min-h-[360px] lg:min-h-[440px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-lg mx-auto"
              >
                {/* Restrained Static Proof Rail */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Proof item 1: Physical Depot & Timing */}
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/95 dark:bg-[#0A100F] border border-slate-200/90 dark:border-white/10 rounded-xl p-3 shadow-xs hover:border-[#0284c7]/50 dark:hover:border-[#3FD1B3]/50 transition-colors group text-left block"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-[#0284c7] dark:text-[#3FD1B3] shrink-0" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-[#3FD1B3] transition-colors truncate">
                        Shiyabaug Depot
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Mon–Sat: 10AM–8:30PM
                    </p>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                        depotStatus.isOpen
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50"
                          : "bg-slate-100 dark:bg-[#12A488]/10 text-slate-600 dark:text-[#3FD1B3] border-slate-200/70 dark:border-[#12A488]/30"
                      }`}
                    >
                      {depotStatus.label}
                    </span>
                  </a>

                  {/* Proof item 2: 2-Hour Clinic Delivery */}
                  <div className="bg-white/95 dark:bg-[#0A100F] border border-slate-200/90 dark:border-white/10 rounded-xl p-3 shadow-xs text-left">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className="h-3.5 w-3.5 text-[#0284c7] dark:text-[#3FD1B3] shrink-0" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        2-Hour Delivery
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      To Vadodara clinics
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50">
                      Local Dispatch
                    </span>
                  </div>

                  {/* Proof item 3: WhatsApp & Phone Orders */}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/95 dark:bg-[#0A100F] border border-slate-200/90 dark:border-white/10 rounded-xl p-3 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-400/50 transition-colors group text-left block"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-[#3FD1B3] shrink-0" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#3FD1B3] transition-colors truncate">
                        +91 97270 76119
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                      Call / WhatsApp Order
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                      Emergency On-Call
                    </span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Brand Logos Ribbon (Refraction GlassSurface) ────────────────── */}
      <div className="container mx-auto px-4 -mt-3 mb-10 relative z-20">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={20}
          distortionScale={-110}
          displace={0.25}
          blur={8}
          backgroundOpacity={0.15}
          className="shadow-sm"
        >
          <div className="w-full px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <div className="h-7 w-7 rounded-lg bg-sky-50 dark:bg-slate-800 text-[#0284c7] grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="whitespace-nowrap">Authorized Distributor For Leading Global Brands</span>
            </div>

            <div className="flex-1 w-full min-w-0 overflow-hidden mx-0 md:mx-4 py-1">
              <LogoLoop
                logos={dentalBrandLogos}
                speed={75}
                direction="left"
                logoHeight={24}
                gap={44}
                pauseOnHover={true}
                scaleOnHover={true}
                draggable={true}
                fadeOut={true}
                fadeOutWidth={0.08}
                ariaLabel="Authorized dental material manufacturer brands"
              />
            </div>

            <Link
              to="/products"
              className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
            >
              <span>And Many More...</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </GlassSurface>
      </div>

      {/* ─── Explore by Clinical Speciality (3D DepthCarousel + Grid Toggle) ─ */}
      <section className="container mx-auto px-4 py-8 mb-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
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

            <div className="flex items-center gap-3 flex-wrap">
              {/* View Switcher Toggle */}
              <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSpecialtyViewMode("carousel")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    specialtyViewMode === "carousel"
                      ? "bg-white dark:bg-[#12A488] text-slate-900 dark:text-[#04110E] shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                  aria-label="3D Depth Stack View"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">3D Depth Stack</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpecialtyViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    specialtyViewMode === "grid"
                      ? "bg-white dark:bg-[#12A488] text-slate-900 dark:text-[#04110E] shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid View</span>
                </button>
              </div>

              <Button
                variant="outline"
                asChild
                className="rounded-full border-sky-200 dark:border-sky-800 text-[#0284c7] hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold px-4 h-9"
              >
                <Link to="/products">
                  View Catalog <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {specialtyViewMode === "carousel" ? (
          <div className="relative w-full h-[470px] sm:h-[500px] my-3 rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50/40 via-white to-sky-50/30 dark:from-[#070B0A] dark:via-[#0B1210] dark:to-[#070B0A] border border-slate-200/70 dark:border-white/10 shadow-sm flex items-center justify-center">
            <DepthCarousel
              items={clinicalSpecialties.map((item) => ({
                image: item.image,
                alt: item.title,
                title: item.title,
                desc: item.desc,
                category: item.category,
              }))}
              cardWidth={290}
              cardHeight={380}
              radius={20}
              depth={220}
              spread={90}
              tilt={22}
              tiltDirection="right"
              perspective={1400}
              visibleCards={4}
              falloff={0.2}
              blur={6}
              autoplay
              autoplayDelay={3200}
              loop
              showControls
              showIndicators
              onItemClick={(_index, item) => {
                if (item.category) {
                  navigate({
                    to: "/products",
                    search: { category: item.category } as Record<string, unknown>,
                  });
                }
              }}
              renderCard={(item) => (
                <div className="relative w-full h-full bg-[#0b0d12] flex flex-col justify-between overflow-hidden group select-none">
                  <div className="w-full h-3/5 bg-white p-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title || item.alt || ""}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                      draggable={false}
                    />
                  </div>
                  <div className="p-4.5 bg-gradient-to-t from-[#070B0A] via-[#0A100F]/95 to-transparent flex flex-col justify-end flex-1 z-10 text-left">
                    <span className="text-[10px] font-bold text-[#0284c7] dark:text-[#3FD1B3] uppercase tracking-wider mb-1">
                      Clinical Specialty
                    </span>
                    <h4 className="text-white font-extrabold text-lg tracking-tight font-heading leading-tight group-hover:text-[#3FD1B3] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-slate-300 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 border-t border-white/10 pt-2.5">
                      <span className="text-[#0284c7] dark:text-[#3FD1B3] flex items-center gap-1 group-hover:underline">
                        Explore Category <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        ) : (
          <StaggerContainer
            staggerDelay={0.06}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
          >
            {clinicalSpecialties.map((item) => (
              <StaggerItem key={item.title} scale>
                <Link
                  to="/products"
                  search={{ category: item.category } as Record<string, unknown>}
                  className="group block h-full"
                >
                  <div className="h-full bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs hover:shadow-md hover:border-[#0284c7]/50 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="h-20 w-full rounded-xl overflow-hidden bg-white p-1.5 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2.5 group-hover:text-[#0284c7] dark:group-hover:text-[#3FD1B3] transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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
        )}
      </section>

      {/* ─── Featured Products Section ───────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <Badge
                variant="outline"
                className="mb-2 text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10"
              >
                Verified Depot
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-foreground">
                Featured Dental Materials
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Factory-certified composites, files, and adhesives ready for immediate Vadodara
                dispatch.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Restorative", "Endodontics", "Impression"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === tab
                      ? "bg-primary text-primary-foreground dark:bg-[#12A488] dark:text-[#04110E] shadow-xs font-bold"
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
        {filteredProducts.length > 0 ? (
          <div className="space-y-8">
            <StaggerContainer
              staggerDelay={0.1}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              {filteredProducts
                .slice(0, 8)
                .map((product: NonNullable<ProductCardProps["product"]>) => (
                  <StaggerItem key={product._id || product.id} scale>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
            </StaggerContainer>

            {/* If not logged in, subtle doctor callout beneath products */}
            {!isAuthenticated && (
              <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 dark:border-white/10 bg-primary/5 dark:bg-[#10201C] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <ShieldCheck className="h-5 w-5 text-primary dark:text-[#3FD1B3] shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Practicing Dentist in Vadodara?</span> Sign in with your clinic credentials to place wholesale orders with 2-hour local dispatch.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Button size="sm" variant="outline" asChild className="rounded-full text-xs font-semibold dark:border-white/15 dark:bg-[#0B1210]">
                    <Link to="/register">Register Clinic</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-full text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] dark:text-[#04110E]">
                    <Link to="/login" search={{ redirect: "/products" } as any}>Doctor Sign In</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center border border-border/60 dark:border-white/10 glass-card rounded-xl">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-lg text-foreground">
              No Materials in This Category
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              No items are currently categorized under "{selectedCategory}". Explore our full
              catalog for all available supplies.
            </p>
            <Button asChild className="rounded-md mt-6" variant="outline">
              <Link to="/products">Browse All Supplies</Link>
            </Button>
          </Card>
        )}

        <ScrollReveal delay={0.2} className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="rounded-md px-8 h-11 bg-secondary hover:bg-secondary/80 dark:bg-[#0B1210] dark:text-[#F2F6F4] dark:border-white/10 hover:dark:bg-[#10201C] text-foreground border border-border/80 font-bold text-sm"
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
                <h3 className="font-heading font-bold text-lg text-foreground">
                  100% Genuine Batches
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Direct manufacturer authorization from 3M, Ivoclar, GC, Mani, Dentsply Sirona, and
                  Septodont.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 dark:bg-[#12A488]/15 text-sky-500 dark:text-[#3FD1B3] grid place-items-center mb-5">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Same-Day Local Transit
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Immediate delivery directly to your dental clinic across Alkapuri, Akota, Gotri,
                  Karelibaug and all Vadodara areas.
                </p>
              </Card>
            </StaggerItem>

            <StaggerItem scale>
              <Card className="p-6 glass-card glass-card-hover rounded-2xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] h-full">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 dark:bg-[#12A488]/15 text-indigo-500 dark:text-[#3FD1B3] grid place-items-center mb-5">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Depot Timings (Mon–Sat)
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Open Monday to Saturday, 10:00 AM to 8:30 PM. Available on call for emergency
                  Sunday clinical procedures.
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
                  Instant digital and printed tax invoices with GST input credit for clinic
                  accounts.
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
                    <div className="text-xs text-primary dark:text-[#3FD1B3] font-medium">
                      {t.clinic} (Vadodara)
                    </div>
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
              Call or WhatsApp Darsh Dental Depot directly at <strong>{PHONE_NUMBER}</strong> for
              instant clinic dispatch across Vadodara.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="rounded-md h-11 px-7 bg-white dark:bg-[#12A488] text-primary dark:text-[#04110E] hover:bg-sky-50 hover:dark:bg-[#3FD1B3] font-bold text-sm shadow-sm btn-shine"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> Order on WhatsApp
                </a>
              </Button>

              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="inline-block">
                <InteractiveHoverButton
                  text="View Store on Google Maps"
                  className="h-11 px-6 text-sm font-semibold border-white/40 dark:border-white/20 bg-white/10 text-white hover:border-white backdrop-blur-sm"
                />
              </a>
            </div>
          </div>
        </div>
      </ScaleReveal>
    </PublicLayout>
  );
}
