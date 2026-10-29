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

const pixelMap = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 176,
};

export function ClinicalLoader({
  size = "md",
  text,
  subtext,
  className,
  fullscreen = false,
}: ClinicalLoaderProps) {
  const [imgError, setImgError] = React.useState(false);

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

        {/* Animated Clinical SVG with fallback */}
        {!imgError ? (
          <img
            src="/loading.svg"
            alt="Loading animation"
            width={pixelMap[size]}
            height={pixelMap[size]}
            onError={() => setImgError(true)}
            className={cn(
              "relative z-10 object-contain drop-shadow-[0_4px_20px_rgba(18,164,136,0.25)] transition-transform",
              sizeMap[size]
            )}
            loading="eager"
          />
        ) : (
          <div
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full border border-[#12A488]/30 bg-[#12A488]/10 text-[#3FD1B3]",
              sizeMap[size]
            )}
          >
            <div className="w-1/2 h-1/2 rounded-full border-2 border-[#12A488] border-t-[#3FD1B3] animate-spin" />
          </div>
        )}
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
