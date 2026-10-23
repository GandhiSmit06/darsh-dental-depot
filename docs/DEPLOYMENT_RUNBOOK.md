# Darsh Dental Depot — Production Deployment Runbook

**Document Version:** 1.2.0 (Revision 5 Targeted Hardening)
**Target Date:** 2026-10-23
**Target Environments:**
- Production Frontend: [https://darsh-dental-depot.gsmit5605.workers.dev](https://darsh-dental-depot.gsmit5605.workers.dev) (Cloudflare Workers)
- Production Database: `wzkqjeejgrolkdkywovp.supabase.co` (Supabase PostgreSQL)
**Primary Contact / Support:** Darsh Dental Depot (+91 97270 76119)

---

## 1. Safety & Authority Guidelines

> [!IMPORTANT]
> - **Zero Blind Execution:** Every SQL statement and secret configuration must be explicitly reviewed by the project owner prior to running.
> - **Payment Mode:** Razorpay must remain in **Test Mode** (`rzp_test_...`) during initial staging and verification.
> - **Transaction Isolation:** The database migration is encapsulated inside a single `BEGIN; ... COMMIT;` block. Any syntax or constraint violation automatically rolls back the entire migration.
> - **Read-Only Preflight Mandatory:** Never run the migration without first running the read-only preflight queries against the live schema.

---

## 2. Pre-Deployment Verification Checklist

Before starting the deployment, verify the local tree and test suite:
- [x] Local Git tree matches `origin/main` at commit `77bbbd9` without uncommitted drift.
- [x] TypeScript type checking passes: `npm --prefix Frontend exec -- tsc --noEmit` (**0 errors**).
- [x] Automated test suite passes: `npm --prefix Frontend test` (**31/31 tests passing**).
- [x] Production build passes: `npm --prefix Frontend run build` (Client and SSR bundles created cleanly).
- [x] No secrets, private `.env` files, or build artifacts staged in Git.

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Execute Preflight Inspection Queries in Supabase (Read-Only)
Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/wzkqjeejgrolkdkywovp/sql/new) and execute the following read-only queries to document existing baseline state:

```sql
-- 1. Inspect active RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_catalog.pg_policies
WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items', 'products', 'profiles')
ORDER BY tablename, policyname;

-- 2. Inspect active functions
SELECT p.proname, n.nspname, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef AS is_security_definer, p.proconfig AS config_settings
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_doctor_order', 'cancel_doctor_order', 'confirm_razorpay_payment', 'handle_new_user', 'is_staff');

-- 3. Inspect auth trigger
SELECT tgname, relname, proname
FROM pg_catalog.pg_trigger tr
JOIN pg_catalog.pg_class c ON c.oid = tr.tgrelid
JOIN pg_catalog.pg_proc p ON p.oid = tr.tgfoid
WHERE c.relname = 'users';
```

---

### Step 2: Configure Cloudflare Worker Production Secrets
Run the following commands in PowerShell from the repository root:

```powershell
# 1. Set Razorpay Key Secret (Server-Side Only for HMAC-SHA256 signature verification & API cross-validation)
npm --prefix Frontend exec -- wrangler secret put RAZORPAY_KEY_SECRET

# 2. Set Supabase Service Role Key (Server-Side Only for privileged order payment updates)
npm --prefix Frontend exec -- wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

> [!NOTE]
> `wrangler secret put` prompts for the secret interactively and transmits it directly to Cloudflare's encrypted key-value store. It is never logged in console history or committed to files.

---

### Step 3: Apply Database Security Migration
Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/wzkqjeejgrolkdkywovp/sql/new) and paste the exact contents of:
[`Frontend/harden_orders_and_roles.sql`](file:///c:/Users/Smit%20Gandhi/Desktop/SMIT/DDD/darsh-dental-glow/Frontend/harden_orders_and_roles.sql)

Click **Run** to execute the transactional block (`BEGIN; ... COMMIT;`).

---

### Step 4: Run Post-Migration Verification Queries
In the Supabase SQL Editor, run the post-flight verification block:

```sql
-- 1. Confirm that insecure client-callable payment RPC is deleted:
SELECT proname FROM pg_catalog.pg_proc
WHERE proname = 'confirm_razorpay_payment';
-- Expected: 0 rows returned.

-- 2. Confirm stored procedures and helper functions have empty search_path and SECURITY DEFINER enabled:
SELECT p.proname, p.prosecdef, p.proconfig
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_doctor_order', 'cancel_doctor_order', 'handle_new_user', 'is_staff', 'trg_protect_profile_fields');
-- Expected: prosecdef = true, proconfig = {search_path=""} for all 5 functions.

-- 3. Confirm RLS policies across orders, products, order_items, and profiles:
SELECT tablename, policyname, cmd
FROM pg_catalog.pg_policies
WHERE schemaname = 'public' AND tablename IN ('orders', 'products', 'order_items', 'profiles')
ORDER BY tablename, cmd;
-- Expected:
-- orders: INSERT and UPDATE restricted to is_staff().
-- products: INSERT, UPDATE, DELETE restricted to is_staff().
-- order_items: ALL restricted to is_staff(); SELECT scoped by order ownership.
-- profiles: UPDATE allowed for self or staff, protected by trigger.

-- 4. Confirm BEFORE UPDATE trigger on public.profiles:
SELECT tgname, relname, proname
FROM pg_catalog.pg_trigger tr
JOIN pg_catalog.pg_class c ON c.oid = tr.tgrelid
JOIN pg_catalog.pg_proc p ON p.oid = tr.tgfoid
WHERE c.relname = 'profiles' AND tr.tgname = 'trg_protect_profile_fields_trigger';
-- Expected: 1 row returned.
```

---

### Step 5: Deploy Frontend Worker
From the terminal:
```powershell
# Build and deploy to Cloudflare Workers
npm --prefix Frontend run build
npm --prefix Frontend exec -- wrangler deploy
```

---

## 4. Post-Deployment Smoke Test Suite

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **ST-01: Doctor Sign-up** | Register a new account at `/register` | User profile is created in `public.profiles` with `role = 'doctor'` and `is_verified = false`. |
| **ST-02: Public Catalog** | Visit `/products` as unauthenticated visitor | All active products and prices render without authentication error. |
| **ST-03: Cart Aggregation** | Add same product to cart twice, proceed to checkout | Cart aggregates quantities into a single item, calculates total from catalog prices. |
| **ST-04: COD Order Placement** | Place order with "Pay on Delivery" | Order created with `order_status = 'pending'`, `payment_status = 'pending'`, stock decremented in DB. |
| **ST-05: Order Cancellation** | Cancel pending COD order in doctor order history | Order marked `cancelled`, inventory atomically restored. Inactive products remain inactive. |
| **ST-06: Razorpay Payment Initiation** | Place order with "Razorpay" | Order created in DB with status pending; genuine Razorpay order created via `/api/create-razorpay-order` with `payment_capture: 1`; Razorpay modal opens with matching amount and `order_id`. |
| **ST-07: Razorpay Signature & Capture** | Complete payment in test mode | Server calls `/api/verify-payment`, validates HMAC-SHA256, verifies payment status is captured, marks order `paid`. |
| **ST-08: Paid Order Cancellation Block** | Attempt to cancel paid order | UI displays depot support message; online self-service cancellation is rejected by DB RPC. |
| **ST-09: Staff Order Management** | Log in as `admin` or `shop_owner` at `/shop` | Staff can view all orders, update status (`processing`, `shipped`, `delivered`), and manage product catalog. |
| **ST-10: Profile Escalation Block** | Non-staff doctor attempts to modify `role` or `is_verified` | DB trigger rejects update with `Privilege escalation rejected`. Legitimate edits (clinic name, phone) succeed. |

---

## 5. Rollback Playbook

### Scenario A: Database Migration Fails During Execution
Because the migration is wrapped in `BEGIN; ... COMMIT;`, any error during execution triggers an automatic PostgreSQL rollback. No partial changes will persist.

### Scenario B: Unexpected Bug in Stored Procedure After Migration
To revert the stored procedures and helper functions:
```sql
DROP FUNCTION IF EXISTS public.create_doctor_order(jsonb, text, jsonb, text);
DROP FUNCTION IF EXISTS public.cancel_doctor_order(uuid);
DROP TRIGGER IF EXISTS trg_protect_profile_fields_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.trg_protect_profile_fields();
DROP FUNCTION IF EXISTS public.is_staff(uuid);
```
To restore standard legacy policies, re-run the policy section from `Frontend/supabase_schema.sql`.

### Scenario C: Cloudflare Worker Regression
To instantly roll back the Cloudflare Worker to the previously active version:
```powershell
npm --prefix Frontend exec -- wrangler rollback
```
This restores the previous production worker deployment without recompiling.

---

## 6. Data Persistence & Reconciliation Advisory

> [!CAUTION]
> **Data Persistence Warning:**
> Dropping or rolling back stored procedures (`create_doctor_order`, `cancel_doctor_order`) and RLS policies modifies database schema metadata only. **It does NOT reverse or recalculate order records, order items, or inventory stock values that were committed while the procedures were active.**
> Any orders placed or stock decrements completed prior to a rollback remain persisted in `public.orders`, `public.order_items`, and `public.products`.

### Recovery Procedures for Payment & Inventory Reconciliation:

1. **Unreconciled Payments (Razorpay Captured, Order Remained Pending):**
   - *Cause:* User closed browser before redirect, network drop between Cloudflare and Supabase, or webhook latency.
   - *Resolution:* Staff logs into Razorpay Dashboard (`https://dashboard.razorpay.com`) -> Orders -> finds payment with matching amount and receipt (`order_number`).
   - Staff confirms captured payment and updates order status to `paid` with `payment_id = pay_...` via the admin dashboard (`/shop`) or executes a trusted reconciliation query:
     ```sql
     UPDATE public.orders
     SET payment_status = 'paid', payment_id = 'pay_ActualPaymentIdFromRazorpay', updated_at = now()
     WHERE order_number = 'ORD-20261023-XXXX' AND payment_status = 'pending';
     ```

2. **Abandoned Checkout Stock Recovery:**
   - *Cause:* Doctor placed order with Razorpay payment method, order record created, but doctor abandoned checkout without paying.
   - *Resolution:* Orders that remain `pending` with `payment_method = 'razorpay'` for > 24 hours without a valid Razorpay transaction can be cancelled by staff via `/shop` or via:
     ```sql
     SELECT public.cancel_doctor_order('order-uuid-here');
     ```
     This automatically restores inventory stock to `public.products` safely.
