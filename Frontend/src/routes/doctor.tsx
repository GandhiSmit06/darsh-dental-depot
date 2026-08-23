import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Heart, ShoppingBag, Bell, Settings, Package,
  CheckCircle2, Truck, Plus, Minus, Trash2, Loader2, Phone, MapPin, Clock, Sparkles, RefreshCw,
  CreditCard, Banknote, ShieldCheck, Building, QrCode, Smartphone, Landmark, Check, ChevronRight
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
import { useAuth } from "@/lib/auth-context";
import { notificationService, type AppNotification } from "@/lib/notifications";
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
      {active === "cart" && <CartSection onNavigateToOrders={() => setActive("orders")} />}
      {active === "wishlist" && <Wishlist />}
      {active === "orders" && <OrdersSection />}
      {active === "notifications" && <NotificationsSection onNavigate={setActive} />}
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
          <StatCard label="Active Orders" value={String(stats.data.activeOrders)} icon={Package} />
          <StatCard label="Wishlist Items" value={String(stats.data.wishlistCount)} icon={Heart} />
          <StatCard label="Total Spent" value={stats.data.totalSpent.toLocaleString()} prefix="₹" icon={ShoppingBag} />
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

function CartSection({ onNavigateToOrders }: { onNavigateToOrders?: () => void }) {
  const { data: cart, loading, error, retry, mutate } = useApiData<DoctorCartItem[]>(doctorApi.getCart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const updateQuantity = async (id: string, qty: number, maxStock?: number) => {
    if (maxStock !== undefined && qty > maxStock) {
      toast.warning(`Only ${maxStock} unit(s) available in depot stock`);
      return;
    }
    try {
      const res = await doctorApi.updateCartItem(id, qty);
      mutate(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to update cart");
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await doctorApi.removeFromCart(id);
      mutate(res.data);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const profileData = useApiData<DoctorProfile>(doctorApi.getProfile);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showRazorpayGateway, setShowRazorpayGateway] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState<any>(null);
  const [gatewayTab, setGatewayTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiMethod, setUpiMethod] = useState<"gpay" | "phonepe" | "paytm" | "qr">("gpay");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Address & Payment state
  const [clinicName, setClinicName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("390001");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    if (profileData.data) {
      if (profileData.data.clinicName) setClinicName(profileData.data.clinicName);
      if (profileData.data.name) setContactName(profileData.data.name);
      if (profileData.data.phone) setContactPhone(profileData.data.phone);
      if (profileData.data.address) setStreetAddress(profileData.data.address);
    }
  }, [profileData.data]);

  const total = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const handleOpenCheckout = () => {
    if (!cart?.length) {
      toast.error("Your cart is empty. Add products before checking out.");
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleProcessOrder = async () => {
    if (!streetAddress.trim()) {
      toast.error("Please enter your clinic street address in Vadodara");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Please enter a contact phone number");
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Submit order with address & payment method
      const res = await doctorApi.placeOrder({
        address: {
          clinicName: clinicName.trim() || undefined,
          contactName: contactName.trim() || undefined,
          contactPhone: contactPhone.trim(),
          street: streetAddress.trim(),
          landmark: landmark.trim() || undefined,
          city: "Vadodara",
          state: "Gujarat",
          pincode: pincode.trim() || "390001",
        },
        paymentMethod,
        notes: deliveryNotes.trim() || undefined,
      });

      // Save updated address to doctor profile for convenience
      doctorApi.updateProfile({
        clinicName: clinicName.trim() || undefined,
        address: streetAddress.trim(),
        phone: contactPhone.trim(),
      }).catch(() => {});

      // 2. If Cash on Delivery
      if (paymentMethod === "cod") {
        toast.success(`🎉 Order ${res.data.orderId} confirmed with Pay on Delivery!`);
        mutate([]);
        setShowCheckoutModal(false);
        if (onNavigateToOrders) onNavigateToOrders();
        return;
      }

      // 3. If Razorpay Online Payment -> Open Gateway Dialog
      setPendingOrderInfo(res.data);
      setShowCheckoutModal(false);
      setShowRazorpayGateway(true);

    } catch (err: any) {
      toast.error(err.message || "Failed to initiate checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCompleteRazorpayPayment = async () => {
    if (!pendingOrderInfo) return;
    setIsSimulatingPayment(true);

    try {
      // Simulate realistic payment gateway processing
      await new Promise((r) => setTimeout(r, 1200));

      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      await doctorApi.verifyRazorpayPayment({
        orderId: pendingOrderInfo.dbOrderId,
        razorpayOrderId: pendingOrderInfo.razorpayOrderId || `order_${pendingOrderInfo.dbOrderId}`,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: "test_signature",
      });

      toast.success(`🎉 Payment of ₹${total.toFixed(2)} successful! Order ${pendingOrderInfo.orderId} placed.`);
      mutate([]);
      setShowRazorpayGateway(false);
      if (onNavigateToOrders) onNavigateToOrders();
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed.");
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Your Cart</h1>
        {cart?.length ? (
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
            {cart.length} product{cart.length > 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading cart items..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !cart?.length ? (
        <EmptyBanner label="Your cart is currently empty" />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 divide-y divide-border/60 rounded-3xl overflow-hidden shadow-sm">
            {cart.map((item) => (
              <div key={item.cartItemId} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-2xl object-cover border shrink-0" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-muted grid place-items-center text-muted-foreground shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.brand}</div>
                  <div className="text-xs font-semibold text-primary mt-1">₹{item.price.toFixed(2)} each</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center border rounded-xl bg-background shadow-2xs overflow-hidden">
                    <button 
                      className="px-2.5 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40" 
                      onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button 
                      className="px-2.5 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40" 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, item.stock)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      title={item.stock !== undefined && item.quantity >= item.stock ? `Max stock available (${item.stock})` : undefined}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {item.stock !== undefined && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Max: {item.stock} in stock
                    </span>
                  )}
                </div>
                <div className="w-24 text-right font-black text-foreground">₹{(item.price * item.quantity).toFixed(2)}</div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.cartItemId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Card>

          {/* Cart Summary Card */}
          <Card className="p-6 h-fit rounded-3xl shadow-sm border border-border/80 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-semibold text-foreground">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-emerald-500" />
                  Vadodara Delivery
                </span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-border/80 pt-3 mt-3">
                <span>Total Amount</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 rounded-2xl font-bold shadow-md shadow-primary/20 text-sm gap-2" 
              onClick={handleOpenCheckout}
            >
              <ShieldCheck className="h-4 w-4" />
              Proceed to Checkout
            </Button>

            <div className="p-3 rounded-2xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Dental Supplies · Direct Dispatch from Kevdabaug Depot</span>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Checkout Dialog (Address & Razorpay Payment Method) */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Complete Clinic Order & Payment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Step 1: Delivery Address */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm">1. Clinic Delivery Address (Vadodara)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Clinic Name</Label>
                  <Input 
                    value={clinicName} 
                    onChange={e => setClinicName(e.target.value)} 
                    placeholder="e.g. Smile Dental Clinic"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Mobile Number *</Label>
                  <Input 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)} 
                    placeholder="+91 98765 43210"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Street / Complex / Shop Address *</Label>
                <Input 
                  value={streetAddress} 
                  onChange={e => setStreetAddress(e.target.value)} 
                  placeholder="e.g. 2nd Floor, Vraj Vihar Complex, Kevdabaug"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Landmark</Label>
                  <Input 
                    value={landmark} 
                    onChange={e => setLandmark(e.target.value)} 
                    placeholder="e.g. Near Char Rasta"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode</Label>
                  <Input 
                    value={pincode} 
                    onChange={e => setPincode(e.target.value)} 
                    placeholder="390001"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Special Instructions (Optional)</Label>
                <Input 
                  value={deliveryNotes} 
                  onChange={e => setDeliveryNotes(e.target.value)} 
                  placeholder="e.g. Deliver before lunch break / Call doctor upon arrival"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm">2. Select Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Razorpay Online Option */}
                <div 
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "razorpay" 
                      ? "border-primary bg-primary/5 shadow-xs" 
                      : "border-border/80 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xs">Razorpay Online</span>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    UPI (GPay / PhonePe / Paytm), Cards & NetBanking
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Instant Dispatch
                  </span>
                </div>

                {/* Cash on Delivery Option */}
                <div 
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod" 
                      ? "border-primary bg-primary/5 shadow-xs" 
                      : "border-border/80 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-xs">Pay on Delivery</span>
                    </div>
                    {paymentMethod === "cod" && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pay cash or scan courier UPI QR when package arrives at your clinic
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Vadodara Clinics Only
                  </span>
                </div>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-sm font-bold text-foreground">Total Payable Amount:</span>
              <span className="text-xl font-black text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCheckoutModal(false)} disabled={isCheckingOut} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              disabled={isCheckingOut} 
              onClick={handleProcessOrder}
              className="rounded-xl font-bold shadow-md shadow-primary/20 gap-2"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "razorpay" ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{total.toFixed(2)} via Razorpay
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4" />
                  Confirm Pay on Delivery Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Razorpay Secure Payment Gateway Dialog ── */}
      <Dialog open={showRazorpayGateway} onOpenChange={setShowRazorpayGateway}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
          {/* Razorpay Brand Header */}
          <div className="bg-gradient-to-r from-[#0b57d0] via-[#0284c7] to-[#0284c7] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md grid place-items-center font-black text-lg text-white border border-white/20">
                ⚡
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight leading-tight flex items-center gap-1.5">
                  Razorpay <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded text-white">SECURE</span>
                </div>
                <div className="text-[11px] text-white/80">Darsh Dental Depot • Vadodara</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-white/70">Payable Amount</div>
              <div className="text-xl font-black tracking-tight">₹{total.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Order summary pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground">
                {pendingOrderInfo?.orderId || "ORD-CURRENT"}
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted/50 border border-border/60">
              <button
                type="button"
                onClick={() => setGatewayTab("upi")}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  gatewayTab === "upi" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> UPI Apps
              </button>
              <button
                type="button"
                onClick={() => setGatewayTab("card")}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  gatewayTab === "card" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" /> Cards
              </button>
              <button
                type="button"
                onClick={() => setGatewayTab("netbanking")}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  gatewayTab === "netbanking" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Landmark className="h-3.5 w-3.5" /> NetBanking
              </button>
            </div>

            {/* Tab 1: UPI Options */}
            {gatewayTab === "upi" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setUpiMethod("gpay")}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      upiMethod === "gpay" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold grid place-items-center text-xs">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Google Pay</div>
                      <div className="text-[10px] text-muted-foreground">Instant UPI</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setUpiMethod("phonepe")}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      upiMethod === "phonepe" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold grid place-items-center text-xs">
                      Pe
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">PhonePe</div>
                      <div className="text-[10px] text-muted-foreground">Direct Autopay</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setUpiMethod("paytm")}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      upiMethod === "paytm" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 font-bold grid place-items-center text-xs">
                      Pay
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Paytm UPI</div>
                      <div className="text-[10px] text-muted-foreground">Wallet / UPI</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setUpiMethod("qr")}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                      upiMethod === "qr" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 font-bold grid place-items-center text-xs">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">QR Scanner</div>
                      <div className="text-[10px] text-muted-foreground">Scan any App</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted Razorpay SSL tunnel active.</span>
                </div>
              </div>
            )}

            {/* Tab 2: Cards */}
            {gatewayTab === "card" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Razorpay Verified Card</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">TEST MODE</span>
                  </div>
                  <div className="font-mono text-sm tracking-wider font-bold text-foreground">
                    4242 •••• •••• 4242
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Exp: 12/28</span>
                    <span>CVV: 123</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {gatewayTab === "netbanking" && (
              <div className="grid grid-cols-2 gap-2">
                {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((bank) => (
                  <div
                    key={bank}
                    className="p-3 rounded-2xl border border-border/60 hover:border-primary/40 bg-card cursor-pointer text-xs font-bold text-foreground flex items-center gap-2"
                  >
                    <Landmark className="h-4 w-4 text-primary" />
                    {bank}
                  </div>
                ))}
              </div>
            )}

            {/* Action Pay Button */}
            <div className="pt-2">
              <Button
                disabled={isSimulatingPayment}
                onClick={handleCompleteRazorpayPayment}
                className="w-full h-12 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-[#0b57d0] via-[#0284c7] to-[#0284c7] hover:opacity-95 text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isSimulatingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Payment with Razorpay...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Complete ₹{total.toFixed(2)} Payment
                  </>
                )}
              </Button>
            </div>
          </div>
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

// ─── Notifications (Rich Real-Time Center) ──────────────────────────────────

function NotificationsSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "order" | "stock">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id || user._id, notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleItemClick = (n: AppNotification) => {
    if (user) {
      notificationService.markAsRead(user.id || user._id, n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    if (n.actionTab) {
      onNavigate(n.actionTab);
    }
  };

  const filtered = notifications.filter((n) => (filter === "all" ? true : n.type === filter));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading">Clinic Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live order tracking, clinic delivery milestones, and wishlist stock restock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs rounded-xl h-9">
              <Check className="h-3.5 w-3.5 mr-1.5" /> Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} className="text-xs rounded-xl h-9">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-xl text-xs h-8 px-3.5"
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "order" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("order")}
          className="rounded-xl text-xs h-8 px-3.5"
        >
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Orders & Delivery (
          {notifications.filter((n) => n.type === "order").length})
        </Button>
        <Button
          variant={filter === "stock" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("stock")}
          className="rounded-xl text-xs h-8 px-3.5"
        >
          <Package className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Wishlist & Restock (
          {notifications.filter((n) => n.type === "stock").length})
        </Button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner label="Checking live alerts..." />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3 rounded-3xl border-dashed">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary mx-auto grid place-items-center">
            <Bell className="h-7 w-7 opacity-70" />
          </div>
          <h3 className="font-bold text-lg">No Notifications</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            You're all caught up! New orders placed, Vadodara dispatch milestones, and restocked wishlist items will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <Card
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? "bg-primary/5 border-primary/30 shadow-xs"
                  : "bg-card border-border/70 opacity-90"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`h-11 w-11 rounded-2xl grid place-items-center shrink-0 ${
                    n.type === "order"
                      ? "bg-primary/15 text-primary"
                      : n.type === "stock"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {n.type === "order" ? (
                    <ShoppingBag className="h-5 w-5" />
                  ) : n.type === "stock" ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                {n.actionTab && (
                  <Button variant="secondary" size="sm" className="rounded-xl text-xs h-8 px-3 font-semibold">
                    {n.actionTab === "orders" ? "Track Order" : n.actionTab === "wishlist" ? "View Wishlist" : "View"}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
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
