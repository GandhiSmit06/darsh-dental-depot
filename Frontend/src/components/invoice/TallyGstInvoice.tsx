import React, { useState } from "react";
import { numberToIndianWords } from "@/lib/number-to-words";
import { Printer, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceItem {
  name: string;
  brand?: string;
  hsn?: string;
  gstRate?: number; // e.g. 5, 12, 18, 28
  mrp?: number;
  quantity: number;
  unit?: string; // PCS, bott, pkt, NOS, Box, etc.
  sellingPrice: number; // Unit price
  batchNumber?: string;
  expiryDate?: string;
  discountPercent?: number;
}

export interface InvoiceOrderData {
  orderNumber: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  deliveryNoteNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  notes?: string;
  customer: {
    fullName: string;
    clinicName?: string;
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
    };
    gstin?: string;
    pan?: string;
  };
  items: InvoiceItem[];
}

export const SELLER_INFO = {
  name: "Darsh Dental Depot",
  addressLine1: "Siyabaug,",
  addressLine2: "Vadodara",
  drugLicense1: "DL No. GJ-VAD-215550",
  drugLicense2: "DL No. GJ-VAD-215551",
  gstin: "24ANKPG4381M1ZP",
  stateName: "Gujarat",
  stateCode: "24",
  email: "hetalgandhi16@gmail.com",
  phoneNumbers: "+91-97270 76119 & 91577 16989",
  pan: "ANKPG4381M",
  bankDetails: {
    bankName: "IDBI BANK BANK LTD-0553102000031189",
    accNumber: "0553102000031189",
    branchIfsc: "SIDDHANATH & IBKL0000553",
  },
};

interface TallyGstInvoiceProps {
  order: InvoiceOrderData;
  onClose?: () => void;
}

export function TallyGstInvoice({ order }: TallyGstInvoiceProps) {
  const [copied, setCopied] = useState(false);

  // Format Dates in DD-MMM-YYYY format (e.g. 28-Mar-2026)
  const invoiceDateObj = order.invoiceDate ? new Date(order.invoiceDate) : new Date();
  const formattedDate = invoiceDateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-");

  const invoiceNo =
    order.invoiceNumber ||
    `${order.orderNumber.replace(/[^0-9]/g, "").slice(-3) || "700"}/25-26`;
  const supplierRef = invoiceNo;

  // Payment Mode Formatter
  const paymentMode =
    order.paymentMethod?.toLowerCase() === "cod"
      ? "Cash on Delivery"
      : `Razorpay Online (${order.paymentStatus === "paid" ? "Paid" : "Pending"})`;

  const isIntraState =
    !order.customer.address?.state ||
    order.customer.address.state.toLowerCase().includes("gujarat") ||
    order.customer.address.state.toLowerCase() === "24";

  // Item Calculations
  let totalTaxableValue = 0;
  let totalTax = 0;

  const processedItems = (order.items && order.items.length > 0
    ? order.items
    : [
        {
          name: "Dental Material Package",
          brand: "Darsh Dental Depot",
          hsn: "90184900",
          gstRate: 5,
          quantity: 1,
          sellingPrice: order.totalAmount || 500,
          unit: "PCS",
        },
      ]
  ).map((it, idx) => {
    const gstRate = it.gstRate ?? 5; // Default 5% as per standard dental items in bill
    const qty = it.quantity || 1;
    const grossPrice = it.sellingPrice || it.mrp || 0;

    // In wholesale, if price is GST inclusive, back-calculate rate:
    const baseRate = grossPrice / (1 + gstRate / 100);
    const taxableAmount = baseRate * qty;
    const itemTax = (grossPrice * qty) - taxableAmount;

    totalTaxableValue += taxableAmount;
    totalTax += itemTax;

    const unitStr = it.unit || "NOS";

    return {
      slNo: idx + 1,
      name: it.name,
      hsn: it.hsn || (idx % 2 === 0 ? "90184900" : "30064000"),
      gstRate,
      qty,
      unit: unitStr,
      rate: baseRate,
      amount: taxableAmount,
    };
  });

  const totalCgst = isIntraState ? totalTax / 2 : 0;
  const totalSgst = isIntraState ? totalTax / 2 : 0;
  const totalIgst = !isIntraState ? totalTax : 0;

  const calculatedGross = totalTaxableValue + totalTax;
  const targetTotal = order.totalAmount || calculatedGross;
  const roundOff = Math.round((targetTotal - calculatedGross) * 100) / 100;
  const finalAmount = Math.round(targetTotal);
  const amountInWords = numberToIndianWords(finalAmount);

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `Tax Invoice #${invoiceNo} for ${order.customer.clinicName || order.customer.fullName} - Total: ₹${finalAmount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Action Bar (hidden during print) */}
      <div className="w-full max-w-[800px] mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-muted/60 rounded-xl border border-border/80 print:hidden">
        <div className="text-xs font-bold text-foreground">
          Invoice: <span className="text-primary font-mono">{invoiceNo}</span> • {order.customer.clinicName || order.customer.fullName}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            className="text-xs h-8 rounded-lg font-semibold gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Details"}
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 rounded-lg font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* ── Exact Tally Tax Invoice Document Sheet ── */}
      <div 
        id="tally-invoice-sheet"
        className="w-full max-w-[800px] bg-white text-black font-sans text-[11px] leading-[1.3] border border-black p-0 shadow-lg print:shadow-none print:border-black print:max-w-none print:w-full print:m-0"
        style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
      >
        {/* Document Title Header */}
        <div className="text-center font-extrabold text-[15px] tracking-wide py-1.5 border-b border-black">
          Tax Invoice
        </div>

        {/* ── Top Header Section (Seller, Buyer, and Metadata Grid) ── */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* Left Column: Seller & Buyer Details */}
          <div className="border-r border-black flex flex-col justify-between">
            {/* Seller */}
            <div className="p-2 border-b border-black text-[11px]">
              <div className="font-bold text-xs">{SELLER_INFO.name}</div>
              <div>{SELLER_INFO.addressLine1}</div>
              <div>{SELLER_INFO.addressLine2}</div>
              <div>{SELLER_INFO.drugLicense1}</div>
              <div>{SELLER_INFO.drugLicense2}</div>
              <div className="font-bold">GSTIN/UIN: {SELLER_INFO.gstin}</div>
              <div>State Name : {SELLER_INFO.stateName}, Code : {SELLER_INFO.stateCode}</div>
              <div>E-Mail : {SELLER_INFO.email}</div>
            </div>

            {/* Buyer */}
            <div className="p-2 text-[11px] flex-1">
              <div className="text-[10px] text-neutral-600">Buyer</div>
              <div className="font-bold text-xs mt-0.5">
                {order.customer.clinicName || order.customer.fullName}
              </div>
              {order.customer.clinicName && (
                <div className="text-[10px] text-neutral-800">Attn: {order.customer.fullName}</div>
              )}
              <div>
                {order.customer.address?.street
                  ? `${order.customer.address.street}, ${order.customer.address.city || "Vadodara"}`
                  : "Vadodara, Gujarat"}
                {order.customer.address?.pincode ? ` - ${order.customer.address.pincode}` : ""}
              </div>
              <div className="mt-1">
                <span className="font-semibold">GSTIN/UIN : </span>
                {order.customer.gstin ? order.customer.gstin : ""}
              </div>
              <div>
                <span className="font-semibold">PAN/IT No : </span>
                {order.customer.pan || ""}
              </div>
              <div>
                <span className="font-semibold">State Name : </span>
                {order.customer.address?.state || "Gujarat"}, Code : {order.customer.address?.state?.toLowerCase().includes("gujarat") || !order.customer.address?.state ? "24" : "24"}
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Metadata Grid */}
          <div className="flex flex-col text-[10.5px]">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Invoice No.</span>
                <span className="font-bold text-[11px]">{invoiceNo}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Dated</span>
                <span className="font-bold text-[11px]">{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Delivery Note</span>
                <span></span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Mode/Terms of Payment</span>
                <span className="font-semibold">{paymentMode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Supplier's Ref.</span>
                <span className="font-bold">{supplierRef}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Other Reference(s)</span>
                <span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Buyer's Order No.</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Dated</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Despatch Document No.</span>
                <span></span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Delivery Note Date</span>
                <span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Despatched through</span>
                <span>Direct Delivery</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Destination</span>
                <span>Vadodara</span>
              </div>
            </div>

            <div className="p-1.5 flex-1">
              <span className="text-[9.5px] block text-neutral-600">Terms of Delivery</span>
              <span>Immediate Delivery</span>
            </div>
          </div>
        </div>

        {/* ── Table of Goods (Sl No. | Description | HSN/SAC | GST Rate | Quantity | Rate | per | Amount) ── */}
        <table className="w-full text-left border-collapse border-b border-black text-[10.5px]">
          <thead>
            <tr className="border-b border-black text-center font-bold">
              <th className="border-r border-black py-1 px-1 w-8">Sl<br />No.</th>
              <th className="border-r border-black py-1 px-2 text-left">Description of Goods</th>
              <th className="border-r border-black py-1 px-1 w-20">HSN/SAC</th>
              <th className="border-r border-black py-1 px-1 w-14">GST<br />Rate</th>
              <th className="border-r border-black py-1 px-1 w-20">Quantity</th>
              <th className="border-r border-black py-1 px-1 w-18 text-right">Rate</th>
              <th className="border-r border-black py-1 px-1 w-12 text-center">per</th>
              <th className="py-1 px-2 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item) => (
              <tr key={item.slNo} className="align-top">
                <td className="border-r border-black p-1 text-center font-medium">{item.slNo}</td>
                <td className="border-r border-black p-1">
                  <div className="font-bold">{item.name}</div>
                </td>
                <td className="border-r border-black p-1 text-center font-mono">{item.hsn}</td>
                <td className="border-r border-black p-1 text-center">{item.gstRate} %</td>
                <td className="border-r border-black p-1 text-center font-bold">{item.qty} {item.unit}</td>
                <td className="border-r border-black p-1 text-right">{item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="border-r border-black p-1 text-center">{item.unit}</td>
                <td className="p-1 text-right font-bold">{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}

            {/* Extra blank rows to maintain standard Tally sheet height */}
            {Array.from({ length: Math.max(0, 7 - processedItems.length) }).map((_, i) => (
              <tr key={`blank-${i}`} style={{ height: "24px" }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}

            {/* Subtotal Row */}
            <tr className="border-t border-black">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="p-1 text-right font-bold border-t border-black">
                {totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* CGST / SGST / IGST Tax Rows */}
            {isIntraState ? (
              <>
                <tr>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black px-2 py-0.5 text-right font-bold">CGST</td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="px-2 py-0.5 text-right font-bold">
                    {totalCgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black px-2 py-0.5 text-right font-bold">SGST</td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="px-2 py-0.5 text-right font-bold">
                    {totalSgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="border-r border-black"></td>
                <td className="border-r border-black px-2 py-0.5 text-right font-bold">IGST</td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="px-2 py-0.5 text-right font-bold">
                  {totalIgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            )}

            {/* Round Off Row */}
            {Math.abs(roundOff) > 0 && (
              <tr>
                <td className="border-r border-black"></td>
                <td className="border-r border-black px-2 py-0.5 text-left text-[10px]">
                  Less : Round Off
                </td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="px-2 py-0.5 text-right text-[10px]">
                  {roundOff < 0 ? `(-)${Math.abs(roundOff).toFixed(2)}` : `(+) ${roundOff.toFixed(2)}`}
                </td>
              </tr>
            )}

            {/* Grand Total Row */}
            <tr className="border-t border-b border-black font-extrabold text-[12px]">
              <td colSpan={7} className="border-r border-black px-2 py-1 text-right">
                Total
              </td>
              <td className="px-2 py-1 text-right whitespace-nowrap">
                ₹ {finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Footer Section ── */}
        <div className="border-b border-black p-2 flex justify-between items-start text-[10.5px]">
          <div>
            <div className="text-[9.5px] text-neutral-600">Amount Chargeable (in words)</div>
            <div className="font-extrabold text-[11px] mt-0.5">{amountInWords}</div>
          </div>
          <div className="text-right text-[9.5px] font-semibold text-neutral-600">
            E. & O.E
          </div>
        </div>

        {/* Declaration & Bank Details & Signatures */}
        <div className="grid grid-cols-2 text-[10.5px]">
          {/* Left Column: PAN & Declaration */}
          <div className="p-2 border-r border-black flex flex-col justify-between">
            <div>
              <div className="font-bold mb-2">Company's PAN : {SELLER_INFO.pan}</div>
              <div className="text-[10px] font-semibold text-neutral-600 mb-0.5">Declaration</div>
              <p className="text-[9.5px] leading-tight text-neutral-700">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </p>
            </div>
          </div>

          {/* Right Column: Bank Details & Authorised Signatory */}
          <div className="p-2 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-semibold text-neutral-600 mb-0.5">Company's Bank Details</div>
              <div className="text-[9.5px] leading-snug">
                <div><span className="text-neutral-600">Bank Name : </span><span className="font-bold">{SELLER_INFO.bankDetails.bankName}</span></div>
                <div><span className="text-neutral-600">A/c No. : </span><span className="font-mono font-bold">{SELLER_INFO.bankDetails.accNumber}</span></div>
                <div><span className="text-neutral-600">Branch & IFS Code : </span><span className="font-bold">{SELLER_INFO.bankDetails.branchIfsc}</span></div>
              </div>
            </div>

            <div className="pt-6 text-right">
              <div className="font-bold text-[10px]">for {SELLER_INFO.name}</div>
              <div className="h-7"></div>
              <div className="font-bold text-[9.5px]">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Jurisdiction Note */}
        <div className="border-t border-black text-center py-1 text-[9px] font-bold tracking-wider uppercase">
          SUBJECT TO JURISDICTION OF VADODARA JURISDICTION<br />
          This is a Computer Generated Invoice
        </div>
      </div>
    </div>
  );
}
