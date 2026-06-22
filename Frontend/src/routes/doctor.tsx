import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Heart, ShoppingBag, Bell, Settings, Package,
  CheckCircle2, Truck, Plus, Minus, Trash2, Loader2
} from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import {
  doctorApi, productsApi, type DoctorProfile, type DoctorStats,
  type DoctorCartItem, type DoctorWishlistItem, type DoctorActiveOrder,
  type DoctorOrderHistoryItem, type ProductResponse
} from "@/lib/api";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — Darsh Dental Depot" }] }),
  component: DoctorDashboard,
});

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "browse", label: "Browse Products", icon: Package },
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

// ─── Shared loading / error / empty helpers ─────────────────────────────────

function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <Loader2 className="h-8 w-8 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <p className="text-sm">Failed to load data. Please try again.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ─── Generic fetch hook ─────────────────────────────────────────────────────

function useApiData<T>(fetcher: () => Promise<{ data: T } | { products: T }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetcherRef.current();
      setData('data' in res ? res.data : (res as any).products);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load, mutate: setData };
}

// ─── Main layout ────────────────────────────────────────────────────────────

function DoctorDashboard() {
  const [active, setActive] = useState("dashboard");
  return (
    <DashboardLayout title="Doctor" role="Doctor" items={items} active={active} onChange={setActive}>
      {active === "dashboard" && <Overview />}
      {active === "browse" && <Browse />}
      {active === "cart" && <CartSection />}
      {active === "wishlist" && <Wishlist />}
      {active === "orders" && <OrdersSection />}
      {active === "notifications" && <NotificationsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

// ─── Mapping ProductResponse to ProductCard props ───────────────────────────

function mapToProductCardProps(p: ProductResponse | DoctorWishlistItem) {
  return {
    id: 'productId' in p ? p.productId : p._id,
    name: p.name,
    brand: p.brand,
    category: 'category' in p ? p.category : '',
    price: 'sellingPrice' in p ? p.sellingPrice : p.price,
    stock: p.stock,
    rating: p.rating,
    reviewCount: p.reviewCount,
    description: '',
    image: 'images' in p ? p.images[0] || '' : p.imageUrl || '',
  };
}

// ─── PAGE 1: Dashboard ──────────────────────────────────────────────────────

function Overview() {
  const profile = useApiData<DoctorProfile>(doctorApi.getProfile);
  const stats = useApiData<DoctorStats>(doctorApi.getStats);
  const recommended = useApiData<ProductResponse[]>(() => productsApi.getProducts(true));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {profile.loading ? "Loading..." : profile.error ? "Welcome" : `Welcome, ${profile.data?.name || 'Doctor'}`}
        </h1>
        <p className="text-muted-foreground text-sm">Your practice at a glance.</p>
      </div>

      {stats.loading ? <LoadingSpinner /> : stats.error ? <ErrorBanner onRetry={stats.retry} /> : stats.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Orders" value={String(stats.data.activeOrders)} icon={ShoppingBag} />
          <StatCard label="Wishlist Items" value={String(stats.data.wishlistCount)} icon={Heart} />
          <StatCard label="Total Spent" value={stats.data.totalSpent.toLocaleString()} prefix="₹" icon={Package} change={stats.data.spentChangePercent} />
          <StatCard label="Cart Items" value={String(stats.data.cartItems)} icon={ShoppingCart} />
        </div>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recommended for you</h3>
        {recommended.loading ? <LoadingSpinner /> : recommended.error ? <ErrorBanner onRetry={recommended.retry} /> : !recommended.data?.length ? <EmptyBanner label="No recommendations available" /> : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {recommended.data.map((p) => (
              <ProductCard 
                key={p._id} 
                product={mapToProductCardProps(p)} 
                onAdd={async () => {
                  try {
                    await doctorApi.addToCart(p._id, 1);
                    toast.success(`${p.name} added to cart`);
                    stats.retry(); // refresh stats
                  } catch { toast.error("Failed to add to cart"); }
                }}
                onWishlist={async () => {
                  try {
                    await doctorApi.addToWishlist(p._id);
                    toast.success("Added to wishlist");
                    stats.retry(); // refresh stats
                  } catch { toast.error("Failed to add to wishlist"); }
                }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── PAGE 2: Browse Products ────────────────────────────────────────────────

function Browse() {
  const { data: products, loading, error, retry } = useApiData<ProductResponse[]>(() => productsApi.getProducts());

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Browse products</h1>
      {loading ? <LoadingSpinner label="Loading products..." /> : error ? <ErrorBanner onRetry={retry} /> : !products?.length ? <EmptyBanner label="No products found" /> : (
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard 
              key={p._id} 
              product={mapToProductCardProps(p)} 
              onAdd={async () => {
                try {
                  await doctorApi.addToCart(p._id, 1);
                  toast.success(`${p.name} added to cart`);
                } catch { toast.error("Failed to add to cart"); }
              }}
              onWishlist={async () => {
                try {
                  await doctorApi.addToWishlist(p._id);
                  toast.success("Added to wishlist");
                } catch { toast.error("Failed to add to wishlist"); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE 3: Cart ───────────────────────────────────────────────────────────

function CartSection() {
  const { data: cart, loading, error, retry, mutate } = useApiData<DoctorCartItem[]>(doctorApi.getCart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cart?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  const updateQuantity = async (id: string, qty: number) => {
    try {
      const res = await doctorApi.updateCartItem(id, qty);
      mutate(res.data);
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await doctorApi.removeFromCart(id);
      mutate(res.data);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const profileData = useApiData<DoctorProfile>(doctorApi.getProfile);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (profileData.data?.address) {
      setAddressInput(profileData.data.address);
    }
  }, [profileData.data]);

  const handleCheckout = async () => {
    if (!profileData.data?.address) {
      setShowAddressModal(true);
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await doctorApi.placeOrder();
      
      // If backend returned simulation mode (Razorpay keys not configured),
      // the order is already marked as paid — just show success
      if ((res.data as any).simulation) {
        toast.success(`Order ${res.data.orderId} placed successfully! (Payment simulated)`);
        mutate([]);
        return;
      }

      const options = {
        key: "rzp_test_RvTaFgHR4Y5TPv",
        amount: res.data.total * 100,
        currency: "INR",
        name: "Darsh Dental Depot",
        description: "Order Payment",
        order_id: res.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await doctorApi.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: res.data.orderId
            });
            toast.success("Payment successful! Order placed.");
            mutate([]);
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: profileData.data?.name,
          email: profileData.data?.email,
          contact: profileData.data?.phone
        },
        theme: {
          color: "#2563eb"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
          toast.error("Payment failed. Please try again.");
      });
      rzp.open();

    } catch {
      toast.error("Failed to initiate checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressInput.trim()) {
      toast.error("Please enter an address");
      return;
    }
    setIsSavingAddress(true);
    try {
      await doctorApi.updateProfile({ address: addressInput });
      await profileData.retry();
      setShowAddressModal(false);
      handleCheckout(); // Automatically continue to checkout
    } catch {
      toast.error("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Your cart</h1>
      {loading ? <LoadingSpinner label="Loading cart..." /> : error ? <ErrorBanner onRetry={retry} /> : !cart?.length ? (
        <EmptyBanner label="Cart is empty" />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 divide-y">
            {cart.map((item) => (
              <div key={item.cartItemId} className="p-4 flex items-center gap-4">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.brand}</div>
                </div>
                <div className="flex items-center border rounded-md">
                  <button className="px-2 py-1" onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button className="px-2 py-1" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><Plus className="h-3 w-3" /></button>
                </div>
                <div className="w-20 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.cartItemId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Card>
          <Card className="p-5 h-fit">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between font-bold border-t pt-3 mt-3"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <Button className="w-full mt-4" disabled={isCheckingOut || profileData.loading} onClick={handleCheckout}>
              {isCheckingOut ? "Processing..." : "Checkout securely"}
            </Button>
          </Card>
        </div>
      )}

      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Address Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Please enter your complete delivery address before checking out.</Label>
              <Input 
                value={addressInput} 
                onChange={e => setAddressInput(e.target.value)} 
                placeholder="Clinic name, Street, City, State, Pincode"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressModal(false)}>Cancel</Button>
            <Button disabled={isSavingAddress} onClick={handleSaveAddress}>
              {isSavingAddress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PAGE 4: Wishlist ───────────────────────────────────────────────────────

function Wishlist() {
  const { data: wishlist, loading, error, retry } = useApiData<DoctorWishlistItem[]>(doctorApi.getWishlist);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Wishlist</h1>
      {loading ? <LoadingSpinner label="Loading wishlist..." /> : error ? <ErrorBanner onRetry={retry} /> : !wishlist?.length ? <EmptyBanner label="Wishlist is empty" /> : (
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {wishlist.map((p) => (
            <ProductCard 
              key={p.wishlistItemId} 
              product={mapToProductCardProps(p)} 
              onAdd={async () => {
                try {
                  await doctorApi.addToCart(p.productId, 1);
                  toast.success(`${p.name} added to cart`);
                } catch { toast.error("Failed to add to cart"); }
              }}
              onWishlist={async () => {
                try {
                  await doctorApi.removeFromWishlist(p.productId);
                  toast.success("Removed from wishlist");
                  retry(); // Refresh wishlist
                } catch { toast.error("Failed to remove from wishlist"); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE 5: Orders ─────────────────────────────────────────────────────────

function OrdersSection() {
  const activeOrder = useApiData<DoctorActiveOrder | null>(doctorApi.getActiveOrder);
  const history = useApiData<DoctorOrderHistoryItem[]>(doctorApi.getOrderHistory);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setIsCanceling(true);
    try {
      await doctorApi.cancelOrder(id);
      toast.success("Order cancelled successfully");
      activeOrder.retry();
      history.retry();
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setIsCanceling(false);
    }
  };

  const stages = [
    { label: "Ordered", icon: CheckCircle2 },
    { label: "Processing", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 },
  ];

  const getProgressWidth = (status?: string) => {
    switch (status) {
      case "pending": return "0%";
      case "processing": return "33%";
      case "shipped": return "66%";
      case "delivered": return "100%";
      default: return "0%";
    }
  };

  const isDone = (status: string | undefined, index: number) => {
    const s = status || "pending";
    const map: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
    return (map[s] || 0) >= index;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Order history</h1>

      {activeOrder.loading ? <LoadingSpinner /> : activeOrder.error ? <ErrorBanner onRetry={activeOrder.retry} /> : activeOrder.data && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm text-muted-foreground">Order #{activeOrder.data.orderId}</div>
              <div className="font-semibold">{activeOrder.data.itemCount} items · ₹{activeOrder.data.total.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{activeOrder.data.status}</Badge>
              {(activeOrder.data.status === "pending" || activeOrder.data.status === "processing") && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={isCanceling} 
                  onClick={() => handleCancelOrder(activeOrder.data!.id)}
                >
                  {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Order"}
                </Button>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <div className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500" style={{ width: `calc(${getProgressWidth(activeOrder.data.status)} - 1rem)` }} />
            {stages.map((s, i) => (
              <div key={s.label} className="relative flex flex-col items-center gap-2 z-10">
                <div className={`h-9 w-9 rounded-full grid place-items-center border-2 transition-colors duration-500 ${isDone(activeOrder.data?.status, i) ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {history.loading ? <LoadingSpinner /> : history.error ? <ErrorBanner onRetry={history.retry} /> : !history.data?.length ? <EmptyBanner label="No past orders" /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Order</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {history.data.map((o) => (
                <TableRow key={o.orderId}>
                  <TableCell className="font-mono">{o.orderId}</TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell>₹{o.total.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.status as any} /></TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─── Notifications (unchanged) ──────────────────────────────────────────────

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="divide-y">
        {[
          { t: "Your order ORD-1024 has shipped", d: "2 hours ago" },
          { t: "Restock available: Filtek Universal", d: "1 day ago" },
        ].map((n, i) => (
          <div key={i} className="p-4">
            <div className="text-sm font-medium">{n.t}</div>
            <div className="text-xs text-muted-foreground">{n.d}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Settings (unchanged) ───────────────────────────────────────────────────

function SettingsSection() {
  const { data: profile } = useApiData<DoctorProfile>(doctorApi.getProfile);
  
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="p-6 space-y-4">
        <div><Label className="mb-1.5">Full name</Label><Input defaultValue={profile?.name || ""} /></div>
        <div><Label className="mb-1.5">Clinic</Label><Input defaultValue={profile?.clinicName || ""} /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Order updates via email</span><Switch defaultChecked /></div>
        <Button onClick={() => toast.success("Saved")}>Save</Button>
      </Card>
    </div>
  );
}
