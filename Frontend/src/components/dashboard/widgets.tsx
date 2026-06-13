import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

export function StatCard({
  label, value, change, icon: Icon, prefix = "",
}: { label: string; value: string | number; change?: number; icon: LucideIcon; prefix?: string }) {
  const up = (change ?? 0) >= 0;
  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold">{prefix}{value}</div>
        {change !== undefined && (
          <div className={`mt-1 text-xs flex items-center gap-1 ${up ? "text-success" : "text-destructive"}`}>
            {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(change)}% vs last week
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Delivered: "default", Shipped: "secondary", Processing: "outline",
    Pending: "outline", Cancelled: "destructive", Active: "default",
    Suspended: "destructive",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Card>
  );
}
