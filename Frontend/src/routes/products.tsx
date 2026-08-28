import { createFileRoute, Navigate } from "@tanstack/react-router";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Package,
  LayoutGrid,
  List,
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

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Dental Materials Catalog — Darsh Dental Depot Vadodara" },
      {
        name: "description",
        content: "Procure authorized dental composites, Japanese Mani diamond burs, GIC cements, and endodontic rotary files.",
      },
    ],
  }),
  component: ProductsPage,
});

const PAGE_SIZE = 12;

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
}: any) {
  return (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
          Filter Catalog
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Specialty Category */}
      <div>
        <Label className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground mb-2 block">
          Specialty Category
        </Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full rounded-xl bg-background text-xs h-9 border-border/80">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/80 text-xs">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c: string) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Slider in INR */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
            Price Range
          </Label>
          <span className="text-xs font-extrabold text-primary font-mono">
            ₹{price[0].toLocaleString("en-IN")} – ₹{price[1].toLocaleString("en-IN")}
          </span>
        </div>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={15000}
          step={200}
          className="py-1"
        />
      </div>

      {/* In Stock Toggle */}
      <div className="pt-2 border-t border-border/50">
        <label className="flex items-center gap-2.5 text-xs font-bold text-foreground cursor-pointer select-none">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(!!v)} />
          <span>In-Stock Depot Items Only</span>
        </label>
      </div>

      {/* Brand Checkboxes */}
      <div className="pt-2 border-t border-border/50">
        <Label className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5 block">
          Manufacturer / Brand
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {brands.map((b: string) => (
            <label
              key={b}
              className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-primary cursor-pointer select-none"
            >
              <Checkbox
                checked={brand.includes(b)}
                onCheckedChange={(v) =>
                  setBrand(v ? [...brand, b] : brand.filter((x: string) => x !== b))
                }
              />
              <span className="truncate">{b}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [brand, setBrand] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([0, 15000]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const { data: response, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
    enabled: isAuthenticated,
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
      if (q && !p.name?.toLowerCase().includes(q.toLowerCase()) && !p.brand?.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (brand.length && !brand.includes(p.brand)) return false;
      if (pPrice < price[0] || pPrice > price[1]) return false;
      if (inStock && (p.stock ?? 0) <= 0) return false;
      return true;
    });

    if (sort === "price-asc")
      list = [...list].sort((a: any, b: any) => (a.sellingPrice ?? a.price ?? 0) - (b.sellingPrice ?? b.price ?? 0));
    if (sort === "price-desc")
      list = [...list].sort((a: any, b: any) => (b.sellingPrice ?? b.price ?? 0) - (a.sellingPrice ?? a.price ?? 0));
    if (sort === "rating")
      list = [...list].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [products, q, cat, brand, price, inStock, sort]);

  if (authLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border/60 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-caption-eyebrow text-primary">Direct Depot Sourcing</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[11px] text-mono-data text-muted-foreground font-semibold">DL: GJ-VAD-215550</span>
            </div>
            <h1 className="text-heading-1 font-extrabold text-foreground tracking-tight">
              Dental Materials & Supplies Catalog
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Showing {filtered.length} authentic materials with live depot stock status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 font-bold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Same-Day Vadodara Delivery
            </Badge>
          </div>
        </motion.div>

        {/* ── Main Catalog Layout: Sidebar + Grid ── */}
        <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <ScrollReveal direction="left" className="hidden md:block">
            <div className="p-5 rounded-2xl bg-card border border-border/70 dark:border-white/10 sticky top-24 shadow-xs">
              <Filters {...filterProps} />
            </div>
          </ScrollReveal>

          {/* Product Listing Main Area */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search materials, burs, composites..."
                  className="pl-10 rounded-xl bg-card text-xs h-10 border-border/70 focus:border-primary"
                />
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden rounded-xl h-10 px-3.5 text-xs font-bold border-border/70">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-background/98 backdrop-blur-2xl w-[320px] overflow-y-auto">
                  <div className="mt-6">
                    <Filters {...filterProps} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sorting Select */}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] rounded-xl bg-card text-xs h-10 font-bold border-border/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/70 text-xs">
                  <SelectItem value="featured">Sort: Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-3">
                <Loader2 className="animate-spin h-9 w-9 text-primary" />
                <span className="text-xs text-muted-foreground font-semibold">
                  Loading verified dental products...
                </span>
              </div>
            ) : paged.length === 0 ? (
              <div className="p-14 text-center rounded-2xl bg-card border border-dashed border-border/80">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <div className="text-sm font-bold text-foreground">No matching dental materials found</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords or resetting your price and brand filters.
                </p>
                <Button onClick={handleReset} variant="outline" className="mt-4 rounded-full text-xs font-bold h-8">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <StaggerContainer staggerDelay={0.06} className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {paged.map((p: any) => (
                  <StaggerItem key={p._id || p.id} scale>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {/* Pagination Controls */}
            {!productsLoading && paged.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl px-4 h-8.5 font-bold text-xs"
                >
                  Previous
                </Button>
                <div className="text-xs font-bold text-muted-foreground px-2">
                  Page <span className="text-foreground">{page}</span> of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl px-4 h-8.5 font-bold text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
