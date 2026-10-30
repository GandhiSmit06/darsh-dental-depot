import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, PanelLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface SidebarLinkItem {
  label: string;
  href?: string;
  to?: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        animate,
        openMobile,
        setOpenMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen sticky top-0 px-3 py-4 hidden md:flex md:flex-col bg-card/80 dark:bg-[#070B0A] border-r border-border/50 dark:border-white/10 backdrop-blur-xl w-[280px] flex-shrink-0 z-40 transition-colors duration-200",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "68px") : "280px",
      }}
      transition={{
        duration: 0.28,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-card/90 dark:bg-[#070B0A] border-b border-border/50 dark:border-white/10 w-full sticky top-0 z-40"
        )}
        {...props}
      >
        <div className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/95 dark:bg-[#10201C] border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-center p-0.5">
            <img
              src="/logo.jpg"
              alt="Darsh Dental"
              className="w-full h-full object-cover rounded-[inherit]"
            />
          </div>
          <span className="font-extrabold text-xs font-heading tracking-tight text-foreground">
            Darsh Dental
          </span>
        </div>
        <div className="flex justify-end z-20">
          <button
            type="button"
            aria-label="Toggle navigation drawer"
            className="p-1.5 rounded-lg border border-border/50 dark:border-white/10 hover:bg-secondary/80 dark:hover:bg-[#10201C] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            onClick={() => setOpenMobile(!openMobile)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <AnimatePresence>
          {openMobile && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background/98 dark:bg-[#070B0A]/98 backdrop-blur-2xl p-6 z-[100] flex flex-col justify-between overflow-y-auto",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 p-2 rounded-xl border border-border/60 dark:border-white/10 hover:bg-secondary dark:hover:bg-[#10201C] text-foreground cursor-pointer transition-colors"
                onClick={() => setOpenMobile(false)}
              >
                <X className="h-5 w-5" />
              </div>
              <div className="flex-1 flex flex-col pt-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
}: {
  link: SidebarLinkItem;
  className?: string;
}) => {
  const { open, animate, setOpenMobile } = useSidebar();
  const isActive = link.active;

  const content = (
    <>
      <div className={cn(
        "flex items-center justify-center shrink-0 w-8 h-8 rounded-lg transition-colors",
        isActive
          ? "text-primary dark:text-[#3FD1B3]"
          : "text-muted-foreground dark:text-[#9DB0A9] group-hover/sidebar:text-foreground dark:group-hover/sidebar:text-[#F2F6F4]"
      )}>
        {link.icon}
      </div>

      <motion.span
        initial={false}
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
        }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className={cn(
          "text-xs truncate whitespace-nowrap overflow-hidden transition-transform duration-150 group-hover/sidebar:translate-x-0.5",
          isActive
            ? "font-bold text-primary dark:text-[#3FD1B3]"
            : "font-medium text-muted-foreground dark:text-[#9DB0A9] group-hover/sidebar:text-foreground dark:group-hover/sidebar:text-[#F2F6F4]"
        )}
      >
        {link.label}
      </motion.span>

      {link.badge && (
        <motion.div
          initial={false}
          animate={{
            display: animate ? (open ? "inline-flex" : "none") : "inline-flex",
            opacity: animate ? (open ? 1 : 0) : 1,
            scale: animate ? (open ? 1 : 0) : 1,
          }}
          transition={{ duration: 0.18 }}
          className="ml-auto shrink-0"
        >
          {link.badge}
        </motion.div>
      )}
    </>
  );

  const baseClasses = cn(
    "flex items-center gap-3 group/sidebar px-2.5 py-2 rounded-xl transition-all duration-150 select-none cursor-pointer w-full text-left",
    isActive
      ? "bg-primary/10 dark:bg-[#12A488]/15 text-primary dark:text-[#3FD1B3] shadow-xs"
      : "hover:bg-secondary/80 dark:hover:bg-[#10201C] text-muted-foreground dark:text-[#9DB0A9] hover:text-foreground dark:hover:text-[#F2F6F4]",
    className,
    link.className
  );

  if (link.to || link.href) {
    const target = link.to || link.href || "/";
    return (
      <Link
        to={target}
        onClick={() => setOpenMobile(false)}
        className={baseClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        link.onClick?.();
        setOpenMobile(false);
      }}
      className={baseClasses}
    >
      {content}
    </button>
  );
};

export const SidebarTrigger = ({
  className,
}: {
  className?: string;
}) => {
  const { open, setOpen, openMobile, setOpenMobile } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={() => {
        // Desktop
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
          setOpen(!open);
        } else {
          // Mobile
          setOpenMobile(!openMobile);
        }
      }}
      className={cn(
        "rounded-xl h-9 w-9 flex items-center justify-center border border-border/60 dark:border-white/10 hover:bg-secondary dark:hover:bg-[#10201C] text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
        className
      )}
    >
      <PanelLeft className="h-4 w-4" />
    </button>
  );
};
