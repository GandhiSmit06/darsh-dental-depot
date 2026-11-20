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
  testimonials: [] as Testimonial[],
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
