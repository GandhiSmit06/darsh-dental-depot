// WhatsApp Integration Helper for Darsh Dental Depot

export interface WhatsAppOrderData {
  orderNumber: string;
  customerName?: string;
  clinicName?: string;
  customerPhone?: string;
  street?: string;
  city?: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const DEPOT_PHONE = "+919727076119";
export const DEPOT_PHONE_CLEAN = "919727076119";

/**
 * Format status for friendly customer display
 */
function formatStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "📋 Order Received & Registered at Depot";
    case "processing":
      return "📦 Packing Supplies at Kevdabaug Depot";
    case "shipped":
      return "🛵 Out for Delivery across Vadodara";
    case "delivered":
      return "✅ Handed Over / Delivered to Clinic";
    case "cancelled":
      return "❌ Order Cancelled";
    default:
      return status;
  }
}

/**
 * Generate formatted WhatsApp dispatch message for doctors/clinics
 */
export function buildDispatchWhatsAppMessage(order: WhatsAppOrderData): string {
  const clinic = order.clinicName || order.customerName || "Doctor";
  const statusLabel = formatStatusLabel(order.status);
  const paymentInfo =
    order.paymentMethod?.toLowerCase() === "cod"
      ? "Pay on Delivery (Cash / Clinic Credit)"
      : `Online Payment (${order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"})`;

  let itemsList = "";
  if (order.items && order.items.length > 0) {
    itemsList = order.items
      .map(
        (it, idx) =>
          `  ${idx + 1}. *${it.name}* (Qty: ${it.quantity}) - ₹${(it.price * it.quantity).toFixed(2)}`
      )
      .join("\n");
  } else {
    itemsList = "  Dental supplies as per order";
  }

  const address = order.street
    ? `${order.street}, ${order.city || "Vadodara"}`
    : "Vadodara Clinic";

  return `🦷 *DARSH DENTAL DEPOT — ORDER UPDATE*
━━━━━━━━━━━━━━━━━━━━
Dear *${clinic}*,

Your dental supply order has an update from our Kevdabaug Depot:

📦 *Order No:* \`${order.orderNumber}\`
🚀 *Current Status:* ${statusLabel}
📍 *Delivery To:* ${address}
💳 *Payment:* ${paymentInfo}

🛍️ *Order Items:*
${itemsList}

💰 *Total Amount:* *₹${order.totalAmount.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━
🚚 *Dispatch Source:*
*Darsh Dental Depot*
Bordi Faliya, B/h Khanderao Market, Shiyabaug, Baroda
📞 *Direct Helpline:* +91 97270 76119 & 91577 16989

_Thank you for choosing Darsh Dental Depot for your dental clinic essentials!_`;
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(phone: string, message: string): void {
  if (typeof window === "undefined") return;

  // Sanitize phone number to standard international format without '+' or spaces
  let cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const encoded = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/${DEPOT_PHONE_CLEAN}?text=${encoded}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open WhatsApp chat for doctor inquiry to depot owner
 */
export function openDoctorSupportWhatsApp(orderNumber?: string, doctorName?: string): void {
  const doc = doctorName ? `Dr. ${doctorName}` : "Doctor";
  const orderRef = orderNumber ? ` regarding Order #${orderNumber}` : "";
  const msg = `Hello Darsh Dental Depot,

I am ${doc} contacting you${orderRef} for supply details & delivery status.

Please assist. Thank you!`;

  openWhatsApp(DEPOT_PHONE_CLEAN, msg);
}
