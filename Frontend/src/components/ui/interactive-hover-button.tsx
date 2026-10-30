import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: React.ReactNode;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text, children, className, ...props }, ref) => {
  const content = text || (typeof children === "string" ? children : undefined) || children || "Button";

  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex min-w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border/80 bg-background px-5 py-2.5 text-center text-sm font-semibold text-foreground shadow-xs transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-[#0B1210] dark:text-[#F2F6F4]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#12A488] shrink-0 transition-all duration-300 ease-out group-hover:scale-[100]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {content}
        </span>
      </div>
      <div className="absolute top-0 inset-x-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white dark:text-[#04110E] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="font-semibold">{content}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
export default InteractiveHoverButton;
