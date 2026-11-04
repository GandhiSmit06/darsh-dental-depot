import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  Package,
  ShieldCheck,
  LogIn,
  UserPlus,
  Truck,
  Layers,
  Activity,
  Crown,
  Scissors,
  Stethoscope,
  Shield,
  ArrowRight,
  Phone,
  MessageSquare,
  Clock,
  Award,
  ThermometerSnowflake,
  FileCheck2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { ClinicalLoader } from "@/components/ui/ClinicalLoader";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Clinical Dental Materials & Equipment Catalog — Darsh Dental Depot" },
      {
        name: "description",
        content:
          "Browse precision dental composites, endodontic rotary files, impression silicones, and surgical consumables for dental clinics in Vadodara.",
      },
    ],
  }),
  component: ProductsPage,
});

const PAGE_SIZE = 12;

// Specialty departments mapping to categories for visual grid
const SPECIALTY_DEPARTMENTS = [
  {
    id: "all",
    name: "All Materials",
    tagline: "Complete clinical catalog",
    categoryMatch: "all",
    icon: Layers,
  },
  {
    id: "composites",
    name: "Restorative & Composites",
    tagline: "Universal, nanohybrids & adhesives",
    categoryMatch: "Composites",
    icon: Sparkles,
  },
  {
    id: "endodontics",
    name: "Endodontics",
    tagline: "NiTi rotary files, sealers & points",
    categoryMatch: "Endodontics",
    icon: Activity,
  },
  {
    id: "prosthodontics",
    name: "Prosthodontics & Impression",
    tagline: "A-Silicones, alginates & cements",
    categoryMatch: "Impression Materials",
    icon: Crown,
  },
  {
    id: "orthodontics",
    name: "Orthodontics",
    tagline: "Brackets, archwires & buccal tubes",
    categoryMatch: "Orthodontics",
    icon: Scissors,
  },
  {
    id: "instruments",
    name: "Surgical & Instruments",
    tagline: "Scalers, diamond burs & sutures",
    categoryMatch: "Instruments",
    icon: Stethoscope,
  },
  {
    id: "disposables",
    name: "Hygiene & Disposables",
    tagline: "Autoclave rolls, bibs & barriers",
    categoryMatch: "Disposables",
    icon: Shield,
  },
];

interface FilterProps {
  cat: string;
  setCat: (val: string) => void;
  brand: string[];
  setBrand: (val: string[]) => void;
  price: number[];
  setPrice: (val: number[]) => void;
  inStock: boolean;
  setInStock: (val: boolean) => void;
  categories: string[];
  brands: string[];
  onReset: () => void;
}

function Filters({
  cat,
  setCat,
  brand,
  setBrand,
  price,
  setPrice,
  inStock,
  setInStock,
  categories,
  brands,
  onReset,
}: FilterProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/50 dark:border-white/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary dark:text-[#3FD1B3]">
            02 / SPECIFICATION FILTER
          </span>
          <h3 className="font-heading font-bold text-base text-foreground mt-0.5">Filter Catalog</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-primary dark:text-[#3FD1B3] font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground dark:text-[#9DB0A9] mb-2.5 block">
          Specialty Category
        </Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full rounded-xl bg-background/80 dark:bg-[#0B1210] border-border/60 dark:border-white/10 text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="glass-card dark:bg-[#0B1210] dark:border-white/10">
            <SelectItem value="all">All Specialties</SelectItem>
            {categories.map((c: string) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Slider in INR */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground dark:text-[#9DB0A9]">
            Max Price (INR)
          </Label>
          <span className="text-xs font-mono font-bold text-primary dark:text-[#3FD1B3]">
            ₹{price[1].toLocaleString("en-IN")}
          </span>
        </div>
        <Slider
          value={[price[1]]}
          min={0}
          max={15000}
          step={100}
          onValueChange={([val]) => setPrice([price[0], val])}
          className="my-3"
        />
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
          <span>₹0</span>
          <span>₹15,000</span>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="flex items-center space-x-2.5 pt-2">
        <Checkbox
          id="instock"
          checked={inStock}
          onCheckedChange={(checked) => setInStock(checked === true)}
          className="rounded-md border-border/80 dark:border-white/20 data-[state=checked]:bg-primary data-[state=checked]:dark:bg-[#12A488]"
        />
        <label
          htmlFor="instock"
          className="text-xs font-semibold cursor-pointer text-foreground/90 select-none"
        >
          In Stock Only (Ready for Vadodara dispatch)
        </label>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div className="pt-2">
          <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground dark:text-[#9DB0A9] mb-3 block">
            Leading Global Brands
          </Label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {brands.map((b: string) => {
              const checked = brand.includes(b);
              return (
                <div key={b} className="flex items-center space-x-2.5">
                  <Checkbox
                    id={`brand-${b}`}
                    checked={checked}
                    onCheckedChange={(c) => {
                      if (c) setBrand([...brand, b]);
                      else setBrand(brand.filter((x: string) => x !== b));
                    }}
                    className="rounded-md border-border/80 dark:border-white/20 data-[state=checked]:bg-primary data-[state=checked]:dark:bg-[#12A488]"
                  />
                  <label
                    htmlFor={`brand-${b}`}
                    className="text-xs font-medium cursor-pointer text-foreground/80 hover:text-foreground transition-colors select-none"
                  >
                    {b}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [q, setQ] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("search") || "";
    }
    return "";
  });
  const [cat, setCat] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("category") || "all";
    }
    return "all";
  });
  const [brand, setBrand] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([0, 15000]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  // Open product catalog: anyone can browse
  const { data: response, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
  });

  const apiProducts = response?.data || [];
  const products = apiProducts;

  const categories = useMemo(
    () => Array.from(new Set(products.map((p: any) => p.category))).filter(Boolean),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((p: any) => p.brand))).filter(Boolean),
    [products]
  );

  const handleReset = () => {
    setQ("");
    setCat("all");
    setBrand([]);
    setPrice([0, 15000]);
    setInStock(false);
    setSort("featured");
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = products.filter((p: any) => {
      const pPrice = p.sellingPrice ?? p.price ?? 0;
      if (
        q &&
        !p.name?.toLowerCase().includes(q.toLowerCase()) &&
        !p.brand?.toLowerCase().includes(q.toLowerCase()) &&
        !p.category?.toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }
      if (cat !== "all") {
        const matchesCategory =
          p.category?.toLowerCase() === cat.toLowerCase() ||
          (cat === "Composites" && p.category?.toLowerCase().includes("composite")) ||
          (cat === "Impression Materials" &&
            (p.category?.toLowerCase().includes("impression") ||
              p.category?.toLowerCase().includes("cement") ||
              p.category?.toLowerCase().includes("prostho")));
        if (!matchesCategory) return false;
      }
      if (brand.length && !brand.includes(p.brand)) return false;
      if (pPrice < price[0] || pPrice > price[1]) return false;
      if (inStock && (p.stock ?? 0) <= 0) return false;
      return true;
    });

    if (sort === "price-asc") {
      list = [...list].sort(
        (a: any, b: any) =>
          (a.sellingPrice ?? a.price ?? 0) - (b.sellingPrice ?? b.price ?? 0)
      );
    }
    if (sort === "price-desc") {
      list = [...list].sort(
        (a: any, b: any) =>
          (b.sellingPrice ?? b.price ?? 0) - (a.sellingPrice ?? a.price ?? 0)
      );
    }
    if (sort === "rating") {
      list = [...list].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  }, [products, q, cat, brand, price, inStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterProps = {
    cat,
    setCat,
    brand,
    setBrand,
    price,
    setPrice,
    inStock,
    setInStock,
    categories,
    brands,
    onReset: handleReset,
  };

  // Scroll to catalog grid when department is clicked
  const handleDepartmentSelect = (categoryMatch: string) => {
    setCat(categoryMatch);
    setPage(1);
    const catalogElement = document.getElementById("catalog-grid-section");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* ========================================================================= */}
        {/* SECTION 1: CLINICAL HERO ATELIER & AUTHORITY STAGE (Plate 1 & 4 Reference) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-16 border-b border-border/40 dark:border-white/10 bg-gradient-to-b from-[#F2F7F6]/60 via-background to-background dark:from-[#0B1513]/70 dark:via-[#070B0A] dark:to-[#070B0A]">
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-200/40 via-transparent to-transparent dark:from-[#12A488]/30" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-[#12A488]/15 border border-primary/20 dark:border-[#12A488]/30 text-primary dark:text-[#3FD1B3] text-xs font-semibold mb-4 tracking-wide">
                <span className="font-mono uppercase text-[10px] tracking-widest">
                  01 / CLINICAL SPECIMEN CATALOG
                </span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span>Vadodara Dental Depot</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-foreground leading-[1.08]">
                Engineered Precision for Dental Operatories.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-muted-foreground dark:text-[#9DB0A9] max-w-2xl font-normal leading-relaxed">
                Direct procurement of authentic restorative composites, endodontic NiTi files,
                impression materials, and surgical consumables with verified manufacturer lot tracking.
              </p>
            </motion.div>

            {/* Quick Authority & Credibility Metric Ribbon (Inspired by Nova Medical & Aesthetics Studio) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-border/40 dark:border-white/10"
            >
              <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-[#0B1513]/80 border border-border/60 dark:border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xs">
                <div className="h-9 w-9 rounded-xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">2-Hour Dispatch</div>
                  <div className="text-[11px] text-muted-foreground">Local Vadodara Delivery</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-[#0B1513]/80 border border-border/60 dark:border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xs">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">100% Genuine Lot</div>
                  <div className="text-[11px] text-muted-foreground">Direct Manufacturer Seal</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-[#0B1513]/80 border border-border/60 dark:border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xs">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Doctor Wholesale</div>
                  <div className="text-[11px] text-muted-foreground">Tiered Clinic Pricing</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-[#0B1513]/80 border border-border/60 dark:border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xs">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                  <ThermometerSnowflake className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Cold-Chain Secure</div>
                  <div className="text-[11px] text-muted-foreground">Temperature Monitored</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SPECIALTY DEPARTMENT GLYPH GRID (Nova Healthcare Reference)    */}
        {/* ========================================================================= */}
        <section className="py-10 border-b border-border/40 dark:border-white/10 bg-secondary/30 dark:bg-[#070B0A]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary dark:text-[#3FD1B3]">
                  SPECIALTY SECTORS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground mt-0.5">
                  Browse by Dental Discipline
                </h2>
              </div>
              <div className="text-xs text-muted-foreground">
                Click any specialty to instantly filter matching clinic supplies
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {SPECIALTY_DEPARTMENTS.map((dept) => {
                const IconComponent = dept.icon;
                const isActive =
                  cat === dept.categoryMatch ||
                  (dept.categoryMatch === "all" && (cat === "all" || !cat));

                return (
                  <button
                    key={dept.id}
                    onClick={() => handleDepartmentSelect(dept.categoryMatch)}
                    className={`group text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden ${
                      isActive
                        ? "bg-primary/10 dark:bg-[#12A488]/20 border-primary dark:border-[#3FD1B3] shadow-sm"
                        : "bg-card/70 dark:bg-[#0B1513]/70 hover:bg-card border-border/60 dark:border-white/10 hover:border-primary/40 dark:hover:border-[#3FD1B3]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-primary text-white dark:bg-[#3FD1B3] dark:text-[#04110E]"
                            : "bg-secondary dark:bg-[#10201C] text-foreground/80 group-hover:text-primary dark:group-hover:text-[#3FD1B3]"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#3FD1B3] animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold font-heading text-foreground line-clamp-1 group-hover:text-primary dark:group-hover:text-[#3FD1B3] transition-colors">
                        {dept.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {dept.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: MAIN CATALOG GRID & FROSTED CONTROLS (CarePlus & Nordic Plate)  */}
        {/* ========================================================================= */}
        <div id="catalog-grid-section" className="container mx-auto px-4 py-10">
          {/* Guest Doctor Notice Banner: Browse freely, log in before purchasing */}
          {!isAuthenticated && !authLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 p-4 sm:p-5 rounded-3xl border border-primary/25 dark:border-[#12A488]/30 bg-primary/5 dark:bg-gradient-to-r dark:from-[#12A488]/15 dark:to-[#0A1B17] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-heading font-bold text-sm text-foreground flex items-center gap-2 justify-center sm:justify-start">
                    <span>Practicing Doctor / Clinic Procurement Portal</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-2 font-bold uppercase tracking-wider text-primary dark:text-[#3FD1B3] border-primary/30"
                    >
                      Open Inspection
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Browse all materials with open technical specifications. Sign in with your registered doctor account to unlock wholesale tiers and chairside delivery.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs font-semibold dark:border-white/20 dark:bg-[#0B1210]"
                >
                  <Link to="/register">
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Register Clinic
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] dark:text-[#04110E] shadow-sm"
                >
                  <Link to="/login" search={{ redirect: "/products" } as any}>
                    <LogIn className="h-3.5 w-3.5 mr-1" /> Doctor Sign In
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Main Grid: Filters + Catalog */}
          <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <ScrollReveal direction="left" className="hidden md:block">
              <Card className="p-6 glass-card rounded-3xl border border-border/60 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] sticky top-24 shadow-sm">
                <Filters {...filterProps} />
              </Card>
            </ScrollReveal>

            {/* Product Listing Main Area */}
            <div>
              {/* CarePlus-inspired Frosted Search & Quick Filter Toolbar */}
              <div className="p-3 mb-6 rounded-2xl bg-card/70 dark:bg-[#0B1513]/80 backdrop-blur-xl border border-border/60 dark:border-white/10 flex flex-wrap gap-3 items-center justify-between shadow-xs">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search materials, instruments, brand or SKU..."
                    className="pl-10 rounded-xl bg-background/80 dark:bg-[#070B0A] border-border/60 dark:border-white/10 text-sm h-10 focus:border-primary dark:focus:border-[#12A488]"
                  />
                  {q && (
                    <button
                      onClick={() => setQ("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Mobile Filter Sheet */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-xl gap-2 h-10 dark:border-white/10 dark:bg-[#070B0A]"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[300px] sm:w-[360px] dark:bg-[#0B1210] dark:border-white/10 overflow-y-auto"
                    >
                      <div className="pt-6">
                        <Filters {...filterProps} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Active Category Chip */}
                {cat !== "all" && (
                  <Badge
                    variant="secondary"
                    className="h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-primary/10 dark:bg-[#12A488]/15 text-primary dark:text-[#3FD1B3]"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => setCat("all")}
                      className="ml-1 hover:opacity-75 font-bold"
                    >
                      ×
                    </button>
                  </Badge>
                )}

                {/* Sort By */}
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[170px] rounded-xl bg-background/80 dark:bg-[#070B0A] border-border/60 dark:border-white/10 text-sm h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass-card dark:bg-[#0B1210] dark:border-white/10">
                    <SelectItem value="featured">Sort: Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Clinic Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Counter status */}
              <div className="flex items-center justify-between mb-4 px-1 text-xs text-muted-foreground">
                <span>
                  Showing <strong className="text-foreground">{filtered.length}</strong> verified dental materials
                </span>
                {filtered.length > 0 && (
                  <span className="font-mono text-[11px]">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>

              {/* Products Grid (Nordic Minimalist Plinth Staging) */}
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center p-16">
                  <ClinicalLoader
                    size="lg"
                    text="Curating Verified Dental Supplies..."
                    subtext="Synchronizing pricing & stock availability"
                  />
                </div>
              ) : paged.length === 0 ? (
                <Card className="p-16 text-center glass-card border border-dashed dark:border-white/10 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] rounded-3xl">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <div className="text-lg font-bold font-heading text-foreground">
                    No matching dental products found
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    We couldn't find any products matching your active filters. Try clearing your search query or selecting "All Materials".
                  </p>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="mt-5 rounded-full text-xs font-semibold dark:border-white/15 dark:text-[#3FD1B3] hover:dark:bg-[#12A488]/15"
                  >
                    Reset All Filters
                  </Button>
                </Card>
              ) : (
                <StaggerContainer
                  staggerDelay={0.06}
                  className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {paged.map((p: any) => (
                    <StaggerItem key={p._id || p.id} scale>
                      <ProductCard product={p} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}

              {/* Pagination Controls */}
              {!productsLoading && paged.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12 pt-6 border-t border-border/40 dark:border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => p - 1);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="rounded-xl px-4 h-9 font-semibold text-xs dark:border-white/10 dark:bg-[#0B1210] dark:text-[#F2F6F4] hover:dark:bg-[#10201C]"
                  >
                    Previous
                  </Button>
                  <div className="text-xs font-semibold text-muted-foreground px-3">
                    Page <span className="text-foreground">{page}</span> of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage((p) => p + 1);
                      window.scrollTo({ top: 350, behavior: "smooth" });
                    }}
                    className="rounded-xl px-4 h-9 font-semibold text-xs dark:border-white/10 dark:bg-[#0B1210] dark:text-[#F2F6F4] hover:dark:bg-[#10201C]"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: DOCTOR VIP CLINIC PROCUREMENT BANNER (Aesthetics & Nova Plate)  */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-border/40 dark:border-white/10 bg-gradient-to-b from-secondary/20 to-background dark:from-[#0B1513]/40 dark:to-[#070B0A]">
          <div className="container mx-auto px-4">
            <Card className="p-8 sm:p-12 rounded-3xl border border-primary/20 dark:border-[#12A488]/30 glass-card bg-gradient-to-br from-card via-card/90 to-primary/5 dark:from-[#0B1513] dark:via-[#0E1E1A] dark:to-[#0A100F] relative overflow-hidden shadow-sm">
              <div className="max-w-3xl relative z-10">
                <Badge
                  variant="outline"
                  className="mb-4 text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 font-mono text-[10px] uppercase tracking-widest"
                >
                  03 / CLINICAL ACCOUNT PROGRAM
                </Badge>
                <h3 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
                  Are You Operating a Dental Clinic or Hospital in Vadodara?
                </h3>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground dark:text-[#9DB0A9] leading-relaxed">
                  Join 150+ verified dental practices across Vadodara benefiting from priority 2-hour operatory dispatch, wholesale carton pricing, consolidated monthly GST invoicing, and dedicated WhatsApp support.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/40 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-foreground">2-Hour Delivery</div>
                      <div className="text-muted-foreground text-[11px]">Chairside emergency dispatch</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-foreground">GST Compliance</div>
                      <div className="text-muted-foreground text-[11px]">Instant business invoicing</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-foreground">Dedicated Rep</div>
                      <div className="text-muted-foreground text-[11px]">+91 97270 76119 On-Call</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-8">
                  <Button
                    asChild
                    className="rounded-full font-bold px-6 h-11 bg-primary text-white dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] dark:text-[#04110E] shadow-sm"
                  >
                    <Link to="/register">
                      Register Your Clinic <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full font-semibold px-5 h-11 border-border/80 dark:border-white/20 dark:bg-[#070B0A]"
                  >
                    <a
                      href="https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20doctor%20inquiring%20about%20clinic%20supplies"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" /> WhatsApp Quick Procurement
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
