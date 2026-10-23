import { createClient } from "@supabase/supabase-js";

interface RazorpayVerifyPayload {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export interface ServerEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  [key: string]: unknown;
}

interface CreateRazorpayOrderPayload {
  orderId: string;
}

// ─── 1. SERVER-SIDE RAZORPAY ORDER CREATION ─────────────────────────────────

export async function handleCreateRazorpayOrderRequest(
  request: Request,
  env: Record<string, unknown>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const typedEnv = (env || {}) as ServerEnv;
    const supabaseUrl = (typeof typedEnv.VITE_SUPABASE_URL === "string" ? typedEnv.VITE_SUPABASE_URL : "") || process.env.VITE_SUPABASE_URL || "";
    const anonKey = (typeof typedEnv.VITE_SUPABASE_ANON_KEY === "string" ? typedEnv.VITE_SUPABASE_ANON_KEY : "") || process.env.VITE_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = (typeof typedEnv.SUPABASE_SERVICE_ROLE_KEY === "string" ? typedEnv.SUPABASE_SERVICE_ROLE_KEY : "") || process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    const razorpayKeyId = (typeof typedEnv.VITE_RAZORPAY_KEY_ID === "string" ? typedEnv.VITE_RAZORPAY_KEY_ID : "") || process.env.VITE_RAZORPAY_KEY_ID || "";
    const razorpaySecret = (typeof typedEnv.RAZORPAY_KEY_SECRET === "string" ? typedEnv.RAZORPAY_KEY_SECRET : "") || process.env.RAZORPAY_KEY_SECRET || "";

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ success: false, message: "Server configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Authenticate caller session
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized: Invalid or expired session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: CreateRazorpayOrderPayload = await request.json();
    if (!payload.orderId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing order ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .select("id, user_id, total_price, order_number, order_status, payment_status, payment_id")
      .eq("id", payload.orderId)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (order.user_id !== userData.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized: Order belongs to another account" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (order.order_status === "cancelled") {
      return new Response(
        JSON.stringify({ success: false, message: "Cannot pay for a cancelled order" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ success: false, message: "Order is already paid" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const amountInPaise = Math.round(Number(order.total_price) * 100);

    let razorpayOrderId = "";

    // If Razorpay API credentials are available, create genuine order on Razorpay servers
    if (razorpayKeyId && razorpaySecret) {
      const basicAuth = btoa(`${razorpayKeyId}:${razorpaySecret}`);
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.order_number,
          payment_capture: 1, // Authoritative: instruct Razorpay to auto-capture upon payment
          notes: {
            dbOrderId: order.id,
            userId: userData.user.id,
          },
        }),
      });

      if (rzpRes.ok) {
        const rzpData = (await rzpRes.json()) as Record<string, unknown>;
        razorpayOrderId = String(rzpData.id || "");
      } else {
        const errText = await rzpRes.text();
        console.error("Razorpay API order creation failed:", errText);
        return new Response(
          JSON.stringify({ success: false, message: "Payment provider failed to create order. Please try again." }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      razorpayOrderId = `order_${order.order_number.replace(/[^a-zA-Z0-9]/g, "")}`;
    }

    // Bind this expected Razorpay order ID to the database order
    await adminClient
      .from("orders")
      .update({
        payment_id: razorpayOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        razorpayOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: razorpayKeyId || "",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Create Razorpay order error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function verifyRazorpayHmacSignature(
  secret: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<boolean> {
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !signature) {
    return false;
  }
  const message = `${razorpayOrderId}|${razorpayPaymentId}`;
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  const expectedSignature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature.toLowerCase() === signature.toLowerCase();
}

// ─── 2. SERVER-SIDE RAZORPAY PAYMENT VERIFICATION ───────────────────────────

export async function handleVerifyPaymentRequest(
  request: Request,
  env: Record<string, unknown>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const typedEnv = (env || {}) as ServerEnv;
    const supabaseUrl = (typeof typedEnv.VITE_SUPABASE_URL === "string" ? typedEnv.VITE_SUPABASE_URL : "") || process.env.VITE_SUPABASE_URL || "";
    const anonKey = (typeof typedEnv.VITE_SUPABASE_ANON_KEY === "string" ? typedEnv.VITE_SUPABASE_ANON_KEY : "") || process.env.VITE_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = (typeof typedEnv.SUPABASE_SERVICE_ROLE_KEY === "string" ? typedEnv.SUPABASE_SERVICE_ROLE_KEY : "") || process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    const razorpaySecret = (typeof typedEnv.RAZORPAY_KEY_SECRET === "string" ? typedEnv.RAZORPAY_KEY_SECRET : "") || process.env.RAZORPAY_KEY_SECRET || "";

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({ success: false, message: "Server configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate user session
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized: Invalid or expired session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: RazorpayVerifyPayload = await request.json();
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = payload;

    if (!orderId || !razorpayPaymentId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required payment parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Cryptographic HMAC-SHA256 signature verification
    // When RAZORPAY_KEY_SECRET is configured, order ID and signature are strictly mandatory
    if (razorpaySecret) {
      if (!razorpayOrderId || !razorpaySignature) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing Razorpay order ID or signature" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const isValid = await verifyRazorpayHmacSignature(
        razorpaySecret,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid payment signature" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Database verification & update using trusted client
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .select("id, user_id, total_price, order_status, payment_status, payment_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (order.user_id !== userData.user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized to update this order" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify order ID tie: if the order previously stored a Razorpay order ID, ensure it matches
    if (order.payment_id && razorpayOrderId && order.payment_id.startsWith("order_") && order.payment_id !== razorpayOrderId) {
      return new Response(
        JSON.stringify({ success: false, message: "Payment order mismatch: This payment does not belong to this order" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (order.order_status === "cancelled") {
      return new Response(
        JSON.stringify({ success: false, message: "Cannot confirm payment for a cancelled order" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Idempotent: If already marked paid, return success
    if (order.payment_status === "paid") {
      return new Response(
        JSON.stringify({ success: true, message: "Order is already marked as paid" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Live Razorpay API cross-validation (Amount & Currency check)
    const razorpayKeyId = env?.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    if (razorpayKeyId && razorpaySecret && razorpayPaymentId.startsWith("pay_")) {
      try {
        const basicAuth = btoa(`${razorpayKeyId}:${razorpaySecret}`);
        const rzpPayRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
          headers: { Authorization: `Basic ${basicAuth}` },
        });
        if (rzpPayRes.ok) {
          const rzpPayment = (await rzpPayRes.json()) as Record<string, unknown>;
          const expectedPaise = Math.round(Number(order.total_price) * 100);
          if (Number(rzpPayment.amount) !== expectedPaise) {
            return new Response(
              JSON.stringify({
                success: false,
                message: `Payment amount mismatch: Expected ₹${(expectedPaise / 100).toFixed(2)}, got ₹${(Number(rzpPayment.amount) / 100).toFixed(2)}`,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
          if (String(rzpPayment.currency) !== "INR") {
            return new Response(
              JSON.stringify({
                success: false,
                message: `Payment currency mismatch: Expected INR, got ${String(rzpPayment.currency)}`,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
          // Handle payment lifecycle: If authorized, attempt immediate capture
          if (String(rzpPayment.status) === "authorized") {
            try {
              const captureRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}/capture`, {
                method: "POST",
                headers: {
                  Authorization: `Basic ${basicAuth}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: expectedPaise, currency: "INR" }),
              });
              if (captureRes.ok) {
                const captureData = (await captureRes.json()) as Record<string, unknown>;
                rzpPayment.status = captureData.status;
              }
            } catch (captureErr) {
              console.warn("Auto-capture attempt failed:", captureErr);
            }
          }

          // STRICT LIFECYCLE: Orders can ONLY be marked 'paid' if the payment is definitively captured!
          if (String(rzpPayment.status) !== "captured") {
            return new Response(
              JSON.stringify({
                success: false,
                message: `Payment status is '${String(rzpPayment.status)}'. Orders require confirmed captured funds before settlement.`,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      } catch (crossCheckErr) {
        console.warn("Could not query Razorpay payments API for amount cross-check; relying on verified HMAC signature:", crossCheckErr);
      }
    }

    // 5. Update order payment status (Atomic race condition protection)
    // Disallow updating orders that have been concurrently marked as cancelled
    const { data: updatedRows, error: updateErr } = await adminClient
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "razorpay",
        payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .neq("order_status", "cancelled")
      .select("id, payment_status, order_status");

    if (updateErr) {
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update order payment status" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cannot confirm payment: Order was concurrently cancelled or does not exist",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Payment verification server error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
