import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, CheckCircle2, Zap, Package, Settings, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { doctorApi } from "@/lib/api";

export interface ProductCardProps {
  product: any;
  onAdd?: (product: any) => void;
  onWishlist?: (product: any) => void;
}

export function ProductCard({ product, onAdd, onWishlist }: ProductCardProps) {
  const { user } = useAuth();
  const isShopOwner = user?.role === "shop_owner";
  const isAdmin = user?.role === "admin";
  const isManager = isShopOwner || isAdmin;

  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const inStock = (product.stock ?? 1) > 0;
  const price = product.price ?? product.sellingPrice ?? 0;
  const originalPrice = product.purchasePrice ? Math.round(price * 1.25) : Math.round(price * 1.2);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const imageUrl =
    product.imageUrl ||
    product.image ||
    (product.images && product.images[0]) ||
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80";

  const productId = product._id || product.id;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onWishlist) {
      onWishlist(product);
      return;
    }

    if (!user) {
      toast.error("Please sign in as a doctor to save items to wishlist");
      return;
    }

    const nextState = !isLiked;
    setIsLiked(nextState);

    try {
      if (nextState) {
        await doctorApi.addToWishlist(productId);
        toast.success(`Saved ${product.name} to clinic wishlist`);
      } else {
        await doctorApi.removeFromWishlist(productId);
        toast.success(`Removed ${product.name} from clinic wishlist`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAdd) {
      onAdd(product);
      return;
    }

    if (!user) {
      toast.error("Please sign in as a doctor to add items to your clinic cart");
      return;
    }

    if (user.role !== "doctor") {
      toast.error("Cart ordering is reserved for registered doctor accounts");
      return;
    }

    if (!productId) {
      toast.error("Unable to identify product");
      return;
    }

    setIsAdding(true);
    try {
      await doctorApi.addToCart(productId, 1);
      setAddedSuccess(true);
      toast.success(`Added ${product.name} to clinic cart!`);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <div className="overflow-hidden h-full flex flex-col group rounded-2xl bg-card border border-border/70 dark:border-white/10 hover:border-primary/50 shadow-xs hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300">
        {/* ── Product Image Area ── */}
        <Link
          to="/products/$id"
          params={{ id: productId }}
          className="relative block aspect-[4/3] bg-secondary/30 dark:bg-white/[0.02] overflow-hidden border-b border-border/40"
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discountPercent > 0 && inStock && (
              <Badge className="bg-amber-500 text-white font-bold text-[9.5px] px-1.5 py-0 h-4.5 shadow-xs border-0 rounded-md">
                <Zap className="h-2.5 w-2.5 mr-0.5 inline fill-current" /> {discountPercent}% OFF
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[9.5px] font-bold px-1.5 py-0 h-4.5 backdrop-blur-md rounded-md ${
                inStock
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Wishlist Button */}
          {!isManager && (
            <button
              type="button"
              onClick={handleWishlist}
              className={`absolute top-2.5 right-2.5 h-7.5 w-7.5 rounded-full grid place-items-center backdrop-blur-md transition-all z-10 ${
                isLiked
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-background/80 text-muted-foreground hover:text-rose-500 hover:bg-background border border-border/60"
              }`}
              aria-label="Save to Wishlist"
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Category Pill on Image */}
          {product.category && (
            <div className="absolute bottom-2 left-2.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-background/90 text-foreground backdrop-blur-md border border-border/60 opacity-90 group-hover:opacity-100 transition-opacity">
              {product.category}
            </div>
          )}
        </Link>

        {/* ── Card Content ── */}
        <div className="p-3.5 flex flex-col gap-1.5 flex-1">
          {/* Brand */}
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">{product.brand || "Darsh Certified"}</span>
          </div>

          {/* Title */}
          <Link
            to="/products/$id"
            params={{ id: productId }}
            className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors"
          >
            {product.name}
          </Link>

          {/* Review Stars & Rating */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="h-3 w-3 fill-current text-amber-400" />
              <span className="font-bold ml-1 text-foreground text-[11px]">
                {(product.rating ?? 4.8).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              ({product.reviewCount ?? 18})
            </span>
          </div>

          {/* Price and Add to Cart / Manage */}
          <div className="mt-auto pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
            <div>
              {discountPercent > 0 && (
                <div className="text-[10px] text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </div>
              )}
              <div className="font-extrabold text-sm sm:text-base text-foreground font-heading leading-none">
                ₹{price.toLocaleString("en-IN")}
              </div>
            </div>

            {isShopOwner ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-xl px-2.5 h-7.5 text-[11px] font-bold border-primary/40 text-primary hover:bg-primary/10 transition-all"
              >
                <Link to="/shop">
                  <Package className="h-3 w-3 mr-1" /> Stock
                </Link>
              </Button>
            ) : isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-xl px-2.5 h-7.5 text-[11px] font-bold border-primary/40 text-primary hover:bg-primary/10 transition-all"
              >
                <Link to="/admin">
                  <Settings className="h-3 w-3 mr-1" /> Admin
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!inStock || isAdding}
                onClick={handleAddToCart}
                className={`rounded-xl px-3 h-7.5 text-xs font-bold transition-all shadow-xs ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {isAdding ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : addedSuccess ? (
                  <>
                    <Check className="h-3 w-3 mr-1" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 mr-1" /> Add
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
