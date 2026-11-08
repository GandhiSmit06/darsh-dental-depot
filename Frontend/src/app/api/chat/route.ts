import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

type HistoryItem = { role?: string; text?: string; parts?: { text?: string }[] };

const GEMINI_MODEL = "gemini-2.5-flash";
const fallback = (message: string) => Response.json({ success: false, text: "", message });

/**
 * Gemini proxy for the dental assistant chatbot. Keeps the API key on the
 * server; on any failure it returns success:false and the client falls back
 * to its local rule engine.
 */
export async function POST(request: Request) {
  const limit = rateLimit(request, "chat", Number(process.env.CHAT_RATE_LIMIT_MAX) || 20);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: unknown;
    history?: unknown;
    systemInstruction?: unknown;
  };
  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 1500) : "";
  if (!prompt) {
    return Response.json({ success: false, message: "Prompt is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback("Gemini is not configured; using local replies.");

  const history = Array.isArray(body.history)
    ? (body.history as HistoryItem[]).slice(-6).map((item) => ({
        role: item.role === "model" ? "model" : "user",
        parts: [{ text: String(item.parts?.[0]?.text ?? item.text ?? "").slice(0, 1000) }],
      }))
    : [];

  const payload: Record<string, unknown> = {
    contents: [...history, { role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
  };
  if (typeof body.systemInstruction === "string" && body.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: body.systemInstruction.slice(0, 2000) }] };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.warn(`[chat] Gemini returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return fallback("Gemini request failed; using local replies.");
    }
    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return Response.json({ success: Boolean(text), text });
  } catch (err) {
    console.error("[chat] Gemini upstream error:", err);
    return fallback("Could not reach Gemini; using local replies.");
  }
}
