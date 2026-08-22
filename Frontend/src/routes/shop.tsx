import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Package, Warehouse, ShoppingBag, Users, BarChart3, Bell, Settings,
  DollarSign, TrendingUp, Plus, FileText, Loader2, Trash2, Edit, UploadCloud, Image as ImageIcon, X
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge, EmptyState } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  shopApi,
  uploadApi,
  type ShopStats,
  type ShopProduct,
  type ShopInventoryItem,
  type ShopOrder,
  type ShopCustomer,
  type WeeklySalesItem,
  type MonthlyTrendItem,
  type CategoryShareItem,
  type ProductPerformanceItem,
} from "@/lib/api";

// Categories & brands for the Add Product form
const formCategories = [
  "Composites", "Impression Materials", "Endodontics", "Orthodontics",
  "Instruments", "Disposables", "Cements & Adhesives", "Whitening", "Other",
];
const formBrands = [
  "3M ESPE", "Ivoclar", "Dentsply Sirona", "GC", "Kerr", "Septodont", "VOCO", "Other",
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

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

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

  useEffect(() => { load(); }, [load]);

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
      {active === "notifications" && <NotificationsSection />}
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
      {stats.loading ? <LoadingSpinner /> : stats.error ? <ErrorBanner onRetry={stats.retry} /> : stats.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Sales" value={stats.data.totalSales.toLocaleString()} prefix="₹" change={stats.data.weeklyChanges.sales} icon={DollarSign} />
          <StatCard label="Revenue" value={stats.data.revenue.toLocaleString()} prefix="₹" change={stats.data.weeklyChanges.revenue} icon={TrendingUp} />
          <StatCard label="Orders" value={String(stats.data.orders)} change={stats.data.weeklyChanges.orders} icon={ShoppingBag} />
          <StatCard label="Customers" value={String(stats.data.customers)} change={stats.data.weeklyChanges.customers} icon={Users} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly sales</h3>
          {weekly.loading ? <LoadingSpinner /> : weekly.error ? <ErrorBanner onRetry={weekly.retry} /> : !weekly.data?.length ? <EmptyBanner label="No sales data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Category share</h3>
          {catShare.loading ? <LoadingSpinner /> : catShare.error ? <ErrorBanner onRetry={catShare.retry} /> : !catShare.data?.length ? <EmptyBanner label="No products yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catShare.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {catShare.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
        {monthly.loading ? <LoadingSpinner /> : monthly.error ? <ErrorBanner onRetry={monthly.retry} /> : !monthly.data?.length ? <EmptyBanner label="No sales data yet" /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── PAGE 2: Products ───────────────────────────────────────────────────────

function ProductForm({ onClose, onSuccess, initialData }: { onClose: () => void, onSuccess: () => void, initialData?: any }) {
  const [loading, setLoading] = useState(false);

  // Check if initialData has a category/brand in predefined lists or custom
  const isPredefinedCategory = initialData?.category ? formCategories.slice(0, -1).includes(initialData.category) : true;
  const initialCategoryVal = initialData?.category
    ? (isPredefinedCategory ? initialData.category : "Other")
    : formCategories[0];
  const [category, setCategory] = useState<string>(initialCategoryVal);
  const [customCategory, setCustomCategory] = useState<string>(
    initialData?.category && !isPredefinedCategory ? initialData.category : ""
  );

  const isPredefinedBrand = initialData?.brand ? formBrands.slice(0, -1).includes(initialData.brand) : true;
  const initialBrandVal = initialData?.brand
    ? (isPredefinedBrand ? initialData.brand : "Other")
    : formBrands[0];
  const [brand, setBrand] = useState<string>(initialBrandVal);
  const [customBrand, setCustomBrand] = useState<string>(
    initialData?.brand && !isPredefinedBrand ? initialData.brand : ""
  );

  // Auto-calculation state for Purchase Price, GST & Selling Price
  const [purchasePrice, setPurchasePrice] = useState<number | string>(
    initialData?.purchasePrice || initialData?.price || ""
  );
  const [gstPercentage, setGstPercentage] = useState<number | string>(
    initialData?.gstPercentage ?? 12
  );
  const [manualSellingPrice, setManualSellingPrice] = useState<string | null>(
    initialData?.sellingPrice ? String(initialData.sellingPrice) : null
  );

  // Compute calculated selling price: Purchase Price + (Purchase Price * GST%)
  const numPurchase = Number(purchasePrice) || 0;
  const numGst = Number(gstPercentage) || 0;
  const gstAmount = (numPurchase * numGst) / 100;
  const autoSellingPrice = numPurchase > 0 ? Math.round((numPurchase + gstAmount) * 100) / 100 : 0;
  const finalSellingPrice = manualSellingPrice !== null && manualSellingPrice !== "" 
    ? Number(manualSellingPrice) 
    : autoSellingPrice;

  // Product Images state
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.imageUrl
      ? [initialData.imageUrl]
      : []
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
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
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
    const finalCategory = category === "Other" 
      ? customCategory.trim() 
      : category;

    if (!finalCategory) {
      toast.error("Please enter a category name");
      return;
    }

    const finalBrand = brand === "Other" 
      ? customBrand.trim() 
      : (brand || "");

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
    } catch (err: any) {
      toast.error(err.message || (initialData ? "Failed to update product" : "Failed to create product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto px-1 pb-1" onSubmit={handleSubmit}>
      <div className="col-span-2"><Label className="mb-1.5 font-semibold text-xs">Product Name *</Label><Input name="name" defaultValue={initialData?.name} placeholder="e.g. Zhermack Tropicalgin Alginate 450g" required /></div>
      
      <div>
        <Label className="mb-1.5 font-semibold text-xs">Category *</Label>
        <Select value={category} onValueChange={(val) => setCategory(val)}>
          <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
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
          <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
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
          <Label className="mb-1.5 text-primary font-semibold block text-xs">Enter Custom Category Name *</Label>
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
          <Label className="mb-1.5 text-primary font-semibold block text-xs">Enter Custom Brand Name *</Label>
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
        <Input name="stock" defaultValue={initialData?.stock ?? 1} type="number" required min="0" placeholder="e.g. 10" />
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
          <span className="text-muted-foreground text-[11px]">Override Selling Price (optional):</span>
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

      <div><Label className="mb-1.5 font-semibold text-xs">HSN Code (optional)</Label><Input name="hsnCode" defaultValue={initialData?.hsnCode} placeholder="e.g. 90184900" /></div>
      <div><Label className="mb-1.5 font-semibold text-xs">Batch Number (optional)</Label><Input name="batchNumber" defaultValue={initialData?.batchNumber} placeholder="e.g. BATCH-2026-01" /></div>

      <div className="col-span-2"><Label className="mb-1.5 font-semibold text-xs">Description *</Label><Textarea name="description" defaultValue={initialData?.description} rows={3} placeholder="Provide details, pack size, usage instructions..." required /></div>
      
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploadingImage}>Cancel</Button>
        <Button type="submit" disabled={loading || uploadingImage} className="bg-gradient-to-r from-primary to-sky-600 text-white font-semibold">
          {loading ? "Saving..." : (initialData ? "Update Product" : "Save Product")}
        </Button>
      </div>
    </form>
  );
}

function ProductsSection({ search }: { search?: string }) {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { data: products, loading, error, retry } = useApiData<ShopProduct[]>(shopApi.getProducts);

  const filteredProducts = products?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || 
           p.sku?.toLowerCase().includes(s) || 
           p.brand?.toLowerCase().includes(s) || 
           p.category?.toLowerCase().includes(s);
  }) || [];

  const handleEdit = (p: any) => {
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
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
          <DialogTrigger asChild><Button onClick={() => setEditingProduct(null)}><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add product"}</DialogTitle></DialogHeader><ProductForm initialData={editingProduct} onClose={handleClose} onSuccess={() => retry()} /></DialogContent>
        </Dialog>
      </div>
      {loading ? <LoadingSpinner label="Loading products..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredProducts.length ? <EmptyBanner label={search ? "No products found matching your search." : "No products yet. Add your first product!"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead>
                <TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="flex items-center gap-3 min-w-[220px]">
                    {(p.imageUrl || (p.images && p.images[0])) ? (
                      <img src={p.imageUrl || (p.images && p.images[0])} alt="" className="h-10 w-10 rounded-lg object-cover border shadow-2xs flex-shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border flex-shrink-0">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <span className="font-semibold text-foreground text-sm">{p.name}</span>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>₹{p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        try {
                          await shopApi.deleteProduct(p._id);
                          toast.success("Product deleted successfully");
                          retry();
                        } catch (e: any) {
                          toast.error(e.message || "Failed to delete product");
                        }
                      }
                    }}>
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
  const { data: inventory, loading, error, retry } = useApiData<ShopInventoryItem[]>(shopApi.getInventory);

  const filteredInventory = inventory?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.productName.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s);
  }) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Inventory</h1>
      {loading ? <LoadingSpinner label="Loading inventory..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredInventory.length ? <EmptyBanner label={search ? "No inventory items found matching your search." : "No inventory data available"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead><TableHead>Product</TableHead>
                <TableHead>Stock</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status || (p.stock === 0 ? "Out of Stock" : p.stock <= 3 ? "Low Stock" : "In Stock")} />
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

// ─── PAGE 4: Orders ─────────────────────────────────────────────────────────

function OrdersSection({ search }: { search?: string }) {
  const { data: orders, loading, error, retry } = useApiData<ShopOrder[]>(shopApi.getOrders);

  const filteredOrders = orders?.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.orderId.toLowerCase().includes(s) || 
           o.customerName.toLowerCase().includes(s) || 
           o.customerEmail.toLowerCase().includes(s);
  }) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Orders</h1>
      {loading ? <LoadingSpinner label="Loading orders..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredOrders.length ? <EmptyBanner label={search ? "No orders found matching your search." : "No orders yet"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
                <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono">{o.orderId}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell>₹{o.total.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.status as "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"} /></TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => {
                      shopApi.getOrderInvoice(o._id)
                        .then(() => toast.success("Invoice downloaded"))
                        .catch(() => toast.error("Failed to download invoice"));
                    }}>
                      <FileText className="h-3.5 w-3.5 mr-1" />Invoice
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

// ─── Customers (Real API Data) ──────────────────────────────────────────────

function CustomersSection({ search }: { search?: string }) {
  const { data: customers, loading, error, retry } = useApiData<ShopCustomer[]>(shopApi.getCustomers);

  const filteredCustomers = customers?.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || 
           c.email.toLowerCase().includes(s) || 
           c.clinicName?.toLowerCase().includes(s) ||
           c.phone?.includes(s);
  }) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registered Doctors & Clinics</h1>
        <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
          Vadodara Clinic Directory
        </Badge>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading clinic accounts..." />
      ) : error ? (
        <ErrorBanner onRetry={retry} />
      ) : !filteredCustomers.length ? (
        <EmptyBanner label={search ? "No clinics found matching your search." : "No registered doctors yet."} />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor / Clinic</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders Placed</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <div className="font-semibold text-foreground">{c.name || "Doctor"}</div>
                    <div className="text-xs text-muted-foreground">{c.clinicName || "Dental Practice"}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{c.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{c.phone || "—"}</TableCell>
                  <TableCell className="font-medium">{c.orders ?? 0}</TableCell>
                  <TableCell className="font-semibold text-primary">₹{(c.spent ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
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
          {perf.loading ? <LoadingSpinner /> : perf.error ? <ErrorBanner onRetry={perf.retry} /> : !perf.data?.length ? <EmptyBanner label="No sales data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perf.data.map((p) => ({ name: p.productName, sales: p.unitsSold }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue trend</h3>
          {trend.loading ? <LoadingSpinner /> : trend.error ? <ErrorBanner onRetry={trend.retry} /> : !trend.data?.length ? <EmptyBanner label="No revenue data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Notifications (Clean real state) ───────────────────────────────────────

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="p-8 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto grid place-items-center">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg">All Systems Operational</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          You are all caught up! New orders placed by Vadodara dental clinics and low-stock alerts will appear here in real time.
        </p>
      </Card>
    </div>
  );
}

// ─── Settings ───────────────────────────────────────────────────────────────

function SettingsSection() {
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Shop Settings</h1>
      <Card className="p-6 space-y-4">
        <div><Label className="mb-1.5">Shop Name</Label><Input defaultValue="Darsh Dental Depot" /></div>
        <div><Label className="mb-1.5">Direct Helpline / WhatsApp</Label><Input defaultValue="+91 97270 76119" /></div>
        <div><Label className="mb-1.5">Support Email</Label><Input defaultValue="support@darshdental.com" /></div>
        <div><Label className="mb-1.5">Store Location</Label><Input defaultValue="FF-10/11, Vraj Vihar Complex, Shiyabaug, Vadodara, Gujarat 390001" /></div>
        <div className="flex items-center justify-between pt-2 border-t"><span className="text-sm">Real-time Order Alerts</span><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Low-Stock SMS / WhatsApp Alerts</span><Switch defaultChecked /></div>
        <Button onClick={() => toast.success("Settings saved successfully")}>Save Changes</Button>
      </Card>
    </div>
  );
}
