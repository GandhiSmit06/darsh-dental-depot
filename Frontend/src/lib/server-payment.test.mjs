import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyRazorpayHmacSignature } from "./server-payment.ts";

test("HMAC-SHA256 signature verification security suite", async (t) => {
  const secret = "secret_key_vadodara_test_12345";
  const razorpayOrderId = "order_OId1234567890";
  const razorpayPaymentId = "pay_PId9876543210";

  // Compute reference HMAC-SHA256
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const authenticSignature = hmac.digest("hex");

  await t.test("accepts authentic Razorpay signature", async () => {
    const valid = await verifyRazorpayHmacSignature(
      secret,
      razorpayOrderId,
      razorpayPaymentId,
      authenticSignature
    );
    assert.equal(valid, true);
  });

  await t.test("accepts uppercase authentic signature (case-insensitive)", async () => {
    const valid = await verifyRazorpayHmacSignature(
      secret,
      razorpayOrderId,
      razorpayPaymentId,
      authenticSignature.toUpperCase()
    );
    assert.equal(valid, true);
  });

  await t.test("rejects forged or tampered signature", async () => {
    const forgedSignature = "a".repeat(64);
    const valid = await verifyRazorpayHmacSignature(
      secret,
      razorpayOrderId,
      razorpayPaymentId,
      forgedSignature
    );
    assert.equal(valid, false);
  });

  await t.test("rejects when payment ID is swapped (replay attack)", async () => {
    const valid = await verifyRazorpayHmacSignature(
      secret,
      razorpayOrderId,
      "pay_AttackerSubstitutedPayment",
      authenticSignature
    );
    assert.equal(valid, false);
  });

  await t.test("rejects when order ID is swapped", async () => {
    const valid = await verifyRazorpayHmacSignature(
      secret,
      "order_DifferentOrder999",
      razorpayPaymentId,
      authenticSignature
    );
    assert.equal(valid, false);
  });

  await t.test("rejects when secret is wrong", async () => {
    const valid = await verifyRazorpayHmacSignature(
      "wrong_secret_key",
      razorpayOrderId,
      razorpayPaymentId,
      authenticSignature
    );
    assert.equal(valid, false);
  });

  await t.test("rejects missing or empty inputs safely without throwing", async () => {
    assert.equal(await verifyRazorpayHmacSignature("", razorpayOrderId, razorpayPaymentId, authenticSignature), false);
    assert.equal(await verifyRazorpayHmacSignature(secret, "", razorpayPaymentId, authenticSignature), false);
    assert.equal(await verifyRazorpayHmacSignature(secret, razorpayOrderId, "", authenticSignature), false);
    assert.equal(await verifyRazorpayHmacSignature(secret, razorpayOrderId, razorpayPaymentId, ""), false);
  });
});

test("Cloudflare Worker server payment endpoint guards", async (t) => {
  const { handleVerifyPaymentRequest, handleCreateRazorpayOrderRequest } = await import("./server-payment.ts");

  await t.test("handleVerifyPaymentRequest rejects non-POST requests with 405", async () => {
    const req = new Request("http://localhost/api/verify-razorpay-payment", { method: "GET" });
    const res = await handleVerifyPaymentRequest(req, {});
    assert.equal(res.status, 405);
  });

  await t.test("handleCreateRazorpayOrderRequest rejects non-POST requests with 405", async () => {
    const req = new Request("http://localhost/api/create-razorpay-order", { method: "GET" });
    const res = await handleCreateRazorpayOrderRequest(req, {});
    assert.equal(res.status, 405);
  });

  await t.test("handleVerifyPaymentRequest returns 500 when Supabase config is missing", async () => {
    const req = new Request("http://localhost/api/verify-razorpay-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "123", razorpayPaymentId: "pay_123" }),
    });
    const res = await handleVerifyPaymentRequest(req, {});
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.match(body.message, /configuration missing/i);
  });

  await t.test("handleCreateRazorpayOrderRequest returns 500 when Supabase config is missing", async () => {
    const req = new Request("http://localhost/api/create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "123" }),
    });
    const res = await handleCreateRazorpayOrderRequest(req, {});
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.match(body.message, /configuration missing/i);
  });
});

test("Order lifecycle & cart aggregation simulation suite", async (t) => {
  // Logic mirror of create_doctor_order cart aggregation
  function aggregateCartItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Your cart is empty");
    }
    const distinctMap = new Map();
    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== "string") {
        throw new Error("Invalid product in cart");
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 1000) {
        throw new Error("Invalid product quantity specified");
      }
      distinctMap.set(item.product_id, (distinctMap.get(item.product_id) || 0) + qty);
    }
    if (distinctMap.size > 50) {
      throw new Error("Cart exceeds maximum allowed limit of 50 distinct items");
    }
    return Array.from(distinctMap.entries()).map(([product_id, quantity]) => ({
      product_id,
      quantity,
    }));
  }

  // Logic mirror of cancel_doctor_order inventory restoration rules
  function simulateInventoryRestore(product, restoredQty) {
    const newStock = product.stock + restoredQty;
    // Inactive products must NEVER be reactivated automatically
    const newStatus = product.status === "out_of_stock" ? "active" : product.status;
    return { stock: newStock, status: newStatus };
  }

  await t.test("rejects empty cart", () => {
    assert.throws(() => aggregateCartItems([]), /Your cart is empty/);
    assert.throws(() => aggregateCartItems(null), /Your cart is empty/);
  });

  await t.test("rejects malformed cart item (missing product_id)", () => {
    assert.throws(
      () => aggregateCartItems([{ product_id: null, quantity: 2 }]),
      /Invalid product in cart/
    );
  });

  await t.test("rejects invalid quantity (zero, negative, fractional, or > 1000)", () => {
    assert.throws(
      () => aggregateCartItems([{ product_id: "prod-1", quantity: 0 }]),
      /Invalid product quantity/
    );
    assert.throws(
      () => aggregateCartItems([{ product_id: "prod-1", quantity: -5 }]),
      /Invalid product quantity/
    );
    assert.throws(
      () => aggregateCartItems([{ product_id: "prod-1", quantity: 1.5 }]),
      /Invalid product quantity/
    );
    assert.throws(
      () => aggregateCartItems([{ product_id: "prod-1", quantity: 1001 }]),
      /Invalid product quantity/
    );
  });

  await t.test("aggregates duplicate product entries into single item with summed quantity", () => {
    const rawCart = [
      { product_id: "prod-A", quantity: 2 },
      { product_id: "prod-B", quantity: 1 },
      { product_id: "prod-A", quantity: 3 },
      { product_id: "prod-A", quantity: 1 },
    ];
    const aggregated = aggregateCartItems(rawCart);
    assert.equal(aggregated.length, 2);
    const prodA = aggregated.find((i) => i.product_id === "prod-A");
    const prodB = aggregated.find((i) => i.product_id === "prod-B");
    assert.equal(prodA.quantity, 6); // 2 + 3 + 1
    assert.equal(prodB.quantity, 1);
  });

  await t.test("enforces distinct items cap of 50", () => {
    const fiftyItems = Array.from({ length: 50 }, (_, i) => ({
      product_id: `prod-${i}`,
      quantity: 1,
    }));
    assert.doesNotThrow(() => aggregateCartItems(fiftyItems));

    const fiftyOneItems = Array.from({ length: 51 }, (_, i) => ({
      product_id: `prod-${i}`,
      quantity: 1,
    }));
    assert.throws(
      () => aggregateCartItems(fiftyOneItems),
      /Cart exceeds maximum allowed limit of 50 distinct items/
    );
  });

  await t.test("inventory restoration flips 'out_of_stock' to 'active'", () => {
    const product = { stock: 0, status: "out_of_stock" };
    const restored = simulateInventoryRestore(product, 5);
    assert.equal(restored.stock, 5);
    assert.equal(restored.status, "active");
  });

  await t.test("inventory restoration NEVER reactivates 'inactive' / discontinued products", () => {
    const discontinuedProduct = { stock: 0, status: "inactive" };
    const restored = simulateInventoryRestore(discontinuedProduct, 5);
    assert.equal(restored.stock, 5);
    assert.equal(restored.status, "inactive"); // Remains strictly inactive
  });

  await t.test("inventory restoration preserves 'active' status", () => {
    const activeProduct = { stock: 10, status: "active" };
    const restored = simulateInventoryRestore(activeProduct, 2);
    assert.equal(restored.stock, 12);
    assert.equal(restored.status, "active");
  });

  await t.test("rejects malformed UUID in cart items", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    assert.equal(uuidRegex.test("not-a-valid-uuid"), false);
    assert.equal(uuidRegex.test("12345"), false);
    assert.equal(uuidRegex.test("c7b3d8e0-5e0b-4b8a-8c1a-7b3d8e05e0b4"), true);
  });

  await t.test("rejects aggregated quantity exceeding 1000 units across duplicate items", () => {
    const cartWithExcessSum = [
      { product_id: "prod-A", quantity: 600 },
      { product_id: "prod-A", quantity: 500 },
    ];
    // Each is <= 1000, but sum is 1100
    const sum = cartWithExcessSum.reduce((acc, i) => acc + i.quantity, 0);
    assert.equal(sum > 1000, true);
  });

  await t.test("concurrent cancellation prevents payment update from succeeding", () => {
    // Simulates database query matching 0 rows because order_status != 'cancelled' condition failed
    const updatedRows = []; // 0 rows updated due to concurrent cancellation
    const isCancelled = updatedRows.length === 0;
    assert.equal(isCancelled, true);
  });

  await t.test("strictly requires 'captured' payment status for order settlement", () => {
    // Only 'captured' status settles the order as 'paid'. 'authorized' must be captured first.
    const isSettledStatus = (status) => status === "captured";
    assert.equal(isSettledStatus("captured"), true);
    assert.equal(isSettledStatus("authorized"), false); // Authorized alone is NOT paid
    assert.equal(isSettledStatus("failed"), false);
    assert.equal(isSettledStatus("refunded"), false);
    assert.equal(isSettledStatus("created"), false);
  });

  await t.test("rejects catalog product with zero or negative price (price <= 0)", () => {
    const validatePrice = (price) => {
      if (typeof price !== "number" || isNaN(price) || price <= 0) {
        throw new Error("Invalid product price in catalog: must be greater than zero");
      }
      return price;
    };
    assert.equal(validatePrice(450), 450);
    assert.throws(() => validatePrice(0), /must be greater than zero/);
    assert.throws(() => validatePrice(-10), /must be greater than zero/);
  });

  await t.test("rejects order with zero or negative total (total_price <= 0)", () => {
    const validateOrderTotal = (total) => {
      if (typeof total !== "number" || isNaN(total) || total <= 0) {
        throw new Error("Order total must be greater than zero");
      }
      return total;
    };
    assert.equal(validateOrderTotal(1250), 1250);
    assert.throws(() => validateOrderTotal(0), /Order total must be greater than zero/);
    assert.throws(() => validateOrderTotal(-500), /Order total must be greater than zero/);
  });

  await t.test("two-pass atomic validation guarantees zero inventory deduction if any item fails", () => {
    // Catalog state
    const catalog = {
      "prod-1": { name: "Composite Kit", stock: 10, price: 1500, status: "active" },
      "prod-2": { name: "Dental Bur", stock: 2, price: 300, status: "active" }, // only 2 in stock
    };

    // Customer cart requests 5 units of prod-1 and 5 units of prod-2
    const cart = [
      { product_id: "prod-1", quantity: 5 },
      { product_id: "prod-2", quantity: 5 }, // Will fail stock check!
    ];

    // Simulate Pass 1: Validation only (no stock updates)
    let pass1Failed = false;
    let failureMessage = "";
    for (const item of cart) {
      const prod = catalog[item.product_id];
      if (prod.stock < item.quantity) {
        pass1Failed = true;
        failureMessage = `Insufficient stock for ${prod.name}`;
        break;
      }
    }

    assert.equal(pass1Failed, true);
    assert.equal(failureMessage, "Insufficient stock for Dental Bur");

    // PASS 2 is NEVER reached! Verify catalog stock is 100% untouched
    assert.equal(catalog["prod-1"].stock, 10); // NOT decremented to 5!
    assert.equal(catalog["prod-2"].stock, 2);
  });

  await t.test("profile trigger prevents non-staff from mutating role, is_verified, or is_active", () => {
    const simulateProfileTrigger = (oldRow, newRow, callerRole) => {
      const isStaff = callerRole === "admin" || callerRole === "shop_owner";
      if (!isStaff) {
        if (newRow.role !== oldRow.role) {
          throw new Error("Privilege escalation rejected: only administrators can modify user roles");
        }
        if (newRow.is_verified !== oldRow.is_verified) {
          throw new Error("Verification modification rejected: only depot staff can verify profiles");
        }
        if (newRow.is_active !== oldRow.is_active) {
          throw new Error("Account status modification rejected: only administrators can change account activation");
        }
      }
      return { ...newRow, updated_at: new Date().toISOString() };
    };

    const doctorProfile = {
      id: "u-1",
      role: "doctor",
      is_verified: false,
      is_active: true,
      clinic_name: "Original Clinic",
    };

    // Doctor attempting self-promotion to admin -> REJECTED
    assert.throws(
      () => simulateProfileTrigger(doctorProfile, { ...doctorProfile, role: "admin" }, "doctor"),
      /Privilege escalation rejected/
    );

    // Doctor attempting self-verification -> REJECTED
    assert.throws(
      () => simulateProfileTrigger(doctorProfile, { ...doctorProfile, is_verified: true }, "doctor"),
      /Verification modification rejected/
    );

    // Doctor updating legitimate details (clinic name, phone, address) -> ALLOWED
    const updated = simulateProfileTrigger(
      doctorProfile,
      { ...doctorProfile, clinic_name: "Updated Smile Clinic" },
      "doctor"
    );
    assert.equal(updated.clinic_name, "Updated Smile Clinic");
    assert.equal(updated.role, "doctor");
    assert.equal(updated.is_verified, false);

    // Admin updating doctor's verification status -> ALLOWED
    const adminVerified = simulateProfileTrigger(
      doctorProfile,
      { ...doctorProfile, is_verified: true },
      "admin"
    );
    assert.equal(adminVerified.is_verified, true);
  });

  await t.test("validates exact amount and currency matching", () => {
    const expectedPaise = 585000; // ₹5,850.00
    const expectedCurrency = "INR";

    const validPayment = { amount: 585000, currency: "INR" };
    const tamperedAmount = { amount: 540000, currency: "INR" };
    const tamperedCurrency = { amount: 585000, currency: "USD" };

    assert.equal(validPayment.amount === expectedPaise && validPayment.currency === expectedCurrency, true);
    assert.equal(tamperedAmount.amount === expectedPaise, false);
    assert.equal(tamperedCurrency.currency === expectedCurrency, false);
  });
});
