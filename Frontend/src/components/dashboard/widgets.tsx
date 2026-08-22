import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

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
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <Card className="p-5 relative overflow-hidden glass-card glass-card-hover border border-border/60 rounded-2xl bg-card">
        {/* Subtle background gradient glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className="mt-2 text-2xl lg:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              {prefix}
              {typeof value === "number" ? value.toLocaleString("en-IN") : value}
              {suffix}
            </div>
          </div>

          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/10 text-primary grid place-items-center border border-primary/20 shadow-sm shrink-0">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <div
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                up
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(change)}%
            </div>
            <span className="text-muted-foreground text-[11px]">vs previous cycle</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let badgeClass = "bg-secondary text-secondary-foreground border-border";
  let dotClass = "bg-muted-foreground";

  if (["delivered", "completed", "active", "paid"].includes(normalized)) {
    badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    dotClass = "bg-emerald-500 animate-pulse";
  } else if (["shipped", "in_transit", "processing"].includes(normalized)) {
    badgeClass = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
    dotClass = "bg-sky-500";
  } else if (["pending", "review", "draft"].includes(normalized)) {
    badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    dotClass = "bg-amber-500";
  } else if (["cancelled", "suspended", "failed", "rejected"].includes(normalized)) {
    badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    dotClass = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${badgeClass}`}
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
    <Card className="p-12 text-center glass-card border border-dashed border-border/80 rounded-2xl">
      {Icon && (
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="text-base font-bold font-heading text-foreground">{title}</div>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
