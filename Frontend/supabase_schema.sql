-- ==============================================================================
-- DARSH DENTAL DEPOT — SUPABASE FULL DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'doctor' check (role in ('doctor', 'admin', 'shop_owner')),
  full_name text not null,
  phone text,
  clinic_name text,
  address text,
  medical_registration_number text,
  profile_image text,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to automatically create profile entry on Auth Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    clinic_name,
    address,
    medical_registration_number
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'full_name', 'Doctor'),
    coalesce(new.raw_user_meta_data->>'role', 'doctor'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'clinicName', new.raw_user_meta_data->>'clinic_name', ''),
    coalesce(new.raw_user_meta_data->>'address', ''),
    coalesce(new.raw_user_meta_data->>'medicalRegistrationNumber', new.raw_user_meta_data->>'medical_registration_number', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  images text[] default '{}'::text[],
  sku text unique default ('DDD-' || upper(substr(md5(random()::text), 1, 6))),
  batch_number text,
  hsn_code text,
  gst_percentage numeric default 18,
  manufacturer text,
  brand text,
  stock integer not null default 0 check (stock >= 0),
  purchase_price numeric not null default 0 check (purchase_price >= 0),
  selling_price numeric not null default 0 check (selling_price >= 0),
  discount_price numeric check (discount_price is null or discount_price >= 0),
  expiry_date date,
  status text not null default 'active' check (status in ('active', 'inactive', 'out_of_stock')),
  low_stock_threshold integer default 3,
  rating numeric default 4.8,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4))),
  user_id uuid references public.profiles(id) on delete set null,
  total_price numeric not null check (total_price >= 0),
  subtotal numeric not null default 0,
  tax_amount numeric not null default 0,
  order_status text not null default 'pending' check (order_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text not null default 'cod' check (payment_method in ('razorpay', 'stripe', 'cod')),
  payment_id text,
  shipping_address jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  price numeric not null check (price >= 0),
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can manage all profiles" 
  on public.profiles for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))
  );

-- Products Policies
create policy "Anyone can view active products" 
  on public.products for select using (true);

create policy "Admins can insert products" 
  on public.products for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))
  );

create policy "Admins can update products" 
  on public.products for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))
  );

create policy "Admins can delete products" 
  on public.products for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))
  );

-- Orders Policies
create policy "Users can view their own orders" 
  on public.orders for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner')));

create policy "Authenticated users can create orders" 
  on public.orders for insert with check (auth.uid() = user_id);

create policy "Users and admins can update orders" 
  on public.orders for update using (
    auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))
  );

-- Order Items Policies
create policy "Users can view order items for their orders" 
  on public.order_items for select using (
    exists (select 1 from public.orders where public.orders.id = public.order_items.order_id and (public.orders.user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'shop_owner'))))
  );

create policy "Authenticated users can insert order items" 
  on public.order_items for insert with check (
    exists (select 1 from public.orders where public.orders.id = public.order_items.order_id and public.orders.user_id = auth.uid())
  );

-- Reviews Policies
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- ==============================================================================
-- SEED INITIAL DENTAL PRODUCTS
-- ==============================================================================
insert into public.products (name, category, description, brand, manufacturer, stock, purchase_price, selling_price, discount_price, status, rating, review_count, images)
values
  (
    '3M Filtek Z350 XT Universal Restorative Composite Kit',
    'Restorative & Composites',
    'Nanohybrid universal composite offering exceptional aesthetics, strength and wear resistance for anterior and posterior restorations.',
    '3M ESPE',
    '3M Healthcare',
    45,
    4200,
    5850,
    5400,
    'active',
    4.9,
    28,
    array['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Dentsply Prime & Bond Universal Adhesive 4ml',
    'Bonding Agents',
    'Active-Guard technology providing balanced hydrophobic and hydrophilic properties for complete cavity coverage and zero post-op sensitivity.',
    'Dentsply Sirona',
    'Dentsply International',
    60,
    1850,
    2600,
    2350,
    'active',
    4.8,
    42,
    array['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'GC Gold Label 2 Light-Cured Universal Glass Ionomer Cement',
    'Cements & Liners',
    'Self-adhesive restorative glass ionomer cement ideal for class III, class V restorations and cervical erosion cases.',
    'GC Dental',
    'GC Corporation Japan',
    35,
    1400,
    1950,
    1800,
    'active',
    4.7,
    19,
    array['https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Mani K-Files 25mm Assorted (#15-40) Pack of 6',
    'Endodontics',
    'High-grade stainless steel hand files with tight spiral flutes for efficient dentin cutting and canal enlargement in Vadodara endodontic procedures.',
    'Mani Inc',
    'Mani Inc Japan',
    120,
    240,
    380,
    350,
    'active',
    4.9,
    64,
    array['https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Septodont Septanest 1:100,000 Articaine Anesthetic Cartridges (Box of 50)',
    'Local Anesthesia',
    'Premium dental local anesthetic with adrenaline 1:100,000 for rapid onset and profound pulp anesthesia in routine and surgical procedures.',
    'Septodont',
    'Septodont France',
    80,
    2100,
    2950,
    2750,
    'active',
    5.0,
    51,
    array['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Zhermack Hydrogum 5 Premium Alginate Impression Powder (453g)',
    'Impression Materials',
    'High-stability chromatic dust-free alginate with 5 days dimensional stability for ultra-accurate diagnostic casts.',
    'Zhermack',
    'Zhermack SpA Italy',
    95,
    520,
    780,
    720,
    'active',
    4.8,
    33,
    array['https://images.unsplash.com/photo-1583912267670-6575ad3726f8?auto=format&fit=crop&w=800&q=80']
  )
on conflict do nothing;

-- 7. STORAGE BUCKET CONFIGURATION (for product images)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public image access" 
  on storage.objects for select 
  using (bucket_id = 'product-images');

create policy "Admins can upload product images" 
  on storage.objects for insert 
  with check (
    bucket_id = 'product-images' and
    (auth.role() = 'authenticated')
  );
