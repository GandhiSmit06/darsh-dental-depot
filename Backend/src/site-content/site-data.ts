import "server-only";

import {
  getCatalogProducts,
  getContentOverrides,
  resolveList,
  resolveSettings,
  slugify,
} from "./content";
import type { Category } from "./defaults";

/** Builds the `window.DDD` script consumed by the marketing pages. */
export async function buildSiteDataScript(): Promise<string> {
  const [overrides, products] = await Promise.all([getContentOverrides(), getCatalogProducts()]);
  const configured = resolveList(overrides, "categories");

  // Show every category that has products; configured cards supply the
  // name/image/blurb when their id matches the product category slug.
  const byId = new Map(configured.map((c) => [slugify(c.id), c]));
  const usedIds = [...new Set(products.map((p) => p.cat))];
  const categories: Category[] = usedIds.map((id) => {
    const c = byId.get(id);
    const items = products.filter((p) => p.cat === id);
    return c
      ? { ...c, id }
      : {
          id,
          name: id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
          img: items[0]?.img ?? "",
          blurb: `${items.length} product${items.length === 1 ? "" : "s"} in stock`,
        };
  });

  const data = {
    ...resolveSettings(overrides),
    categories,
    brands: resolveList(overrides, "brands"),
    testimonials: resolveList(overrides, "testimonials"),
    faqs: resolveList(overrides, "faqs"),
    products,
  };

  const js = `const DDD = ${JSON.stringify(data)};
DDD.money = n => '₹' + Number(n).toLocaleString('en-IN');
DDD.off = p => p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
DDD.wa = text => 'https://wa.me/' + DDD.phoneRaw + '?text=' + encodeURIComponent(text);
DDD.catName = id => (DDD.categories.find(c => c.id === id) || {}).name || id;
DDD.byCategory = id => DDD.products.filter(p => p.cat === id);
DDD.featured = () => DDD.products.filter(p => p.featured);
DDD.product = id => DDD.products.find(p => p.id === id);
`;

  return js;
}
