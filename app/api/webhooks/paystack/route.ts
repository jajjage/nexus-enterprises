import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  validateWebhookSignature,
  WEBHOOK_EVENTS,
  verifyPayment,
  PaystackWebhookPayload,
} from "@/lib/paystack";
import { getServiceBySlug } from "@/lib/services";
import { sendPaymentConfirmationEmail } from "@/lib/email-templates";

/**
 * Handle Paystack webhook events
 * Webhook is called when payment is verified on Paystack servers
 * IMPORTANT: Always validate the signature first
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature validation
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Validate webhook signature
    if (!validateWebhookSignature(signature || "", body)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload: PaystackWebhookPayload = JSON.parse(body);

    // Only process successful charge events
    if (payload.event !== WEBHOOK_EVENTS.CHARGE_SUCCESS) {
      console.log(`Ignoring webhook event: ${payload.event}`);
      return NextResponse.json({ received: true });
    }

    const { reference, amount } = payload.data;
    const customerData = payload.data;

    // Verify the payment amount and status with Paystack API
    // This ensures we're not processing fraudulent requests
    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      console.error(
        `Payment verification failed for reference ${reference}`,
        verification
      );
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Extract customer metadata
    const { name, phone, companyName, serviceSlug, orderNumber: retryOrderNumber } =
      customerData.metadata || {};

    // Check if this is a payment retry (reference starts with RETRY-)
    const isRetryPayment = reference.startsWith("RETRY-");

    if (isRetryPayment && retryOrderNumber) {
      // This is a payment retry from the tracking page
      const existingOrder = await prisma.order.findFirst({
        where: { orderNumber: retryOrderNumber },
      });

      if (existingOrder) {
        // Verify amount matches
        if (amount !== existingOrder.amountKobo) {
          console.error(
            `Amount mismatch for retry: expected ${existingOrder.amountKobo}, got ${amount}`
          );
          return NextResponse.json(
            { error: "Amount mismatch" },
            { status: 400 }
          );
        }

        // Update order status to PAYMENT_CONFIRMED
        if (existingOrder.status === "AWAITING_PAYMENT") {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: "PAYMENT_CONFIRMED",
              paymentReference: reference, // Update with the new retry reference
              logs: {
                create: {
                  status: "PAYMENT_CONFIRMED",
                  note: `Payment confirmed via payment retry (Reference: ${reference})`,
                },
              },
            },
          });

          // Send email
          try {
            await sendPaymentConfirmationEmail({
              customerName: existingOrder.clientName,
              customerEmail: existingOrder.clientEmail,
              orderNumber: existingOrder.orderNumber,
              serviceName: existingOrder.serviceName,
              amount: existingOrder.amountKobo / 100,
              trackingToken: existingOrder.trackingToken,
              trackingUrl: `${process.env.SITE_URL || "http://localhost:3000"}/track/${
                existingOrder.trackingToken
              }`,
            });
          } catch (emailError) {
            console.error("Failed to send payment confirmation email:", emailError);
          }
        }

        console.log(
          `Payment retry processed for order: ${existingOrder.id}`,
          reference
        );
        return NextResponse.json({ received: true });
      }

      console.error(`Order not found for retry: ${retryOrderNumber}`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Not a retry payment - process as new order from "Pay Now" flow
    if (!name || !phone || !serviceSlug) {
      console.error("Missing required metadata in webhook", payload);
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    const service = getServiceBySlug(serviceSlug);
    if (!service) {
      console.error(`Unknown service: ${serviceSlug}`);
      return NextResponse.json(
        { error: "Unknown service" },
        { status: 400 }
      );
    }

    // Verify amount matches service price
    if (amount !== service.amountKobo) {
      console.error(
        `Amount mismatch: expected ${service.amountKobo}, got ${amount}`
      );
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Check if order with this reference already exists
    const existingOrder = await prisma.order.findFirst({
      where: { paymentReference: reference },
    });

    if (existingOrder) {
      // Order already exists - update status if it's awaiting payment
      if (existingOrder.status === "AWAITING_PAYMENT") {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: "PAYMENT_CONFIRMED",
            logs: {
              create: {
                status: "PAYMENT_CONFIRMED",
                note: `Payment confirmed via webhook (Reference: ${reference})`,
              },
            },
          },
        });

        // Send email
        try {
          await sendPaymentConfirmationEmail({
            customerName: existingOrder.clientName,
            customerEmail: existingOrder.clientEmail,
            orderNumber: existingOrder.orderNumber,
            serviceName: existingOrder.serviceName,
            amount: existingOrder.amountKobo ? existingOrder.amountKobo / 100 : 0,
            trackingToken: existingOrder.trackingToken,
            trackingUrl: `${process.env.SITE_URL || "http://localhost:3000"}/track/${
              existingOrder.trackingToken
            }`,
          });
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
        }
      }

      console.log(
        `Payment confirmation processed for existing order: ${existingOrder.id}`,
        reference
      );
      return NextResponse.json({ received: true });
    }

    // Create the order with PAYMENT_CONFIRMED status
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const dateSegment = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // Get count of orders created today for order numbering
    const orderCountToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const orderNumber = `NEX-${dateSegment}-${String(
      orderCountToday + 1
    ).padStart(4, "0")}`;
    const trackingToken = crypto
      .randomBytes(16)
      .toString("hex");

    // Create order in a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        trackingToken,
        serviceSlug,
        serviceName: service.title,
        clientName: name,
        clientEmail: customerData.customer?.email || "",
        clientPhone: phone,
        companyName,
        status: "PAYMENT_CONFIRMED",
        amountKobo: amount,
        paymentProvider: "PAYSTACK",
        paymentReference: reference,
        logs: {
          create: {
            status: "PAYMENT_CONFIRMED",
            note: `Payment received via Paystack (Reference: ${reference})`,
          },
        },
      },
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail({
        customerName: name,
        customerEmail: customerData.customer?.email || "",
        orderNumber: order.orderNumber,
        serviceName: service.title,
        amount: amount / 100, // Convert back to Naira
        trackingToken: order.trackingToken,
        trackingUrl: `${process.env.SITE_URL || "http://localhost:3000"}/track/${
          order.trackingToken
        }`,
      });
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
      // Don't fail the webhook for email errors
    }

    console.log(`Order created successfully: ${order.id}`, {
      orderNumber: order.orderNumber,
      reference,
      amount,
    });

    return NextResponse.json({
      received: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to acknowledge we received the webhook
    // Paystack will retry if we return an error
    return NextResponse.json(
      { error: "Internal server error", received: true },
      { status: 200 }
    );
  }
}

/**
 * GET health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Paystack webhook endpoint is active",
  });
}
