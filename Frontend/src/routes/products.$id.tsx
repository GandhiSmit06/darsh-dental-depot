import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap,
  ArrowLeft,
  Package,
  Settings,
  FileText,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/ScrollReveal";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Clinical Material Specifications — Darsh Dental Depot" },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-heading">Product Not Found</h1>
        <p className="text-xs text-muted-foreground mt-2">
          The requested dental material does not exist or has been discontinued.
        </p>
        <Button asChild className="mt-6 rounded-full text-xs font-bold">
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

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
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
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
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold">
            Loading clinical specifications...
          </span>
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
          <Button asChild className="mt-4 rounded-full text-xs font-bold">
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
      setAddedSuccess(true);
      toast.success(`Added ${qty} × ${product.name} to clinic cart`);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    try {
      if (nextState) {
        await doctorApi.addToWishlist(product._id);
        toast.success("Saved to clinic wishlist");
      } else {
        await doctorApi.removeFromWishlist(product._id);
        toast.success("Removed from clinic wishlist");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update wishlist");
      setIsWishlisted(!nextState);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            Dental Catalog
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* ── Main Product Grid ── */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left: Studio Gallery */}
          <ScrollReveal direction="left" className="lg:col-span-6 space-y-3.5">
            <div className="overflow-hidden aspect-[4/3] rounded-3xl bg-secondary/30 dark:bg-white/[0.02] border border-border/70 dark:border-white/10 relative shadow-sm">
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {discountPercent > 0 && inStock && (
                  <Badge className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 shadow-xs border-0 rounded-md">
                    <Zap className="h-2.5 w-2.5 mr-0.5 inline fill-current" /> {discountPercent}% Clinic Savings
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.5 backdrop-blur-md rounded-md ${
                    inStock
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                  }`}
                >
                  {inStock ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
                </Badge>
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {gallery.map((g: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === i
                        ? "border-primary shadow-xs scale-105"
                        : "border-border/60 hover:border-primary/40 opacity-70"
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </ScrollReveal>

          {/* Right: Technical Information & Purchase Console */}
          <ScrollReveal direction="right" delay={0.1} className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-primary font-bold text-[11px] border-primary/30 uppercase tracking-wider">
                  {product.brand || "Darsh Certified"}
                </Badge>
                <div className="text-[11px] text-muted-foreground font-mono">
                  SKU: {product.sku || product.SKU || `DEN-${product._id?.slice(-6).toUpperCase()}`}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2.5 mt-2.5 text-xs text-muted-foreground">
                <div className="flex items-center text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                  <span className="font-bold ml-1 text-foreground text-xs">
                    {(product.rating || 4.9).toFixed(1)}
                  </span>
                </div>
                <span>•</span>
                <span>{product.reviewCount || 24} Verified Clinic Reviews</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  100% Genuine Lot
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-secondary/50 dark:bg-white/[0.03] border border-border/70 dark:border-white/8 flex items-center justify-between">
              <div>
                {discountPercent > 0 && (
                  <div className="text-[11px] text-muted-foreground line-through">
                    MRP: ₹{originalPrice.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-primary leading-tight">
                  ₹{price.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-semibold text-muted-foreground">/ unit (Incl. GST)</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-xs">
                Wholesale Depot Rate
              </Badge>
            </div>

            {/* Technical Specification Matrix */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 dark:border-white/10 space-y-2 text-xs">
              <div className="font-heading font-bold text-xs uppercase tracking-wider text-foreground mb-1">
                Technical & Regulatory Details
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">HSN Code:</span>
                  <span className="font-mono font-bold text-foreground">90184900</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">GST Rate:</span>
                  <span className="font-bold text-foreground">5% / 12% / 18%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-bold text-foreground">{product.category || "General Supplies"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Drug License:</span>
                  <span className="font-mono text-foreground">GJ-VAD-215550</span>
                </div>
              </div>
            </div>

            {/* Actions & Role Switches */}
            <div className="space-y-3 pt-1">
              {user?.role === "shop_owner" ? (
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1">
                      <Package className="h-4 w-4 text-primary" /> Shop Owner Inventory
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Current physical depot stock: <strong>{product.stock ?? 0} units</strong>
                    </div>
                  </div>
                  <Button asChild className="rounded-xl font-bold bg-primary text-white text-xs h-8">
                    <Link to="/shop">Manage Stock</Link>
                  </Button>
                </div>
              ) : user?.role === "admin" ? (
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1">
                      <Settings className="h-4 w-4 text-primary" /> Admin Control
                    </div>
                  </div>
                  <Button asChild className="rounded-xl font-bold bg-primary text-white text-xs h-8">
                    <Link to="/admin">Open Hub</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-border/70 rounded-xl bg-card p-0.5 shadow-2xs">
                    <button
                      type="button"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-40"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center font-bold font-mono text-xs">{qty}</span>
                    <button
                      type="button"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-40"
                      onClick={() => setQty((q) => Math.min(product.stock ?? 1, q + 1))}
                      disabled={qty >= (product.stock ?? 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                    className={`flex-1 rounded-xl h-11 text-xs font-bold transition-all shadow-xs ${
                      addedSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {addingToCart ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : addedSuccess ? (
                      <>
                        <Check className="h-4 w-4 mr-1.5" /> Added to Clinic Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Clinic Cart
                      </>
                    )}
                  </Button>

                  {/* Wishlist Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={`h-11 w-11 rounded-xl border-border/70 ${
                      isWishlisted ? "text-rose-500 border-rose-500/40 bg-rose-500/10" : "text-muted-foreground"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>
              )}
            </div>

            {/* Quality Guarantees */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/50 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground text-[11.5px]">2-Hour Clinic Transit</div>
                  <div className="text-[10px] text-muted-foreground">All Vadodara zones</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/60 flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-foreground text-[11.5px]">Tally GST Sales Bill</div>
                  <div className="text-[10px] text-muted-foreground">Official tax invoice included</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <ScrollReveal className="mt-16 pt-8 border-t border-border/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold font-heading text-foreground">Frequently Paired Dental Supplies</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Compatible items for this restorative protocol.</p>
              </div>
              <Button variant="ghost" asChild className="rounded-full text-xs font-bold hover:text-primary">
                <Link to="/products">View All</Link>
              </Button>
            </div>
            <StaggerContainer staggerDelay={0.07} className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p: any) => (
                <StaggerItem key={p._id} scale>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>
        )}
      </div>
    </PublicLayout>
  );
}
