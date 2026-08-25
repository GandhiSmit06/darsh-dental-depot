import React from "react";
import { Package, Clock, CheckCircle2, Truck, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openDoctorSupportWhatsApp } from "@/lib/whatsapp";
import { useAuth } from "@/lib/auth-context";

interface ChatOrderCardProps {
  order: {
    orderId: string;
    itemCount: number;
    total: number;
    status: string;
    date: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
  };
  onOpenInvoice?: (order: any) => void;
}

const STAGES = [
  { key: "pending", label: "Received", icon: Clock },
  { key: "processing", label: "Packing", icon: Package },
  { key: "shipped", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export function ChatOrderCard({ order, onOpenInvoice }: ChatOrderCardProps) {
  const { user } = useAuth();
  const currentStatus = (order.status || "pending").toLowerCase();

  const getStageIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStageIndex(currentStatus);

  return (
    <div className="p-3 rounded-2xl bg-background border border-primary/20 shadow-xs space-y-2.5 text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Active Depot Order</span>
          <span className="font-mono font-extrabold text-primary text-sm">#{order.orderId}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-foreground">₹{order.total.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground">{order.itemCount} Item{order.itemCount > 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="py-1">
        <div className="flex items-center justify-between relative max-w-xs mx-auto">
          {/* Background line */}
          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-border/80" />
          {/* Active fill line */}
          <div
            className="absolute top-3.5 left-4 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${(currentIdx / 3) * 100}%` }}
          />

          {STAGES.map((s, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={s.key} className="relative flex flex-col items-center gap-1 z-10 text-center">
                <div
                  className={`h-7 w-7 rounded-full grid place-items-center border-2 transition-all ${
                    isDone
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-muted text-muted-foreground border-border"
                  } ${isCurrent ? "ring-2 ring-primary/30 animate-pulse" : ""}`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-[10px] font-bold ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenInvoice && onOpenInvoice(order)}
          className="h-8 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1 rounded-xl"
        >
          <FileText className="h-3.5 w-3.5" />
          Tally GST Bill
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => openDoctorSupportWhatsApp(order.orderId, user?.fullName)}
          className="h-8 text-xs font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1 rounded-xl"
        >
          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
