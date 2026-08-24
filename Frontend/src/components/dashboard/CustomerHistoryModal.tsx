import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  Search,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Receipt,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  shopApi,
  type CustomerHistoryData,
  type CustomerOrderTransaction,
} from "@/lib/api";
import { toast } from "sonner";

interface CustomerHistoryModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerHistoryModal({
  customerId,
  isOpen,
  onClose,
}: CustomerHistoryModalProps) {
  const [data, setData] = useState<CustomerHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ledger" | "analytics" | "profile">("ledger");

  // Ledger filters
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Analytics Year filter
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    if (!customerId || !isOpen) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    shopApi
      .getCustomerHistory(customerId)
      .then((res) => {
        setData(res.data);
        // Expand first order by default
        if (res.data.transactions?.length > 0) {
          setExpandedOrders({ [res.data.transactions[0].id]: true });
        }
      })
      .catch((err: any) => {
        console.error("Failed to load customer history:", err);
        setError(err.message || "Failed to load customer history");
        toast.error("Failed to load customer history");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customerId, isOpen]);

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered transactions for the ledger
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter((t) => {
      // Search
      if (ledgerSearch) {
        const s = ledgerSearch.toLowerCase();
        const matchesId = t.orderId.toLowerCase().includes(s);
        const matchesPayId = t.paymentId?.toLowerCase().includes(s);
        const matchesItem = t.items.some((i) => i.name.toLowerCase().includes(s));
        if (!matchesId && !matchesPayId && !matchesItem) return false;
      }
      // Status filter
      if (statusFilter !== "all" && t.orderStatus.toLowerCase() !== statusFilter) {
        return false;
      }
      // Payment filter
      if (paymentFilter !== "all") {
        if (paymentFilter === "razorpay" && t.paymentMethod.toLowerCase() !== "razorpay") return false;
        if (paymentFilter === "cod" && t.paymentMethod.toLowerCase() !== "cod") return false;
        if (paymentFilter === "paid" && t.paymentStatus.toLowerCase() !== "paid") return false;
        if (paymentFilter === "pending" && t.paymentStatus.toLowerCase() !== "pending") return false;
      }
      return true;
    });
  }, [data?.transactions, ledgerSearch, statusFilter, paymentFilter]);

  // Analytics monthly chart data
  const chartData = useMemo(() => {
    if (!data?.monthlyTimeline) return [];
    let timeline = [...data.monthlyTimeline];
    if (selectedYear !== "all") {
      timeline = timeline.filter((m) => m.year.toString() === selectedYear);
    }
    return timeline
      .slice()
      .reverse()
      .map((m) => ({
        month: m.label,
        sales: m.totalSpent,
        orders: m.ordersCount,
      }));
  }, [data?.monthlyTimeline, selectedYear]);

  // Available years for dropdown
  const availableYears = useMemo(() => {
    if (!data?.yearlyBreakdown) return [];
    return data.yearlyBreakdown.map((y) => y.year.toString());
  }, [data?.yearlyBreakdown]);

  const cleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9]/g, "");
  };

  const handlePrintOrder = (order: CustomerOrderTransaction) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print invoices");
      return;
    }

    const itemsHtml = order.items
      .map(
        (i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${i.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${i.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${i.total.toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; color: #0f172a; margin: 30px; font-size: 13px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
          .logo-title { font-size: 20px; font-weight: 800; color: #0284c7; }
          .depot-sub { font-size: 10px; font-weight: bold; color: #64748b; letter-spacing: 1px; }
          .invoice-tag { font-size: 22px; font-weight: 800; color: #0f172a; text-align: right; }
          .section-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .box { width: 48%; }
          .box-title { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f8fafc; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .totals { margin-top: 20px; width: 280px; margin-left: auto; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .grand-total { font-size: 16px; font-weight: 800; color: #0284c7; border-top: 2px solid #0284c7; padding-top: 8px; margin-top: 5px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
          @media print { button { display: none; } body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-title">DARSH DENTAL DEPOT</div>
            <div class="depot-sub">AUTHORIZED DENTAL IMPORTERS & SUPPLIERS • VADODARA</div>
            <div style="margin-top: 5px; font-size: 11px; color: #475569;">
              FF-10/11, Vraj Vihar Complex, Shiyabaug, Vadodara, Gujarat 390001<br/>
              Phone: +91 97270 76119 | Email: info@darshdental.com
            </div>
          </div>
          <div>
            <div class="invoice-tag">TAX INVOICE</div>
            <div style="font-family: monospace; font-weight: bold; color: #0284c7; text-align: right;">${order.orderId}</div>
            <div style="font-size: 11px; color: #64748b; text-align: right; margin-top: 3px;">Date: ${order.date}</div>
            <div style="text-align: right; margin-top: 5px;"><span class="badge">${order.paymentStatus.toUpperCase()} • ${order.paymentMethod.toUpperCase()}</span></div>
          </div>
        </div>

        <div class="section-grid">
          <div class="box">
            <div class="box-title">Billed To (Doctor / Clinic):</div>
            <div style="font-weight: bold; font-size: 14px;">${data?.profile.name || "Doctor"}</div>
            <div style="font-weight: 600; color: #0284c7;">${data?.profile.clinicName || ""}</div>
            <div style="margin-top: 3px; color: #475569;">${data?.profile.address || order.shippingAddress?.street || "Vadodara, Gujarat"}</div>
            <div style="margin-top: 3px; color: #475569;">Phone: ${data?.profile.phone || order.shippingAddress?.contactPhone || "—"}</div>
            <div style="color: #475569;">Email: ${data?.profile.email || "—"}</div>
          </div>
          <div class="box" style="text-align: right;">
            <div class="box-title">Payment & Dispatch Info:</div>
            <div>Payment Gateway: <strong>${order.paymentMethod === "razorpay" ? "Razorpay Online" : "Pay on Delivery (COD)"}</strong></div>
            ${order.paymentId ? `<div>Transaction ID: <span style="font-family: monospace;">${order.paymentId}</span></div>` : ""}
            <div>Dispatch Status: <strong>${order.orderStatus.toUpperCase()}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>GST (Included 18%):</span>
            <span>₹${order.taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>₹${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
          Thank you for choosing Darsh Dental Depot Vadodara for your dental clinic supplies.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleShareWhatsApp = (order: CustomerOrderTransaction) => {
    if (!data?.profile.phone) {
      toast.error("Doctor's phone number is missing");
      return;
    }
    const phone = cleanPhone(data.profile.phone);
    const text = encodeURIComponent(
      `Hello Dr. ${data.profile.name},\n\nHere is your receipt from *Darsh Dental Depot Vadodara* for Order *#${order.orderId}*:\n\n• Date: ${order.date}\n• Items: ${order.items.length} item(s)\n• Total Amount: ₹${order.totalPrice.toFixed(2)}\n• Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})\n• Status: ${order.orderStatus.toUpperCase()}\n\nThank you for your trusted partnership! Call +91 97270 76119 for any inquiries.`
    );
    window.open(`https://wa.me/91${phone.replace(/^91/, "")}?text=${text}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-3xl border border-border/80 shadow-2xl bg-background/95 backdrop-blur-xl">
        {/* Dialog Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-indigo-600 text-white grid place-items-center font-extrabold text-lg shadow-md shrink-0">
                {data?.profile.name ? data.profile.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold font-heading text-foreground flex items-center gap-2">
                  <span>{data?.profile.name || "Doctor Details"}</span>
                  {data?.profile.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" title="Verified Vadodara Clinic" />
                  )}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                  {data?.profile.clinicName && (
                    <span className="font-semibold text-primary flex items-center gap-1">
                      <Building className="h-3 w-3" /> {data.profile.clinicName}
                    </span>
                  )}
                  {data?.profile.memberSince && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      • Member Since: <strong className="text-foreground">{data.profile.memberSince}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact Action Pills */}
            {data?.profile && (
              <div className="flex items-center gap-2 flex-wrap">
                {data.profile.phone && (
                  <a
                    href={`https://wa.me/91${cleanPhone(data.profile.phone).replace(/^91/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                {data.profile.phone && (
                  <a
                    href={`tel:${data.profile.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                )}
                {data.profile.email && (
                  <a
                    href={`mailto:${data.profile.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading full customer purchase history...</span>
            </div>
          ) : error || !data ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
              <p className="font-semibold text-foreground">Could not load customer purchase history</p>
              <p className="text-xs">{error || "Please try again later"}</p>
            </div>
          ) : (
            <>
              {/* Lifetime KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <Card className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Lifetime Spend (LTV)</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-foreground mt-1.5">
                    ₹{data.lifetimeStats.ltv.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Across {data.lifetimeStats.totalOrders} order{data.lifetimeStats.totalOrders !== 1 ? "s" : ""}
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Total Orders Placed</span>
                    <ShoppingBag className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-foreground mt-1.5">
                    {data.lifetimeStats.totalOrders}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {data.lifetimeStats.completedOrders} Delivered • {data.lifetimeStats.pendingOrders} Active
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Average Order Value</span>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold font-heading text-foreground mt-1.5">
                    ₹{data.lifetimeStats.aov.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Per transaction average
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Last Purchase</span>
                    <Calendar className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-base font-bold text-foreground mt-2 truncate">
                    {data.lifetimeStats.lastOrderDate || "No orders yet"}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 capitalize truncate">
                    {data.lifetimeStats.preferredPaymentMethod
                      ? `Preferred: ${data.lifetimeStats.preferredPaymentMethod}`
                      : "Account Active"}
                  </div>
                </Card>
              </div>

              {/* Navigation Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(val: any) => setActiveTab(val)}
                className="w-full space-y-4"
              >
                <TabsList className="grid grid-cols-3 w-full bg-secondary/60 p-1 rounded-2xl border border-border/50">
                  <TabsTrigger
                    value="ledger"
                    className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                  >
                    <Receipt className="h-3.5 w-3.5" /> Order History Ledger ({data.transactions.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                  >
                    <TrendingUp className="h-3.5 w-3.5" /> Monthly & Yearly Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                  >
                    <Building className="h-3.5 w-3.5" /> Clinic Profile
                  </TabsTrigger>
                </TabsList>

                {/* ── TAB 1: Complete Order History Ledger ── */}
                <TabsContent value="ledger" className="space-y-4 focus:outline-none">
                  {/* Filters & Search Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-border/60">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        placeholder="Search by Order ID, item name, or payment ID..."
                        className="pl-8.5 text-xs h-9 rounded-xl bg-background border-border/60"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-32 text-xs font-semibold rounded-xl bg-background border-border/60">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="h-9 w-34 text-xs font-semibold rounded-xl bg-background border-border/60">
                          <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="razorpay">⚡ Razorpay Online</SelectItem>
                          <SelectItem value="cod">💵 Pay on Delivery</SelectItem>
                          <SelectItem value="paid">✅ Paid</SelectItem>
                          <SelectItem value="pending">🟡 Payment Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Transactions Feed */}
                  {filteredTransactions.length === 0 ? (
                    <Card className="p-12 text-center space-y-3 rounded-3xl border-dashed">
                      <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground mx-auto grid place-items-center">
                        <ShoppingBag className="h-6 w-6 opacity-60" />
                      </div>
                      <h4 className="font-bold text-base">No Orders Found</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {ledgerSearch || statusFilter !== "all" || paymentFilter !== "all"
                          ? "No transactions match your current search and filter criteria."
                          : "This doctor has not placed any orders yet from account inception."}
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filteredTransactions.map((order) => {
                        const isExpanded = !!expandedOrders[order.id];
                        return (
                          <Card
                            key={order.id}
                            className="rounded-2xl border border-border/70 overflow-hidden shadow-xs hover:border-primary/40 transition-all bg-card"
                          >
                            {/* Order Bar Header */}
                            <div
                              onClick={() => toggleOrderExpand(order.id)}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/20 transition-colors select-none"
                            >
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 font-mono text-xs font-bold">
                                  <Package className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-extrabold text-sm text-primary">
                                      {order.orderId}
                                    </span>
                                    {order.orderStatus === "delivered" ? (
                                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Delivered
                                      </Badge>
                                    ) : order.orderStatus === "cancelled" ? (
                                      <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                        <XCircle className="h-3 w-3 mr-1" /> Cancelled
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold capitalize">
                                        <Clock className="h-3 w-3 mr-1" /> {order.orderStatus}
                                      </Badge>
                                    )}
                                    <span className="text-[11px] text-muted-foreground">
                                      {order.date}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                    <span>
                                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                    </span>
                                    <span>•</span>
                                    {order.paymentMethod === "razorpay" ? (
                                      <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                                        <CreditCard className="h-3 w-3" /> Razorpay Online
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <Banknote className="h-3 w-3" /> Pay on Delivery (COD)
                                      </span>
                                    )}
                                    <span>•</span>
                                    <span
                                      className={
                                        order.paymentStatus === "paid"
                                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                          : "text-amber-600 dark:text-amber-400 font-bold"
                                      }
                                    >
                                      {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <div className="text-right">
                                  <div className="font-extrabold text-base text-foreground font-heading">
                                    ₹{order.totalPrice.toFixed(2)}
                                  </div>
                                  {order.taxAmount > 0 && (
                                    <div className="text-[10px] text-muted-foreground">
                                      Incl. ₹{order.taxAmount.toFixed(2)} GST
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-muted-foreground"
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            {/* Collapsible Order Items & Details */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/10 space-y-4">
                                {/* Line Items Table */}
                                <div className="space-y-2">
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Items Purchased in this Order:
                                  </div>
                                  <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/50">
                                        <tr>
                                          <th className="py-2.5 px-3">Product</th>
                                          <th className="py-2.5 px-3 text-center">Qty</th>
                                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                                          <th className="py-2.5 px-3 text-right">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/40">
                                        {order.items.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-muted/20">
                                            <td className="py-2.5 px-3">
                                              <div className="flex items-center gap-2.5">
                                                {item.image ? (
                                                  <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-8 w-8 rounded-lg object-cover border shrink-0"
                                                  />
                                                ) : (
                                                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                                                    <Package className="h-4 w-4" />
                                                  </div>
                                                )}
                                                <span className="font-semibold text-foreground">
                                                  {item.name}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-bold font-mono">
                                              {item.quantity}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-muted-foreground">
                                              ₹{item.price.toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-extrabold text-foreground font-mono">
                                              ₹{item.total.toFixed(2)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Address & Payment ID info bar */}
                                <div className="grid sm:grid-cols-2 gap-3 text-xs bg-background/80 p-3 rounded-xl border border-border/50">
                                  <div>
                                    <span className="font-bold text-muted-foreground block mb-0.5">
                                      📍 Delivery Destination:
                                    </span>
                                    <p className="text-foreground">
                                      {order.shippingAddress?.street || data?.profile.address || "Vadodara Clinic Dispatch"}
                                    </p>
                                    {order.notes && (
                                      <p className="text-muted-foreground mt-1 italic">
                                        Note: "{order.notes}"
                                      </p>
                                    )}
                                  </div>
                                  <div className="sm:text-right space-y-1">
                                    {order.paymentId && (
                                      <div>
                                        <span className="text-muted-foreground font-medium">Payment ID: </span>
                                        <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">
                                          {order.paymentId}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-muted-foreground">
                                      Subtotal: <strong>₹{order.subtotal.toFixed(2)}</strong> + GST:{" "}
                                      <strong>₹{order.taxAmount.toFixed(2)}</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleShareWhatsApp(order)}
                                    className="rounded-xl text-xs h-8 gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                                  >
                                    <Share2 className="h-3.5 w-3.5" /> WhatsApp Receipt
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePrintOrder(order)}
                                    className="rounded-xl text-xs h-8 gap-1 bg-primary text-white hover:bg-primary/90"
                                  >
                                    <Printer className="h-3.5 w-3.5" /> Print Tax Invoice
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* ── TAB 2: Month-by-Month & Year-by-Year Spending Analytics ── */}
                <TabsContent value="analytics" className="space-y-5 focus:outline-none">
                  {/* Filter Year Header */}
                  <div className="flex items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/70">
                    <div>
                      <h3 className="font-bold text-sm font-heading">
                        Purchase Trends & Spending Timeline
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Chronological monthly breakdown of orders placed by this doctor
                      </p>
                    </div>
                    {availableYears.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Filter Year:</span>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="h-8 w-28 text-xs font-bold rounded-xl bg-background">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Monthly Spending Trend Bar Chart */}
                  {chartData.length > 0 ? (
                    <Card className="p-5 rounded-2xl border border-border shadow-xs">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        Monthly Spending Volume (₹ INR)
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v) => `₹${v}`}
                            />
                            <Tooltip
                              formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Total Spent"]}
                              labelFormatter={(label) => `Period: ${label}`}
                              contentStyle={{
                                background: "var(--color-card)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "12px",
                                fontSize: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="sales"
                              fill="var(--color-primary)"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={48}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-8 text-center text-xs text-muted-foreground">
                      No purchase volume recorded yet.
                    </Card>
                  )}

                  {/* Month-by-Month Detailed Item Breakdown Cards */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Monthly Products Breakdown:
                    </div>
                    {data.monthlyTimeline.length === 0 ? (
                      <Card className="p-8 text-center text-xs text-muted-foreground">
                        No monthly purchase records found.
                      </Card>
                    ) : (
                      data.monthlyTimeline
                        .filter((m) => selectedYear === "all" || m.year.toString() === selectedYear)
                        .map((m, idx) => (
                          <Card
                            key={idx}
                            className="p-4 rounded-2xl border border-border/70 space-y-3 bg-card"
                          >
                            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center font-bold text-xs">
                                  <Calendar className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-extrabold text-sm text-foreground">
                                  {m.label}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  {m.ordersCount} Order{m.ordersCount !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="font-extrabold text-sm text-primary font-heading">
                                ₹{m.totalSpent.toFixed(2)}
                              </div>
                            </div>

                            {/* Products Bought in this specific month */}
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Items Purchased This Month:
                              </div>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {m.itemsPurchased.map((item, iIdx) => (
                                  <div
                                    key={iIdx}
                                    className="p-2.5 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between text-xs"
                                  >
                                    <span className="font-semibold text-foreground truncate pr-2">
                                      {item.name}
                                    </span>
                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-primary font-mono">
                                        Qty: {item.quantity}
                                      </span>
                                      <span className="text-[11px] text-muted-foreground ml-1.5">
                                        (₹{item.total.toFixed(2)})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>

                {/* ── TAB 3: Clinic & Doctor Full Profile ── */}
                <TabsContent value="profile" className="space-y-4 focus:outline-none">
                  <Card className="p-6 rounded-2xl border border-border/70 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Doctor Full Name
                          </label>
                          <div className="text-base font-bold text-foreground mt-0.5">
                            {data.profile.name}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Clinic / Practice Name
                          </label>
                          <div className="text-sm font-semibold text-primary mt-0.5">
                            {data.profile.clinicName || "Private Dental Practice"}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Medical Registration Number
                          </label>
                          <div className="text-sm font-mono font-medium text-foreground mt-0.5">
                            {data.profile.medicalRegistrationNumber || "Verified Vadodara Dentist"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Contact Phone
                          </label>
                          <div className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-2">
                            <span>{data.profile.phone || "—"}</span>
                            {data.profile.phone && (
                              <a
                                href={`tel:${data.profile.phone}`}
                                className="text-xs text-primary font-bold hover:underline"
                              >
                                Call
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Email Address
                          </label>
                          <div className="text-sm font-medium text-foreground mt-0.5">
                            {data.profile.email || "—"}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Clinic Physical Address
                          </label>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {data.profile.address || "Vadodara, Gujarat"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between flex-wrap gap-3">
                      <div className="text-xs text-muted-foreground">
                        Account Created: <strong className="text-foreground">{data.profile.memberSince}</strong>
                      </div>
                      {data.profile.phone && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const phone = cleanPhone(data.profile.phone);
                            const text = encodeURIComponent(
                              `Hello Dr. ${data.profile.name}, this is Darsh Dental Depot Vadodara. How can we assist your clinic with dental supplies today?`
                            );
                            window.open(
                              `https://wa.me/91${phone.replace(/^91/, "")}?text=${text}`,
                              "_blank"
                            );
                          }}
                          className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <MessageSquare className="h-4 w-4" /> Message Doctor on WhatsApp
                        </Button>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerHistoryModal;
