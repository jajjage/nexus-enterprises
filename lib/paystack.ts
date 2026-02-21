/**
 * Paystack payment configuration and utilities
 * Public key is safe for client-side use
 * Secret key is NEVER exposed to client
 */

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_PUBLIC_KEY) {
  console.warn("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured");
}

if (!PAYSTACK_SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("PAYSTACK_SECRET_KEY must be configured in production");
}

/**
 * Paystack API endpoint
 */
export const PAYSTACK_API_URL = "https://api.paystack.co";

/**
 * Convert Naira to Kobo (multiply by 100)
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert Kobo to Naira (divide by 100)
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Generate unique payment reference
 * Format: PAY-{timestamp}-{randomString}
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

/**
 * Initialize/verify Paystack payment
 * Returns authorization URL for redirect or uses callback-based approach
 */
export async function initializePayment(
  email: string,
  amountKobo: number,
  reference: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
) {
  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error(`Paystack initialization failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verify payment with Paystack API
 * Must be called from server-side only
 */
export async function verifyPayment(reference: string) {
  const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Payment verification failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Validate Paystack webhook signature
 * Compares HMAC-SHA512 hash of request body with provided signature
 */
export function validateWebhookSignature(
  signature: string | undefined,
  rawBody: string
): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

/**
 * Paystack webhook event types
 */
export const WEBHOOK_EVENTS = {
  CHARGE_SUCCESS: "charge.success",
  CHARGE_FAILED: "charge.failed",
  CHARGE_DISPUTE_CREATE: "charge.dispute.create",
  TRANSFER_SUCCESS: "transfer.success",
  TRANSFER_FAILED: "transfer.failed",
  INVOICE_PAYMENT_REQUEST_PENDING: "invoice.payment_request_pending",
} as const;

/**
 * Expected webhook payload types
 */
export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: "success" | "failed";
    currency: string;
    customer?: {
      id: number;
      email: string;
      phone?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
    paid_at?: string;
  };
}
