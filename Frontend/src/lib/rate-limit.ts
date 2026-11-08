import "server-only";

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window, per-IP request limiter kept in process memory. Good enough for
 * a single server; use a shared store (e.g. Upstash Redis) if you scale out.
 */
export function rateLimit(
  request: Request,
  name: string,
  max: number,
): { ok: boolean; retryAfter: number } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const key = `${name}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  return { ok: bucket.count <= max, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function tooManyRequests(retryAfter: number): Response {
  return Response.json(
    { success: false, message: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
