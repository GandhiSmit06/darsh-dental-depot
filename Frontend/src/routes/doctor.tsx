import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Heart, ShoppingBag, Bell, Settings, Package,
  CheckCircle2, Truck, Plus, Minus, Trash2, Loader2, Phone, MapPin, Clock, Sparkles, RefreshCw
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
  const previousStatusRef = useRef<string | null>(null);

  // Real-time asynchronous live polling every 3 seconds (like Zomato / Swiggy live delivery)
  useEffect(() => {
    const interval = setInterval(() => {
      activeOrder.retry();
      history.retry();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeOrder.retry, history.retry]);

  // Trigger real-time notifications on status transition
  useEffect(() => {
    if (activeOrder.data?.status) {
      const current = activeOrder.data.status.toLowerCase();
      if (previousStatusRef.current && previousStatusRef.current !== current) {
        if (current === "processing") {
          toast.info("⚙️ Darsh Dental Depot is now packaging your supplies!");
        } else if (current === "shipped") {
          toast.success("🛵 Out for Delivery! Courier is on the way to your clinic in Vadodara.");
        } else if (current === "delivered") {
          toast.success("🎉 Order delivered successfully to your clinic!");
        }
      }
      previousStatusRef.current = current;
    }
  }, [activeOrder.data?.status]);

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
    { key: "pending", label: "Order Placed", desc: "Registered at Depot", icon: CheckCircle2 },
    { key: "processing", label: "Preparing Supplies", desc: "Packed at Kevdabaug", icon: Package },
    { key: "shipped", label: "Out for Delivery", desc: "En route in Vadodara", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Handed over to Clinic", icon: CheckCircle2 },
  ];

  const getProgressWidth = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "pending": return "12%";
      case "processing": return "40%";
      case "shipped": return "72%";
      case "delivered": return "100%";
      default: return "0%";
    }
  };

  const isDone = (status: string | undefined, index: number) => {
    const s = (status || "pending").toLowerCase();
    const map: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };
    return (map[s] || 0) >= index;
  };

  const getStatusHeadline = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "pending":
        return {
          title: "Order Received — Awaiting Depot Confirmation",
          description: "Darsh Dental Depot has received your clinic's request and is preparing the dispatch schedule.",
          color: "text-amber-500",
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "processing":
        return {
          title: "Packaging Supplies at Kevdabaug Depot",
          description: "Your materials are being safely inspected, packed, and sanitized for delivery.",
          color: "text-blue-500",
          badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "shipped":
        return {
          title: "Out for Delivery in Vadodara!",
          description: "Delivery courier is actively en route from Kevdabaug Depot to your clinic.",
          color: "text-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
      case "delivered":
        return {
          title: "Delivered to Your Clinic! 🎉",
          description: "Package safely delivered to your dental clinic. Thank you for choosing Darsh Dental Depot!",
          color: "text-emerald-600",
          badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
        };
      case "cancelled":
        return {
          title: "Order Cancelled",
          description: "This order was cancelled.",
          color: "text-rose-500",
          badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        };
      default:
        return {
          title: "Processing Order",
          description: "Updating order tracking details...",
          color: "text-primary",
          badge: "bg-primary/10 text-primary border-primary/20",
        };
    }
  };

  const orderStatusInfo = getStatusHeadline(activeOrder.data?.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Order History & Live Tracking</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time delivery updates from Darsh Dental Depot to your clinic
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { activeOrder.retry(); history.retry(); }} className="text-xs">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Swiggy / Zomato Style Live Delivery Tracker Card */}
      {activeOrder.loading && !activeOrder.data ? (
        <LoadingSpinner label="Connecting to live dispatch stream..." />
      ) : activeOrder.error ? (
        <ErrorBanner onRetry={activeOrder.retry} />
      ) : activeOrder.data && (
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-card via-background to-primary/5 rounded-3xl shadow-lg">
          {/* Top Live Bar */}
          <div className="bg-primary/10 px-5 py-3 border-b border-primary/15 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                LIVE DISPATCH TRACKING
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">• Same-Day Vadodara Delivery</span>
            </div>

            <Badge className={`${orderStatusInfo.badge} font-bold text-xs capitalize py-1 px-3`}>
              {activeOrder.data.status}
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            {/* Header with Order ID & Cancel Option */}
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary block">
                  ORDER #{activeOrder.data.orderId}
                </span>
                <h3 className={`text-lg sm:text-xl font-extrabold ${orderStatusInfo.color} mt-0.5`}>
                  {orderStatusInfo.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                  {orderStatusInfo.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{activeOrder.data.itemCount} Items</div>
                  <div className="text-lg font-black text-foreground">₹{activeOrder.data.total.toFixed(2)}</div>
                </div>

                {(activeOrder.data.status.toLowerCase() === "pending" || activeOrder.data.status.toLowerCase() === "processing") && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isCanceling} 
                    onClick={() => handleCancelOrder(activeOrder.data!.id)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-9"
                  >
                    {isCanceling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-2">
              <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                {/* Background line */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-border/80 rounded-full" />
                {/* Active animated fill line */}
                <div 
                  className="absolute top-5 left-6 h-1 bg-gradient-to-r from-primary via-sky-500 to-emerald-500 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `calc(${getProgressWidth(activeOrder.data.status)} - 2rem)` }} 
                />

                {stages.map((s, i) => {
                  const done = isDone(activeOrder.data?.status, i);
                  const isCurrent = (activeOrder.data?.status || "pending").toLowerCase() === s.key;
                  return (
                    <div key={s.key} className="relative flex flex-col items-center gap-2 z-10 text-center w-28">
                      <div 
                        className={`h-11 w-11 rounded-2xl grid place-items-center border-2 transition-all duration-500 ${
                          done 
                            ? "bg-gradient-to-br from-primary to-sky-600 border-primary text-white shadow-md shadow-primary/20 scale-105" 
                            : "bg-card border-border text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20 animate-pulse" : ""}`}
                      >
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shop Depot Contact & Destination Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">Dispatched From:</span>
                  <p className="text-muted-foreground">Darsh Dental Depot, Kevdabaug, Vadodara</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Vraj Vihar Complex, Char Rasta</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-foreground block">Have a Question?</span>
                    <p className="text-muted-foreground">Call Shop Owner (Uncle)</p>
                  </div>
                </div>
                <a
                  href="tel:+919727076119"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Phone className="h-3 w-3" /> +91 97270 76119
                </a>
              </div>
            </div>

            {/* Items inside this order breakdown */}
            {activeOrder.data.products && activeOrder.data.products.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Items in this order:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeOrder.data.products.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/80">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover border shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted grid place-items-center text-muted-foreground shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">{item.brand} • Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Past Orders Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-bold font-heading">All Order Records</h2>
        {history.loading ? (
          <LoadingSpinner label="Loading records..." />
        ) : history.error ? (
          <ErrorBanner onRetry={history.retry} />
        ) : !history.data?.length ? (
          <EmptyBanner label="No past orders recorded" />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.data.map((o) => (
                  <TableRow key={o.orderId} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-primary">{o.orderId}</TableCell>
                    <TableCell>{o.itemCount} items</TableCell>
                    <TableCell className="font-bold text-foreground">₹{o.total.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={o.status as any} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{o.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Notifications (Clean state) ───────────────────────────────────────────

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="p-8 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto grid place-items-center">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg">No New Notifications</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          You're all set! Real-time order dispatch alerts and clinic delivery updates from Darsh Dental Depot will appear here.
        </p>
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
