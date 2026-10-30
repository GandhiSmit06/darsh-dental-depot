import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { WifiOff } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { PageLoader } from "@/components/ui/PageLoader";
import { DentalAiChatbot } from "@/components/chatbot/DentalAiChatbot";
import { InternetReconnectModal } from "@/components/ui/InternetReconnectModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl">
        <div className="relative mx-auto w-44 h-28 mb-3 flex items-center justify-center">
          {!imgError ? (
            <img
              src="/internet-reconnect-plugs.svg"
              alt="Connection disrupted"
              width={176}
              height={112}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(18,164,136,0.3)]"
              loading="eager"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#12A488]/15 border border-[#12A488]/30 flex items-center justify-center shadow-inner">
              <WifiOff className="w-8 h-8 animate-pulse text-[#3FD1B3]" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold font-heading text-foreground">Connection or Server Disrupted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We encountered an issue communicating with the depot servers. Please check your internet connection and try again.
        </p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#12A488] to-[#3FD1B3] px-6 py-2.5 text-xs font-bold text-black tracking-wide shadow-lg shadow-[#12A488]/20 hover:opacity-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Darsh Dental Depot — Premium Dental Materials Supplier" },
      { name: "description", content: "Trusted supplier of premium dental materials, instruments and supplies for clinics and professionals across India." },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preload", href: "/loading.svg", as: "image", type: "image/svg+xml" },
      { rel: "preload", href: "/internet-reconnect-plugs.svg", as: "image", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var d=document.documentElement,t=localStorage.getItem('theme'),isDark=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){d.classList.add('dark');d.style.colorScheme='dark';}else{d.classList.remove('dark');d.style.colorScheme='light';}}catch(e){}try{if(sessionStorage.getItem('ddd_initial_seen')==='true'){document.documentElement.classList.add('ddd-app-ready','ddd-seen');}}catch(e){}})();",
          }}
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PageLoader />
          <InternetReconnectModal />
          <div id="app-root-content" className="min-h-screen flex flex-col w-full">
            <Outlet />
          </div>
          <DentalAiChatbot />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
