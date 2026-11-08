import { handleVerifyPaymentRequest } from "@/lib/server-payment";

export const POST = (request: Request) => handleVerifyPaymentRequest(request, process.env);
