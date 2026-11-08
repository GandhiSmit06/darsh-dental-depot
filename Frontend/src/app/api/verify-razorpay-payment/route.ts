import { handleVerifyPaymentRequest } from "@darsh/backend/payments/razorpay";

export const POST = (request: Request) => handleVerifyPaymentRequest(request, process.env);
