"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { DentalAiChatbot } from "@/components/chatbot/DentalAiChatbot";
import { InternetReconnectModal } from "@/components/ui/InternetReconnectModal";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <InternetReconnectModal />
          <div id="app-root-content" className="min-h-screen flex flex-col w-full">
            {children}
          </div>
          <DentalAiChatbot />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
