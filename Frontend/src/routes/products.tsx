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
  Loader2,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Package,
  ShieldCheck,
  LogIn,
  UserPlus,
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
      { title: "All Dental Products & Materials — Darsh Dental Depot" },
      {
        name: "description",
        content: "Browse premium dental composites, instruments, impression materials, and consumables.",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/50 dark:border-white/10">
        <h3 className="font-heading font-bold text-base text-foreground">Filter Catalog</h3>
        <button
          onClick={onReset}
          className="text-xs text-primary dark:text-[#3FD1B3] font-semibold hover:underline flex items-center gap-1"
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
            <SelectItem value="all">All Categories</SelectItem>
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
            Leading Brands
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border/50 dark:border-white/10 gap-4"
        >
          <div>
            <Badge variant="outline" className="text-primary dark:text-[#3FD1B3] border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10 mb-2">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500" /> Authorized Dental Material Depot
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-foreground">
              Dental Materials & Equipment Catalog
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Showing {filtered.length} verified products from global dental manufacturers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs dark:bg-[#12A488]/15 dark:text-[#3FD1B3] dark:border-[#12A488]/30">
              <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500 dark:text-[#3FD1B3]" /> Genuine Stock Verified
            </Badge>
          </div>
        </motion.div>

        {/* Guest Doctor Notice Banner: Browse freely, log in before purchasing */}
        {!isAuthenticated && !authLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 p-4 sm:p-5 rounded-2xl border border-primary/25 dark:border-[#12A488]/30 bg-primary/5 dark:bg-gradient-to-r dark:from-[#12A488]/15 dark:to-[#0A1B17] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="h-11 w-11 rounded-xl bg-primary/10 dark:bg-[#12A488]/20 text-primary dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-foreground flex items-center gap-2 justify-center sm:justify-start">
                  <span>Browsing Darsh Dental Depot Catalog</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold uppercase tracking-wider text-primary dark:text-[#3FD1B3] border-primary/30">
                    Open Access
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse all dental materials and clinical specifications. Practicing doctors and clinic owners sign in to add items to cart and place wholesale orders.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-semibold dark:border-white/20 dark:bg-[#0B1210]">
                <Link to="/register">
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Register Clinic
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-full text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] dark:text-[#04110E] shadow-sm">
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
            {/* Top Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search materials, instruments, SKU..."
                  className="pl-10 rounded-2xl bg-background/80 dark:bg-[#0B1210] border-border/60 dark:border-white/10 text-sm h-11 focus:border-primary dark:focus:border-[#12A488]"
                />
              </div>

              {/* Mobile Filter Sheet */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-2xl gap-2 h-11 dark:border-white/10 dark:bg-[#0B1210]">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Filters</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[360px] dark:bg-[#0B1210] dark:border-white/10 overflow-y-auto">
                    <div className="pt-6">
                      <Filters {...filterProps} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort By */}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] rounded-2xl bg-background/80 dark:bg-[#0B1210] border-border/60 dark:border-white/10 text-sm h-11">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass-card dark:bg-[#0B1210] dark:border-white/10">
                  <SelectItem value="featured">Sort: Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
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
                <div className="text-lg font-bold font-heading text-foreground">No matching dental products</div>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try resetting the search or category filters.
                </p>
                <Button onClick={handleReset} variant="outline" className="mt-5 rounded-full text-xs font-semibold dark:border-white/15 dark:text-[#3FD1B3] hover:dark:bg-[#12A488]/15">
                  Reset All Filters
                </Button>
              </Card>
            ) : (
              <StaggerContainer staggerDelay={0.07} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl px-4 h-9 font-semibold text-xs dark:border-white/10 dark:bg-[#0B1210] dark:text-[#F2F6F4] hover:dark:bg-[#10201C]"
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
