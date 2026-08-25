import React from "react";
import { Package, Search, FileText, MessageSquare, AlertTriangle, MapPin, CreditCard, Sparkles } from "lucide-react";

interface ChatQuickChipsProps {
  role: "doctor" | "shop_owner" | "admin" | "visitor";
  onSelect: (prompt: string) => void;
}

export function ChatQuickChips({ role, onSelect }: ChatQuickChipsProps) {
  let chips: Array<{ label: string; prompt: string; icon: React.ElementType }> = [];

  if (role === "doctor") {
    chips = [
      { label: "Track Active Order", prompt: "Where is my active order?", icon: Package },
      { label: "Search Mani Burs", prompt: "Show Mani Diamond Burs prices and sizes", icon: Search },
      { label: "GC Gold Label Cement", prompt: "What is the price of GC Gold Label 1?", icon: Search },
      { label: "Download Tally GST Bill", prompt: "How do I download my GST tax invoice?", icon: FileText },
      { label: "WhatsApp Uncle / Depot", prompt: "I want to chat with Darsh Dental Depot on WhatsApp", icon: MessageSquare },
    ];
  } else if (role === "shop_owner" || role === "admin") {
    chips = [
      { label: "Low Stock Alert", prompt: "Show products running low on stock", icon: AlertTriangle },
      { label: "Pending Orders Today", prompt: "How many orders are pending for dispatch?", icon: Package },
      { label: "Depot Bank & DL Info", prompt: "Show IDBI bank and drug license details", icon: FileText },
      { label: "WhatsApp Dispatch Help", prompt: "How to send WhatsApp dispatch alerts to doctors?", icon: MessageSquare },
    ];
  } else {
    chips = [
      { label: "Register Clinic", prompt: "How can I register my dental clinic account?", icon: Sparkles },
      { label: "Mani Burs Catalog", prompt: "Show Mani Burs and composites available", icon: Search },
      { label: "Depot Location & Timing", prompt: "Where is Darsh Dental Depot in Vadodara and what are the timings?", icon: MapPin },
      { label: "Payment & Delivery", prompt: "What payment methods and delivery options do you offer?", icon: CreditCard },
      { label: "WhatsApp Inquiry", prompt: "I want to contact Darsh Dental Depot on WhatsApp", icon: MessageSquare },
    ];
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 px-3 no-scrollbar">
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(chip.prompt)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted/80 hover:bg-primary hover:text-white border border-border/70 text-foreground transition-all shrink-0 shadow-2xs"
        >
          <chip.icon className="h-3 w-3 shrink-0" />
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
}
