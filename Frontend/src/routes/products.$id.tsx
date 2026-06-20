import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button asChild className="mt-4"><Link to="/products">Back to products</Link></Button>
      </div>
    </PublicLayout>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

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
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  const product = productResponse?.data;

  if (!product) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button asChild className="mt-4"><Link to="/products">Back to products</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const defaultImage = "https://via.placeholder.com/600?text=No+Image";
  const gallery = product.images?.length ? product.images : [defaultImage];
  const related = (relatedResponse?.data || []).filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-10">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> /{" "}
          <Link to="/products" className="hover:text-primary">Products</Link> /{" "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <Card className="overflow-hidden aspect-square bg-accent">
              <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </Card>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-md overflow-hidden border-2 ${activeImg === i ? "border-primary" : "border-transparent"}`}>
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</div>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {(product.rating || 0).toFixed(1)} <span className="text-muted-foreground">({product.reviewCount || 0} reviews)</span>
              </div>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>
            <div className="text-4xl font-bold mt-6">₹{(product.sellingPrice || 0).toFixed(2)}</div>
            <p className="text-muted-foreground mt-4 leading-relaxed">No description available.</p>

            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border rounded-md">
                <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center">{qty}</span>
                <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={() => toast.success("Added to cart")} disabled={product.stock <= 0}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button variant="secondary" onClick={() => toast.success("Order placed")} disabled={product.stock <= 0}>Buy Now</Button>
              <Button variant="ghost" size="icon" onClick={() => toast.success("Saved")}><Heart className="h-4 w-4" /></Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <Card className="p-3 flex items-center gap-3"><Truck className="h-4 w-4 text-primary" /><span className="text-xs">Fast local delivery</span></Card>
              <Card className="p-3 flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-xs">100% genuine guarantee</span></Card>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related products</h2>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p._id} product={p as any} />)}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
