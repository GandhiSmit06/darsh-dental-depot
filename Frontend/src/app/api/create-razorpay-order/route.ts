import { handleCreateRazorpayOrderRequest } from "@darsh/backend/payments/razorpay";

export const POST = (request: Request) => handleCreateRazorpayOrderRequest(request, process.env);
