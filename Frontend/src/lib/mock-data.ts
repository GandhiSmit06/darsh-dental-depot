export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
};

export const categories = [
  "Composites",
  "Impression Materials",
  "Endodontics",
  "Orthodontics",
  "Instruments",
  "Disposables",
  "Cements & Adhesives",
  "Whitening",
];

export const brands = ["3M ESPE", "Ivoclar", "Dentsply Sirona", "GC", "Kerr", "Septodont", "VOCO"];

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=600&q=80`;

const seeds = [
  "1606811971618-4486d14f3f99",
  "1588776814546-1ffcf47267a5",
  "1609840114035-3c981b782dfe",
  "1581595219315-a187dd40c322",
  "1606811841689-23dfddce3e95",
  "1612277795421-9bc7706a4a34",
  "1583912267550-aabe4ab2c8b9",
  "1629909613654-28e377c37b09",
];

export const products: Product[] = Array.from({ length: 24 }).map((_, i) => {
  const cat = categories[i % categories.length];
  const brand = brands[i % brands.length];
  return {
    id: `p-${i + 1}`,
    name: [
      "Filtek Universal Composite",
      "Alginate Impression Powder",
      "RotoFile Endo Rotary Set",
      "Orthodontic Bracket Kit",
      "Stainless Steel Scaler",
      "Disposable Bib Roll",
      "GC Fuji Glass Ionomer",
      "Opalescence Whitening Gel",
    ][i % 8] + ` ${["A2", "Pro", "Plus", "Premium", "Kit", "Pack"][i % 6]}`,
    brand,
    category: cat,
    price: Math.round((19 + (i * 7.3) % 280) * 100) / 100,
    stock: (i * 13) % 60,
    rating: 3.8 + ((i * 0.17) % 1.2),
    reviewCount: 12 + (i * 7) % 240,
    description:
      "Premium-grade dental material designed for clinical excellence. Trusted by professionals for consistent results, durability, and patient comfort.",
    image: img(seeds[i % seeds.length]),
  };
});

export const mockProducts = products;

export const featuredProducts = products.slice(0, 8);

export const testimonials = [
  {
    name: "Dr. Aisha Khan",
    role: "Endodontist, Mumbai",
    quote:
      "Darsh Dental Depot has been my go-to supplier for three years. Always on time, always genuine.",
  },
  {
    name: "Dr. Rohit Mehta",
    role: "Clinic Owner, Pune",
    quote: "Their inventory and pricing are unmatched. The platform makes reordering effortless.",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Orthodontist, Delhi",
    quote: "Premium brands at fair prices, with fast doorstep delivery. Highly recommended.",
  },
];

export const faqs = [
  {
    q: "Are all products genuine and certified?",
    a: "Yes. Every product is sourced directly from authorized distributors and ships with manufacturer certification.",
  },
  {
    q: "What is your typical delivery time?",
    a: "Orders ship within 24 hours. Most metros receive delivery in 1–3 business days.",
  },
  {
    q: "Do you offer bulk pricing for clinics?",
    a: "Absolutely. Registered clinics and shops get tiered pricing automatically at checkout.",
  },
  {
    q: "What is the return policy?",
    a: "Unopened products may be returned within 7 days. Defective items are replaced free of charge.",
  },
];

export const salesWeekly = [
  { day: "Mon", sales: 4200 },
  { day: "Tue", sales: 5100 },
  { day: "Wed", sales: 4800 },
  { day: "Thu", sales: 6100 },
  { day: "Fri", sales: 7300 },
  { day: "Sat", sales: 8200 },
  { day: "Sun", sales: 5400 },
];

export const salesMonthly = [
  { month: "Jan", sales: 42000, orders: 320 },
  { month: "Feb", sales: 48000, orders: 360 },
  { month: "Mar", sales: 51000, orders: 410 },
  { month: "Apr", sales: 49500, orders: 395 },
  { month: "May", sales: 58000, orders: 470 },
  { month: "Jun", sales: 63200, orders: 510 },
  { month: "Jul", sales: 71000, orders: 590 },
  { month: "Aug", sales: 68500, orders: 560 },
  { month: "Sep", sales: 74200, orders: 612 },
  { month: "Oct", sales: 80100, orders: 670 },
  { month: "Nov", sales: 86400, orders: 720 },
  { month: "Dec", sales: 92000, orders: 780 },
];

export const categoryShare = categories.slice(0, 5).map((c, i) => ({
  name: c,
  value: 15 + ((i * 13) % 30),
}));

export type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
};

export const orders: Order[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `ORD-${1000 + i}`,
  customer: ["Dr. A. Khan", "Dr. R. Mehta", "Dr. P. Sharma", "SmileCare Clinic", "Bright Dental"][i % 5],
  items: 1 + (i % 6),
  total: Math.round((120 + i * 47.3) * 100) / 100,
  status: (["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const)[i % 5],
  date: `2026-05-${String(22 - (i % 20)).padStart(2, "0")}`,
}));

export type User = {
  id: string;
  name: string;
  email: string;
  role: "Doctor" | "Shop Owner" | "Admin";
  status: "Active" | "Suspended" | "Pending";
  joined: string;
};

export const users: User[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `U-${i + 1}`,
  name: ["Aisha Khan", "Rohit Mehta", "Priya Sharma", "Sameer Patel", "Neha Gupta", "Vikram Roy"][i % 6],
  email: `user${i + 1}@dental.io`,
  role: (["Doctor", "Shop Owner", "Admin"] as const)[i % 3],
  status: (["Active", "Active", "Active", "Pending", "Suspended"] as const)[i % 5],
  joined: `2025-${String(((i * 2) % 12) + 1).padStart(2, "0")}-15`,
}));

export const activityLogs = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  actor: ["admin@darsh.io", "system", "dr.khan@x.io", "shop.mehta@x.io"][i % 4],
  action: [
    "Updated product inventory",
    "Approved new doctor registration",
    "Issued refund for ORD-1004",
    "Created new product",
    "Deactivated user",
  ][i % 5],
  time: `${i + 1}h ago`,
}));
