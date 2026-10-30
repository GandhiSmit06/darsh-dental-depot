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
import { MagneticCursor } from "@/components/ui/magnetic-cursor";
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

function classifyError(err: unknown) {
  const msg = (err instanceof Error ? err.message : String(err || "")).toLowerCase();
  const status = typeof (err as any)?.status === "number" ? (err as any).status : 0;
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (isOffline || msg.includes("network") || msg.includes("failed to fetch") || msg.includes("offline")) {
    return {
      type: "network" as const,
      title: "Connection Disrupted",
      description: "Unable to communicate with depot servers. Please check your internet connection and try again.",
      primaryText: "Retry Connection",
      primaryHref: null,
      isRetry: true,
    };
  }

  if (
    status === 401 ||
    msg.includes("unauthorized") ||
    msg.includes("jwt") ||
    msg.includes("session expired") ||
    msg.includes("not logged in")
  ) {
    return {
      type: "auth" as const,
      title: "Clinic Session Expired",
      description: "Your clinic session has expired or requires authentication. Please sign in to access your doctor portal.",
      primaryText: "Sign In to Clinic Portal",
      primaryHref: "/login",
      isRetry: false,
    };
  }

  if (status === 403 || msg.includes("forbidden") || msg.includes("access denied") || msg.includes("permission")) {
    return {
      type: "permission" as const,
      title: "Access Restricted",
      description: "Your clinic account does not have permission to view this section.",
      primaryText: "Return to Catalog",
      primaryHref: "/products",
      isRetry: false,
    };
  }

  if (status === 404 || msg.includes("not found")) {
    return {
      type: "not_found" as const,
      title: "Resource Not Found",
      description: "The requested record or clinic page could not be located in the depot system.",
      primaryText: "Return to Homepage",
      primaryHref: "/",
      isRetry: false,
    };
  }

  return {
    type: "runtime" as const,
    title: "Application Display Notice",
    description: "An unexpected display issue occurred while loading this section. You can refresh the view or return to the main catalog.",
    primaryText: "Refresh View",
    primaryHref: null,
    isRetry: true,
  };
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("[Darsh Dental Depot Diagnostic]", error);
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const errInfo = classifyError(error);

  const handlePrimary = () => {
    if (errInfo.primaryHref) {
      window.location.href = errInfo.primaryHref;
    } else {
      router.invalidate();
      reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl">
        <div className="relative mx-auto w-44 h-28 mb-3 flex items-center justify-center">
          {!imgError ? (
            <img
              src="/internet-reconnect-plugs.svg"
              alt={errInfo.title}
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
        <h1 className="text-xl font-bold font-heading text-foreground">{errInfo.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {errInfo.description}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePrimary}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#12A488] to-[#3FD1B3] px-6 py-2.5 text-xs font-bold text-black tracking-wide shadow-lg shadow-[#12A488]/20 hover:opacity-95 transition-all cursor-pointer"
          >
            {errInfo.primaryText}
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/50 px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
          >
            Go Home
          </Link>
        </div>
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
          <MagneticCursor
            cursorSize={28}
            magneticFactor={0.22}
            hoverPadding={6}
          >
            <PageLoader />
            <InternetReconnectModal />
            <div id="app-root-content" className="min-h-screen flex flex-col w-full">
              <Outlet />
            </div>
            <DentalAiChatbot />
            <Toaster richColors position="top-right" />
          </MagneticCursor>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
