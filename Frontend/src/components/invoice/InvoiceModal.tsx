import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TallyGstInvoice, type InvoiceOrderData } from "./TallyGstInvoice";
import { FileText, X } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: InvoiceOrderData | null;
}

export function InvoiceModal({ isOpen, onClose, orderData }: InvoiceModalProps) {
  if (!orderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-3xl border border-border/80 shadow-2xl bg-background/95 backdrop-blur-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
          <DialogTitle className="text-lg font-bold font-heading flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tally ERP GST Tax Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <TallyGstInvoice order={orderData} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
