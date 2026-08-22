import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, CheckCircle, Zap, Package, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      toast.success(`Added ${product.name} to clinic cart!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group glass-card glass-card-hover border border-border/60 hover:border-primary/40 rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Product Image Area */}
        <Link
          to="/products/$id"
          params={{ id: productId }}
          className="relative block aspect-[4/3] bg-muted/40 overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPercent > 0 && inStock && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 shadow-sm border-0">
                <Zap className="h-3 w-3 mr-0.5 inline fill-current" /> {discountPercent}% OFF
              </Badge>
            )}
            <Badge
              variant={inStock ? "secondary" : "destructive"}
              className={`text-[10px] font-semibold px-2 py-0.5 backdrop-blur-md ${
                inStock
                  ? "bg-background/85 text-foreground border border-border/40"
                  : "bg-destructive/90 text-white"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Wishlist Button (Only for doctors / guest clinic buyers) */}
          {!isManager && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleWishlist}
              className={`absolute top-3 right-3 h-8 w-8 rounded-full grid place-items-center backdrop-blur-md transition-all z-10 ${
                isLiked
                  ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                  : "bg-background/80 text-muted-foreground hover:text-red-500 hover:bg-background border border-border/40"
              }`}
              aria-label="Add to Wishlist"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </motion.button>
          )}

          {/* Quick Category overlay tag */}
          {product.category && (
            <div className="absolute bottom-2 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.category}
            </div>
          )}
        </Link>

        {/* Card Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Brand */}
          <div className="text-[11px] font-bold text-primary/80 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {product.brand || "Darsh Certified"}
          </div>

          {/* Title */}
          <Link
            to="/products/$id"
            params={{ id: productId }}
            className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span className="font-bold ml-1 text-foreground text-xs">
                {(product.rating ?? 4.8).toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({product.reviewCount ?? 28} reviews)
            </span>
          </div>

          {/* Price and Add to Cart / Manage */}
          <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </div>
              <div className="font-extrabold text-base text-foreground font-heading">
                ₹{price.toLocaleString("en-IN")}
              </div>
            </div>

            {isShopOwner ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-xl px-3 h-8 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 transition-all"
              >
                <Link to="/shop">
                  <Package className="h-3.5 w-3.5 mr-1" /> Depot Stock
                </Link>
              </Button>
            ) : isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-xl px-3 h-8 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 transition-all"
              >
                <Link to="/admin">
                  <Settings className="h-3.5 w-3.5 mr-1" /> Admin
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!inStock || isAdding}
                onClick={handleAddToCart}
                className="rounded-xl px-3.5 h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
