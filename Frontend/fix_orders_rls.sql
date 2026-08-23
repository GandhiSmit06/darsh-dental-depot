-- ==============================================================================
-- FIX: ALLOW DOCTORS & USERS TO CANCEL / UPDATE THEIR OWN ORDERS IN SUPABASE
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/wzkqjeejgrolkdkywovp/sql/new
-- ==============================================================================

-- 1. Drop existing restricted update policies on orders
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Users can update their own orders" on public.orders;
drop policy if exists "Users and admins can update orders" on public.orders;

-- 2. Create comprehensive update policy allowing doctors to cancel/update their own orders and admins to update all orders
create policy "Users and admins can update orders" 
  on public.orders for update using (
    auth.uid() = user_id or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner')
    )
  );

-- 3. Allow stock updates when placing or cancelling orders
drop policy if exists "Anyone can update product stock" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Users and admins can update products" on public.products;

create policy "Users and admins can update products"
  on public.products for update using (
    true
  );
