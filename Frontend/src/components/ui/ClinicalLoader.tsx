import React from "react";
import { cn } from "@/lib/utils";

export interface ClinicalLoaderProps {
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional loading text */
  text?: string;
  /** Optional subtext */
  subtext?: string;
  /** Optional container class name */
  className?: string;
  /** If true, fills viewport or full container */
  fullscreen?: boolean;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-44 h-44",
};

export function ClinicalLoader({
  size = "md",
  text,
  subtext,
  className,
  fullscreen = false,
}: ClinicalLoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center select-none",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient clinical glow behind loader */}
        <div
          className={cn(
            "absolute rounded-full blur-2xl pointer-events-none transition-all duration-700 opacity-60",
            "bg-gradient-to-tr from-[#12A488]/30 via-[#3FD1B3]/25 to-transparent",
            size === "sm" ? "w-16 h-16" : size === "md" ? "w-28 h-28" : "w-48 h-48"
          )}
        />

        {/* Animated Clinical SVG */}
        <img
          src="/loading.svg"
          alt="Loading animation"
          className={cn(
            "relative z-10 object-contain drop-shadow-[0_4px_20px_rgba(18,164,136,0.25)] transition-transform",
            sizeMap[size]
          )}
          loading="eager"
        />
      </div>

      {text && (
        <p className="mt-3.5 text-sm font-semibold tracking-wide text-foreground/90 font-heading">
          {text}
        </p>
      )}

      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground/80 max-w-xs">
          {subtext}
        </p>
      )}
      <span className="sr-only">{text || "Loading content..."}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
