import "server-only";

import { supabaseAnonKey, supabaseUrl } from "../config";

const STAFF_ROLES = ["admin", "shop_owner"];

/** Resolves the request's Supabase bearer token and checks the user is staff. */
export async function verifyStaffRequest(
  request: Request,
): Promise<{ ok: true } | { ok: false; status: 401 | 403 }> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401 };

  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` };
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers,
    cache: "no-store",
  });
  if (!userRes.ok) return { ok: false, status: 401 };
  const user = (await userRes.json()) as { id: string };

  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
    { headers, cache: "no-store" },
  );
  const [profile] = profileRes.ok ? ((await profileRes.json()) as { role: string }[]) : [];
  return profile && STAFF_ROLES.includes(profile.role) ? { ok: true } : { ok: false, status: 403 };
}
