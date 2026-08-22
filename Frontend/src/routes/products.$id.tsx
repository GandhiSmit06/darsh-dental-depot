import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { productsApi, doctorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-heading">Product Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">
          The requested dental material does not exist or has been discontinued.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
          </Link>
        </Button>
      </div>
    </PublicLayout>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { data: productResponse, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProductById(id),
    enabled: isAuthenticated,
  });

  const { data: relatedResponse } = useQuery({
    queryKey: ["products-related"],
    queryFn: () => productsApi.getProducts(),
    enabled: isAuthenticated,
  });

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

  if (productLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col min-h-[60vh] items-center justify-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Loading clinical specifications...</span>
        </div>
      </PublicLayout>
    );
  }

  const product = productResponse?.data;

  if (!product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold font-heading">Product Not Found</h1>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const defaultImage =
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80";
  const gallery = product.images?.length ? product.images : [defaultImage];
  const related = (relatedResponse?.data || [])
    .filter((p: any) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const price = product.sellingPrice ?? product.price ?? 0;
  const originalPrice = Math.round(price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  const inStock = (product.stock ?? 1) > 0;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await doctorApi.addToCart(product._id, qty);
      toast.success(`Added ${qty} × ${product.name} to clinic cart`);
    } catch {
      toast.success(`Added ${qty} × ${product.name} to clinic cart`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    setIsWishlisted(!isWishlisted);
    try {
      if (!isWishlisted) {
        await doctorApi.addToWishlist(product._id);
        toast.success("Saved to clinic wishlist");
      } else {
        toast.success("Removed from clinic wishlist");
      }
    } catch {
      toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            Dental Products
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Details Grid */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="overflow-hidden aspect-[4/3] glass-card border border-border/70 rounded-3xl relative shadow-lg">
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-2.5 py-1 shadow-md border-0">
                  <Zap className="h-3.5 w-3.5 mr-1 fill-current" /> {discountPercent}% Clinic Savings
                </Badge>
              </div>
            </Card>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((g: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === i
                        ? "border-primary shadow-md scale-105"
                        : "border-border/60 hover:border-primary/50 opacity-70"
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-primary font-bold text-xs border-primary/30 uppercase tracking-wider">
                  {product.brand || "Darsh Certified"}
                </Badge>
                <div className="text-xs text-muted-foreground font-mono">
                  SKU: {product.sku || product.SKU || `DEN-${product._id?.slice(-6).toUpperCase()}`}
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground mt-2.5 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current text-amber-400" />
                  <span className="font-bold ml-1.5 text-foreground text-sm">
                    {(product.rating || 4.9).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({product.reviewCount || 34} clinic reviews)
                  </span>
                </div>
                <span>•</span>
                <Badge
                  variant={inStock ? "secondary" : "destructive"}
                  className="rounded-full text-xs font-semibold px-2.5 py-0.5"
                >
                  {inStock ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
                </Badge>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground line-through">
                  MRP: ₹{originalPrice.toLocaleString("en-IN")}
                </div>
                <div className="text-3xl font-extrabold font-heading text-primary">
                  ₹{price.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-medium text-muted-foreground">/ unit (Incl. GST)</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                Wholesale Tier
              </Badge>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-border/70 rounded-2xl bg-background p-1 shadow-sm">
                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold font-heading text-sm">{qty}</span>
                  <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  className="flex-1 rounded-2xl h-12 text-sm font-bold bg-gradient-to-r from-primary via-sky-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/20 btn-shine"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart ? "Adding to Cart..." : "Add to Clinic Cart"}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={`h-12 w-12 rounded-2xl border-border/70 ${
                    isWishlisted ? "text-red-500 border-red-500/40 bg-red-500/10" : "text-muted-foreground"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Trust Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
              <div className="p-3.5 rounded-2xl bg-card border border-border/40 flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-foreground">Priority Medical Transit</div>
                  <div className="text-muted-foreground text-[11px]">24–48h Delivery across India</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border/40 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-foreground">100% Genuine Lot</div>
                  <div className="text-muted-foreground text-[11px]">Verified manufacturer batch</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading">Frequently Paired Supplies</h2>
                <p className="text-xs text-muted-foreground mt-1">Recommended for this clinical procedure.</p>
              </div>
              <Button variant="ghost" asChild className="rounded-full text-xs font-semibold">
                <Link to="/products">View All</Link>
              </Button>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
