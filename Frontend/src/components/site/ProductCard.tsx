import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, CheckCircle, Zap, Package, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { doctorApi } from "@/lib/api";
import { AddToCartAnimation } from "./AddToCartAnimation";
import { TiltedCard, TiltedCardLayer } from "@/components/ui/TiltedCard";

export interface ProductCardProps {
  product: any;
  onAdd?: (product: any) => void;
  onWishlist?: (product: any) => void;
}

export function ProductCard({ product, onAdd, onWishlist }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isShopOwner = user?.role === "shop_owner";
  const isAdmin = user?.role === "admin";
  const isManager = isShopOwner || isAdmin;

  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const inStock = (product.stock ?? 1) > 0;
  const price = product.price ?? product.sellingPrice ?? 0;
  const originalPrice = product.purchasePrice ? Math.round(price * 1.25) : Math.round(price * 1.2);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const imageUrl =
    product.imageUrl ||
    product.image ||
    (product.images && product.images[0]) ||
    "/products/filtek-z350.jpg";

  const productId = product._id || product.id;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onWishlist) {
      onWishlist(product);
      return;
    }

    if (!user) {
      toast.info("Please sign in as a doctor to save items to your clinic wishlist");
      navigate({ to: "/login", search: { redirect: `/products/${productId}` } as any });
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
      setIsLiked(!nextState);
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
      toast.info("Please sign in as a doctor to purchase supplies for your clinic");
      navigate({ to: "/login", search: { redirect: `/products/${productId}` } as any });
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
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2400);
    } catch (err: any) {
      toast.error(err.message || "Failed to add item to cart");
    } finally {
      setTimeout(() => setIsAdding(false), 1400);
    }
  };

  return (
    <TiltedCard
      containerWidth="100%"
      containerHeight="100%"
      imageWidth="100%"
      imageHeight="100%"
      rotateAmplitude={10}
      scaleOnHover={1.025}
      glare={0.35}
      glareColor="#12A488"
      shadow={0.35}
      radius={18}
      perspective={1000}
      smoothness={0.65}
      showTooltip={false}
      gyroscope={false}
      intro={false}
      className="h-full w-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group glass-card border border-border/60 hover:border-primary/40 rounded-2xl bg-card transition-colors duration-300">
        {/* Product Image Area */}
        <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
          <Link
            to="/products/$id"
            params={{ id: productId }}
            className="block h-full w-full"
          >
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/products/filtek-z350.jpg";
              }}
            />
          </Link>

          {/* 3D Floating Badges & Wishlist Layer */}
          <TiltedCardLayer depth={25}>
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
              {!inStock ? (
                <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-sm pointer-events-auto">
                  Out of Stock
                </Badge>
              ) : discountPercent > 0 ? (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 shadow-sm border-0 pointer-events-auto">
                  <Zap className="h-3 w-3 mr-0.5 inline fill-current" /> {discountPercent}% OFF
                </Badge>
              ) : null}
            </div>

            {/* Wishlist Button (Only for doctors / guest clinic buyers) */}
            {!isManager && (
              <motion.button
                data-magnetic
                whileTap={{ scale: 0.8 }}
                onClick={handleWishlist}
                className={`absolute top-3 right-3 h-8 w-8 rounded-full grid place-items-center backdrop-blur-md transition-all z-10 pointer-events-auto ${
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
              <div className="absolute bottom-2 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                {product.category}
              </div>
            )}
          </TiltedCardLayer>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Brand */}
          <div className="text-[11px] font-bold text-primary dark:text-[#3FD1B3] uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {product.brand || "Darsh Certified"}
          </div>

          {/* Title */}
          <Link
            to="/products/$id"
            params={{ id: productId }}
            className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary dark:group-hover:text-[#3FD1B3] transition-colors"
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
              <div className="font-extrabold text-base text-foreground dark:text-[#3FD1B3] font-heading">
                ₹{price.toLocaleString("en-IN")}
              </div>
            </div>

            {isShopOwner ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-xl px-3 h-8 text-xs font-semibold border-primary/40 text-primary dark:text-[#3FD1B3] hover:bg-primary/10 transition-all"
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
                className="rounded-xl px-3 h-8 text-xs font-semibold border-primary/40 text-primary dark:text-[#3FD1B3] hover:bg-primary/10 transition-all"
              >
                <Link to="/admin">
                  <Settings className="h-3.5 w-3.5 mr-1" /> Admin
                </Link>
              </Button>
            ) : (
              <div data-magnetic className="inline-block"><AddToCartAnimation
                onClick={handleAddToCart}
                disabled={!inStock}
                isAdding={isAdding}
                isAdded={isAdded}
                mode="onAction"
                pillColor="#0A1B17"
                textColor="#3FD1B3"
                className="h-8 w-28 shrink-0 rounded-xl"
              /></div>
            )}
          </div>
        </div>
      </Card>
    </TiltedCard>
  );
}
