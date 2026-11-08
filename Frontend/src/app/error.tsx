"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

function classifyError(err: unknown) {
  const msg = (err instanceof Error ? err.message : String(err || "")).toLowerCase();
  const status = typeof (err as any)?.status === "number" ? (err as any).status : 0;
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (
    isOffline ||
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    msg.includes("offline")
  ) {
    return {
      type: "network" as const,
      title: "Connection Disrupted",
      description:
        "Unable to communicate with depot servers. Please check your internet connection and try again.",
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
      description:
        "Your clinic session has expired or requires authentication. Please sign in to access your doctor portal.",
      primaryText: "Sign In to Clinic Portal",
      primaryHref: "/login",
      isRetry: false,
    };
  }

  if (
    status === 403 ||
    msg.includes("forbidden") ||
    msg.includes("access denied") ||
    msg.includes("permission")
  ) {
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
    description:
      "An unexpected display issue occurred while loading this section. You can refresh the view or return to the main catalog.",
    primaryText: "Refresh View",
    primaryHref: null,
    isRetry: true,
  };
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Darsh Dental Depot Diagnostic]", error);
  }, [error]);
  const [imgError, setImgError] = useState(false);
  const errInfo = classifyError(error);

  const handlePrimary = () => {
    if (errInfo.primaryHref) {
      window.location.href = errInfo.primaryHref;
    } else {
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
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{errInfo.description}</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePrimary}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#12A488] to-[#3FD1B3] px-6 py-2.5 text-xs font-bold text-black tracking-wide shadow-lg shadow-[#12A488]/20 hover:opacity-95 transition-all cursor-pointer"
          >
            {errInfo.primaryText}
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/50 px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
