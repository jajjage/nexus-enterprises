import { describe, expect, it } from "vitest";

import {
  adminOrderRequestEmail,
  adminOrderUpdateEmail,
  newsletterWelcomeEmail,
  orderPlacedAwaitingPaymentEmail,
  paymentConfirmedEmail,
} from "@/lib/email-templates";

describe("email templates", () => {
  it("builds newsletter welcome copy", () => {
    const template = newsletterWelcomeEmail();

    expect(template.subject).toContain("Welcome");
    expect(template.html).toContain("Nexus Enterprises");
    expect(template.text).toContain("subscribing");
  });

  it("builds order placed email with tracking link and amount", () => {
    const template = orderPlacedAwaitingPaymentEmail({
      customerName: "Aisha",
      orderNumber: "NEX-20260222-0001",
      serviceName: "Business Registration",
      amount: 15000,
      trackingUrl: "https://nexus.ng/track/token-1",
    });

    expect(template.subject).toContain("NEX-20260222-0001");
    expect(template.html).toContain("Business Registration");
    expect(template.html).toContain("https://nexus.ng/track/token-1");
    expect(template.text).toContain("₦");
  });

  it("builds payment confirmation and admin update templates with required details", () => {
    const payment = paymentConfirmedEmail({
      customerName: "Aisha",
      orderNumber: "NEX-20260222-0002",
      serviceName: "Tax Filing",
      amount: 22000,
      trackingUrl: "https://nexus.ng/track/token-2",
    });
    const adminUpdate = adminOrderUpdateEmail({
      customerName: "Aisha",
      orderNumber: "NEX-20260222-0002",
      serviceName: "Tax Filing",
      status: "ACTION_REQUIRED",
      note: "Please upload your signed forms.",
      trackingUrl: "https://nexus.ng/track/token-2",
    });

    expect(payment.subject).toContain("Payment Confirmed");
    expect(payment.html).toContain("Tax Filing");
    expect(payment.text).toContain("token-2");

    expect(adminUpdate.subject).toContain("Action Required");
    expect(adminUpdate.html).toContain("Please upload your signed forms.");
    expect(adminUpdate.text).toContain("Track");
  });

  it("builds admin request-info template with current status and request message", () => {
    const request = adminOrderRequestEmail({
      customerName: "Aisha",
      orderNumber: "NEX-20260222-0003",
      serviceName: "Tax Filing",
      currentStatus: "IN_PROGRESS",
      message: "Please provide your updated TIN certificate.",
      trackingUrl: "https://nexus.ng/track/token-3",
    });

    expect(request.subject).toContain("Information Needed");
    expect(request.html).toContain("updated TIN certificate");
    expect(request.html).toContain("In Progress");
    expect(request.text).toContain("token-3");
  });
});
