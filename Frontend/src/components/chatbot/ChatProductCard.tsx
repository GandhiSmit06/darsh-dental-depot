import React, { useState } from "react";
import { ShoppingCart, Check, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { doctorApi } from "@/lib/api";

interface ChatProductCardProps {
  product: {
    id?: string;
    _id?: string;
    name: string;
    brand?: string;
    price: number;
    sellingPrice?: number;
    stock?: number;
    image?: string;
    imageUrl?: string;
    category?: string;
  };
}

export function ChatProductCard({ product }: ChatProductCardProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = product.sellingPrice || product.price || 0;
  const productId = product._id || product.id || "prod-sample";
  const inStock = (product.stock ?? 1) > 0;
  const imageUrl =
    product.imageUrl ||
    product.image ||
    "/products/filtek-z350.jpg";

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in with your doctor account to add items to your clinic cart");
      return;
    }

    if (user.role !== "doctor") {
      toast.error("Cart ordering is available for registered doctor accounts");
      return;
    }

    setIsAdding(true);
    try {
      await doctorApi.addToCart(productId, 1);
      setAdded(true);
      toast.success(`Added ${product.name} to clinic cart!`);
      setTimeout(() => setAdded(false), 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/95 dark:bg-gradient-to-br dark:from-[#10201C] dark:to-[#0A100F] border border-border/80 dark:border-white/10 shadow-xs hover:border-primary/40 dark:hover:border-[#12A488]/50 transition-all text-xs">
      <img
        src={imageUrl}
        alt={product.name}
        className="h-14 w-14 rounded-lg object-cover border border-border/60 dark:border-white/10 shrink-0 bg-muted dark:bg-[#070B0A]"
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground dark:text-[#F2F6F4] truncate leading-tight">{product.name}</div>
        <div className="text-[11px] text-muted-foreground dark:text-[#9DB0A9] mt-0.5 truncate">
          {product.brand || "Darsh Dental Depot"}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-extrabold text-primary dark:text-[#3FD1B3] text-sm">₹{price.toFixed(2)}</span>
          <Badge
            variant="outline"
            className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${
              inStock
                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:border-[#12A488]/40 dark:text-[#3FD1B3] dark:bg-[#12A488]/15"
                : "border-rose-500/30 text-rose-600 bg-rose-500/10 dark:border-rose-500/40 dark:text-rose-400 dark:bg-rose-500/15"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </div>

      <Button
        size="sm"
        disabled={isAdding || !inStock}
        onClick={handleAddToCart}
        className={`h-8 px-2.5 text-xs font-bold rounded-lg shrink-0 gap-1 transition-all ${
          added
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-primary hover:bg-primary/90 dark:bg-[#12A488] dark:hover:bg-[#3FD1B3] text-white dark:text-[#04110E] shadow-xs"
        }`}
      >
        {isAdding ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : added ? (
          <>
            <Check className="h-3.5 w-3.5" /> Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" /> Add
          </>
        )}
      </Button>
    </div>
  );
}
