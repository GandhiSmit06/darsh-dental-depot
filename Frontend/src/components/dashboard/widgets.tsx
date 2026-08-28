import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
}) {
  const up = (change ?? 0) >= 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="p-4 sm:p-5 relative overflow-hidden rounded-2xl bg-card border border-border/70 dark:border-white/10 shadow-xs hover:border-primary/40 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className="mt-1.5 text-2xl lg:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              {prefix}
              {typeof value === "number" ? value.toLocaleString("en-IN") : value}
              {suffix}
            </div>
          </div>

          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20 shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
            <div
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                up
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
            <span className="text-muted-foreground text-[10.5px]">vs previous month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let badgeClass = "bg-secondary text-secondary-foreground border-border/70";
  let dotClass = "bg-muted-foreground";

  if (["delivered", "completed", "active", "paid", "in stock", "in_stock", "available"].includes(normalized)) {
    badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    dotClass = "bg-emerald-500 animate-pulse";
  } else if (["shipped", "in_transit", "processing"].includes(normalized)) {
    badgeClass = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
    dotClass = "bg-sky-500";
  } else if (["low stock", "low_stock", "pending", "review", "draft"].includes(normalized)) {
    badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    dotClass = "bg-amber-500";
  } else if (["out of stock", "out_of_stock", "cancelled", "suspended", "failed", "rejected"].includes(normalized)) {
    badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    dotClass = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-border/80">
      {Icon && (
        <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="text-sm font-bold text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
