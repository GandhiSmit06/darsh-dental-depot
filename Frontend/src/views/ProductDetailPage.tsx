"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { AddToCartAnimation } from "@/components/site/AddToCartAnimation";
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
  CheckCircle,
  Sparkles,
  Zap,
  ArrowLeft,
  Share2,
  Package,
  Settings,
  Clock,
  MessageSquare,
  ThermometerSnowflake,
  Award,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";
import { ClinicalLoader } from "@/components/ui/ClinicalLoader";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Open product view: anyone can see product specifications & details
  const { data: productResponse, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getProductById(id),
  });

  const { data: relatedResponse } = useQuery({
    queryKey: ["products-related"],
    queryFn: () => productsApi.getProducts(),
  });

  if (productLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col min-h-[60vh] items-center justify-center">
          <ClinicalLoader size="lg" text="Loading product…" subtext="Checking depot inventory" />
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
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const defaultImage = "/site/assets/img/brand/logo-mark-512.png";
  const gallery = product.images?.length ? product.images : [defaultImage];
  const related = (relatedResponse?.data || [])
    .filter((p: any) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const originalPrice = product.sellingPrice ?? product.price ?? 0;
  const price =
    product.discountPrice && product.discountPrice > 0 && product.discountPrice < originalPrice
      ? product.discountPrice
      : originalPrice;
  const discountPercent =
    originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const inStock = product.stock > 0 && product.status === "active";

  const handleAddToCart = async () => {
    // Require authentication before adding to cart / purchasing
    if (!isAuthenticated || !user) {
      toast.info("Please sign in with your doctor account to add items to cart and place orders");
      navigate.push(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }

    if (user.role !== "doctor") {
      toast.error("Ordering is reserved for registered doctor accounts");
      return;
    }

    setAddingToCart(true);
    try {
      await doctorApi.addToCart(product._id, qty);
      toast.success(`Added ${qty} × ${product.name} to clinic cart`);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2400);
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setTimeout(() => setAddingToCart(false), 1400);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user) {
      toast.info("Please sign in with your doctor account to save items to wishlist");
      navigate.push(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }

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

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Darsh Dental Depot`,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="rounded-full text-xs font-semibold gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" /> All Products
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-full text-xs gap-1.5 dark:border-white/10 dark:bg-[#0B1210]"
          >
            <Share2 className="h-3.5 w-3.5" /> Share Material
          </Button>
        </div>

        {/* Main Product Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Gallery */}
          <ScrollReveal direction="left" className="lg:col-span-6 space-y-4">
            <Card className="p-4 rounded-3xl border border-border/60 dark:border-white/10 glass-card dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] overflow-hidden aspect-square flex items-center justify-center relative shadow-sm">
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercent > 0 && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 dark:bg-[#12A488]/20 dark:text-[#3FD1B3] dark:border dark:border-[#12A488]/30 text-white font-bold text-xs px-2.5 py-1 shadow-md border-0">
                    <Zap className="h-3.5 w-3.5 mr-1 fill-current" /> {discountPercent}% Clinic
                    Savings
                  </Badge>
                )}
              </div>
            </Card>

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((g: string, i: number) => (
                  <button
                    key={i}
                    aria-label={`View product image ${i + 1}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImg === i
                        ? "border-primary dark:border-[#12A488] shadow-md scale-105"
                        : "border-border/60 dark:border-white/10 hover:border-primary/50 dark:hover:border-[#3FD1B3]/50 opacity-70"
                    }`}
                  >
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </ScrollReveal>

          {/* Right Column: Information & Actions */}
          <ScrollReveal direction="right" delay={0.1} className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="text-primary dark:text-[#3FD1B3] font-bold text-xs border-primary/30 dark:border-[#12A488]/30 dark:bg-[#12A488]/10 uppercase tracking-wider"
                >
                  {product.brand || "Darsh Dental Depot"}
                </Badge>
                <div className="text-xs text-muted-foreground dark:text-[#9DB0A9] font-mono">
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
                    {product.reviewCount ? product.rating.toFixed(1) : "Unrated"}
                  </span>
                  <span className="text-xs text-muted-foreground dark:text-[#9DB0A9] ml-1">
                    ({product.reviewCount || 0} clinic reviews)
                  </span>
                </div>
                <span>•</span>
                <Badge
                  variant={inStock ? "secondary" : "destructive"}
                  className="rounded-full text-xs font-semibold px-2.5 py-0.5 dark:bg-[#12A488]/15 dark:text-[#3FD1B3] dark:border-[#12A488]/30"
                >
                  {inStock ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
                </Badge>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-secondary/50 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] border border-border/60 dark:border-white/10 flex items-center justify-between">
              <div>
                {discountPercent > 0 && (
                  <div className="text-xs text-muted-foreground dark:text-[#9DB0A9] line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </div>
                )}
                <div className="text-3xl font-extrabold font-heading text-primary dark:text-[#3FD1B3]">
                  ₹{price.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-medium text-muted-foreground dark:text-[#9DB0A9]">
                    / unit (Incl. GST)
                  </span>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-[#3FD1B3] border-emerald-500/20 dark:border-[#12A488]/30 font-bold">
                Wholesale Tier
              </Badge>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-2">
              {user?.role === "shop_owner" ? (
                <div className="p-4 rounded-2xl bg-primary/10 dark:bg-[#10201C] border border-primary/20 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-primary dark:text-[#3FD1B3]" /> Store
                      Inventory Item
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-[#9DB0A9] mt-0.5">
                      You are logged in as the Shop Owner. Manage pricing, batches & stock in your
                      portal.
                    </div>
                  </div>
                  <Button
                    asChild
                    className="rounded-xl font-bold bg-primary dark:bg-[#12A488] hover:dark:bg-[#3FD1B3] text-white dark:text-[#04110E] text-xs h-9 shadow-sm"
                  >
                    <Link href="/shop">Open Shop Inventory</Link>
                  </Button>
                </div>
              ) : user?.role === "admin" ? (
                <div className="p-4 rounded-2xl bg-primary/10 dark:bg-[#10201C] border border-primary/20 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Settings className="h-4 w-4 text-primary dark:text-[#3FD1B3]" /> Admin
                      Control
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-[#9DB0A9] mt-0.5">
                      You are logged in as Admin. Manage all catalog items in Admin Hub.
                    </div>
                  </div>
                  <Button
                    asChild
                    className="rounded-xl font-bold bg-primary dark:bg-[#12A488] hover:dark:bg-[#3FD1B3] text-white dark:text-[#04110E] text-xs h-9 shadow-sm"
                  >
                    <Link href="/admin">Open Admin Hub</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-border/70 dark:border-white/10 rounded-2xl bg-background dark:bg-[#0B1210] p-1 shadow-sm">
                      <button
                        className="p-2 text-muted-foreground dark:text-[#9DB0A9] hover:text-foreground dark:hover:text-[#F2F6F4] hover:bg-secondary dark:hover:bg-[#10201C] rounded-xl transition-colors disabled:opacity-40"
                        aria-label="Decrease quantity"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-bold font-heading text-sm text-foreground">
                        {qty}
                      </span>
                      <button
                        className="p-2 text-muted-foreground dark:text-[#9DB0A9] hover:text-foreground dark:hover:text-[#F2F6F4] hover:bg-secondary dark:hover:bg-[#10201C] rounded-xl transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                        onClick={() => setQty((q) => Math.min(product.stock ?? 1, q + 1))}
                        disabled={qty >= (product.stock ?? 1)}
                        title={
                          qty >= (product.stock ?? 1)
                            ? `Maximum stock available (${product.stock})`
                            : undefined
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <AddToCartAnimation
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      isAdding={addingToCart}
                      isAdded={addedToCart}
                      mode="onAction"
                      text={!user ? "SIGN IN TO ORDER" : "ADD TO CLINIC CART"}
                      pillColor="#0A1B17"
                      textColor="#3FD1B3"
                      className="flex-1 h-12 rounded-2xl overflow-hidden"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={handleWishlistToggle}
                      className={`h-12 w-12 rounded-2xl border-border/70 dark:border-white/10 dark:bg-[#0B1210] ${
                        isWishlisted
                          ? "text-red-500 border-red-500/40 bg-red-500/10"
                          : "text-muted-foreground dark:text-[#9DB0A9]"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {!user && (
                    <div className="rounded-xl p-3 bg-primary/5 dark:bg-[#12A488]/10 border border-primary/20 dark:border-[#12A488]/20 flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-primary dark:text-[#3FD1B3] shrink-0" />
                      <span className="text-xs text-muted-foreground dark:text-[#9DB0A9]">
                        Practicing dentists & clinic owners sign in to order with wholesale pricing
                        & 2-hour local dispatch.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clinical Delivery & Trust Highlights */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-teal-500/10 dark:bg-[#12A488]/15 border border-teal-500/20 dark:border-[#12A488]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-teal-500/20 dark:bg-[#3FD1B3]/20 text-teal-600 dark:text-[#3FD1B3] flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-foreground">
                      2-Hour Chairside Dispatch
                    </div>
                    <div className="text-[11px] text-muted-foreground dark:text-[#9DB0A9]">
                      Local Vadodara Delivery from Shiyabaug Depot
                    </div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-[#3FD1B3] border-emerald-500/30 text-[10px] font-mono uppercase">
                  {inStock ? "In stock" : "Enquire"}
                </Badge>
              </div>

              {/* Direct Doctor Rep WhatsApp Procurement */}
              <Button
                variant="outline"
                asChild
                className="w-full rounded-2xl h-11 border-border/80 dark:border-white/15 dark:bg-[#0B1210] hover:bg-secondary text-xs font-semibold"
              >
                <a
                  href={`https://wa.me/919727076119?text=Hello%20Darsh%20Dental%20Depot,%20I%20am%20a%20doctor%20inquiring%20about%20ordering%20${encodeURIComponent(product.name)}%20(SKU:%20${product.sku || product._id})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span>Ask the depot on WhatsApp</span>
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>

        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold">Product details</h2>
          {product.description && (
            <p className="mt-3 max-w-3xl whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          )}
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Category", product.category],
              ["Manufacturer", product.manufacturer],
              ["Batch number", product.batchNumber],
              ["Expiry date", product.expiryDate],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-card p-4">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-semibold break-words">{value}</dd>
                </div>
              ))}
          </dl>
        </section>
        {/* Related Products */}
        {related.length > 0 && (
          <ScrollReveal className="mt-20 pt-10 border-t border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading">
                  More in this category
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Other supplies listed under {product.category}.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link href="/products">View All Catalog</Link>
              </Button>
            </div>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p: any) => (
                <StaggerItem key={p._id || p.id} scale>
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
