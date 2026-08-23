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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";

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
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <h3 className="font-heading font-bold text-base text-foreground">Filter Catalog</h3>
        <button
          onClick={onReset}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2.5 block">
          Specialty Category
        </Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full rounded-xl bg-background/80 border-border/60 text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="glass-card">
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
        <div className="flex items-center justify-between mb-2">
          <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Price Range
          </Label>
          <span className="text-xs font-bold text-primary font-heading">
            ₹{price[0].toLocaleString("en-IN")} – ₹{price[1].toLocaleString("en-IN")}
          </span>
        </div>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={15000}
          step={200}
          className="py-2"
        />
      </div>

      {/* In Stock Toggle */}
      <div className="pt-2 border-t border-border/40">
        <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(!!v)} />
          <span>In-Stock Items Only</span>
        </label>
      </div>

      {/* Brand Checkboxes */}
      <div className="pt-2 border-t border-border/40">
        <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
          Dental Manufacturer / Brand
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
              <span>{b}</span>
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
  const products = apiProducts.length > 0 ? apiProducts : mockProducts;

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
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border/50 gap-4">
          <div>
            <Badge variant="outline" className="text-primary border-primary/30 mb-2">
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
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs">
              <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Genuine Stock Verified
            </Badge>
          </div>
        </div>

        {/* Main Grid: Filters + Catalog */}
        <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block">
            <Card className="p-6 glass-card rounded-3xl border border-border/60 sticky top-24 shadow-sm">
              <Filters {...filterProps} />
            </Card>
          </aside>

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
                  className="pl-10 rounded-2xl bg-background/80 border-border/60 text-sm h-11 focus:border-primary"
                />
              </div>

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden rounded-2xl h-11 px-4 border-border/60">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-card w-[320px] overflow-y-auto">
                  <div className="mt-6">
                    <Filters {...filterProps} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[190px] rounded-2xl bg-background/80 border-border/60 text-sm h-11 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
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
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">
                  Loading verified dental products...
                </span>
              </div>
            ) : paged.length === 0 ? (
              <Card className="p-16 text-center glass-card border border-dashed rounded-3xl">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <div className="text-lg font-bold font-heading text-foreground">No matching dental products</div>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  We couldn't find any products matching your active filters. Try resetting the search or category filters.
                </p>
                <Button onClick={handleReset} variant="outline" className="mt-5 rounded-full text-xs font-semibold">
                  Reset All Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {paged.map((p: any) => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!productsLoading && paged.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 pt-6 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl px-4 h-9 font-semibold text-xs"
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
                  className="rounded-xl px-4 h-9 font-semibold text-xs"
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
