import PDFDocument from 'pdfkit';
import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';
import dayjs from 'dayjs';

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  date: Date;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export const generateInvoicePDF = (data: InvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc
      .fillColor('#2563eb')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('DARSH DENTAL DEPOT', 50, 50);

    doc
      .fillColor('#6b7280')
      .fontSize(10)
      .font('Helvetica')
      .text('Premium Dental Material Management', 50, 85);

    // Invoice title
    doc
      .fillColor('#111827')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 50, { align: 'right' });

    doc
      .fillColor('#6b7280')
      .fontSize(10)
      .font('Helvetica')
      .text(`#${data.invoiceNumber}`, 400, 78, { align: 'right' })
      .text(`Date: ${dayjs(data.date).format('DD MMM YYYY')}`, 400, 92, { align: 'right' })
      .text(`Order: ${data.orderId}`, 400, 106, { align: 'right' });

    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).stroke('#e5e7eb');

    // Bill to
    doc
      .fillColor('#374151')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO', 50, 145);

    doc
      .font('Helvetica')
      .text(data.customer.name, 50, 162)
      .text(data.customer.email, 50, 177)
      .text(data.customer.address, 50, 192, { width: 200 });

    // Table header
    const tableTop = 260;
    doc
      .fillColor('#f3f4f6')
      .rect(50, tableTop, 495, 20)
      .fill();

    doc
      .fillColor('#374151')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('PRODUCT', 60, tableTop + 6)
      .text('QTY', 350, tableTop + 6, { width: 60, align: 'center' })
      .text('UNIT PRICE', 410, tableTop + 6, { width: 80, align: 'right' })
      .text('AMOUNT', 490, tableTop + 6, { width: 55, align: 'right' });

    // Table rows
    let y = tableTop + 28;
    doc.font('Helvetica').fontSize(9).fillColor('#374151');

    data.items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.fillColor('#fafafa').rect(50, y - 4, 495, 20).fill();
      }
      const amount = item.quantity * item.price;
      doc
        .fillColor('#374151')
        .text(item.name, 60, y, { width: 280 })
        .text(item.quantity.toString(), 350, y, { width: 60, align: 'center' })
        .text(`₹${item.price.toFixed(2)}`, 410, y, { width: 80, align: 'right' })
        .text(`₹${amount.toFixed(2)}`, 490, y, { width: 55, align: 'right' });
      y += 22;
    });

    // Totals
    y += 10;
    doc.moveTo(350, y).lineTo(545, y).stroke('#e5e7eb');
    y += 12;

    doc
      .font('Helvetica')
      .text('Subtotal:', 350, y, { width: 140, align: 'right' })
      .text(`₹${data.subtotal.toFixed(2)}`, 490, y, { width: 55, align: 'right' });
    y += 16;

    doc
      .text('Tax (GST 18%):', 350, y, { width: 140, align: 'right' })
      .text(`₹${data.tax.toFixed(2)}`, 490, y, { width: 55, align: 'right' });
    y += 16;

    doc.moveTo(350, y).lineTo(545, y).stroke('#e5e7eb');
    y += 8;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#2563eb')
      .text('TOTAL:', 350, y, { width: 140, align: 'right' })
      .text(`₹${data.total.toFixed(2)}`, 490, y, { width: 55, align: 'right' });

    // Footer
    doc
      .fillColor('#9ca3af')
      .font('Helvetica')
      .fontSize(8)
      .text('Thank you for your business!', 50, 720, { align: 'center' })
      .text(
        'Darsh Dental Depot | noreply@darshdental.com',
        50,
        733,
        { align: 'center' },
      );

    doc.end();
  });
};

export const uploadInvoiceToCloudinary = async (
  buffer: Buffer,
  invoiceNumber: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'darsh-dental-depot/invoices',
        public_id: `invoice_${invoiceNumber}`,
        resource_type: 'raw',
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};
