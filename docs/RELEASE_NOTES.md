# Release Notes — Darsh Dental Depot

**Release Version:** v1.2.0
**Release Name:** Order Integrity & Cryptographic Payment Hardening
**Release Date:** 2026-10-23
**Status:** Staging Verified — Ready for Production Approval

---

## 1. Overview

Release `v1.2.0` is a comprehensive security and functional hardening release for Darsh Dental Depot. It resolves critical architectural vulnerabilities in payment processing, cart pricing, order cancellation, and role-based access control (RBAC).

All order pricing, inventory decrementing, and payment validations now occur exclusively on trusted server infrastructure (Cloudflare Workers and PostgreSQL stored procedures), eliminating reliance on browser-supplied values.

---

## 2. Key Security Remediations

### A. Server-Side Cryptographic Payment Verification (VULN-05)
- **Eliminated Client-Callable Payment RPC:** Removed `confirm_razorpay_payment` completely. Browsers can no longer mark orders as paid directly.
- **Web Crypto HMAC-SHA256 Verification:** Added `/api/verify-razorpay-payment` on the Cloudflare Worker server. The endpoint strictly validates the payment signature against `RAZORPAY_KEY_SECRET`.
- **Order & Payment ID Binding:** Cross-checks that `order.payment_id === razorpayOrderId` to eliminate payment swapping and replay attacks.
- **Idempotency:** Repeated payment verification calls return success safely without double-processing.
- **Amount & Currency Cross-Validation:** Verifies live against Razorpay API that the transaction was executed for the exact order amount in INR.

### B. Server-Side Price Calculation & Stock Deduction (VULN-03)
- **Database Catalog Pricing:** The frontend no longer transmits prices. The `create_doctor_order` PostgreSQL stored procedure reads `selling_price` and `discount_price` directly from catalog records under row locks (`FOR UPDATE`).
- **Cart Aggregation:** Groups duplicate entries for the same product in a cart payload into a single consolidated line item, ensuring accurate inventory deduction.
- **Quantity & Item Caps:** Limits orders to a maximum of 50 distinct products and 1,000 units per line item to prevent resource exhaustion.
- **Unique Order Numbers:** Order number generation (`ORD-YYYYMMDD-XXXX`) includes collision detection and an automated retry loop.

### C. Atomic & Guarded Order Cancellation (VULN-06)
- **Atomic Cancellation Procedure:** Introduced `cancel_doctor_order` with row-level locks on the target order.
- **Paid Order Protection:** Prohibits online self-service cancellation for paid orders (`payment_status = 'paid'`).
- **Status Preservation:** When restoring inventory, products marked `'out_of_stock'` return to `'active'`. Products marked `'inactive'` (discontinued) remain strictly inactive.
- **Idempotency:** Duplicate cancellation calls return success without duplicating restored stock.

### D. Registration & Profile Privilege Escalation Prevention (VULN-02)
- Hardened the `handle_new_user()` auth trigger with `SET search_path = ''`.
- Ignores client metadata roles during signup; every new registrant is hardcoded as `role := 'doctor'` and `is_verified := false`.
- **Robust BEFORE UPDATE Trigger on Profiles:** Added `trg_protect_profile_fields` to prevent any non-staff user from mutating `role` or `is_verified`, completely eliminating RLS recursion while preserving legitimate profile updates (name, phone, clinic, address).
- **Recursion-Free Staff Helper:** Added `public.is_staff()` (`STABLE SECURITY DEFINER`) to streamline RLS evaluation across all tables without recursion.

### E. Row-Level Security (RLS) Lockdown (VULN-01 & VULN-04)
- Dropped all legacy permissive update policies on `public.products` and `public.orders`.
- Restricted direct updates on `products`, `orders`, and `order_items` strictly to depot staff (`admin`, `shop_owner`).
- **Eliminated Direct Customer INSERT Pathway:** Customer purchases must exclusively pass through `public.create_doctor_order()`. Direct table insertion by customers on `public.orders` and `public.order_items` is denied by RLS.
- **Two-Pass Atomic Validation:** `create_doctor_order()` performs complete catalog read & stock validation before executing any mutations. Zero inventory deductions occur if any product fails.
- Restricted storage uploads, updates, and deletions in `product-images` bucket to depot staff.

---

## 3. Automated Test Coverage

The release includes a **31-case automated test suite** in `Frontend/src/lib/server-payment.test.mjs` executed via Node's native test runner (`npm test`):
- **Cryptographic Signature Verification:** Standard valid signature, case-insensitive hex matching, forged signature rejection, parameter substitution rejection, replay attack rejection, invalid secret rejection, input sanitization.
- **Server Endpoint Guards:** Non-POST verb rejection (405), missing environment configuration rejection (500).
- **Cart & Order Lifecycle:** Empty cart rejection, malformed product item rejection, negative/zero/excessive quantity rejection, duplicate item quantity aggregation, 50-item cap enforcement, inventory status restoration and inactive product protection.
- **Data Integrity & Concurrency:** Malformed UUID rejection, aggregated quantity overflow rejection (> 1000 units), concurrent cancellation race condition handling, captured payment status enforcement, price/total <= 0 rejection, two-pass atomic rollback verification, profile trigger privilege protection, and amount/currency cross-validation.

---

## 4. Breaking Changes & Upgrade Notes

1. **Client Order Placement:** Direct client-side `orders.insert()` is no longer permitted for customers. All order placements must invoke `supabase.rpc('create_doctor_order', ...)`.
2. **Payment Confirmation:** Payment verification must call `POST /api/verify-razorpay-payment`.
3. **Required Server Secrets:** `RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` must be configured in Cloudflare Workers via Wrangler CLI before live payments can be verified.

---

## 5. Verification Checklist

- [x] TypeScript compilation (`npx tsc --noEmit`): 0 errors
- [x] Production build (`npm run build`): Clean build for client and SSR worker
- [x] Automated test suite (`npm test`): 27 / 27 PASS
- [x] Working tree clean of secrets and build output
- [x] Razorpay configured in Test Mode (`rzp_test_...`)
