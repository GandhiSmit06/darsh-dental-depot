import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function PageLoader() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [showInitial, setShowInitial] = useState(true);

  // Smooth initial entry load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitial(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const isVisible = showInitial || isLoading;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/85 backdrop-blur-xl transition-all duration-500">
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Loader Container */}
      <div className="relative flex flex-col items-center justify-center p-8">
        {/* Animated Brand Icon inside the center */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="dolphin-loader" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 animate-bounce">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Brand Text & Status */}
        <div className="text-center space-y-1.5 mt-2">
          <h2 className="text-lg font-bold font-heading tracking-tight text-foreground flex items-center justify-center gap-2">
            <span>Darsh Dental Depot</span>
          </h2>
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Loading dental platform...
          </p>
        </div>
      </div>
    </div>
  );
}
