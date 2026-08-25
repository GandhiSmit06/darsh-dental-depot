import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  Minimize2,
  FileText,
  Phone,
  Package,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { doctorApi, shopApi, productsApi } from "@/lib/api";
import { sendChatMessage, type ChatMessage } from "@/lib/chatbot/chat-engine";
import { type ChatSessionContext } from "@/lib/chatbot/chat-privacy-guard";
import { ChatProductCard } from "./ChatProductCard";
import { ChatOrderCard } from "./ChatOrderCard";
import { ChatQuickChips } from "./ChatQuickChips";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import type { InvoiceOrderData } from "@/components/invoice/TallyGstInvoice";
import { openDoctorSupportWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

export function DentalAiChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeOrderData, setActiveOrderData] = useState<any | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<InvoiceOrderData | null>(null);

  // User role
  const role: "doctor" | "shop_owner" | "admin" | "visitor" =
    user?.role === "doctor"
      ? "doctor"
      : user?.role === "shop_owner"
      ? "shop_owner"
      : user?.role === "admin"
      ? "admin"
      : "visitor";

  // Initial welcome greeting
  const initialGreeting =
    role === "doctor"
      ? `Hello Dr. ${user?.fullName || "Doctor"}! 👋 I am your Darsh Dental Depot AI assistant. I can help you find dental materials, track your active orders, or download your Tally GST Tax Invoices.`
      : role === "shop_owner" || role === "admin"
      ? `Namaste Hetal Uncle / Smit! 🏪 I am ready to assist with depot operations, pending dispatches, and inventory alerts.`
      : `Welcome to **Darsh Dental Depot**! 🦷 We supply authentic dental materials with same-day express clinic delivery across Vadodara. How can I help you today?`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: initialGreeting,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch contextual user data on mount / role change
  useEffect(() => {
    // 1. Fetch active products for catalog search
    productsApi
      .getProducts()
      .then((res: any) => {
        if (res.data) setCatalogProducts(res.data);
      })
      .catch(() => {});

    // 2. If Doctor: Fetch active order
    if (role === "doctor" && user) {
      doctorApi
        .getActiveOrder()
        .then((res) => {
          if (res.data) setActiveOrderData(res.data);
        })
        .catch(() => {});
    }

    // 3. If Shop Owner / Admin: Fetch pending orders and low stock
    if ((role === "shop_owner" || role === "admin") && user) {
      shopApi
        .getOrders()
        .then((res) => {
          if (res.data) {
            const pending = res.data.filter(
              (o) => o.status?.toLowerCase() === "pending" || o.status?.toLowerCase() === "processing"
            );
            setPendingOrdersCount(pending.length);
          }
        })
        .catch(() => {});
    }
  }, [role, user]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Construct current session context for privacy guard
  const getSessionContext = (): ChatSessionContext => {
    return {
      user,
      role,
      doctorData:
        role === "doctor"
          ? {
              fullName: user?.fullName || "Doctor",
              clinicName: user?.clinicName,
              phone: user?.phone,
              activeOrder: activeOrderData
                ? {
                    orderId: activeOrderData.orderId,
                    itemCount: activeOrderData.itemCount || 1,
                    total: activeOrderData.total || 0,
                    status: activeOrderData.status || "pending",
                    date: activeOrderData.date || "Today",
                    items: activeOrderData.products,
                  }
                : null,
            }
          : undefined,
      shopData:
        role === "shop_owner" || role === "admin"
          ? {
              pendingOrderCount: pendingOrdersCount,
              lowStockCount: lowStockCount,
              totalProducts: catalogProducts.length,
            }
          : undefined,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const sessionCtx = getSessionContext();
      const botReply = await sendChatMessage(messages, text, sessionCtx, catalogProducts);
      setMessages((prev) => [...prev, botReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "I am ready to assist. Please try asking again or contact our depot directly on WhatsApp at +91 97270 76119.",
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTallyInvoice = (orderObj?: any) => {
    const orderToUse = orderObj || activeOrderData;
    if (!orderToUse) {
      toast.error("No active order available to generate invoice");
      return;
    }

    const items = (orderToUse.products || orderToUse.items || []).map((it: any) => ({
      name: it.name || "Dental Product",
      brand: it.brand || "Darsh Dental Depot",
      hsn: it.hsn || "90184900",
      gstRate: it.gstRate || 5,
      mrp: Number(it.price || orderToUse.total || 0),
      quantity: Number(it.quantity || 1),
      sellingPrice: Number(it.price || orderToUse.total || 0),
      unit: "PCS",
    }));

    const invoiceData: InvoiceOrderData = {
      orderNumber: orderToUse.orderId || "ORD-2674",
      invoiceNumber: `700/25-26`,
      invoiceDate: new Date().toISOString(),
      totalAmount: Number(orderToUse.total || 500),
      paymentMethod: orderToUse.paymentMethod || "cod",
      paymentStatus: orderToUse.paymentStatus || "paid",
      customer: {
        fullName: user?.fullName || "Doctor",
        clinicName: user?.clinicName || "Dental Clinic",
        phone: user?.phone,
        email: user?.email,
        address: {
          street: "Vadodara Clinic Lane",
          city: "Vadodara",
          state: "Gujarat",
          pincode: "390001",
        },
      },
      items: items.length > 0 ? items : [
        {
          name: "Dental Clinic Supplies",
          brand: "Darsh Dental Depot",
          hsn: "90184900",
          gstRate: 5,
          quantity: 1,
          sellingPrice: Number(orderToUse.total || 500),
          unit: "PCS",
        }
      ],
    };

    setSelectedInvoiceOrder(invoiceData);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: "bot",
        text: initialGreeting,
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* ── Floating Glowing Trigger Button ── */}
      <div className="fixed bottom-5 right-5 z-50 print:hidden flex flex-col items-end">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary via-sky-600 to-primary bg-[length:200%_auto] hover:bg-[position:right_center] text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
          >
            <div className="relative">
              <Bot className="h-5 w-5 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-black tracking-wide">Darsh AI Assistant</div>
              <div className="text-[10px] text-white/80 font-medium">Dental & Orders Help</div>
            </div>
          </button>
        )}

        {/* ── Chatbot Window Popup ── */}
        {isOpen && (
          <div className="w-[360px] sm:w-[410px] h-[580px] max-h-[85vh] bg-background/98 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-primary via-sky-600 to-primary text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 grid place-items-center text-white shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold flex items-center gap-1.5 leading-tight">
                    Darsh Dental AI
                    <Badge variant="secondary" className="bg-white/20 text-white text-[9px] px-1.5 py-0 h-4 border-0">
                      ⚡ Gemini 2.5
                    </Badge>
                  </div>
                  <div className="text-[10.5px] text-white/80 font-medium">
                    {role === "doctor"
                      ? `Doctor Assistant • Dr. ${user?.fullName || "Clinic"}`
                      : role === "shop_owner"
                      ? "Depot Operations • Shop Owner"
                      : role === "admin"
                      ? "Administrator Console"
                      : "Darsh Dental Depot • Vadodara"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="h-7 w-7 rounded-lg hover:bg-white/20 text-white grid place-items-center transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="h-7 w-7 rounded-lg hover:bg-white/20 text-white grid place-items-center transition-colors"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    {isBot && (
                      <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary border border-primary/20 grid place-items-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2 ${isBot ? "items-start" : "items-end"}`}>
                      {/* Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed ${
                          isBot
                            ? "bg-muted/70 text-foreground border border-border/60 rounded-tl-xs shadow-2xs"
                            : "bg-primary text-primary-foreground rounded-tr-xs shadow-xs font-medium"
                        }`}
                      >
                        <div className="whitespace-pre-line break-words text-[11.5px]">{m.text}</div>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isBot ? "text-muted-foreground" : "text-primary-foreground/70"
                          }`}
                        >
                          {m.timestamp}
                        </div>
                      </div>

                      {/* In-Chat Interactive Action Cards */}
                      {m.cardType === "product_list" && m.cardData && (
                        <div className="space-y-1.5 pt-1 w-full">
                          {m.cardData.map((p: any, idx: number) => (
                            <ChatProductCard key={idx} product={p} />
                          ))}
                        </div>
                      )}

                      {m.cardType === "order_status" && m.cardData && (
                        <div className="pt-1 w-full">
                          <ChatOrderCard order={m.cardData} onOpenInvoice={handleOpenTallyInvoice} />
                        </div>
                      )}

                      {m.cardType === "invoice_prompt" && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleOpenTallyInvoice()}
                            className="text-xs h-8 font-bold bg-primary hover:bg-primary/90 text-white rounded-xl gap-1.5 shadow-xs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Open Tally GST Bill (PDF)
                          </Button>
                        </div>
                      )}

                      {m.cardType === "whatsapp_prompt" && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            onClick={() => openDoctorSupportWhatsApp("Urgent Inquiry", user?.fullName)}
                            className="text-xs h-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 shadow-xs"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            WhatsApp +91 97270 76119
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isBot && (
                      <div className="h-7 w-7 rounded-xl bg-primary text-white grid place-items-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {user?.fullName ? user.fullName[0].toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Bot className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="p-2.5 rounded-2xl bg-muted/60 text-muted-foreground italic flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    Thinking with Gemini...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Role-Aware Quick Suggestion Chips */}
            <div className="border-t border-border/50 bg-muted/20">
              <ChatQuickChips role={role} onSelect={(prompt) => handleSendMessage(prompt)} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 border-t border-border/80 bg-background flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  role === "doctor"
                    ? "Ask about burs, composites, active order..."
                    : role === "shop_owner"
                    ? "Ask about low stock, dispatches..."
                    : "Ask about dental materials, clinic registration..."
                }
                className="h-10 text-xs rounded-xl bg-muted/50 focus-visible:ring-1"
                disabled={loading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || loading}
                className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-white shrink-0 shadow-xs"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Tally ERP GST Tax Invoice Viewer Dialog */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        orderData={selectedInvoiceOrder}
      />
    </>
  );
}
