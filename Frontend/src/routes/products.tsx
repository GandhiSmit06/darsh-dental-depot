import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [
    { title: "Products — Darsh Dental Depot" },
    { name: "description", content: "Browse premium dental materials, instruments and consumables." },
  ]}),
  component: ProductsPage,
});

const PAGE_SIZE = 8;

function Filters({
  cat, setCat, brand, setBrand, price, setPrice, inStock, setInStock, categories, brands
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3 text-sm">Category</h4>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Brand</h4>
        <div className="space-y-2">
          {brands.map((b: string) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={brand.includes(b)}
                onCheckedChange={(v) => setBrand(v ? [...brand, b] : brand.filter((x: string) => x !== b))}
              />
              {b}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Price: ${price[0]} – ${price[1]}</h4>
        <Slider value={price} onValueChange={setPrice} min={0} max={300} step={10} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(!!v)} />
        In stock only
      </label>
    </div>
  );
}

function ProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [brand, setBrand] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([0, 300]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const { data: response, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
    enabled: isAuthenticated,
  });

  const products = response?.data || [];

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))).filter(Boolean), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))).filter(Boolean), [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.category !== cat) return false;
      if (brand.length && !brand.includes(p.brand)) return false;
      if (p.sellingPrice < price[0] || p.sellingPrice > price[1]) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.sellingPrice - b.sellingPrice);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.sellingPrice - a.sellingPrice);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
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
  const filterProps = { cat, setCat, brand, setBrand, price, setPrice, inStock, setInStock, categories, brands };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground mt-1">Premium dental materials and supplies.</p>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden md:block">
            <Card className="p-5 sticky top-20">
              <Filters {...filterProps} />
            </Card>
          </aside>

          <div>
            <div className="flex flex-wrap gap-3 items-center mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search products..." className="pl-9" />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent><div className="mt-6"><Filters {...filterProps} /></div></SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {productsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : paged.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-lg font-semibold">No products found</div>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
              </Card>
            ) : (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((p) => <ProductCard key={p._id} product={p as any} />)}
              </div>
            )}

            {!productsLoading && paged.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <div className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</div>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
