import { handleCreateRazorpayOrderRequest } from "@/lib/server-payment";

export const POST = (request: Request) => handleCreateRazorpayOrderRequest(request, process.env);
