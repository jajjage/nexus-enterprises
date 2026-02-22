import crypto from "node:crypto";
import { describe, expect, it, vi } from "vitest";

async function importPaystackModule() {
  vi.resetModules();
  process.env.PAYSTACK_SECRET_KEY = "sk_test_signature_key";
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = "pk_test_public_key";
  return import("@/lib/paystack");
}

describe("paystack utilities", () => {
  it("validates webhook signature for true and false paths", async () => {
    const paystack = await importPaystackModule();
    const body = JSON.stringify({ event: "charge.success", amount: 500000 });

    const validSignature = crypto
      .createHmac("sha512", String(process.env.PAYSTACK_SECRET_KEY))
      .update(body)
      .digest("hex");

    expect(paystack.validateWebhookSignature(validSignature, body)).toBe(true);
    expect(paystack.validateWebhookSignature("invalid-signature", body)).toBe(false);
  });

  it("generates payment references with expected format", async () => {
    const paystack = await importPaystackModule();

    const reference = paystack.generatePaymentReference();

    expect(reference).toMatch(/^PAY-\d{13}-[A-Z0-9]{6}$/);
  });

  it("handles naira/kobo conversion edge values", async () => {
    const paystack = await importPaystackModule();

    expect(paystack.nairaToKobo(0)).toBe(0);
    expect(paystack.nairaToKobo(0.01)).toBe(1);
    expect(paystack.nairaToKobo(1999.995)).toBe(200000);

    expect(paystack.koboToNaira(0)).toBe(0);
    expect(paystack.koboToNaira(1)).toBe(0.01);
    expect(paystack.koboToNaira(200000)).toBe(2000);
  });
});
