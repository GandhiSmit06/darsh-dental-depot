import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_CONTENT_TAG } from "@/lib/site/content";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

/** Called by the dashboard after saving content so the site updates immediately. Staff only. */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` };
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers, cache: "no-store" });
  if (!userRes.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = (await userRes.json()) as { id: string };

  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
    headers,
    cache: "no-store",
  });
  const [profile] = profileRes.ok ? ((await profileRes.json()) as { role: string }[]) : [];
  if (!profile || !["admin", "shop_owner"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  revalidateTag(SITE_CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
