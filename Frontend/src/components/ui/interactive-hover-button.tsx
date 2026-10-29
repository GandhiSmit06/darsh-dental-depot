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
      <span className="inline-flex items-center gap-1.5 translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {content}
      </span>
      <div className="absolute top-0 inset-x-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="font-semibold">{content}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </div>
      <div className="pointer-events-none absolute left-[15%] top-[45%] h-2.5 w-2.5 -translate-y-1/2 scale-[1] rounded-full bg-primary transition-all duration-300 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:translate-y-0 group-hover:scale-[2] group-hover:rounded-none group-hover:bg-primary dark:bg-[#12A488]" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
export default InteractiveHoverButton;
