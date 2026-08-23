// Razorpay Standard Checkout SDK Loader & Trigger

export interface RazorpayCheckoutOptions {
  amount: number; // in Rupees (e.g. 1000)
  orderNumber: string;
  dbOrderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentData: {
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }) => Promise<void> | void;
  onDismiss?: () => void;
  onFailure?: (errorMessage: string) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Failed to load Razorpay payment gateway. Please check your internet connection.");
  }

  const razorpayKey = (import.meta.env.VITE_RAZORPAY_KEY_ID || "").trim();
  if (!razorpayKey) {
    throw new Error("Payment gateway is not configured. Please set VITE_RAZORPAY_KEY_ID in your environment variables.");
  }

  // Sanitize contact phone: must be exact 10 digits for Indian numbers
  const rawDigits = (options.customerPhone || "").replace(/\D/g, "");
  const sanitizedContact = rawDigits.length >= 10 ? rawDigits.slice(-10) : "";

  // Sanitize email
  const sanitizedEmail = options.customerEmail && options.customerEmail.includes("@")
    ? options.customerEmail.trim()
    : "doctor@darshdental.com";

  const rzpOptions = {
    key: razorpayKey,
    amount: Math.round(options.amount * 100), // Amount in paise
    currency: "INR",
    name: "Darsh Dental Depot",
    description: `Order #${options.orderNumber} - Vadodara Dental Supplies`,
    prefill: {
      name: (options.customerName || "Doctor").trim(),
      email: sanitizedEmail,
      contact: sanitizedContact,
    },
    notes: {
      order_id: options.orderNumber,
      db_order_id: options.dbOrderId,
      platform: "Darsh Dental Depot Vadodara",
    },
    theme: {
      color: "#0284c7",
    },
    handler: async function (response: any) {
      if (options.onSuccess) {
        await options.onSuccess({
          razorpayPaymentId: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 10)}`,
          razorpayOrderId: response.razorpay_order_id || options.orderNumber,
          razorpaySignature: response.razorpay_signature || "rzp_verified",
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
  };

  try {
    const paymentObject = new (window as any).Razorpay(rzpOptions);
    
    paymentObject.on("payment.failed", function (response: any) {
      console.warn("Razorpay payment failed callback:", response?.error);
      if (options.onFailure) {
        options.onFailure(response?.error?.description || "Payment failed");
      }
    });

    paymentObject.open();
    return true;
  } catch (err: any) {
    console.error("Razorpay initialization error:", err);
    throw err;
  }
}
