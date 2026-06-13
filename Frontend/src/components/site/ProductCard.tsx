import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Product } from "@/lib/mock-data";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Card className="overflow-hidden h-full flex flex-col group">
        <Link to="/products/$id" params={{ id: product.id }} className="relative block aspect-square bg-accent overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge
            variant={inStock ? "default" : "destructive"}
            className="absolute top-3 left-3"
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
          <button
            onClick={(e) => { e.preventDefault(); toast.success("Added to wishlist"); }}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 grid place-items-center hover:bg-background"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </Link>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</div>
          <Link to="/products/$id" params={{ id: product.id }} className="font-semibold leading-snug line-clamp-2 hover:text-primary">
            {product.name}
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {product.rating.toFixed(1)} <span className="opacity-60">({product.reviewCount})</span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={() => toast.success(`${product.name} added to cart`)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
