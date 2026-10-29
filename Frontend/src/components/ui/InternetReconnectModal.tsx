import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WifiOff, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InternetReconnectModal() {
  const queryClient = useQueryClient();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(10);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Ping a static asset with cache-buster
      const response = await fetch(`/favicon.png?ping=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      if (response.ok || response.status < 500) {
        setIsOffline(false);
        setIsOpen(false);
        setAutoRetryCount(10);
        queryClient.invalidateQueries();
        toast.success("Back Online! Dental depot connection restored.", {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          duration: 3500,
        });
        setIsChecking(false);
        return true;
      }
    } catch {
      // Still offline
    }
    setIsChecking(false);
    return false;
  }, [queryClient]);

  // Listen to network changes
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsOpen(true);
    };

    const handleOnline = () => {
      checkConnection();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkConnection]);

  // Periodic auto-retry countdown when offline
  useEffect(() => {
    if (!isOffline) return;

    const timer = setInterval(() => {
      setAutoRetryCount((prev) => {
        if (prev <= 1) {
          checkConnection();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOffline, checkConnection]);

  if (!isOffline && !isOpen) return null;

  return (
    <>
      {/* Floating Network Indicator Banner (Shown when modal is dismissed but still offline) */}
      {isOffline && !isOpen && (
        <aside
          role="status"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 backdrop-blur-md text-amber-600 dark:text-amber-300 shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-3"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Connection Interrupted</span>
          <button
            onClick={() => setIsOpen(true)}
            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-foreground text-xs font-bold transition-colors ml-1"
          >
            Reconnect
          </button>
        </aside>
      )}

      {/* Main Reconnect Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reconnect-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F1D19] to-[#0A1310] p-6 text-center shadow-2xl overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#12A488]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Dismiss button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Dismiss offline warning"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animated Plugs SVG Graphic */}
            <div className="relative mx-auto my-2 w-44 h-28 flex items-center justify-center">
              <img
                src="/internet-reconnect-plugs.svg"
                alt="Internet disconnected animation"
                className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(18,164,136,0.3)]"
              />
            </div>

            {/* Modal Heading & Description */}
            <h3
              id="reconnect-dialog-title"
              className="mt-2 text-lg font-bold font-heading text-white tracking-tight"
            >
              Connection Interrupted
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              We couldn't reach Darsh Dental Depot servers. Please verify your WiFi or cellular network.
            </p>

            {/* Auto-retry counter badge */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400/90 bg-[#12A488]/10 px-3 py-1 rounded-full border border-[#12A488]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Auto-checking in {autoRetryCount}s...
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col gap-2">
              <Button
                onClick={() => checkConnection()}
                disabled={isChecking}
                className="w-full rounded-2xl bg-gradient-to-r from-[#12A488] to-[#3FD1B3] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#12A488]/20 hover:opacity-95 transition-all"
              >
                {isChecking ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isChecking ? "Checking Connection..." : "Try Reconnect"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl text-xs text-muted-foreground hover:text-white hover:bg-white/5"
              >
                Continue Offline (Cached View)
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
