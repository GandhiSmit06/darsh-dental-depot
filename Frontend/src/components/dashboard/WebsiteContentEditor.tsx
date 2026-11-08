"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteContentApi, type SiteContentSchema, type SiteEditableField } from "@/lib/api";

const SETTINGS_LABELS: Record<string, string> = {
  phone: "Phone number (as displayed)",
  phoneRaw: "WhatsApp number (digits only, with country code)",
  hours: "Opening hours",
  address: "Depot address",
  mapsQuery: "Google Maps search text",
};

const LIST_LABELS: Record<string, { title: string; hint: string }> = {
  categories: {
    title: "Product categories",
    hint: "Cards on the home page and catalog filters. The id must match a product category name in lowercase with dashes (e.g. “Impression Materials” → impression-materials).",
  },
  brands: { title: "Brands", hint: "Brand marquee and the Brands page." },
  testimonials: { title: "Testimonials", hint: "Doctor reviews on the home page." },
  faqs: { title: "FAQs", hint: "Questions and answers on the home page." },
};

const FIELD_LABELS: Record<string, string> = {
  id: "Id",
  name: "Name",
  img: "Image",
  blurb: "Short description",
  tag: "Country / tag",
  cats: "Categories supplied",
  quote: "Quote",
  role: "Role & clinic",
  initials: "Initials",
  q: "Question",
  a: "Answer",
};

type Tab = { id: string; label: string };

export function WebsiteContentEditor() {
  const [schema, setSchema] = useState<SiteContentSchema | null>(null);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("home");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [s, values] = await Promise.all([
        siteContentApi.getSchema(),
        siteContentApi.getSaved(),
      ]);
      setSchema(s);
      setSaved(values);
      setDraft({});
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load website content");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tabs: Tab[] = useMemo(
    () =>
      schema
        ? [
            ...Object.entries(schema.pages).map(([id, p]) => ({ id, label: p.label })),
            { id: "settings", label: "Contact details" },
            ...Object.keys(schema.lists).map((id) => ({
              id: `list:${id}`,
              label: LIST_LABELS[id]?.title ?? id,
            })),
          ]
        : [],
    [schema],
  );

  const dirtyCount = Object.keys(draft).length;
  const valueOf = (key: string, fallback: string) => draft[key] ?? saved[key] ?? fallback;
  const setValue = (key: string, value: string, fallback: string) =>
    setDraft((d) => {
      const next = { ...d };
      if (value === (saved[key] ?? fallback)) delete next[key];
      else next[key] = value;
      return next;
    });

  const saveAll = async () => {
    setSaving(true);
    try {
      await siteContentApi.save(draft);
      setSaved((s) => ({ ...s, ...draft }));
      setDraft({});
      toast.success("Website updated — changes are live");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const resetKeys = async (keys: string[]) => {
    const savedKeys = keys.filter((k) => k in saved);
    setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !keys.includes(k))));
    if (!savedKeys.length) return;
    try {
      await siteContentApi.reset(savedKeys);
      setSaved((s) =>
        Object.fromEntries(Object.entries(s).filter(([k]) => !savedKeys.includes(k))),
      );
      toast.success("Restored the original content");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset");
    }
  };

  if (loadError) {
    return (
      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-semibold">Website content is not set up yet</h2>
        <p className="text-sm text-muted-foreground">
          {loadError}. Run{" "}
          <code className="rounded bg-muted px-1">supabase/04_site_content.sql</code> in the
          Supabase SQL editor, then reload.
        </p>
        <Button variant="outline" onClick={load}>
          Try again
        </Button>
      </Card>
    );
  }

  if (!schema) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const page = schema.pages[tab];

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website content</h1>
          <p className="text-sm text-muted-foreground">
            Edit the text, images and details on the public website. Products come from the Products
            section.
          </p>
        </div>
        {page && (
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
            <a href={page.path} target="_blank" rel="noopener">
              View {page.label} page <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {page && (
        <PageFields
          fields={schema.fields.filter((f) => f.page === tab)}
          saved={saved}
          draft={draft}
          valueOf={valueOf}
          setValue={setValue}
          onReset={resetKeys}
        />
      )}

      {tab === "settings" && (
        <Card className="space-y-4 p-4 sm:p-6">
          {Object.entries(schema.settings).map(([k, def]) => {
            const key = `settings.${k}`;
            return (
              <FieldShell
                key={key}
                label={SETTINGS_LABELS[k] ?? k}
                edited={key in saved}
                dirty={key in draft}
                onReset={() => resetKeys([key])}
              >
                <Input
                  value={valueOf(key, def)}
                  onChange={(e) => setValue(key, e.target.value, def)}
                />
              </FieldShell>
            );
          })}
        </Card>
      )}

      {tab.startsWith("list:") && (
        <ListEditor
          name={tab.slice(5)}
          defaults={schema.lists[tab.slice(5)]}
          value={valueOf(`list.${tab.slice(5)}`, "")}
          edited={`list.${tab.slice(5)}` in saved}
          onChange={(v) => setValue(`list.${tab.slice(5)}`, v, "")}
          onReset={() => resetKeys([`list.${tab.slice(5)}`])}
        />
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur transition-transform ${
          dirtyCount ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDraft({})} disabled={saving}>
              Discard
            </Button>
            <Button size="sm" onClick={saveAll} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Save &amp; publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageFields({
  fields,
  saved,
  draft,
  valueOf,
  setValue,
  onReset,
}: {
  fields: SiteEditableField[];
  saved: Record<string, string>;
  draft: Record<string, string>;
  valueOf: (key: string, fallback: string) => string;
  setValue: (key: string, value: string, fallback: string) => void;
  onReset: (keys: string[]) => void;
}) {
  const sections = useMemo(() => {
    const map = new Map<string, SiteEditableField[]>();
    for (const f of fields) map.set(f.section, [...(map.get(f.section) ?? []), f]);
    return [...map.entries()];
  }, [fields]);

  return (
    <div className="space-y-4">
      {sections.map(([section, items]) => (
        <Card key={section} className="space-y-4 p-4 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {section}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((f) => (
              <div
                key={f.key}
                className={f.type === "text" && f.defaultValue.length > 90 ? "md:col-span-2" : ""}
              >
                <FieldShell
                  label={f.label}
                  edited={f.key in saved}
                  dirty={f.key in draft}
                  onReset={() => onReset([f.key])}
                >
                  {f.type === "image" ? (
                    <ImageInput
                      value={valueOf(f.key, f.defaultValue)}
                      onChange={(v) => setValue(f.key, v, f.defaultValue)}
                    />
                  ) : f.type === "count" ? (
                    <Input
                      type="number"
                      min={0}
                      value={valueOf(f.key, f.defaultValue)}
                      onChange={(e) => setValue(f.key, e.target.value, f.defaultValue)}
                    />
                  ) : (
                    <Textarea
                      rows={Math.min(6, Math.max(1, Math.ceil(f.defaultValue.length / 70)))}
                      value={valueOf(f.key, f.defaultValue)}
                      onChange={(e) => setValue(f.key, e.target.value, f.defaultValue)}
                    />
                  )}
                  {f.type === "text" && /<em>/.test(f.defaultValue) && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Words inside &lt;em&gt;…&lt;/em&gt; are shown in the highlighted italic style.
                    </p>
                  )}
                </FieldShell>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function FieldShell({
  label,
  edited,
  dirty,
  onReset,
  children,
}: {
  label: string;
  edited: boolean;
  dirty: boolean;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-1.5">
          {dirty && <Badge variant="secondary">Unsaved</Badge>}
          {edited && !dirty && <Badge variant="outline">Edited</Badge>}
          {(edited || dirty) && (
            <button
              type="button"
              onClick={onReset}
              title="Restore original"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Images must be under 5 MB");
    setUploading(true);
    try {
      onChange(await siteContentApi.uploadImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-36">
        {value && <img src={value} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-1.5 h-4 w-4" />
          )}
          Upload image
        </Button>
      </div>
    </div>
  );
}

function ListEditor({
  name,
  defaults,
  value,
  edited,
  onChange,
  onReset,
}: {
  name: string;
  defaults: Record<string, string>[];
  value: string;
  edited: boolean;
  onChange: (json: string) => void;
  onReset: () => void;
}) {
  const items: Record<string, string>[] = useMemo(() => {
    try {
      const parsed = value ? JSON.parse(value) : null;
      return Array.isArray(parsed) ? parsed : defaults;
    } catch {
      return defaults;
    }
  }, [value, defaults]);
  const keys = Object.keys(defaults[0] ?? {});
  const meta = LIST_LABELS[name];

  const update = (next: Record<string, string>[]) => onChange(JSON.stringify(next));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    update(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{meta?.hint}</p>
        {edited && (
          <Button variant="ghost" size="sm" className="self-start" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restore original list
          </Button>
        )}
      </div>
      {items.map((item, i) => (
        <Card key={i} className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => update(items.filter((_, j) => j !== i))}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {keys.map((k) => {
              const v = String(item[k] ?? "");
              const set = (nv: string) =>
                update(items.map((it, j) => (j === i ? { ...it, [k]: nv } : it)));
              const long = k === "quote" || k === "a" || k === "blurb";
              return (
                <div
                  key={k}
                  className={`space-y-1.5 ${long || k === "img" ? "md:col-span-2" : ""}`}
                >
                  <Label className="text-xs">{FIELD_LABELS[k] ?? k}</Label>
                  {k === "img" ? (
                    <ImageInput value={v} onChange={set} />
                  ) : long ? (
                    <Textarea rows={3} value={v} onChange={(e) => set(e.target.value)} />
                  ) : (
                    <Input value={v} onChange={(e) => set(e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={() => update([...items, Object.fromEntries(keys.map((k) => [k, ""]))])}
      >
        <Plus className="mr-1.5 h-4 w-4" /> Add item
      </Button>
    </div>
  );
}
