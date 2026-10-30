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
  toggleSidebar: () => void;
}

const defaultSidebarContext: SidebarContextProps = {
  open: true,
  setOpen: () => {},
  animate: false,
  openMobile: false,
  setOpenMobile: () => {},
  toggleSidebar: () => {},
};

const SidebarContext = createContext<SidebarContextProps>(defaultSidebarContext);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  return context || defaultSidebarContext;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  defaultOpen = true,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  defaultOpen?: boolean;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        animate,
        openMobile,
        setOpenMobile,
        toggleSidebar,
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
  defaultOpen = true,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  defaultOpen?: boolean;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} defaultOpen={defaultOpen} animate={animate}>
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
  const { open, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-screen sticky top-0 py-4 hidden md:flex md:flex-col bg-card/90 dark:bg-[#070B0A] border-r border-border/50 dark:border-white/10 backdrop-blur-xl flex-shrink-0 z-40 transition-colors duration-200 overflow-hidden",
        open ? "px-3 w-[260px]" : "px-2 w-[72px]",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "72px") : "260px",
      }}
      transition={{
        duration: 0.24,
        ease: [0.25, 0.1, 0.25, 1],
      }}
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
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-card/95 dark:bg-[#070B0A] border-b border-border/50 dark:border-white/10 w-full sticky top-0 z-40"
        )}
        {...props}
      >
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="h-8 w-8 rounded-xl overflow-hidden bg-white/95 dark:bg-[#10201C] border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-center p-0.5">
            <img
              src="/logo.jpg"
              alt="Darsh Dental"
              className="w-full h-full object-cover rounded-[inherit]"
            />
          </div>
          <span className="font-extrabold text-sm font-heading tracking-tight text-foreground">
            Darsh Dental
          </span>
        </Link>
        <div className="flex justify-end z-20">
          <button
            type="button"
            aria-label="Toggle navigation drawer"
            className="p-2 rounded-xl border border-border/50 dark:border-white/10 hover:bg-secondary/80 dark:hover:bg-[#10201C] text-foreground cursor-pointer transition-colors"
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
              <div className="flex-1 flex flex-col pt-2">
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
      <div
        className={cn(
          "flex items-center justify-center shrink-0 transition-colors",
          open ? "w-5 h-5" : "w-5 h-5 mx-auto"
        )}
      >
        {link.icon}
      </div>

      <motion.span
        initial={false}
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="text-xs truncate whitespace-nowrap overflow-hidden transition-transform duration-150"
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
          transition={{ duration: 0.15 }}
          className="ml-auto shrink-0"
        >
          {link.badge}
        </motion.div>
      )}
    </>
  );

  const baseClasses = cn(
    "transition-all duration-150 select-none cursor-pointer flex items-center group/sidebar relative",
    open
      ? "gap-3 px-3 py-2.5 rounded-xl w-full text-left"
      : "w-10 h-10 mx-auto justify-center rounded-xl",
    isActive
      ? "bg-primary text-primary-foreground dark:bg-[#12A488] dark:text-[#04110E] font-bold shadow-sm"
      : "text-muted-foreground dark:text-[#9DB0A9] hover:text-foreground dark:hover:text-[#F2F6F4] hover:bg-secondary/70 dark:hover:bg-[#10201C]",
    className,
    link.className
  );

  if (link.to || link.href) {
    const target = link.to || link.href || "/";
    return (
      <Link
        to={target}
        title={!open ? link.label : undefined}
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
      title={!open ? link.label : undefined}
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
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
          setOpen(!open);
        } else {
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
