import { handleSendEmailOtpRequest } from "@/lib/server-email";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(request, "email-otp", Number(process.env.AUTH_RATE_LIMIT_MAX) || 20);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);
  return handleSendEmailOtpRequest(request, process.env);
}
