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

  const razorpayKey =
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    "rzp_test_RvTaFgHR4Y5TPv";

  const rzpOptions = {
    key: razorpayKey,
    amount: Math.round(options.amount * 100), // Amount in paise
    currency: "INR",
    name: "Darsh Dental Depot",
    description: `Order #${options.orderNumber} - Dental Materials & Equipment`,
    image: "https://darsh-dental-depot.gsmit5605.workers.dev/favicon.ico",
    prefill: {
      name: options.customerName || "Doctor",
      email: options.customerEmail || "",
      contact: options.customerPhone || "",
    },
    notes: {
      order_id: options.orderNumber,
      db_order_id: options.dbOrderId,
      platform: "Darsh Dental Depot Vadodara",
    },
    theme: {
      color: "#0284c7", // Primary brand blue
    },
    handler: async function (response: any) {
      if (options.onSuccess) {
        await options.onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
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

  const paymentObject = new (window as any).Razorpay(rzpOptions);
  paymentObject.open();
  return true;
}
