import React, { useState } from "react";
import { numberToIndianWords } from "@/lib/number-to-words";
import { Printer, Download, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceItem {
  name: string;
  brand?: string;
  hsn?: string;
  gstRate?: number; // e.g. 5, 12, 18, 28
  mrp?: number;
  quantity: number;
  unit?: string; // Unit, Packet, Pcs, Box
  sellingPrice: number; // Gross price per unit (GST inclusive)
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
  };
  items: InvoiceItem[];
}

export const SELLER_INFO = {
  name: "Darsh Dental Depot*",
  addressLine1: "Bordi Faliya Small Lane, B/h Khanderao Market,",
  addressLine2: "Shiyabaug, Baroda.-01",
  drugLicense: "DL NO 20 B 215550, DL NO 21 B 215551",
  phoneNumbers: "+91-97270 76119 & 91577 16989",
  gstin: "24ANKPG4381M1ZP",
  stateName: "Gujarat",
  stateCode: "24",
  contactPerson: "Hetal Gandhi / Smit Gandhi",
  pan: "ANKPG 4381M",
  bankDetails: {
    accHolder: "Darsh Dental Depot",
    bankName: "Kotak Mahindra Bank",
    accNumber: "2511664979",
    ifsc: "KKBK0002750",
    branch: "Raopura",
  },
};

interface TallyGstInvoiceProps {
  order: InvoiceOrderData;
  onClose?: () => void;
}

export function TallyGstInvoice({ order, onClose }: TallyGstInvoiceProps) {
  const [copyType, setCopyType] = useState<"ORIGINAL FOR RECIPIENT" | "DUPLICATE FOR TRANSPORTER" | "TRIPLICATE FOR SUPPLIER">("ORIGINAL FOR RECIPIENT");
  const [copied, setCopied] = useState(false);

  // Format Dates
  const formattedDate = order.invoiceDate
    ? new Date(order.invoiceDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });

  const printedTimestamp = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceNo = order.invoiceNumber || `T/${order.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "2674"}/26-27`;
  const deliveryNote = order.deliveryNoteNumber || `DC/26-27/${order.orderNumber.replace(/[^0-9]/g, "").slice(-3) || "140"}`;

  // Payment Mode Formatter
  const paymentMode =
    order.paymentMethod?.toLowerCase() === "cod"
      ? "Pay on Delivery (Clinic Credit / Cash)"
      : `Online via Razorpay (${order.paymentStatus === "paid" ? "Paid" : "Pending"})`;

  // Item Calculations (Tally standard: Back-calculate base taxable rate from GST-inclusive selling price)
  let totalTaxableValue = 0;
  let totalSgst = 0;
  let totalCgst = 0;
  let totalIgst = 0;

  const isIntraState = !order.customer.address?.state || order.customer.address.state.toLowerCase().includes("gujarat");

  const processedItems = (order.items || []).map((it, idx) => {
    const gstRate = it.gstRate ?? 18; // Default 18% for dental materials if not specified
    const qty = it.quantity || 1;
    const grossPrice = it.sellingPrice || it.mrp || 0;
    
    // Taxable base unit rate = Gross Price / (1 + (GST / 100))
    const baseRate = grossPrice / (1 + gstRate / 100);
    const taxableAmount = baseRate * qty;
    const taxAmount = (grossPrice * qty) - taxableAmount;

    totalTaxableValue += taxableAmount;

    if (isIntraState) {
      totalSgst += taxAmount / 2;
      totalCgst += taxAmount / 2;
    } else {
      totalIgst += taxAmount;
    }

    return {
      slNo: idx + 1,
      name: it.name,
      brand: it.brand || "Darsh Dental Depot",
      hsn: it.hsn || "90184900",
      gstRate,
      mrp: it.mrp || grossPrice,
      qty,
      unit: it.unit || "Unit",
      baseRate,
      discPercent: it.discountPercent || 0,
      taxableAmount,
      batch: it.batchNumber || "V" + (1000 + idx * 17),
      expiry: it.expiryDate || "31-Oct-30",
    };
  });

  const grossTotal = order.totalAmount || (totalTaxableValue + totalSgst + totalCgst + totalIgst);
  const calculatedGross = totalTaxableValue + totalSgst + totalCgst + totalIgst;
  const roundOff = Math.round((grossTotal - calculatedGross) * 100) / 100;
  const finalAmount = Math.round(grossTotal);
  const amountInWords = numberToIndianWords(finalAmount);

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `Invoice #${invoiceNo} for ${order.customer.fullName} - Total: ₹${finalAmount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Action Bar (hidden in print) */}
      <div className="w-full max-w-[820px] mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/60 rounded-2xl border border-border/80 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Copy Type:</span>
          <select
            value={copyType}
            onChange={(e) => setCopyType(e.target.value as any)}
            className="text-xs font-semibold bg-background border border-border rounded-xl px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="ORIGINAL FOR RECIPIENT">Original for Recipient</option>
            <option value="DUPLICATE FOR TRANSPORTER">Duplicate for Transporter</option>
            <option value="TRIPLICATE FOR SUPPLIER">Triplicate for Supplier</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            className="text-xs h-8 rounded-xl font-semibold gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Summary"}
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* ── Exact Tally ERP Document Sheet ── */}
      <div 
        id="tally-invoice-sheet"
        className="w-full max-w-[820px] bg-white text-black font-sans text-[11px] leading-[1.25] border-2 border-black p-0 shadow-lg print:shadow-none print:border-black print:max-w-none print:w-full print:m-0"
        style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
      >
        {/* Document Header */}
        <div className="text-right px-2 pt-1 text-[10px] font-normal text-neutral-800">
          Printed on {printedTimestamp}
        </div>
        <div className="text-center font-bold text-base tracking-wide uppercase py-1 border-b border-black">
          TAX INVOICE <span className="text-xs font-semibold">({copyType})</span>
        </div>

        {/* ── Top 2-Column Split Box ── */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* Left Column: Seller & Buyer */}
          <div className="border-r border-black flex flex-col justify-between">
            {/* Seller */}
            <div className="p-2 border-b border-black">
              <div className="font-extrabold text-sm tracking-tight">{SELLER_INFO.name}</div>
              <div>{SELLER_INFO.addressLine1}</div>
              <div>{SELLER_INFO.addressLine2}</div>
              <div>{SELLER_INFO.drugLicense}</div>
              <div>{SELLER_INFO.phoneNumbers}</div>
              <div className="mt-1 font-bold">GSTIN/UIN: {SELLER_INFO.gstin}</div>
              <div>State Name : {SELLER_INFO.stateName}, Code : {SELLER_INFO.stateCode}</div>
              <div>Contact : {SELLER_INFO.phoneNumbers}</div>
            </div>

            {/* Buyer (Bill to) */}
            <div className="p-2">
              <div className="font-bold underline text-[10.5px]">Buyer (Bill to)</div>
              <div className="font-bold text-xs">
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
                {order.customer.gstin || "Unregistered / Clinic"}
              </div>
              <div>
                <span className="font-semibold">State Name : </span>
                {order.customer.address?.state || "Gujarat"}, Code : 24
              </div>
              <div>
                <span className="font-semibold">Contact person : </span>
                {order.customer.fullName}
              </div>
              <div>
                <span className="font-semibold">Contact : </span>
                {order.customer.phone || "+91 97270 76119"}
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Metadata Grid */}
          <div className="flex flex-col text-[10.5px]">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Invoice No.</span>
                <span className="font-bold">{invoiceNo}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Dated</span>
                <span className="font-bold">{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Delivery Note</span>
                <span className="font-semibold">{deliveryNote}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Mode/Terms of Payment</span>
                <span className="font-semibold">{paymentMode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Reference No. & Date.</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Other References</span>
                <span>Kevdabaug Depot</span>
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
                <span className="text-[9.5px] block text-neutral-600">Dispatch Doc No.</span>
                <span>DD/DISP/{order.orderNumber.slice(-4)}</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Delivery Note Date</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-1.5 border-r border-black">
                <span className="text-[9.5px] block text-neutral-600">Dispatched through</span>
                <span>Kevdabaug Depot Express</span>
              </div>
              <div className="p-1.5">
                <span className="text-[9.5px] block text-neutral-600">Destination</span>
                <span>Vadodara</span>
              </div>
            </div>

            <div className="p-1.5 flex-1">
              <span className="text-[9.5px] block text-neutral-600">Terms of Delivery</span>
              <span className="font-medium">Same-Day Direct Depot Clinic Dispatch (Vadodara)</span>
            </div>
          </div>
        </div>

        {/* ── Table of Goods ── */}
        <table className="w-full text-left border-collapse border-b border-black text-[10px]">
          <thead>
            <tr className="border-b border-black text-center font-bold bg-neutral-100/60">
              <th className="border-r border-black py-1 px-1 w-7">Sl No.</th>
              <th className="border-r border-black py-1 px-2 text-left">Description of Goods</th>
              <th className="border-r border-black py-1 px-1 w-16">HSN/SAC</th>
              <th className="border-r border-black py-1 px-1 w-12">GST Rate</th>
              <th className="border-r border-black py-1 px-1 w-20">MRP/ Marginal</th>
              <th className="border-r border-black py-1 px-1 w-16">Quantity</th>
              <th className="border-r border-black py-1 px-1 w-16">Rate</th>
              <th className="border-r border-black py-1 px-1 w-10">per</th>
              <th className="border-r border-black py-1 px-1 w-12">Disc. %</th>
              <th className="py-1 px-2 text-right w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {processedItems.map((item) => (
              <tr key={item.slNo} className="align-top border-b border-neutral-300">
                <td className="border-r border-black p-1 text-center font-semibold">{item.slNo}</td>
                <td className="border-r border-black p-1">
                  <div className="font-bold text-[10.5px]">{item.name}*#</div>
                  <div className="text-[9px] text-neutral-700">
                    <span>Batch : {item.batch}</span>
                    <span className="ml-3">Expiry : {item.expiry}</span>
                  </div>
                </td>
                <td className="border-r border-black p-1 text-center font-mono">{item.hsn}</td>
                <td className="border-r border-black p-1 text-center">{item.gstRate} %</td>
                <td className="border-r border-black p-1 text-right">{item.mrp.toFixed(2)}/{item.unit}</td>
                <td className="border-r border-black p-1 text-center font-bold">{item.qty} {item.unit}</td>
                <td className="border-r border-black p-1 text-right">{item.baseRate.toFixed(2)}</td>
                <td className="border-r border-black p-1 text-center">{item.unit}</td>
                <td className="border-r border-black p-1 text-center">{item.discPercent > 0 ? `${item.discPercent}%` : ""}</td>
                <td className="p-1 text-right font-bold">{item.taxableAmount.toFixed(2)}</td>
              </tr>
            ))}

            {/* Extra blank rows to give standard Tally sheet height if few items */}
            {processedItems.length < 4 && (
              <tr style={{ height: `${(4 - processedItems.length) * 32}px` }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            )}

            {/* Taxable Subtotal Row */}
            <tr className="border-t border-black font-semibold">
              <td colSpan={9} className="border-r border-black px-2 py-0.5 text-right font-bold">
                Taxable Subtotal
              </td>
              <td className="px-2 py-0.5 text-right font-bold">
                {totalTaxableValue.toFixed(2)}
              </td>
            </tr>

            {/* SGST & CGST (Intra-state) or IGST */}
            {isIntraState ? (
              <>
                <tr>
                  <td colSpan={9} className="border-r border-black px-2 py-0.5 text-right font-bold">
                    S GST
                  </td>
                  <td className="px-2 py-0.5 text-right font-semibold">
                    {totalSgst.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={9} className="border-r border-black px-2 py-0.5 text-right font-bold">
                    C GST
                  </td>
                  <td className="px-2 py-0.5 text-right font-semibold">
                    {totalCgst.toFixed(2)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={9} className="border-r border-black px-2 py-0.5 text-right font-bold">
                  I GST
                </td>
                <td className="px-2 py-0.5 text-right font-semibold">
                  {totalIgst.toFixed(2)}
                </td>
              </tr>
            )}

            {/* Round Off */}
            {Math.abs(roundOff) > 0 && (
              <tr>
                <td colSpan={9} className="border-r border-black px-2 py-0.5 text-right text-[9.5px]">
                  Less : Round Off
                </td>
                <td className="px-2 py-0.5 text-right text-[9.5px]">
                  {roundOff < 0 ? `(-)${Math.abs(roundOff).toFixed(2)}` : `(+) ${roundOff.toFixed(2)}`}
                </td>
              </tr>
            )}

            {/* Final Grand Total Row */}
            <tr className="border-t-2 border-b border-black font-extrabold text-[12px] bg-neutral-100/50">
              <td colSpan={9} className="border-r border-black px-2 py-1 text-right">
                Total
              </td>
              <td className="px-2 py-1 text-right">
                ₹ {finalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Footer Breakdown: Amount in words & Bank Details ── */}
        <div className="border-b border-black p-2 flex justify-between items-start text-[10.5px]">
          <div>
            <div className="text-[9.5px] text-neutral-600">Amount Chargeable (in words)</div>
            <div className="font-extrabold text-[11px] mt-0.5">{amountInWords}</div>
            <div className="mt-1.5 font-bold">Company's PAN : {SELLER_INFO.pan}</div>
          </div>
          <div className="text-right text-[9.5px] font-semibold text-neutral-600">
            E. & O.E
          </div>
        </div>

        {/* Declaration & Bank Details & Signatures */}
        <div className="grid grid-cols-2 text-[10px]">
          {/* Left: Declaration & Customer Seal */}
          <div className="p-2 border-r border-black flex flex-col justify-between">
            <div>
              <div className="font-bold underline mb-0.5">Declaration</div>
              <p className="text-[9.5px] leading-tight text-neutral-700">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </p>
            </div>

            <div className="pt-8 mt-4 border-t border-dashed border-neutral-400 text-center">
              <span className="font-bold text-[9.5px]">Customer's Seal and Signature</span>
            </div>
          </div>

          {/* Right: Bank Details & Authorised Signatory */}
          <div className="p-2 flex flex-col justify-between">
            <div>
              <div className="font-bold underline mb-0.5">Company's Bank Details</div>
              <div className="grid grid-cols-[105px_1fr] text-[9.5px] leading-snug">
                <span>A/c Holder's Name :</span>
                <span className="font-bold">{SELLER_INFO.bankDetails.accHolder}</span>
                <span>Bank Name :</span>
                <span>{SELLER_INFO.bankDetails.bankName}</span>
                <span>A/c No. :</span>
                <span className="font-mono font-bold">{SELLER_INFO.bankDetails.accNumber}</span>
                <span>Branch & IFS Code :</span>
                <span>{SELLER_INFO.bankDetails.branch} & {SELLER_INFO.bankDetails.ifsc}</span>
              </div>
            </div>

            <div className="pt-4 text-right">
              <div className="font-bold text-[10px]">for {SELLER_INFO.name}</div>
              <div className="h-8"></div>
              <div className="font-bold border-t border-neutral-400 inline-block px-3 text-[9.5px]">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Jurisdiction Note */}
        <div className="border-t border-black text-center py-1 text-[9px] font-bold tracking-wider uppercase bg-neutral-50">
          SUBJECT TO VADODARA JURISDICTION • This is a Computer Generated Invoice
        </div>
      </div>
    </div>
  );
}
