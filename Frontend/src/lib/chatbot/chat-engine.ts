// Darsh Dental Depot — Dual AI Chatbot Engine (Gemini 2.5 Flash + Local Smart Engine)
import { DEPOT_KNOWLEDGE } from "./chat-knowledge";
import { buildSystemPrompt, type ChatSessionContext } from "./chat-privacy-guard";
import { openDoctorSupportWhatsApp } from "@/lib/whatsapp";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  cardType?: "product_list" | "order_status" | "invoice_prompt" | "whatsapp_prompt" | "low_stock_list";
  cardData?: any;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Executes a Gemini API request with fallback to Local Smart Matcher
 */
export async function sendChatMessage(
  history: ChatMessage[],
  userPrompt: string,
  context: ChatSessionContext,
  allProducts: any[] = []
): Promise<ChatMessage> {
  const prompt = userPrompt.trim();
  const lower = prompt.toLowerCase();

  // First check if user prompt matches specific interactive intents (for immediate rich card rendering)
  const richCard = evaluateInteractiveCard(lower, context, allProducts);

  let replyText = "";

  // Try Google Gemini API if key is available
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("your_key")) {
    try {
      const systemInstruction = buildSystemPrompt(context);

      // Build conversation contents in Gemini format
      const contents = history.slice(-6).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      // Append current user message
      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch {
      // Graceful fallback to smart local rules
      replyText = "";
    }
  }

  // Fallback to Intelligent Rule Engine if Gemini returned empty
  if (!replyText) {
    replyText = generateSmartRuleReply(lower, context, richCard);
  }

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sender: "bot",
    text: replyText,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    cardType: richCard?.cardType,
    cardData: richCard?.cardData,
  };
}

/**
 * Detects if a prompt should generate interactive in-chat cards (Products, Orders, GST Invoice, WhatsApp)
 */
function evaluateInteractiveCard(
  query: string,
  ctx: ChatSessionContext,
  allProducts: any[]
): { cardType: ChatMessage["cardType"]; cardData: any } | null {
  // 1. Order Tracking Query
  if (
    query.includes("track") ||
    query.includes("where is my order") ||
    query.includes("status of order") ||
    query.includes("order status") ||
    query.includes("delivery")
  ) {
    if (ctx.role === "doctor" && ctx.doctorData?.activeOrder) {
      return {
        cardType: "order_status",
        cardData: ctx.doctorData.activeOrder,
      };
    }
  }

  // 2. Tally GST Invoice Query
  if (
    query.includes("invoice") ||
    query.includes("gst bill") ||
    query.includes("tax bill") ||
    query.includes("download bill") ||
    query.includes("tally")
  ) {
    return {
      cardType: "invoice_prompt",
      cardData: {
        orderId: ctx.doctorData?.activeOrder?.orderId || "Latest Order",
      },
    };
  }

  // 3. WhatsApp Helpline Query
  if (
    query.includes("whatsapp") ||
    query.includes("contact uncle") ||
    query.includes("call depot") ||
    query.includes("phone number") ||
    query.includes("helpline")
  ) {
    return {
      cardType: "whatsapp_prompt",
      cardData: {
        phone: DEPOT_KNOWLEDGE.business.phoneNumbers[0],
        name: DEPOT_KNOWLEDGE.business.proprietors,
      },
    };
  }

  // 4. Low Stock Query (Shop Owner)
  if (
    (ctx.role === "shop_owner" || ctx.role === "admin") &&
    (query.includes("low stock") || query.includes("out of stock") || query.includes("inventory alert"))
  ) {
    const lowStockItems = allProducts.filter((p) => (p.stock || 0) <= 5).slice(0, 4);
    return {
      cardType: "low_stock_list",
      cardData: lowStockItems,
    };
  }

  // 5. Product Search Matcher
  const productsToSearch = allProducts.length > 0 ? allProducts : DEPOT_KNOWLEDGE.featuredProducts;
  const matched = productsToSearch.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();

    const terms = query.split(" ").filter((w) => w.length > 2);
    return terms.some((t) => name.includes(t) || brand.includes(t) || cat.includes(t));
  });

  if (matched.length > 0 && (query.includes("price") || query.includes("find") || query.includes("buy") || query.includes("show") || query.includes("burs") || query.includes("composite") || query.includes("gold label") || query.includes("cement") || query.includes("mani") || query.includes("fuji") || query.includes("progel") || query.includes("tetric") || query.includes("gdc"))) {
    return {
      cardType: "product_list",
      cardData: matched.slice(0, 3),
    };
  }

  return null;
}

/**
 * Intelligent Rule-Based Fallback Generator
 */
function generateSmartRuleReply(
  query: string,
  ctx: ChatSessionContext,
  richCard: { cardType: ChatMessage["cardType"]; cardData: any } | null
): string {
  // Order Tracking
  if (richCard?.cardType === "order_status") {
    const ao = ctx.doctorData?.activeOrder;
    return `📦 **Order Status Update**: Your order **#${ao?.orderId}** is currently **${ao?.status.toUpperCase()}** (${ao?.itemCount} items, Total: ₹${ao?.total.toFixed(2)}). See the live progress tracker below!`;
  }

  // Invoice Query
  if (richCard?.cardType === "invoice_prompt") {
    return `📄 **Tally ERP GST Invoice**: You can download or print your official computer-generated GST tax invoice with full HSN breakdown (5%/12%/18%) directly using the button below.`;
  }

  // WhatsApp Query
  if (richCard?.cardType === "whatsapp_prompt") {
    return `💬 **Direct Depot Helpline**: You can chat directly with **Hetal Uncle / Smit Gandhi** on WhatsApp at **+91 97270 76119** for urgent clinic orders or price inquiries.`;
  }

  // Product List Match
  if (richCard?.cardType === "product_list") {
    return `🦷 Here are the top dental materials matching your search from our Vadodara depot catalog. You can add them directly to your cart below:`;
  }

  // Low stock (Shop Owner)
  if (richCard?.cardType === "low_stock_list") {
    return `⚠️ **Depot Inventory Alert**: Here are the products running low in stock at the depot that need to be reordered:`;
  }

  // Depot timings & Location
  if (query.includes("where") || query.includes("location") || query.includes("address") || query.includes("timing") || query.includes("time")) {
    return `📍 **Darsh Dental Depot Location & Timings**:\n• **Address**: ${DEPOT_KNOWLEDGE.business.address} (Near Khanderao Market / Vraj Vihar Complex, Siyabaug, Vadodara).\n• **Working Hours**: ${DEPOT_KNOWLEDGE.business.workingHours}.\n• **Express Delivery**: Same-day dispatch across all Vadodara dental clinics!`;
  }

  // Payment Options
  if (query.includes("payment") || query.includes("cod") || query.includes("upi") || query.includes("razorpay") || query.includes("pay")) {
    return `💳 **Accepted Payment Methods**:\n1. **Pay on Delivery (COD)**: Cash or clinic cheque upon delivery.\n2. **Razorpay Online**: Instant UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.\nEvery order includes a verified GST Tax Invoice.`;
  }

  // Default helpful response based on user role
  if (ctx.role === "doctor") {
    return `Hello Dr. ${ctx.doctorData?.fullName || "Doctor"}! 👋 I am your Darsh Dental Depot assistant. How can I assist your clinic today? You can search dental materials, check your active order status, download GST bills, or inquire on WhatsApp.`;
  }

  if (ctx.role === "shop_owner" || ctx.role === "admin") {
    return `Namaste Hetal Uncle / Smit! 🏪 I am ready to help manage depot operations. You can check low stock alerts, view pending dispatches, or generate WhatsApp alerts for doctors.`;
  }

  return `Welcome to **Darsh Dental Depot**! 🦷 We supply authentic dental materials (Mani Burs, GC Gold Label, Ivoclar Composites, Endo files) with same-day express clinic delivery across Vadodara. How can I help you today?`;
}
