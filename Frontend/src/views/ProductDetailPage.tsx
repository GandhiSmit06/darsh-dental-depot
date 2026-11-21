/* eslint-disable @next/next/no-html-link-for-pages -- The catalog is a standalone HTML route. */
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { productsApi, doctorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { defaultSettings } from "@darsh/backend/site-content/defaults";
import { StatusBadge } from "@/components/dashboard/widgets";
import { toast } from "sonner";
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
      <div className="depot-product">
        <nav
          className="mb-6 flex items-center justify-between gap-4"
          aria-label="Product navigation"
        >
          <a href="/products" className="depot-text-link">
            <ArrowLeft size={16} /> Back to catalog
          </a>
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
            <Share2 size={15} /> Share
          </Button>
        </nav>

        <div className="depot-product-grid">
          <section aria-label="Product images" className="min-w-0">
            <div className="depot-product-photo">
              <img src={gallery[activeImg]} alt={product.name} />
              {discountPercent > 0 && (
                <span className="depot-product-discount">{discountPercent}% off</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={index === activeImg}
                    onClick={() => setActiveImg(index)}
                    className="size-16 shrink-0 overflow-hidden rounded-xl border aria-pressed:border-foreground"
                  >
                    <img className="size-full object-cover" src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <article className="depot-product-info">
            <p className="portal-kicker">
              {product.brand} {product.category && <> · {product.category}</>}
            </p>
            <h1>{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <StatusBadge status={inStock ? "In stock" : "Out of stock"} />
              {product.reviewCount > 0 && (
                <span>
                  <Star className="mr-1 inline size-4 fill-current text-amber-600" />{" "}
                  {product.rating.toFixed(1)} ({product.reviewCount})
                </span>
              )}
              <span>SKU {product.sku || product._id}</span>
            </div>
            <div className="depot-product-price">
              <strong>₹{price.toLocaleString("en-IN")}</strong>
              {discountPercent > 0 && <s>₹{originalPrice.toLocaleString("en-IN")}</s>}
              <small>Per unit · Inclusive of GST</small>
            </div>

            {user?.role === "admin" || user?.role === "shop_owner" ? (
              <Button asChild className="rounded-full">
                <Link href={user.role === "admin" ? "/admin" : "/shop"}>
                  Open inventory dashboard
                </Link>
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {user && (
                  <div className="inline-flex items-center rounded-full border bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="Decrease quantity"
                      disabled={qty <= 1}
                      onClick={() => setQty(qty - 1)}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="min-w-8 text-center">{qty}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="Increase quantity"
                      disabled={qty >= product.stock}
                      onClick={() => setQty(qty + 1)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
                <Button
                  className="rounded-full"
                  disabled={!inStock || addingToCart}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={16} />{" "}
                  {addedToCart
                    ? "Added to cart"
                    : addingToCart
                      ? "Adding…"
                      : user
                        ? "Add to clinic cart"
                        : "Sign in to order"}
                </Button>
                <Button
                  className="rounded-full"
                  variant="outline"
                  size="icon"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={isWishlisted}
                  onClick={handleWishlistToggle}
                >
                  <Heart size={16} className={isWishlisted ? "fill-current" : undefined} />
                </Button>
              </div>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-4 border-t pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Truck size={17} /> Local delivery in Vadodara
              </span>
              <a
                className="depot-text-link"
                href={`https://wa.me/${defaultSettings.phoneRaw}?text=${encodeURIComponent(`Hello Darsh Dental Depot, is ${product.name} available?`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare size={16} /> Ask on WhatsApp
              </a>
            </div>
          </article>
        </div>

        <section className="mt-10 border-t pt-7">
          <h2 className="font-heading text-2xl font-medium">Product details</h2>
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
                <div key={label} className="rounded-xl border bg-card p-4">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words font-semibold">{value}</dd>
                </div>
              ))}
          </dl>
        </section>

        {related.length > 0 && (
          <section className="mt-10 border-t pt-7">
            <h2 className="mb-5 font-heading text-2xl font-medium">More in this category</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
