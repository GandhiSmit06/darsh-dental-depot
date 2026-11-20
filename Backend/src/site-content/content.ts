import "server-only";

import { supabaseAnonKey, supabaseUrl } from "../config";
import {
  defaultLists,
  defaultSettings,
  type CatalogProduct,
  type ListName,
  type SiteSettings,
} from "./defaults";

export const SITE_CONTENT_TAG = "site-content";
const REVALIDATE_SECONDS = 300;
const DEFAULT_LOW_STOCK = Number(process.env.LOW_STOCK_THRESHOLD) || 3;

async function supabaseRest<T>(query: string): Promise<T | null> {
  const resource = query.split("?", 1)[0];
  const headers = new Headers({ apikey: supabaseAnonKey });
  // Legacy anon keys are JWTs. Publishable keys belong only in the apikey header.
  if (!supabaseAnonKey.startsWith("sb_publishable_")) {
    headers.set("Authorization", `Bearer ${supabaseAnonKey}`);
  }
  try {
    const init: RequestInit & {
      next?: { revalidate?: number; tags?: string[] };
    } = {
      headers,
      // Next.js data cache: refreshed every 5 minutes or when the dashboard saves.
      next: { revalidate: REVALIDATE_SECONDS, tags: [SITE_CONTENT_TAG] },
    };
    const res = await fetch(`${supabaseUrl}/rest/v1/${query}`, init);
    if (!res.ok) {
      console.warn(`Supabase ${resource} request failed (${res.status})`);
      return null;
    }
    return (await res.json()) as T;
  } catch {
    console.warn(`Could not read Supabase ${resource}`);
    return null;
  }
}

/** All saved overrides as a key -> value map (empty if the table is missing). */
export async function getContentOverrides(): Promise<Record<string, string>> {
  const rows = await supabaseRest<{ key: string; value: string }[]>(
    "site_content?select=key,value",
  );
  return Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
}

export function resolveSettings(overrides: Record<string, string>): SiteSettings {
  const settings = { ...defaultSettings };
  for (const k of Object.keys(settings) as (keyof SiteSettings)[]) {
    const v = overrides[`settings.${k}`];
    if (v?.trim()) settings[k] = v.trim();
  }
  return settings;
}

export function resolveList<N extends ListName>(
  overrides: Record<string, string>,
  name: N,
): (typeof defaultLists)[N] {
  const raw = overrides[`list.${name}`];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as (typeof defaultLists)[N];
    } catch {
      /* fall back to defaults */
    }
  }
  return defaultLists[name];
}

type ProductRow = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  manufacturer: string | null;
  images: string[] | null;
  stock: number;
  selling_price: number;
  discount_price: number | null;
  status: string;
  low_stock_threshold: number | null;
  rating: number | null;
  review_count: number | null;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Live products in the catalog's shape. Null indicates an upstream error. */
export async function getCatalogProducts(): Promise<CatalogProduct[] | null> {
  const rows = await supabaseRest<ProductRow[]>(
    "products?select=id,name,category,brand,manufacturer,images,stock,selling_price,discount_price,status,low_stock_threshold,rating,review_count&status=neq.inactive&order=review_count.desc.nullslast",
  );
  if (rows === null) return null;

  return rows.map((p, i) => {
    const mrp = Number(p.selling_price) || 0;
    const discountPrice = Number(p.discount_price);
    const outOfStock = p.status === "out_of_stock" || p.stock <= 0;
    return {
      id: p.id,
      name: p.name,
      brand: p.brand || p.manufacturer || "Darsh Dental Depot",
      cat: slugify(p.category),
      price: discountPrice > 0 && discountPrice < mrp ? discountPrice : mrp,
      mrp,
      img: p.images?.[0] || "/site/assets/img/brand/logo-mark-512.png",
      rating: Number(p.rating) || 0,
      reviews: p.review_count ?? 0,
      stock: outOfStock
        ? "out"
        : p.stock <= (p.low_stock_threshold ?? DEFAULT_LOW_STOCK)
          ? "low"
          : "in",
      featured: i < 8,
    };
  });
}
