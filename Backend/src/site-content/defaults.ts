// Default website content, used until a value is saved from the admin
// dashboard (Website Content tab). Generated from the original static data.js.

export type SiteSettings = typeof defaultSettings;

export const defaultSettings = {
  phone: "+91 97270 76119",
  phoneRaw: "919727076119",
  hours: "Mon–Sat: 10 AM – 8:30 PM",
  address:
    "FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001",
  mapsQuery: "Vraj Vihar Complex, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001",
};

export type Category = { id: string; name: string; img: string; blurb: string };
export type Brand = { name: string; tag: string; cats: string };
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};
export type Faq = { q: string; a: string };
export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  cat: string;
  price: number;
  mrp: number;
  img: string;
  rating: number;
  reviews: number;
  stock: "in" | "low" | "out";
  unit?: string;
  featured?: boolean;
};

export const defaultLists = {
  categories: [
    {
      id: "restorative",
      name: "Composite & Restorative",
      img: "/site/assets/img/p-filtek.png",
      blurb: "Composites, GIC, bonds & cements",
    },
    {
      id: "endo",
      name: "Endodontics",
      img: "/site/assets/img/p-rotary.png",
      blurb: "Rotary files, sealers & endo equipment",
    },
    {
      id: "impression",
      name: "Impression Materials",
      img: "/site/assets/img/p-alginate.png",
      blurb: "Alginates, putties & VPS",
    },
    {
      id: "sterile",
      name: "Sterilization & Disposables",
      img: "/site/assets/img/p-gloves.png",
      blurb: "Gloves, pouches, masks & tips",
    },
  ] as Category[],
  brands: [
    {
      name: "3M Oral Care",
      tag: "Global",
      cats: "Composites, Cements, Impression",
    },
    {
      name: "Ivoclar Vivadent",
      tag: "Liechtenstein",
      cats: "Composites, Cements, Prosthetics",
    },
    {
      name: "GC India",
      tag: "Japan / India",
      cats: "GIC, Composites, Impression",
    },
    {
      name: "Dentsply Sirona",
      tag: "USA",
      cats: "Endo Files, Composites, Equipment",
    },
    {
      name: "MANI",
      tag: "Japan",
      cats: "Endo Files, Instruments",
    },
    {
      name: "Zhermack",
      tag: "Italy",
      cats: "Alginate, Silicone Putty",
    },
    {
      name: "Septodont",
      tag: "France",
      cats: "Anaesthetics, Endo, Disposables",
    },
    {
      name: "Kerr",
      tag: "USA",
      cats: "Bonds, Composites, Impression",
    },
    {
      name: "Kuraray Noritake",
      tag: "Japan",
      cats: "Bonds, Cements, Porcelain",
    },
    {
      name: "VOCO",
      tag: "Germany",
      cats: "Composites, Cements, Fluoride",
    },
    {
      name: "SHOFU",
      tag: "Japan",
      cats: "Composites, Polishers, Cements",
    },
    {
      name: "COLTENE",
      tag: "Switzerland",
      cats: "Endo, Impression, Hygiene",
    },
    {
      name: "KULZER",
      tag: "Germany",
      cats: "Composites, Impression",
    },
    {
      name: "ULTRADENT",
      tag: "USA",
      cats: "Hemostatics, Whitening, Endo",
    },
    {
      name: "Hu-Friedy",
      tag: "USA",
      cats: "Instruments & Instrument Care",
    },
    {
      name: "BISCO",
      tag: "USA",
      cats: "Bonds, Liners, Cements",
    },
    {
      name: "Straumann",
      tag: "Switzerland",
      cats: "Implants & Prosthetics",
    },
    {
      name: "Tokuyama",
      tag: "Japan",
      cats: "Composites, Cements",
    },
    {
      name: "SDI",
      tag: "Australia",
      cats: "GIC, Amalgam, Whitening",
    },
    {
      name: "Woodpecker",
      tag: "China",
      cats: "Endo Motors, Scalers, Devices",
    },
  ] as Brand[],
  testimonials: [
    {
      quote:
        "Ordered ProTaper Gold at 4 PM — files reached my Manjalpur clinic before evening OPD. Batch numbers verified on delivery, every single time.",
      name: "Dr. Rajan Patel",
      role: "MDS — Endodontist, Manjalpur",
      initials: "RP",
    },
    {
      quote:
        "The only depot in Vadodara that I trust for original stock. Depot pricing saves my clinic nearly 15–18% every month on composites.",
      name: "Dr. Nisha Shah",
      role: "BDS — Smile Care Dental, Alkapuri",
      initials: "NS",
    },
    {
      quote:
        "Sunday emergency, needed anaesthetic cartridges urgently. One WhatsApp message and it was at my clinic in under two hours. Unmatched.",
      name: "Dr. Amey Trivedi",
      role: "MDS — Oral Surgeon, Gotri",
      initials: "AT",
    },
  ] as Testimonial[],
  faqs: [
    {
      q: "Do you deliver to my clinic, and how fast?",
      a: "Yes — same-day 2-hour express delivery covers every major area of Vadodara: Alkapuri, Akota, Gotri, Manjalpur, Waghodia Road, Harni, Nizampura, Fatehgunj and more. Orders placed before 7:30 PM are dispatched the same working day.",
    },
    {
      q: "How do I know the products are 100% genuine?",
      a: "Every item is sourced directly from authorised distributors and manufacturers. Original batch numbers, manufacturing dates and manufacturer warranty support accompany every product — you can verify each batch before use.",
    },
    {
      q: "Are these wholesale / depot prices for doctors?",
      a: "Yes. Registered Vadodara doctors get direct depot pricing — the same wholesale rates our physical counter offers, with no marketplace markup. Sign in to the Doctor Portal or order on WhatsApp to receive your rate card.",
    },
    {
      q: "Do I need an account to place an order?",
      a: "No. You can order directly on WhatsApp at +91 97270 76119 in minutes. A free Doctor Portal account additionally gives you order history, GST invoices, and one-tap reorder.",
    },
    {
      q: "What are your working hours?",
      a: "The Shiyabaug depot is open Monday to Saturday, 10:00 AM to 8:30 PM. Sundays are closed for walk-ins, but urgent clinical supplies are handled on-call — message us on WhatsApp and we will arrange it.",
    },
    {
      q: "Can I return a product if there is an issue?",
      a: "Absolutely. Unopened items in original condition can be exchanged within 7 days, and any manufacturing defect is covered by the manufacturer warranty — we coordinate the claim for you.",
    },
  ] as Faq[],
};

export type ListName = keyof typeof defaultLists;

/** Sample catalog shown only while the Supabase products table is empty or unreachable. */
export const sampleProducts: CatalogProduct[] = [
  {
    id: "filtek",
    name: "Filtek Z350 XT Restorative Composite — A2",
    brand: "3M Oral Care",
    cat: "restorative",
    price: 4250,
    mrp: 4950,
    img: "/site/assets/img/p-filtek.png",
    rating: 4.9,
    reviews: 214,
    stock: "in",
    unit: "4 g syringe",
    featured: true,
  },
  {
    id: "tetric",
    name: "Tetric EvoCeram Bulk-Fill Composite",
    brand: "Ivoclar Vivadent",
    cat: "restorative",
    price: 3450,
    mrp: 3980,
    img: "/site/assets/img/p-syringe.png",
    rating: 4.8,
    reviews: 167,
    stock: "in",
    unit: "3 g syringe",
  },
  {
    id: "fuji-ix",
    name: "Fuji IX GP Packable Glass Ionomer — A2",
    brand: "GC India",
    cat: "restorative",
    price: 2150,
    mrp: 2490,
    img: "/site/assets/img/p-gic.png",
    rating: 4.8,
    reviews: 189,
    stock: "in",
    unit: "15 g powder + liquid",
  },
  {
    id: "optibond",
    name: "OptiBond Universal Adhesive",
    brand: "Kerr",
    cat: "restorative",
    price: 3850,
    mrp: 4350,
    img: "/site/assets/img/p-bond.png",
    rating: 4.7,
    reviews: 96,
    stock: "low",
    unit: "5 mL bottle",
  },
  {
    id: "protaper",
    name: "ProTaper Gold Rotary Files 25 mm",
    brand: "Dentsply Sirona",
    cat: "endo",
    price: 5850,
    mrp: 6480,
    img: "/site/assets/img/p-rotary.png",
    rating: 4.9,
    reviews: 243,
    stock: "in",
    unit: "pack of 6",
    featured: true,
  },
  {
    id: "kfile",
    name: "K-Files Stainless Steel 25 mm",
    brand: "MANI",
    cat: "endo",
    price: 650,
    mrp: 750,
    img: "/site/assets/img/p-kfile.png",
    rating: 4.8,
    reviews: 312,
    stock: "in",
    unit: "pack of 10",
  },
  {
    id: "apex",
    name: "DPEX III Apex Locator",
    brand: "Woodpecker",
    cat: "endo",
    price: 12500,
    mrp: 14200,
    img: "/site/assets/img/p-apex.png",
    rating: 4.7,
    reviews: 58,
    stock: "in",
    unit: "1 device + warranty",
  },
  {
    id: "tropicalgin",
    name: "Tropicalgin Alginate Impression Material",
    brand: "Zhermack",
    cat: "impression",
    price: 500,
    mrp: 625,
    img: "/site/assets/img/p-alginate.png",
    rating: 4.8,
    reviews: 428,
    stock: "in",
    unit: "453 g pouch",
    featured: true,
  },
  {
    id: "zetaplus",
    name: "Zeta+ C-Silicone Putty Impression Material",
    brand: "Zhermack",
    cat: "impression",
    price: 2750,
    mrp: 3100,
    img: "/site/assets/img/p-putty.png",
    rating: 4.7,
    reviews: 121,
    stock: "in",
    unit: "900 ml putty + light",
  },
  {
    id: "express",
    name: "Express 2 Light Body VPS Impression",
    brand: "3M Oral Care",
    cat: "impression",
    price: 3950,
    mrp: 4500,
    img: "/site/assets/img/p-lightbody.png",
    rating: 4.8,
    reviews: 87,
    stock: "out",
    unit: "50 ml cartridge",
  },
  {
    id: "gloves",
    name: "Nitrile Examination Gloves — Mint",
    brand: "Depot Essentials",
    cat: "sterile",
    price: 890,
    mrp: 1050,
    img: "/site/assets/img/p-gloves.png",
    rating: 4.6,
    reviews: 503,
    stock: "in",
    unit: "box of 100",
    featured: true,
  },
  {
    id: "pouches",
    name: "Self-Seal Sterilization Pouches 3.5″ × 9″",
    brand: "Depot Essentials",
    cat: "sterile",
    price: 1150,
    mrp: 1350,
    img: "/site/assets/img/p-pouches.png",
    rating: 4.7,
    reviews: 289,
    stock: "in",
    unit: "box of 200",
  },
  {
    id: "masks",
    name: "3-Ply Surgical Earloop Masks",
    brand: "Depot Essentials",
    cat: "sterile",
    price: 450,
    mrp: 520,
    img: "/site/assets/img/p-masks.png",
    rating: 4.5,
    reviews: 640,
    stock: "in",
    unit: "box of 50",
  },
];
