import { Link } from "@tanstack/react-router";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  subtitle?: string;
  className?: string;
  clickable?: boolean;
  showGlow?: boolean;
}

const sizeMap = {
  sm: {
    icon: "h-8 w-8 rounded-lg",
    title: "text-sm",
    sub: "text-[8px]",
  },
  md: {
    icon: "h-10 w-10 rounded-xl",
    title: "text-base",
    sub: "text-[9px]",
  },
  lg: {
    icon: "h-12 w-12 rounded-2xl",
    title: "text-lg",
    sub: "text-[10px]",
  },
  xl: {
    icon: "h-16 w-16 rounded-2xl",
    title: "text-2xl",
    sub: "text-xs",
  },
};

export function BrandLogo({
  size = "md",
  withText = true,
  subtitle = "DEPOT • VADODARA",
  className = "",
  clickable = true,
  showGlow = true,
}: BrandLogoProps) {
  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Icon Container with glowing aura */}
      <div className="relative shrink-0">
        {showGlow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300 pointer-events-none" />
        )}
        <div
          className={`relative ${currentSize.icon} overflow-hidden bg-white/95 dark:bg-slate-900 border border-white/60 dark:border-slate-700/60 shadow-md transform group-hover:scale-105 transition-all duration-300 flex items-center justify-center p-0.5`}
        >
          <img
            src="/logo.jpg"
            alt="Darsh Dental Logo"
            className="w-full h-full object-cover rounded-[inherit] transform group-hover:scale-110 transition-transform duration-500"
            loading="eager"
          />
        </div>
      </div>

      {/* Typography */}
      {withText && (
        <div className="leading-none flex flex-col justify-center">
          <span
            className={`font-extrabold ${currentSize.title} tracking-tight font-heading bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent group-hover:to-cyan-500 transition-colors`}
          >
            DARSH DENTAL
          </span>
          <span
            className={`${currentSize.sub} font-extrabold uppercase tracking-widest text-primary mt-0.5`}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
