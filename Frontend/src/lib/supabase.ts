import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wzkqjeejgrolkdkywovp.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WxtFdrwndFYgyhC6E0hdzw_pSxquJcl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  email: string;
  role: 'doctor' | 'admin' | 'shop_owner';
  full_name: string;
  phone?: string;
  clinic_name?: string;
  address?: string;
  medical_registration_number?: string;
  profile_image?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  sku: string;
  batch_number?: string;
  hsn_code?: string;
  gst_percentage?: number;
  manufacturer?: string;
  brand?: string;
  stock: number;
  purchase_price: number;
  selling_price: number;
  discount_price?: number;
  expiry_date?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  low_stock_threshold: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  total_price: number;
  subtotal: number;
  tax_amount: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'razorpay' | 'stripe' | 'cod';
  payment_id?: string;
  shipping_address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    fullName?: string;
    phone?: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  created_at: string;
};
