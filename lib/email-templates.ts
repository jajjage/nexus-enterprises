import { ORDER_STATUS_LABELS, type OrderStatusValue } from "@/lib/order-status";
import { sendEmailBestEffort, type EmailSendResult } from "@/lib/mailer";
import { buildTrackingUrl } from "@/lib/urls";

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

export function newsletterWelcomeEmail(): EmailTemplate {
  return {
    subject: "Welcome to Nexus Updates",
    html: `<p>Thanks for subscribing to Nexus Enterprises updates.</p><p>We will send practical compliance and business updates as they become available.</p>`,
    text: "Thanks for subscribing to Nexus Enterprises updates.",
  };
}

export function postBroadcastEmail({
  title,
  excerpt,
  url,
  coverImage,
}: {
  title: string;
  excerpt?: string | null;
  url: string;
  coverImage?: string | null;
}): EmailTemplate {
  const summary = excerpt ?? "Read the latest update.";
  return {
    subject: `New post: ${title}`,
    html: `
      <div>
        <h2>${title}</h2>
        ${coverImage ? `<p><img src="${coverImage}" alt="${title}" style="max-width:100%;height:auto" /></p>` : ""}
        <p>${summary}</p>
        <p><a href="${url}">Read the full post</a></p>
      </div>
    `,
    text: `${title}\n\n${summary}\n\n${url}`,
  };
}

export function orderPlacedAwaitingPaymentEmail({
  customerName,
  orderNumber,
  serviceName,
  amount,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingUrl: string;
}): EmailTemplate {
  const formattedAmount = formatNaira(amount);

  return {
    subject: `Order Received - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Received</h2>
        <p>Hello ${customerName},</p>
        <p>We have received your order for <strong>${serviceName}</strong>.</p>
        <p>Your order is currently <strong>Awaiting Payment</strong>.</p>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
        </div>
        <p>You can track this order at any time using the link below:</p>
        <p><a href="${trackingUrl}">Track your order</a></p>
      </div>
    `,
    text: `Order received\nOrder: ${orderNumber}\nService: ${serviceName}\nAmount: ${formattedAmount}\nTrack: ${trackingUrl}`,
  };
}

export function paymentConfirmedEmail({
  customerName,
  orderNumber,
  serviceName,
  amount,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingUrl: string;
}): EmailTemplate {
  const formattedAmount = formatNaira(amount);

  return {
    subject: `Payment Confirmed - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmed</h2>
        <p>Hello ${customerName},</p>
        <p>We have confirmed your payment for <strong>${serviceName}</strong>.</p>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Amount Paid:</strong> ${formattedAmount}</p>
        </div>
        <p>You can follow progress from your tracking page:</p>
        <p><a href="${trackingUrl}">Track your order</a></p>
      </div>
    `,
    text: `Payment confirmed\nOrder: ${orderNumber}\nService: ${serviceName}\nAmount: ${formattedAmount}\nTrack: ${trackingUrl}`,
  };
}

export function adminOrderUpdateEmail({
  customerName,
  orderNumber,
  serviceName,
  status,
  note,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  status: OrderStatusValue;
  note: string;
  trackingUrl: string;
}): EmailTemplate {
  const statusLabel = ORDER_STATUS_LABELS[status];
  return {
    subject: `Order Update - ${orderNumber} (${statusLabel})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Update</h2>
        <p>Hello ${customerName},</p>
        <p>There is a new update on your order for <strong>${serviceName}</strong>.</p>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Status:</strong> ${statusLabel}</p>
          <p><strong>Update Note:</strong> ${note}</p>
        </div>
        <p><a href="${trackingUrl}">Track your order</a></p>
      </div>
    `,
    text: `Order update\nOrder: ${orderNumber}\nService: ${serviceName}\nStatus: ${statusLabel}\nNote: ${note}\nTrack: ${trackingUrl}`,
  };
}

export function adminOrderRequestEmail({
  customerName,
  orderNumber,
  serviceName,
  currentStatus,
  message,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  currentStatus: OrderStatusValue;
  message: string;
  trackingUrl: string;
}): EmailTemplate {
  const statusLabel = ORDER_STATUS_LABELS[currentStatus];
  return {
    subject: `Information Needed - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Additional Information Needed</h2>
        <p>Hello ${customerName},</p>
        <p>We need a quick update from you to continue your order for <strong>${serviceName}</strong>.</p>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Current Status:</strong> ${statusLabel}</p>
          <p><strong>What we need from you:</strong> ${message}</p>
        </div>
        <p><a href="${trackingUrl}">Open your tracking page</a></p>
      </div>
    `,
    text: `Additional information needed\nOrder: ${orderNumber}\nService: ${serviceName}\nCurrent status: ${statusLabel}\nMessage: ${message}\nTrack: ${trackingUrl}`,
  };
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<EmailSendResult> {
  const template = newsletterWelcomeEmail();
  return sendEmailBestEffort(
    {
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "newsletter_welcome", recipient: email },
  );
}

export async function sendOrderPlacedAwaitingPaymentEmail({
  customerName,
  customerEmail,
  orderNumber,
  serviceName,
  amount,
  trackingToken,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingToken: string;
}): Promise<EmailSendResult> {
  const trackingUrl = buildTrackingUrl(trackingToken);
  const template = orderPlacedAwaitingPaymentEmail({
    customerName,
    orderNumber,
    serviceName,
    amount,
    trackingUrl,
  });

  return sendEmailBestEffort(
    {
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "order_placed", recipient: customerEmail, orderNumber },
  );
}

export async function sendPaymentConfirmationEmail({
  customerName,
  customerEmail,
  orderNumber,
  serviceName,
  amount,
  trackingToken,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingToken: string;
}): Promise<EmailSendResult> {
  const trackingUrl = buildTrackingUrl(trackingToken);
  const template = paymentConfirmedEmail({
    customerName,
    orderNumber,
    serviceName,
    amount,
    trackingUrl,
  });

  return sendEmailBestEffort(
    {
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "payment_confirmed", recipient: customerEmail, orderNumber },
  );
}

export async function sendAdminOrderUpdateEmail({
  customerName,
  customerEmail,
  orderNumber,
  serviceName,
  status,
  note,
  trackingToken,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  status: OrderStatusValue;
  note: string;
  trackingToken: string;
}): Promise<EmailSendResult> {
  const trackingUrl = buildTrackingUrl(trackingToken);
  const template = adminOrderUpdateEmail({
    customerName,
    orderNumber,
    serviceName,
    status,
    note,
    trackingUrl,
  });

  return sendEmailBestEffort(
    {
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "admin_order_update", recipient: customerEmail, orderNumber },
  );
}

export async function sendAdminOrderRequestEmail({
  customerName,
  customerEmail,
  orderNumber,
  serviceName,
  currentStatus,
  message,
  trackingToken,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  currentStatus: OrderStatusValue;
  message: string;
  trackingToken: string;
}): Promise<EmailSendResult> {
  const trackingUrl = buildTrackingUrl(trackingToken);
  const template = adminOrderRequestEmail({
    customerName,
    orderNumber,
    serviceName,
    currentStatus,
    message,
    trackingUrl,
  });

  return sendEmailBestEffort(
    {
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "admin_order_request_info", recipient: customerEmail, orderNumber },
  );
}
