import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  Users,
  BarChart3,
  Bell,
  Settings,
  Plus,
  FileText,
  Loader2,
  Trash2,
  Edit,
  UploadCloud,
  Image as ImageIcon,
  X,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  RefreshCw,
  CreditCard,
  Banknote,
  Building,
  Phone,
  Calendar,
  ShieldCheck,
  History,
  Eye,
  ArrowUpDown,
  UserCheck,
  MapPin,
  Mail,
  Receipt,
  Search,
} from "lucide-react";
import { CustomerHistoryModal } from "@/components/dashboard/CustomerHistoryModal";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { notificationService, type AppNotification } from "@/lib/notifications";
import {
  shopApi,
  uploadApi,
  type ShopProduct,
  type ShopInventoryItem,
  type ShopOrder,
  type ShopCustomer,
  type ShopStats,
  type WeeklySalesItem,
  type MonthlyTrendItem,
  type CategoryShareItem,
  type ProductPerformanceItem,
} from "@/lib/api";

// Categories & brands for the Add Product form
const formCategories = [
  "Composites",
  "Impression Materials",
  "Endodontics",
  "Orthodontics",
  "Instruments",
  "Disposables",
  "Cements & Adhesives",
  "Whitening",
  "Other",
];
const formBrands = [
  "3M ESPE",
  "Ivoclar",
  "Dentsply Sirona",
  "GC",
  "Kerr",
  "Septodont",
  "VOCO",
  "Other",
];

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop Owner Dashboard — Darsh Dental Depot" }] }),
  component: ShopDashboard,
});

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
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
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
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

function useApiData<T>(fetcher: () => Promise<{ data: T }>) {
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
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}

// ─── Main layout ────────────────────────────────────────────────────────────

function ShopDashboard() {
  const [active, setActive] = useState("dashboard");
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout
      title="Shop Owner"
      role="Shop Owner"
      items={items}
      active={active}
      onChange={setActive}
      search={search}
      onSearchChange={setSearch}
    >
      {active === "dashboard" && <DashboardSection />}
      {active === "products" && <ProductsSection search={search} />}
      {active === "inventory" && <InventorySection search={search} />}
      {active === "orders" && <OrdersSection search={search} />}
      {active === "customers" && <CustomersSection search={search} />}
      {active === "analytics" && <AnalyticsSection />}
      {active === "notifications" && <NotificationsSection onNavigate={setActive} />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

// ─── PAGE 1: Dashboard ──────────────────────────────────────────────────────

function DashboardSection() {
  const stats = useApiData<ShopStats>(shopApi.getStats);
  const weekly = useApiData<WeeklySalesItem[]>(shopApi.getWeeklySales);
  const catShare = useApiData<CategoryShareItem[]>(shopApi.getCategoryShare);
  const monthly = useApiData<MonthlyTrendItem[]>(shopApi.getMonthlyTrend);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Here's how your shop is performing today.</p>
      </div>

      {/* Stat Cards */}
      {stats.loading ? (
        <LoadingSpinner />
      ) : stats.error ? (
        <ErrorBanner onRetry={stats.retry} />
      ) : (
        stats.data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Sales"
              value={stats.data.totalSales.toLocaleString()}
              prefix="₹"
              change={stats.data.weeklyChanges.sales}
              icon={DollarSign}
            />
            <StatCard
              label="Revenue"
              value={stats.data.revenue.toLocaleString()}
              prefix="₹"
              change={stats.data.weeklyChanges.revenue}
              icon={TrendingUp}
            />
            <StatCard
              label="Orders"
              value={String(stats.data.orders)}
              change={stats.data.weeklyChanges.orders}
              icon={ShoppingBag}
            />
            <StatCard
              label="Customers"
              value={String(stats.data.customers)}
              change={stats.data.weeklyChanges.customers}
              icon={Users}
            />
          </div>
        )
      )}

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly sales</h3>
          {weekly.loading ? (
            <LoadingSpinner />
          ) : weekly.error ? (
            <ErrorBanner onRetry={weekly.retry} />
          ) : !weekly.data?.length ? (
            <EmptyBanner label="No sales data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Category share</h3>
          {catShare.loading ? (
            <LoadingSpinner />
          ) : catShare.error ? (
            <ErrorBanner onRetry={catShare.retry} />
          ) : !catShare.data?.length ? (
            <EmptyBanner label="No products yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catShare.data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {catShare.data.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Monthly trend */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Monthly sales trend</h3>
        {monthly.loading ? (
          <LoadingSpinner />
        ) : monthly.error ? (
          <ErrorBanner onRetry={monthly.retry} />
        ) : !monthly.data?.length ? (
          <EmptyBanner label="No sales data yet" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── PAGE 2: Products ───────────────────────────────────────────────────────

function ProductForm({
  onClose,
  onSuccess,
  initialData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ShopProduct | null;
}) {
  const [loading, setLoading] = useState(false);

  // Check if initialData has a category/brand in predefined lists or custom
  const isPredefinedCategory = initialData?.category
    ? formCategories.slice(0, -1).includes(initialData.category)
    : true;
  const initialCategoryVal = initialData?.category
    ? isPredefinedCategory
      ? initialData.category
      : "Other"
    : formCategories[0];
  const [category, setCategory] = useState<string>(initialCategoryVal);
  const [customCategory, setCustomCategory] = useState<string>(
    initialData?.category && !isPredefinedCategory ? initialData.category : "",
  );

  const isPredefinedBrand = initialData?.brand
    ? formBrands.slice(0, -1).includes(initialData.brand)
    : true;
  const initialBrandVal = initialData?.brand
    ? isPredefinedBrand
      ? initialData.brand
      : "Other"
    : formBrands[0];
  const [brand, setBrand] = useState<string>(initialBrandVal);
  const [customBrand, setCustomBrand] = useState<string>(
    initialData?.brand && !isPredefinedBrand ? initialData.brand : "",
  );

  // Auto-calculation state for Purchase Price, GST & Selling Price
  const [purchasePrice, setPurchasePrice] = useState<number | string>(
    initialData?.purchasePrice || initialData?.price || "",
  );
  const [gstPercentage, setGstPercentage] = useState<number | string>(
    initialData?.gstPercentage ?? 12,
  );
  const [manualSellingPrice, setManualSellingPrice] = useState<string | null>(
    initialData?.sellingPrice ? String(initialData.sellingPrice) : null,
  );

  // Compute calculated selling price: Purchase Price + (Purchase Price * GST%)
  const numPurchase = Number(purchasePrice) || 0;
  const numGst = Number(gstPercentage) || 0;
  const gstAmount = (numPurchase * numGst) / 100;
  const autoSellingPrice = numPurchase > 0 ? Math.round((numPurchase + gstAmount) * 100) / 100 : 0;
  const finalSellingPrice =
    manualSellingPrice !== null && manualSellingPrice !== ""
      ? Number(manualSellingPrice)
      : autoSellingPrice;

  // Product Images state
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.imageUrl
        ? [initialData.imageUrl]
        : [],
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const fileList = Array.from(files);
      const uploadedUrls = await uploadApi.uploadMultiple(fileList, "products");
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith("http://") && !imageUrlInput.startsWith("https://")) {
      toast.error("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image URL added!");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Resolve final category and brand
    const finalCategory = category === "Other" ? customCategory.trim() : category;

    if (!finalCategory) {
      toast.error("Please enter a category name");
      return;
    }

    const finalBrand = brand === "Other" ? customBrand.trim() : brand || "";

    const computedPrice = finalSellingPrice || numPurchase;

    const payload = {
      name: formData.get("name") as string,
      category: finalCategory,
      brand: finalBrand,
      price: computedPrice,
      sellingPrice: computedPrice,
      purchasePrice: numPurchase > 0 ? numPurchase : computedPrice,
      stock: Number(formData.get("stock") || 1),
      images: images,
      imageUrl: images[0] || "",
      hsnCode: formData.get("hsnCode") as string,
      gstPercentage: numGst,
      batchNumber: formData.get("batchNumber") as string,
      description: formData.get("description") as string,
    };

    setLoading(true);
    try {
      if (initialData) {
        await shopApi.updateProduct(initialData._id, payload);
        toast.success("Product updated successfully!");
      } else {
        await shopApi.createProduct(payload);
        toast.success("Product created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        (err as Error).message ||
          (initialData ? "Failed to update product" : "Failed to create product"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto px-1 pb-1"
      onSubmit={handleSubmit}
    >
      <div className="col-span-2">
        <Label className="mb-1.5 font-semibold text-xs">Product Name *</Label>
        <Input
          name="name"
          defaultValue={initialData?.name}
          placeholder="e.g. Zhermack Tropicalgin Alginate 450g"
          required
        />
      </div>

      <div>
        <Label className="mb-1.5 font-semibold text-xs">Category *</Label>
        <Select value={category} onValueChange={(val) => setCategory(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {formCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "Other" ? "✨ Other (Specify custom category)" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 font-semibold text-xs">Brand</Label>
        <Select value={brand} onValueChange={(val) => setBrand(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            {formBrands.map((b) => (
              <SelectItem key={b} value={b}>
                {b === "Other" ? "✨ Other (Specify custom brand)" : b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditionally rendered Custom Category Input */}
      {category === "Other" && (
        <div className="col-span-2 sm:col-span-1 bg-primary/5 p-2.5 rounded-xl border border-primary/20">
          <Label className="mb-1.5 text-primary font-semibold block text-xs">
            Enter Custom Category Name *
          </Label>
          <Input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Alginates, Prosthodontics..."
            required
            autoFocus
            className="bg-background text-sm"
          />
        </div>
      )}

      {/* Conditionally rendered Custom Brand Input */}
      {brand === "Other" && (
        <div className="col-span-2 sm:col-span-1 bg-primary/5 p-2.5 rounded-xl border border-primary/20">
          <Label className="mb-1.5 text-primary font-semibold block text-xs">
            Enter Custom Brand Name *
          </Label>
          <Input
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            placeholder="e.g. Zhermack, Kulzer, Mani..."
            required
            autoFocus
            className="bg-background text-sm"
          />
        </div>
      )}

      <div className="col-span-2 sm:col-span-1">
        <Label className="mb-1.5 font-semibold text-xs">Stock Available *</Label>
        <Input
          name="stock"
          defaultValue={initialData?.stock ?? 1}
          type="number"
          required
          min="0"
          placeholder="e.g. 10"
        />
      </div>

      {/* Purchase Price & GST inputs */}
      <div className="col-span-2 sm:col-span-1">
        <Label className="mb-1.5 font-semibold text-xs text-foreground">Purchase Price (₹) *</Label>
        <Input
          type="number"
          value={purchasePrice}
          onChange={(e) => {
            setPurchasePrice(e.target.value);
            setManualSellingPrice(null); // auto recalculate
          }}
          placeholder="e.g. 400"
          required
          min="0"
          step="0.01"
          className="font-semibold"
        />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="font-semibold text-xs text-foreground">GST Rate (%) *</Label>
          <div className="flex gap-1">
            {[5, 12, 18, 28].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGstPercentage(g);
                  setManualSellingPrice(null);
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium border transition-colors ${
                  Number(gstPercentage) === g
                    ? "bg-primary text-white border-primary"
                    : "bg-secondary text-muted-foreground border-border/60 hover:bg-muted"
                }`}
              >
                {g}%
              </button>
            ))}
          </div>
        </div>
        <Input
          type="number"
          value={gstPercentage}
          onChange={(e) => {
            setGstPercentage(e.target.value);
            setManualSellingPrice(null); // auto recalculate
          }}
          placeholder="e.g. 12"
          min="0"
          max="100"
        />
      </div>

      {/* Live Calculated Selling Price Display Card */}
      <div className="col-span-2 bg-gradient-to-br from-primary/10 via-sky-500/10 to-indigo-500/10 p-3.5 rounded-2xl border border-primary/25 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-primary block">
              💰 Auto-Calculated Selling Price
            </span>
            <span className="text-[11px] text-muted-foreground">
              Base (₹{numPurchase.toFixed(2)}) + GST {numGst}% (₹{gstAmount.toFixed(2)})
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              ₹{autoSellingPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-primary/15 flex items-center justify-between text-xs">
          <span className="text-muted-foreground text-[11px]">
            Override Selling Price (optional):
          </span>
          <div className="w-32">
            <Input
              type="number"
              value={manualSellingPrice ?? autoSellingPrice}
              onChange={(e) => setManualSellingPrice(e.target.value)}
              placeholder={String(autoSellingPrice)}
              className="h-8 text-xs font-bold text-right bg-background/90"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Product Images Upload Section */}
      <div className="col-span-2 space-y-2.5 border border-border/80 rounded-2xl p-3.5 bg-muted/20">
        <div className="flex items-center justify-between">
          <Label className="font-semibold text-xs flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" /> Product Images
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {images.length} {images.length === 1 ? "image" : "images"} attached
          </span>
        </div>

        {/* Upload box & action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp, image/gif"
            multiple
            className="hidden"
            id="product-image-file-input"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-dashed border-2 hover:border-primary hover:bg-primary/5 py-4 h-auto text-xs flex items-center justify-center gap-2"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Uploading to Cloud Storage...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 text-primary" />
                <span>Upload Photos from Device (JPG, PNG, WebP)</span>
              </>
            )}
          </Button>

          <div className="flex gap-1.5 sm:w-64">
            <Input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Or paste image URL"
              className="text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddImageUrl}
              className="text-xs h-9 px-3"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Uploaded Images Preview Thumbnails */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-2">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-border/80 bg-background shadow-xs w-20 h-20 flex-shrink-0"
              >
                <img
                  src={imgUrl}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[9px] font-bold text-center py-0.5 backdrop-blur-xs">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-destructive text-white rounded-full p-1 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-1.5 font-semibold text-xs">HSN Code (optional)</Label>
        <Input name="hsnCode" defaultValue={initialData?.hsnCode} placeholder="e.g. 90184900" />
      </div>
      <div>
        <Label className="mb-1.5 font-semibold text-xs">Batch Number (optional)</Label>
        <Input
          name="batchNumber"
          defaultValue={initialData?.batchNumber}
          placeholder="e.g. BATCH-2026-01"
        />
      </div>

      <div className="col-span-2">
        <Label className="mb-1.5 font-semibold text-xs">Description *</Label>
        <Textarea
          name="description"
          defaultValue={initialData?.description}
          rows={3}
          placeholder="Provide details, pack size, usage instructions..."
          required
        />
      </div>

      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading || uploadingImage}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || uploadingImage}
          className="bg-gradient-to-r from-primary to-sky-600 text-white font-semibold"
        >
          {loading ? "Saving..." : initialData ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}

function ProductsSection({ search }: { search?: string }) {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const { data: products, loading, error, retry } = useApiData<ShopProduct[]>(shopApi.getProducts);

  const filteredProducts =
    products?.filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s)
      );
    }) || [];

  const handleEdit = (p: ShopProduct) => {
    setEditingProduct(p);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setEditingProduct(null), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!v) handleClose();
            else setOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              onClose={handleClose}
              onSuccess={() => retry()}
            />
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <LoadingSpinner label="Loading products..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !filteredProducts.length ? (
        <EmptyBanner
          label={
            search
              ? "No products found matching your search."
              : "No products yet. Add your first product!"
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="flex items-center gap-3 min-w-[220px]">
                    {p.imageUrl || (p.images && p.images[0]) ? (
                      <img
                        src={p.imageUrl || (p.images && p.images[0])}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border shadow-2xs flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border flex-shrink-0">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <span className="font-semibold text-foreground text-sm">{p.name}</span>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>₹{(p.sellingPrice ?? p.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this product?")) {
                          try {
                            await shopApi.deleteProduct(p._id);
                            toast.success("Product deleted successfully");
                            retry();
                          } catch (e: unknown) {
                            toast.error((e as Error).message || "Failed to delete product");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─── PAGE 3: Inventory ──────────────────────────────────────────────────────

function InventorySection({ search }: { search?: string }) {
  const {
    data: inventory,
    loading,
    error,
    retry,
  } = useApiData<ShopInventoryItem[]>(shopApi.getInventory);

  const filteredInventory =
    inventory?.filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return p.productName.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s);
    }) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Inventory</h1>
      {loading ? (
        <LoadingSpinner label="Loading inventory..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !filteredInventory.length ? (
        <EmptyBanner
          label={
            search
              ? "No inventory items found matching your search."
              : "No inventory data available"
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        p.status ||
                        (p.stock === 0 ? "Out of Stock" : p.stock <= 3 ? "Low Stock" : "In Stock")
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─── PAGE 4: Orders & Payment Records ──────────────────────────────────────

function OrdersSection({ search }: { search?: string }) {
  const { data: orders, loading, error, retry } = useApiData<ShopOrder[]>(shopApi.getOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "razorpay" | "cod" | "paid" | "pending">("all");

  // Real-time live polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      retry();
    }, 4000);
    return () => clearInterval(interval);
  }, [retry]);

  const handleStatusChange = async (orderId: string, orderNumber: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await shopApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderNumber} is now "${newStatus.toUpperCase()}"!`);
      retry();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const allOrders = orders || [];
  
  // Real-time payment metrics calculation
  const totalOrdersCount = allOrders.length;
  const razorpayOrders = allOrders.filter((o) => o.paymentMethod?.toLowerCase() === "razorpay");
  const codOrders = allOrders.filter((o) => o.paymentMethod?.toLowerCase() === "cod");
  const paidOrders = allOrders.filter((o) => o.paymentStatus?.toLowerCase() === "paid");
  const pendingPaymentOrders = allOrders.filter((o) => o.paymentStatus?.toLowerCase() === "pending");

  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
  const razorpayPaidRevenue = razorpayOrders
    .filter((o) => o.paymentStatus?.toLowerCase() === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = allOrders.filter((o) => {
    if (paymentFilter === "razorpay" && o.paymentMethod?.toLowerCase() !== "razorpay") return false;
    if (paymentFilter === "cod" && o.paymentMethod?.toLowerCase() !== "cod") return false;
    if (paymentFilter === "paid" && o.paymentStatus?.toLowerCase() !== "paid") return false;
    if (paymentFilter === "pending" && o.paymentStatus?.toLowerCase() !== "pending") return false;

    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(s) ||
      o.customerName.toLowerCase().includes(s) ||
      o.customerEmail.toLowerCase().includes(s) ||
      (o.clinicName && o.clinicName.toLowerCase().includes(s)) ||
      (o.paymentId && o.paymentId.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Orders & Payments</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time live audit • Live order sync from Vadodara clinics
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => retry()} className="text-xs rounded-xl gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Live
        </Button>
      </div>

      {/* Payment & Order Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border bg-card shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Orders Placed</span>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-foreground">{totalOrdersCount}</div>
          <div className="text-[11px] text-muted-foreground">
            Gross Total: <span className="font-bold text-foreground">₹{totalRevenue.toLocaleString("en-IN")}</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-400 font-semibold">
            <span>Razorpay Online Paid</span>
            <CreditCard className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-sky-800 dark:text-sky-300">
            ₹{razorpayPaidRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-sky-700/80 dark:text-sky-400">
            <span className="font-bold">{paidOrders.length}</span> verified online transaction{paidOrders.length !== 1 ? "s" : ""}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>Pay on Delivery (COD)</span>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-emerald-800 dark:text-emerald-300">
            ₹{codRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
            <span className="font-bold">{codOrders.length}</span> COD clinic package{codOrders.length !== 1 ? "s" : ""}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
            <span>Pending Payments</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-amber-800 dark:text-amber-300">
            {pendingPaymentOrders.length}
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400">
            Awaiting delivery settlement or retry
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: `All Orders (${allOrders.length})` },
          { key: "razorpay", label: `⚡ Razorpay Online (${razorpayOrders.length})` },
          { key: "cod", label: `💵 Pay on Delivery (${codOrders.length})` },
          { key: "paid", label: `✅ Paid (${paidOrders.length})` },
          { key: "pending", label: `⏳ Pending (${pendingPaymentOrders.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPaymentFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              paymentFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading orders and payment logs..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !filteredOrders.length ? (
        <EmptyBanner label={search ? "No orders found matching your search." : "No orders found for this filter."} />
      ) : (
        <Card className="overflow-hidden rounded-2xl border shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">Order #</TableHead>
                <TableHead className="font-bold">Doctor / Clinic</TableHead>
                <TableHead className="font-bold">Items</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Payment Details & ID</TableHead>
                <TableHead className="font-bold">Order Status</TableHead>
                <TableHead className="font-bold">Date & Time</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o._id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    {o.orderId}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {o.customerName}
                    </div>
                    {o.clinicName && (
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3 text-primary/70 shrink-0" />
                        {o.clinicName}
                      </div>
                    )}
                    {o.contactPhone && (
                      <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                        {o.contactPhone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-md">
                      {o.itemCount} item{o.itemCount > 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell className="font-extrabold text-sm text-foreground">
                    ₹{o.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {o.paymentMethod?.toLowerCase() === "razorpay" ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                          <CreditCard className="h-3 w-3 text-sky-600" /> Razorpay Online
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <Banknote className="h-3 w-3 text-emerald-600" /> Pay on Delivery (COD)
                        </div>
                      )}
                      <div>
                        {o.paymentStatus?.toLowerCase() === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            🟡 Payment Pending
                          </span>
                        )}
                      </div>
                      {o.paymentId && (
                        <div className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit">
                          ID: {o.paymentId}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {o.status.toLowerCase() === "delivered" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                      </span>
                    ) : o.status.toLowerCase() === "cancelled" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="h-3.5 w-3.5" /> Cancelled
                      </span>
                    ) : (
                      <Select
                        value={o.status.toLowerCase()}
                        disabled={updatingId === o._id}
                        onValueChange={(val) => handleStatusChange(o._id, o.orderId, val)}
                      >
                        <SelectTrigger className="h-8 w-38 text-xs font-semibold rounded-xl bg-background border-border/80 shadow-2xs">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">🟡 Pending</SelectItem>
                          <SelectItem value="processing">⚙️ Processing (Packing)</SelectItem>
                          <SelectItem value="shipped">🚚 Shipped (Out for delivery)</SelectItem>
                          <SelectItem value="delivered">🟢 Delivered (Completed)</SelectItem>
                          <SelectItem value="cancelled">🔴 Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {o.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs px-2.5 rounded-xl gap-1"
                      onClick={() => {
                        shopApi
                          .getOrderInvoice(o._id)
                          .then(() => toast.success(`Invoice for ${o.orderId} generated`))
                          .catch(() => toast.error("Failed to generate invoice"));
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ─── Customers (Real API Data with 360° History Ledger) ─────────────────────

function CustomersSection({ search: globalSearch }: { search?: string }) {
  const {
    data: customers,
    loading,
    error,
    retry,
  } = useApiData<ShopCustomer[]>(shopApi.getCustomers);

  const [localSearch, setLocalSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "high_value" | "new">("all");
  const [sortBy, setSortBy] = useState<"spent" | "orders" | "newest" | "name">("spent");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const activeSearch = localSearch || globalSearch || "";

  // Summary Metrics
  const totalClinics = customers?.length || 0;
  const activeClinics = customers?.filter((c) => (c.orders ?? 0) > 0).length || 0;
  const totalSpentAll = customers?.reduce((sum, c) => sum + (c.spent ?? 0), 0) || 0;
  const avgClinicValue = activeClinics > 0 ? Math.round(totalSpentAll / activeClinics) : 0;

  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers) return [];

    let list = customers.filter((c) => {
      // Search filter
      if (activeSearch) {
        const s = activeSearch.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(s);
        const matchesEmail = c.email?.toLowerCase().includes(s);
        const matchesClinic = c.clinicName?.toLowerCase().includes(s);
        const matchesPhone = c.phone?.includes(s);
        const matchesAddress = c.address?.toLowerCase().includes(s);
        if (!matchesName && !matchesEmail && !matchesClinic && !matchesPhone && !matchesAddress) {
          return false;
        }
      }

      // Tab filter
      if (filterType === "active") return (c.orders ?? 0) > 0;
      if (filterType === "high_value") return (c.spent ?? 0) >= 2000;
      if (filterType === "new") return (c.orders ?? 0) === 0;
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "spent") return (b.spent ?? 0) - (a.spent ?? 0);
      if (sortBy === "orders") return (b.orders ?? 0) - (a.orders ?? 0);
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

    return list;
  }, [customers, activeSearch, filterType, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top Header & Vadodara Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Registered Doctors & Clinics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete clinic intelligence, lifetime order tracking, and month-by-month purchase history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary font-mono text-xs py-1 px-3">
            <Building className="h-3 w-3 mr-1.5" /> Vadodara Dental Network
          </Badge>
          <Button variant="outline" size="sm" onClick={retry} className="text-xs rounded-xl h-8">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stat Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">Total Registered Clinics</div>
          <div className="text-2xl font-extrabold font-heading text-foreground mt-1">
            {totalClinics}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Verified dental doctors</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">Active Depot Buyers</div>
          <div className="text-2xl font-extrabold font-heading text-primary mt-1">
            {activeClinics}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {totalClinics > 0 ? `${Math.round((activeClinics / totalClinics) * 100)}% active rate` : "0%"}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">Total Customer LTV</div>
          <div className="text-2xl font-extrabold font-heading text-foreground mt-1">
            ₹{totalSpentAll.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">All-time clinic purchases</div>
        </Card>

        <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">Avg. Active Clinic Value</div>
          <div className="text-2xl font-extrabold font-heading text-foreground mt-1">
            ₹{avgClinicValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Mean spend per active buyer</div>
        </Card>
      </div>

      {/* Search, Filter Pills & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/70">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by Doctor name, Clinic name, Phone, Email, or Address..."
            className="pl-8.5 text-xs h-9 rounded-xl bg-background border-border/60"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "ghost"}
            onClick={() => setFilterType("all")}
            className="rounded-xl text-xs h-8 px-3"
          >
            All ({totalClinics})
          </Button>
          <Button
            size="sm"
            variant={filterType === "active" ? "default" : "ghost"}
            onClick={() => setFilterType("active")}
            className="rounded-xl text-xs h-8 px-3"
          >
            Active Buyers ({activeClinics})
          </Button>
          <Button
            size="sm"
            variant={filterType === "high_value" ? "default" : "ghost"}
            onClick={() => setFilterType("high_value")}
            className="rounded-xl text-xs h-8 px-3"
          >
            High Value ({customers?.filter((c) => (c.spent ?? 0) >= 2000).length || 0})
          </Button>
          <Button
            size="sm"
            variant={filterType === "new" ? "default" : "ghost"}
            onClick={() => setFilterType("new")}
            className="rounded-xl text-xs h-8 px-3"
          >
            New ({customers?.filter((c) => (c.orders ?? 0) === 0).length || 0})
          </Button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort:</span>
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="h-8.5 w-40 text-xs font-semibold rounded-xl bg-background border-border/60">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spent">💰 Highest Spent (LTV)</SelectItem>
              <SelectItem value="orders">📦 Most Orders Placed</SelectItem>
              <SelectItem value="newest">🕒 Newest Registered</SelectItem>
              <SelectItem value="name">🔤 Doctor Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Directory Table */}
      {loading ? (
        <LoadingSpinner label="Loading clinic accounts and historical ledgers..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !filteredAndSortedCustomers.length ? (
        <EmptyBanner
          label={
            activeSearch || filterType !== "all"
              ? "No clinics found matching your search and filter criteria."
              : "No registered doctors yet."
          }
        />
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-border/80 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold text-xs">Doctor & Clinic</TableHead>
                <TableHead className="font-bold text-xs">Contact Details</TableHead>
                <TableHead className="font-bold text-xs">Member Since</TableHead>
                <TableHead className="font-bold text-xs">Order Summary</TableHead>
                <TableHead className="font-bold text-xs">Total Lifetime Spent</TableHead>
                <TableHead className="text-right font-bold text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCustomers.map((c) => {
                const ordersCount = c.orders ?? 0;
                const spentAmount = c.spent ?? 0;
                const aov = c.aov ?? (ordersCount > 0 ? Math.round(spentAmount / ordersCount) : 0);

                return (
                  <TableRow
                    key={c._id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomerId(c._id)}
                  >
                    {/* Doctor & Clinic */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center font-extrabold text-sm shadow-xs shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : "D"}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <span className="truncate">{c.name || "Doctor"}</span>
                            {c.isVerified && (
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" title="Verified Doctor" />
                            )}
                          </div>
                          <div className="text-xs text-primary font-semibold flex items-center gap-1">
                            <Building className="h-3 w-3 shrink-0" />
                            <span className="truncate">{c.clinicName || "Dental Practice"}</span>
                          </div>
                          {c.address && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{c.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Details */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-foreground">
                            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                            <a
                              href={`tel:${c.phone}`}
                              className="hover:text-primary hover:underline"
                            >
                              {c.phone}
                            </a>
                            <a
                              href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, "").replace(/^91/, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded hover:bg-emerald-500/20"
                              title="Chat on WhatsApp"
                            >
                              WA
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate max-w-xs">
                            <Mail className="h-3 w-3 shrink-0" />
                            <a href={`mailto:${c.email}`} className="hover:text-foreground truncate">
                              {c.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Member Since */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{c.memberSince || "—"}</span>
                      </div>
                    </TableCell>

                    {/* Order Summary */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={ordersCount > 0 ? "default" : "secondary"}
                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          >
                            {ordersCount} {ordersCount === 1 ? "Order" : "Orders"}
                          </Badge>
                        </div>
                        {c.lastOrderDate && (
                          <div className="text-[10px] text-muted-foreground">
                            Last: {c.lastOrderDate}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Spent (LTV) */}
                    <TableCell>
                      <div>
                        <div className="font-extrabold text-sm text-foreground font-heading">
                          ₹{spentAmount.toFixed(2)}
                        </div>
                        {ordersCount > 0 && (
                          <div className="text-[10px] text-muted-foreground">
                            AOV: ₹{aov.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomerId(c._id)}
                        className="rounded-xl text-xs h-8 px-3 gap-1.5 font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors"
                      >
                        <History className="h-3.5 w-3.5 text-primary group-hover:text-white" />
                        <span>View History</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Customer Full Purchase History Modal */}
      <CustomerHistoryModal
        customerId={selectedCustomerId}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}

// ─── PAGE 5: Analytics ──────────────────────────────────────────────────────

function AnalyticsSection() {
  const perf = useApiData<ProductPerformanceItem[]>(shopApi.getProductPerformance);
  const trend = useApiData<MonthlyTrendItem[]>(shopApi.getMonthlyTrend);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Product performance</h3>
          {perf.loading ? (
            <LoadingSpinner />
          ) : perf.error ? (
            <ErrorBanner onRetry={perf.retry} />
          ) : !perf.data?.length ? (
            <EmptyBanner label="No sales data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={perf.data.map((p) => ({ name: p.productName, sales: p.unitsSold }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue trend</h3>
          {trend.loading ? (
            <LoadingSpinner />
          ) : trend.error ? (
            <ErrorBanner onRetry={trend.retry} />
          ) : !trend.data?.length ? (
            <EmptyBanner label="No revenue data yet" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Notifications (Rich Real-Time Center) ──────────────────────────────────

function NotificationsSection({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "order" | "stock" | "user">("all");
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
    toast.success("All notifications marked as read");
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
            <h1 className="text-2xl font-bold font-heading">Shop Alerts & Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time notifications for incoming clinic orders, low stock warnings, and doctor registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs rounded-xl h-9">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} className="text-xs rounded-xl h-9">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-3 flex-wrap">
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
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Clinic Orders (
          {notifications.filter((n) => n.type === "order").length})
        </Button>
        <Button
          variant={filter === "stock" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("stock")}
          className="rounded-xl text-xs h-8 px-3.5"
        >
          <Package className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Stock & Inventory (
          {notifications.filter((n) => n.type === "stock").length})
        </Button>
        <Button
          variant={filter === "user" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("user")}
          className="rounded-xl text-xs h-8 px-3.5"
        >
          <Users className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> New Clinics (
          {notifications.filter((n) => n.type === "user").length})
        </Button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3 rounded-3xl border-dashed">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary mx-auto grid place-items-center">
            <Bell className="h-7 w-7 opacity-70" />
          </div>
          <h3 className="font-bold text-lg">No Notifications</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            All caught up! New orders placed by Vadodara dental clinics and low-stock alerts will appear here in real time.
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
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {n.type === "order" ? (
                    <ShoppingBag className="h-5 w-5" />
                  ) : n.type === "stock" ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      {n.time}
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
                    {n.actionTab === "orders"
                      ? "Process Order"
                      : n.actionTab === "inventory"
                      ? "Manage Stock"
                      : n.actionTab === "customers"
                      ? "View Clinic"
                      : "View Details"}
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

// ─── Settings ───────────────────────────────────────────────────────────────

function SettingsSection() {
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Shop Settings</h1>
      <Card className="p-6 space-y-4">
        <div>
          <Label className="mb-1.5">Shop Name</Label>
          <Input defaultValue="Darsh Dental Depot" />
        </div>
        <div>
          <Label className="mb-1.5">Direct Helpline / WhatsApp</Label>
          <Input defaultValue="+91 97270 76119" />
        </div>
        <div>
          <Label className="mb-1.5">Support Email</Label>
          <Input defaultValue="support@darshdental.com" />
        </div>
        <div>
          <Label className="mb-1.5">Store Location</Label>
          <Input defaultValue="FF-10/11, Vraj Vihar Complex, Shiyabaug, Vadodara, Gujarat 390001" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm">Real-time Order Alerts</span>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Low-Stock SMS / WhatsApp Alerts</span>
          <Switch defaultChecked />
        </div>
        <Button onClick={() => toast.success("Settings saved successfully")}>Save Changes</Button>
      </Card>
    </div>
  );
}
