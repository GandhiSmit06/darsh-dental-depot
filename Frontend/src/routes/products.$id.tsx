import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/mock-data";
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, ShieldCheck } from "lucide-react";
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
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) throw notFound();

  const gallery = [product.image, ...products.slice(0, 3).map((p) => p.image)];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

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
            <div className="grid grid-cols-4 gap-3 mt-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-md overflow-hidden border-2 ${activeImg === i ? "border-primary" : "border-transparent"}`}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</div>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.rating.toFixed(1)} <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </Badge>
            </div>
            <div className="text-4xl font-bold mt-6">${product.price.toFixed(2)}</div>
            <p className="text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

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
              <Card className="p-3 flex items-center gap-3"><Truck className="h-4 w-4 text-primary" /><span className="text-xs">Free shipping over $500</span></Card>
              <Card className="p-3 flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-xs">100% genuine guarantee</span></Card>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Customer reviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Dr. Reviewer {i}</div>
                  <div className="flex">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-warning text-warning" />)}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Excellent quality, exactly as described. Will reorder.</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related products</h2>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
