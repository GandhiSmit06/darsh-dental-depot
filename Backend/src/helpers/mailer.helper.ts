import { transporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async (options: MailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      ...options,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
    throw error;
  }
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; color: #374151; }
    .button { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px 32px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦷 Darsh Dental Depot</h1>
      <p>Premium Dental Material Management</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Darsh Dental Depot. All rights reserved.<br>
      If you didn't request this email, please ignore it.
    </div>
  </div>
</body>
</html>
`;

export const sendOtpEmail = async (
  to: string,
  name: string,
  otp: string,
  purpose: 'register' | 'login'
) => {
  const isRegister = purpose === 'register';
  const title = isRegister
    ? 'Verify Your Clinic Registration'
    : 'Doctor Portal Login Code';
  const actionText = isRegister
    ? 'Use the 6-digit verification code below to activate your doctor account for Darsh Dental Depot.'
    : 'Use the 6-digit one-time password below to securely sign in to your Darsh Dental Depot portal.';

  await sendMail({
    to,
    subject: `🔐 Your Verification Code: ${otp} — Darsh Dental Depot`,
    html: baseTemplate(`
      <div style="text-align: center;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">${title}</h2>
        <p style="color: #64748b; font-size: 15px;">Hello Dr. ${name || 'Doctor'},</p>
        <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">${actionText}</p>
        
        <div style="background: #f1f5f9; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; margin: 24px auto; max-width: 280px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
          ⏱️ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; pt: 16px;">
          📍 Exclusively Serving Dental Clinics in Vadodara, Gujarat
        </p>
      </div>
    `),
  });
};

export const sendWelcomeEmail = async (to: string, name: string, verifyUrl: string) => {
  await sendMail({
    to,
    subject: 'Welcome to Darsh Dental Depot — Verify Your Email',
    html: baseTemplate(`
      <h2>Welcome, ${name}! 👋</h2>
      <p>Thank you for joining Darsh Dental Depot. Please verify your email address to activate your account.</p>
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
      <p style="font-size:13px;color:#6b7280;">This link expires in 24 hours.</p>
    `),
  });
};

export const sendPasswordResetEmail = async (to: string, name: string, resetUrl: string) => {
  await sendMail({
    to,
    subject: 'Reset Your Password — Darsh Dental Depot',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p style="font-size:13px;color:#6b7280;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  });
};

export const sendOrderConfirmationEmail = async (
  to: string,
  name: string,
  orderId: string,
  total: number,
  items: { name: string; quantity: number; price: number }[],
) => {
  const itemRows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name}</td>
         <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
         <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">₹${item.price.toFixed(2)}</td></tr>`,
    )
    .join('');

  await sendMail({
    to,
    subject: `Order Confirmed #${orderId} — Darsh Dental Depot`,
    html: baseTemplate(`
      <h2>Order Confirmed! ✅</h2>
      <p>Hi ${name}, your order <strong>#${orderId}</strong> has been placed successfully.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">Product</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr><td colspan="2" style="padding-top:12px;font-weight:bold;">Total</td>
          <td style="padding-top:12px;font-weight:bold;text-align:right;">₹${total.toFixed(2)}</td></tr>
        </tfoot>
      </table>
      <p style="font-size:13px;color:#6b7280;">You will receive another email when your order ships.</p>
    `),
  });
};

export const sendOrderStatusEmail = async (
  to: string,
  name: string,
  orderId: string,
  status: string,
) => {
  await sendMail({
    to,
    subject: `Order #${orderId} Status Update — Darsh Dental Depot`,
    html: baseTemplate(`
      <h2>Order Status Update</h2>
      <p>Hi ${name}, your order <strong>#${orderId}</strong> status has been updated to:</p>
      <p style="font-size:20px;font-weight:bold;color:#2563eb;">${status.toUpperCase()}</p>
    `),
  });
};

export const sendLowStockAlertEmail = async (
  to: string,
  products: { name: string; stock: number; threshold: number }[],
) => {
  const rows = products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${p.name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;color:#ef4444;font-weight:bold;">${p.stock}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${p.threshold}</td>
        </tr>`,
    )
    .join('');

  await sendMail({
    to,
    subject: '⚠️ Low Stock Alert — Darsh Dental Depot',
    html: baseTemplate(`
      <h2>⚠️ Low Stock Alert</h2>
      <p>The following products are running low on stock:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;background:#f3f4f6;">Product</th>
            <th style="text-align:center;padding:8px;background:#f3f4f6;">Current Stock</th>
            <th style="text-align:center;padding:8px;background:#f3f4f6;">Threshold</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:20px;">Please restock these items as soon as possible.</p>
    `),
  });
};
