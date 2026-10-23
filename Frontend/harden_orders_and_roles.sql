-- ==============================================================================
-- DARSH DENTAL DEPOT — PRODUCTION ORDER & ROLE SECURITY HARDENING MIGRATION
-- Project: wzkqjeejgrolkdkywovp.supabase.co
-- Generated: 2026-10-23
-- REVISION 5 (COMPREHENSIVE TARGETED HARDENING):
--   1. Added STABLE SECURITY DEFINER helper public.is_staff() to eliminate RLS recursion.
--   2. Replaced recursive profiles WITH CHECK policy with a robust BEFORE UPDATE trigger
--      (trg_protect_profile_fields) that prevents role and verification tampering while
--      preserving legitimate profile editing.
--   3. Implemented true two-pass atomic validation in create_doctor_order(): zero mutations
--      occur on any validation failure; subtransaction rollback handles unexpected errors.
--   4. Strictly rejected zero or negative product prices (unit_price <= 0 and total_price <= 0).
--   5. Guaranteed complete order-item and stock consistency with inventory snapshotting.
--   6. Enforced collision-resistant order numbers and duplicate product aggregation.
--   7. Revoked direct customer INSERT/UPDATE on orders & order_items; customer mutations
--      must pass through create_doctor_order() and cancel_doctor_order().
--   8. Atomic cancellation with row locks, paid-order block, and inactive product protection.
--   9. Product image storage management restricted strictly to depot staff.
--  10. Fully enclosed in transactional block (BEGIN ... COMMIT).
-- ==============================================================================

-- ==============================================================================
-- SECTION A: PREFLIGHT INSPECTION QUERIES (READ-ONLY)
-- Execute these in Supabase SQL Editor prior to running the migration.
-- ==============================================================================
/*
-- 1. Inspect existing RLS policies on critical tables:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_catalog.pg_policies
WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items', 'products', 'profiles')
ORDER BY tablename, policyname;

-- 2. Inspect existing function definitions & search_path settings:
SELECT p.proname, n.nspname, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef AS is_security_definer, p.proconfig AS config_settings
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_doctor_order', 'cancel_doctor_order', 'confirm_razorpay_payment', 'handle_new_user', 'is_staff');

-- 3. Inspect existing auth trigger on auth.users:
SELECT tgname, relname, proname
FROM pg_catalog.pg_trigger tr
JOIN pg_catalog.pg_class c ON c.oid = tr.tgrelid
JOIN pg_catalog.pg_proc p ON p.oid = tr.tgfoid
WHERE c.relname = 'users';
*/

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PURGE OBSOLETE / INSECURE FUNCTIONS & POLICIES (SAFE RE-RUNNABILITY)
-- ------------------------------------------------------------------------------

-- Insecure client-callable payment confirmation RPC MUST NOT exist
DROP FUNCTION IF EXISTS public.confirm_razorpay_payment(uuid, text, text);

-- Drop legacy & current product policies
DROP POLICY IF EXISTS "Users and admins can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update product stock" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins and shop owners can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins and shop owners can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins and shop owners can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

-- Drop legacy & current order policies
DROP POLICY IF EXISTS "Users and admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and shop owners can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and shop owners can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and shop owners can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Drop legacy & current order items policies
DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins and shop owners can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;

-- Drop legacy & current profile policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile without role escalation" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- ------------------------------------------------------------------------------
-- 2. STAFF VERIFICATION HELPER (PREVENTS RLS RECURSION)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'shop_owner') FROM public.profiles WHERE id = p_user_id),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- ------------------------------------------------------------------------------
-- 3. AUTH TRIGGER: PREVENT REGISTRATION PRIVILEGE ESCALATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    clinic_name,
    address,
    medical_registration_number,
    is_verified,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', 'Doctor'),
    'doctor', -- STRICT: Never trust role from client metadata; always default to doctor
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'clinicName', new.raw_user_meta_data->>'clinic_name', ''),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    COALESCE(new.raw_user_meta_data->>'medicalRegistrationNumber', new.raw_user_meta_data->>'medical_registration_number', ''),
    false,    -- STRICT: Clinics require manual staff verification
    true,
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()),
    pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. PROFILES TABLE: ROBUST TRIGGER-BASED FIELD PROTECTION & RECURSION-FREE RLS
-- ------------------------------------------------------------------------------
-- Trigger strictly enforces that role, is_verified, and is_active cannot be tampered
-- with by non-staff users, completely eliminating RLS recursion while preserving
-- legitimate doctor profile editing (name, phone, address, clinic, etc.).
CREATE OR REPLACE FUNCTION public.trg_protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only enforce when invoked by an authenticated client session
  IF auth.uid() IS NOT NULL THEN
    IF NOT public.is_staff(auth.uid()) THEN
      IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Privilege escalation rejected: only administrators can modify user roles';
      END IF;

      IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
        RAISE EXCEPTION 'Verification modification rejected: only depot staff can verify profiles';
      END IF;

      IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        RAISE EXCEPTION 'Account status modification rejected: only administrators can change account activation';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields_trigger ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_protect_profile_fields();

-- Clean, recursion-free RLS policies for profiles:
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Users can update their own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_staff())
  WITH CHECK (auth.uid() = id OR public.is_staff());

-- ------------------------------------------------------------------------------
-- 5. PRODUCTS TABLE: CATALOG READ-ONLY FOR CLIENTS, STAFF WRITE
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins and shop owners can insert products"
  ON public.products FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Admins and shop owners can update products"
  ON public.products FOR UPDATE USING (public.is_staff());

CREATE POLICY "Admins and shop owners can delete products"
  ON public.products FOR DELETE USING (public.is_staff());

-- ------------------------------------------------------------------------------
-- 6. ORDERS TABLE: CUSTOMER CREATION VIA RPC ONLY, STAFF DIRECT MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff());

-- Direct customer INSERT is revoked; all customer purchases must pass through create_doctor_order()
CREATE POLICY "Admins and shop owners can insert orders"
  ON public.orders FOR INSERT WITH CHECK (public.is_staff());

-- Direct customer UPDATE is revoked; order status & payments are managed by staff or cancel_doctor_order()
CREATE POLICY "Admins and shop owners can update orders"
  ON public.orders FOR UPDATE USING (public.is_staff());

CREATE POLICY "Admins and shop owners can delete orders"
  ON public.orders FOR DELETE USING (public.is_staff());

-- ------------------------------------------------------------------------------
-- 7. ORDER ITEMS TABLE: SCOPED ACCESS & STAFF MANAGEMENT
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view order items for their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_staff())
    )
  );

CREATE POLICY "Admins and shop owners can manage order items"
  ON public.order_items FOR ALL USING (public.is_staff());

-- ------------------------------------------------------------------------------
-- 8. STORAGE: LOCK PRODUCT IMAGE MANAGEMENT TO STAFF
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND public.is_staff()
  );

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'product-images' AND public.is_staff()
  );

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'product-images' AND public.is_staff()
  );

-- ------------------------------------------------------------------------------
-- 9. ATOMIC STORED PROCEDURE: CREATE DOCTOR ORDER (TWO-PASS TRANSACTIONAL)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_doctor_order(
  p_items jsonb,
  p_payment_method text,
  p_shipping_address jsonb DEFAULT '{}'::jsonb,
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_json_elem jsonb;
  v_item record;
  v_prod record;
  v_total_price numeric := 0;
  v_unit_price numeric;
  v_qty integer;
  v_prod_id uuid;
  v_distinct_count integer;
  v_attempt integer := 0;
  v_collision boolean := true;
BEGIN
  -- 1. Verify authenticated caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Authentication required to place an order');
  END IF;

  -- 2. Verify active profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND is_active = true) THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Doctor profile not found or inactive');
  END IF;

  -- 3. Validate payment method
  IF p_payment_method NOT IN ('razorpay', 'stripe', 'cod') THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Invalid payment method');
  END IF;

  -- 4. Validate items array existence
  IF p_items IS NULL OR pg_catalog.jsonb_typeof(p_items) != 'array' OR pg_catalog.jsonb_array_length(p_items) = 0 THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Your cart is empty');
  END IF;

  -- 5. Strict validation of every element: NEVER silently skip malformed items
  FOR v_json_elem IN SELECT * FROM pg_catalog.jsonb_array_elements(p_items)
  LOOP
    IF pg_catalog.jsonb_typeof(v_json_elem) != 'object' THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Malformed cart item: object expected');
    END IF;

    -- Validate product_id presence & valid UUID format
    IF v_json_elem->>'product_id' IS NULL OR
       v_json_elem->>'product_id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Invalid or missing product ID in cart item');
    END IF;

    -- Validate quantity: must be positive integer string
    IF v_json_elem->>'quantity' IS NULL OR
       v_json_elem->>'quantity' !~ '^[0-9]+$' THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Product quantity must be a positive integer');
    END IF;

    -- Range check per item (1 to 1000)
    IF (v_json_elem->>'quantity')::bigint <= 0 OR (v_json_elem->>'quantity')::bigint > 1000 THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Product quantity must be between 1 and 1000 units');
    END IF;
  END LOOP;

  -- 6. Enforce maximum distinct items cap to prevent unbounded execution
  SELECT pg_catalog.count(DISTINCT (x->>'product_id')::uuid) INTO v_distinct_count
  FROM pg_catalog.jsonb_array_elements(p_items) AS x;

  IF v_distinct_count > 50 THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Cart exceeds maximum allowed limit of 50 distinct items');
  END IF;

  -- 7. Generate unique Order ID & collision-resistant Order Number
  v_order_id := pg_catalog.gen_random_uuid();

  WHILE v_collision AND v_attempt < 5 LOOP
    v_attempt := v_attempt + 1;
    v_order_number := 'ORD-' ||
      pg_catalog.to_char(pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()), 'YYYYMMDD') || '-' ||
      pg_catalog.upper(pg_catalog.substr(pg_catalog.md5(pg_catalog.random()::pg_catalog.text || pg_catalog.clock_timestamp()::pg_catalog.text), 1, 4));

    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number) THEN
      v_collision := false;
    END IF;
  END LOOP;

  IF v_collision THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Failed to allocate unique order number. Please try again.');
  END IF;

  -- ----------------------------------------------------------------------------
  -- PASS 1: COMPLETE READ, INVENTORY LOCK & TRUSTED CALCULATION (ZERO MUTATIONS)
  -- If any item fails validation, the function returns immediately without
  -- having decremented a single unit of inventory.
  -- ----------------------------------------------------------------------------
  FOR v_item IN
    SELECT
      (x->>'product_id')::uuid AS product_id,
      pg_catalog.sum((x->>'quantity')::bigint)::bigint AS raw_quantity
    FROM pg_catalog.jsonb_array_elements(p_items) AS x
    GROUP BY (x->>'product_id')::uuid
  LOOP
    v_prod_id := v_item.product_id;

    -- Enforce aggregated quantity cap
    IF v_item.raw_quantity <= 0 OR v_item.raw_quantity > 1000 THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Total aggregated quantity for a product exceeds the 1000 unit limit');
    END IF;
    v_qty := v_item.raw_quantity::integer;

    -- Lock catalog row for concurrency safety
    SELECT * INTO v_prod FROM public.products WHERE id = v_prod_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Product not found in catalog');
    END IF;

    IF v_prod.status = 'inactive' THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Product is currently unavailable: ' || v_prod.name);
    END IF;

    IF v_prod.stock < v_qty THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Insufficient stock for ' || v_prod.name || ' (Available: ' || v_prod.stock || ')');
    END IF;

    -- Trusted database price (selling_price or discounted price)
    v_unit_price := CASE
      WHEN v_prod.discount_price IS NOT NULL AND v_prod.discount_price > 0 THEN v_prod.discount_price
      ELSE v_prod.selling_price
    END;

    -- Strict validation: reject zero or negative catalog prices
    IF v_unit_price <= 0 THEN
      RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Invalid product price in catalog: must be greater than zero');
    END IF;

    v_total_price := v_total_price + (v_unit_price * v_qty);
  END LOOP;

  -- Strict validation: reject zero or negative total order price
  IF v_total_price <= 0 THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Order total must be greater than zero');
  END IF;

  -- ----------------------------------------------------------------------------
  -- PASS 2: ATOMIC MUTATION & INSERTION (SUBTRANSACTION EXCEPTION BLOCK)
  -- Executed ONLY when Pass 1 completely succeeded. Any unexpected failure
  -- triggers an automatic rollback of all stock decrements and inserts.
  -- ----------------------------------------------------------------------------
  BEGIN
    -- 1. Decrement inventory atomically
    FOR v_item IN
      SELECT
        (x->>'product_id')::uuid AS product_id,
        pg_catalog.sum((x->>'quantity')::bigint)::bigint AS raw_quantity
      FROM pg_catalog.jsonb_array_elements(p_items) AS x
      GROUP BY (x->>'product_id')::uuid
    LOOP
      v_prod_id := v_item.product_id;
      v_qty := v_item.raw_quantity::integer;

      UPDATE public.products
      SET
        stock = stock - v_qty,
        status = CASE WHEN stock - v_qty = 0 THEN 'out_of_stock' ELSE status END,
        updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
      WHERE id = v_prod_id;
    END LOOP;

    -- 2. Insert Master Order record (pending status, null payment_id)
    INSERT INTO public.orders (
      id,
      order_number,
      user_id,
      total_price,
      subtotal,
      tax_amount,
      order_status,
      payment_status,
      payment_method,
      payment_id,
      shipping_address,
      notes,
      created_at,
      updated_at
    ) VALUES (
      v_order_id,
      v_order_number,
      v_user_id,
      v_total_price,
      v_total_price,
      0,
      'pending',
      'pending',
      p_payment_method,
      NULL,
      COALESCE(p_shipping_address, '{}'::jsonb),
      COALESCE(p_notes, ''),
      pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()),
      pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
    );

    -- 3. Insert Order Items with authentic product snapshot values
    FOR v_item IN
      SELECT
        (x->>'product_id')::uuid AS product_id,
        pg_catalog.sum((x->>'quantity')::bigint)::bigint AS raw_quantity
      FROM pg_catalog.jsonb_array_elements(p_items) AS x
      GROUP BY (x->>'product_id')::uuid
    LOOP
      v_prod_id := v_item.product_id;
      v_qty := v_item.raw_quantity::integer;

      SELECT * INTO v_prod FROM public.products WHERE id = v_prod_id;
      v_unit_price := CASE
        WHEN v_prod.discount_price IS NOT NULL AND v_prod.discount_price > 0 THEN v_prod.discount_price
        ELSE v_prod.selling_price
      END;

      INSERT INTO public.order_items (
        order_id,
        product_id,
        name,
        quantity,
        price,
        image,
        created_at
      ) VALUES (
        v_order_id,
        v_prod_id,
        v_prod.name,
        v_qty,
        v_unit_price,
        COALESCE(v_prod.images[1], ''),
        pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
      );
    END LOOP;

  EXCEPTION WHEN OTHERS THEN
    -- Automatic subtransaction rollback: reverses any stock decrements and inserts
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'message', 'Order placement failed due to an unexpected database error: ' || SQLERRM
    );
  END;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'message', 'Order placed successfully',
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_price', v_total_price
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_doctor_order(jsonb, text, jsonb, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_doctor_order(jsonb, text, jsonb, text) TO authenticated;

-- ------------------------------------------------------------------------------
-- 10. ATOMIC STORED PROCEDURE: CANCEL DOCTOR ORDER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_doctor_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order record;
  v_item record;
BEGIN
  -- 1. Row-level lock on the target order
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;

  -- 2. Authorization check: Must be the order creator or depot staff
  IF v_order.user_id != auth.uid() AND NOT public.is_staff(auth.uid()) THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Unauthorized to cancel this order');
  END IF;

  -- 3. Idempotency: Prevent duplicate cancellations and double stock restoration
  IF v_order.order_status = 'cancelled' THEN
    RETURN pg_catalog.jsonb_build_object('success', true, 'message', 'Order is already cancelled');
  END IF;

  -- 4. Payment validation: Prevent self-service cancellation of paid orders
  IF v_order.payment_status = 'paid' THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Paid orders cannot be cancelled online. Please contact depot support at +91 97270 76119 for assistance.');
  END IF;

  -- 5. State validation: Doctors can only cancel orders in 'pending' status
  IF v_order.order_status != 'pending' AND NOT public.is_staff(auth.uid()) THEN
    RETURN pg_catalog.jsonb_build_object('success', false, 'message', 'Only pending orders can be cancelled online');
  END IF;

  -- 6. Atomically restore inventory grouped by product_id
  FOR v_item IN
    SELECT product_id, pg_catalog.sum(quantity) AS qty
    FROM public.order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
    GROUP BY product_id
  LOOP
    UPDATE public.products
    SET
      stock = stock + v_item.qty,
      -- Protect inactive products: Only flip 'out_of_stock' back to 'active'
      status = CASE WHEN status = 'out_of_stock' THEN 'active' ELSE status END,
      updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
    WHERE id = v_item.product_id;
  END LOOP;

  -- 7. Mark order as cancelled
  UPDATE public.orders
  SET
    order_status = 'cancelled',
    updated_at = pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now())
  WHERE id = p_order_id;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'message', 'Order cancelled successfully and inventory restored'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_doctor_order(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_doctor_order(uuid) TO authenticated;

COMMIT;

-- ==============================================================================
-- SECTION B: POST-MIGRATION VERIFICATION QUERIES (READ-ONLY)
-- Execute these in Supabase SQL Editor after running the migration.
-- ==============================================================================
/*
-- 1. Confirm that confirm_razorpay_payment is completely removed:
SELECT proname FROM pg_catalog.pg_proc
WHERE proname = 'confirm_razorpay_payment';
-- Expected: 0 rows returned.

-- 2. Confirm helper function and stored procedures have empty search_path and SECURITY DEFINER enabled:
SELECT p.proname, p.prosecdef, p.proconfig
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_doctor_order', 'cancel_doctor_order', 'handle_new_user', 'is_staff', 'trg_protect_profile_fields');
-- Expected: prosecdef = true, proconfig = {search_path=""} for all functions.

-- 3. Confirm RLS policies on orders, products, order_items, profiles:
SELECT tablename, policyname, cmd
FROM pg_catalog.pg_policies
WHERE schemaname = 'public' AND tablename IN ('orders', 'products', 'order_items', 'profiles')
ORDER BY tablename, cmd;
-- Expected:
-- orders: INSERT and UPDATE restricted to is_staff().
-- products: INSERT, UPDATE, DELETE restricted to is_staff().
-- order_items: ALL restricted to is_staff(); SELECT scoped by order ownership.
-- profiles: UPDATE restricted to (auth.uid() = id OR is_staff()).

-- 4. Confirm BEFORE UPDATE trigger on public.profiles:
SELECT tgname, relname, proname
FROM pg_catalog.pg_trigger tr
JOIN pg_catalog.pg_class c ON c.oid = tr.tgrelid
JOIN pg_catalog.pg_proc p ON p.oid = tr.tgfoid
WHERE c.relname = 'profiles' AND tr.tgname = 'trg_protect_profile_fields_trigger';
-- Expected: 1 row returned.
*/
