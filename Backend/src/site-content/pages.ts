import "server-only";

import { parse, type HTMLElement } from "node-html-parser";
import { getContentOverrides } from "./content";

/** Page HTML templates keyed by file name (e.g. "index.html"). */
export type SiteTemplates = Record<string, string>;

/**
 * Public marketing pages are HTML templates (Frontend/src/site). Elements tagged with
 * data-cms="<key>" are editable from the admin dashboard; their current markup
 * is the default until a value is saved in the site_content table.
 */
export const SITE_PAGES = {
  home: { file: "index.html", label: "Home", path: "/" },
  products: { file: "products.html", label: "Products", path: "/products" },
  brands: { file: "brands.html", label: "Brands", path: "/brands" },
  about: { file: "about.html", label: "About", path: "/about" },
  location: { file: "location.html", label: "Location", path: "/location" },
  contact: { file: "contact.html", label: "Contact", path: "/contact" },
} as const;

export type SitePage = keyof typeof SITE_PAGES;

export type FieldType = "text" | "image" | "count" | "meta";

export type EditableField = {
  key: string;
  page: SitePage;
  section: string;
  type: FieldType;
  label: string;
  defaultValue: string;
};

function readTemplate(templates: SiteTemplates, page: SitePage): string {
  const html = templates[SITE_PAGES[page].file];
  if (!html)
    throw new Error(`Missing site template ${SITE_PAGES[page].file}; run npm run site:templates`);
  return html;
}

/** Strip anything executable from staff-entered rich text. */
function sanitizeInline(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?(<\/\s*\1\s*>|$)/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function getMeta(root: HTMLElement) {
  return {
    title: root.querySelector("title")?.text ?? "",
    description: root.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
  };
}

/** Render a page with saved overrides applied. */
export async function renderSitePage(templates: SiteTemplates, page: SitePage): Promise<string> {
  const template = readTemplate(templates, page);
  const overrides = await getContentOverrides();
  if (!Object.keys(overrides).some((k) => k.startsWith(`${page}.`))) return template;
  const root = parse(template, { comment: true });

  for (const el of root.querySelectorAll("[data-cms]")) {
    const key = el.getAttribute("data-cms")!;
    const value = overrides[key];
    if (value == null || value === "") continue;
    const type = el.getAttribute("data-cms-type");
    if (type === "image") {
      el.setAttribute("src", value);
    } else if (type === "count") {
      const num = parseInt(value, 10);
      if (!Number.isNaN(num)) el.setAttribute("data-count", String(num));
    } else {
      el.set_content(sanitizeInline(value));
    }
  }

  const title = overrides[`${page}.meta.title`];
  if (title) root.querySelector("title")?.set_content(escapeAttr(title));
  const description = overrides[`${page}.meta.description`];
  if (description)
    root.querySelector('meta[name="description"]')?.setAttribute("content", description);

  return root.toString();
}

function sectionName(el: HTMLElement): string {
  for (let a: HTMLElement | null = el.parentNode; a; a = a.parentNode) {
    if (a.rawTagName?.toLowerCase() === "section" || a.classList?.contains("hero")) {
      const heading = a.querySelector("h1, h2");
      if (heading) return heading.text.replace(/\s+/g, " ").trim();
    }
  }
  return "Page";
}

/** Every editable field across all pages, with its default value. */
export async function listEditableFields(templates: SiteTemplates): Promise<EditableField[]> {
  const fields: EditableField[] = [];
  for (const page of Object.keys(SITE_PAGES) as SitePage[]) {
    const root = parse(readTemplate(templates, page));
    const meta = getMeta(root);
    fields.push(
      {
        key: `${page}.meta.title`,
        page,
        section: "Search engine (SEO)",
        type: "meta",
        label: "Browser tab title",
        defaultValue: meta.title,
      },
      {
        key: `${page}.meta.description`,
        page,
        section: "Search engine (SEO)",
        type: "meta",
        label: "Search description",
        defaultValue: meta.description,
      },
    );
    for (const el of root.querySelectorAll("[data-cms]")) {
      const type = (el.getAttribute("data-cms-type") as FieldType | undefined) ?? "text";
      const defaultValue =
        type === "image"
          ? (el.getAttribute("src") ?? "")
          : type === "count"
            ? (el.getAttribute("data-count") ?? "")
            : el.innerHTML.trim();
      const tag = el.rawTagName.toLowerCase();
      const label =
        type === "image"
          ? `Image: ${el.getAttribute("alt") || "untitled"}`
          : type === "count"
            ? `Number${el.getAttribute("data-suffix") ? ` (shown with "${el.getAttribute("data-suffix")}")` : ""}`
            : /^h[1-4]$/.test(tag)
              ? "Heading"
              : el.classList.contains("eyebrow")
                ? "Small label"
                : tag === "p"
                  ? "Paragraph"
                  : tag === "li"
                    ? "List item"
                    : "Text";
      fields.push({
        key: el.getAttribute("data-cms")!,
        page,
        section: sectionName(el),
        type,
        label,
        defaultValue,
      });
    }
  }
  return fields;
}
