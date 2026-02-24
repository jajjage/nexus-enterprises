"use client";

import React, { useState, useEffect } from "react";
import { prepareCheckout, placeOrder } from "@/app/services/[service-slug]/checkout-action";
import { Button } from "@/components/ui/button";
import type { PaystackResponse } from "./paystack-types";
import "./paystack-types"; // Import for global Window type declaration

interface PaystackCheckoutProps {
  serviceSlug: string;
  serviceName: string;
  servicePrice: number; // in Naira
}

export function PaystackCheckout({
  serviceSlug,
  serviceName,
  servicePrice,
}: PaystackCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    trackingToken: string;
    trackingUrl: string;
    email: string;
  } | null>(null);
  const trackingDisplayId = placedOrder?.orderNumber ?? "";

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load payment system. Please refresh the page.");
      console.error("Failed to load Paystack script");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  // Validate form fields
  const isFormValid = formData.name && formData.email && formData.phone && formData.name.length >= 2 && formData.phone.length >= 10;

  // Handle "Place Order" button
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("companyName", formData.companyName);
      formDataObj.append("serviceSlug", serviceSlug);

      const result = await placeOrder(formDataObj);

      setPlacedOrder({
        orderNumber: result.orderNumber,
        trackingToken: result.trackingToken,
        trackingUrl: result.trackingUrl,
        email: formData.email,
      });
      setCopyState("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Place order error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTrackingId = async () => {
    if (!placedOrder) return;

    try {
      await navigator.clipboard.writeText(placedOrder.orderNumber);
      setCopyState("copied");
      setTimeout(() => {
        window.location.href = placedOrder.trackingUrl;
      }, 700);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      setCopyState("error");
    }
  };

  // Handle "Pay Now" button
  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPaying(true);

    try {
      // Validate Paystack is loaded
      if (!window.PaystackPop) {
        throw new Error("Payment system is not ready. Please refresh and try again.");
      }

      // Prepare checkout (validate input and get payment reference)
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("companyName", formData.companyName);
      formDataObj.append("serviceSlug", serviceSlug);

      const checkout = await prepareCheckout(formDataObj);

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: checkout.publicKey,
        email: checkout.email,
        amount: checkout.amount, // in kobo
        ref: checkout.paymentReference,
        currency: "NGN",
        metadata: checkout.metadata,
        onClose: () => {
          setIsPaying(false);
          setError(
            `Payment cancelled. Your order (${checkout.orderNumber}) is saved and awaiting payment. You can complete payment later from your tracking page.`,
          );
        },
        onSuccess: (response: PaystackResponse) => {
          console.log("Payment successful!", response);
          setIsPaying(false);
          alert(
            "Payment successful! Your order is being processed. Check your email for order details."
          );
          setFormData({ name: "", email: "", phone: "", companyName: "" });
          // Redirect to tracking page while webhook confirmation finalizes.
          setTimeout(() => {
            window.location.href = checkout.trackingUrl;
          }, 2000);
        },
      });

      handler.openIframe();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Payment error:", err);
      setIsPaying(false);
    }
  };

  if (!paystackLoaded) {
    return (
      <div className="checkout-container">
        <div className="checkout-form">
          <p style={{ color: "#666", textAlign: "center" }}>Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h3>Complete Your Order</h3>
        <div className="service-info">
          <p>
            <strong>{serviceName}</strong>
          </p>
          <p className="service-price">
            NGN {servicePrice.toLocaleString()}
          </p>
        </div>

        <form>
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              required
              disabled={isLoading || isPaying}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              disabled={isLoading || isPaying}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+234 or 0701234567"
              required
              disabled={isLoading || isPaying}
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name (Optional)</label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Your company name"
              disabled={isLoading || isPaying}
            />
          </div>

          <div className="button-group">
            <Button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!isFormValid || isLoading || isPaying}
              variant="outline"
            >
              {isLoading ? "Creating Order..." : "Place Order"}
            </Button>
            <Button
              type="button"
              onClick={handlePayNow}
              disabled={!isFormValid || isLoading || isPaying}
            >
              {isPaying ? "Processing Payment..." : `Pay NGN ${servicePrice.toLocaleString()}`}
            </Button>
          </div>
        </form>

        <div className="info-box">
          <p><strong>Place Order:</strong> Create your order now, pay anytime from your tracking page.</p>
          <p><strong>Pay Now:</strong> Complete payment immediately and get instant confirmation.</p>
        </div>

        <p className="security-note">
          💳 Secure payment powered by Paystack. Your details are safe.
        </p>
      </div>

      {placedOrder ? (
        <div className="order-modal-backdrop" role="presentation">
          <div className="order-modal" role="dialog" aria-modal="true" aria-label="Order placed">
            <h4>Order placed successfully</h4>
            <p>
              We have sent a confirmation email to <strong>{placedOrder.email}</strong>.
            </p>
            <p>Copy your tracking ID below to keep it safe.</p>

            <div className="tracking-token-box">{trackingDisplayId}</div>
            <p className="order-number">Order Number: {placedOrder.orderNumber}</p>

            <div className="modal-actions">
              <Button type="button" onClick={handleCopyTrackingId}>
                Copy Tracking ID
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.location.href = placedOrder.trackingUrl;
                }}
              >
                Go to Tracking Page
              </Button>
            </div>

            <p className="copy-state">
              {copyState === "copied" ? "Copied. Redirecting to tracking page..." : null}
              {copyState === "error" ? "Copy failed. Use the button below to continue." : null}
            </p>

            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setPlacedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .checkout-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .checkout-form {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .checkout-form h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }

        .service-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 25px;
        }

        .service-info p {
          margin: 5px 0;
          color: #666;
        }

        .service-price {
          font-size: 24px;
          font-weight: bold;
          color: #2d8659;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border-left: 4px solid #c33;
        }

        .error-message p {
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-group input:disabled {
          background-color: #f9f9f9;
          color: #999;
          cursor: not-allowed;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .button-group :global(button) {
          flex: 1;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .info-box {
          background: #f0f7ff;
          border: 1px solid #b3d9ff;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #333;
        }

        .info-box p {
          margin: 8px 0;
        }

        .info-box strong {
          color: #0066cc;
        }

        .security-note {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 15px;
        }

        .order-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.58);
          padding: 20px;
        }

        .order-modal {
          width: 100%;
          max-width: 520px;
          border-radius: 12px;
          background: #fff;
          padding: 24px;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
        }

        .order-modal h4 {
          margin: 0 0 12px;
          color: #142850;
          font-size: 22px;
        }

        .order-modal p {
          margin: 8px 0;
          color: #334155;
          line-height: 1.5;
        }

        .tracking-token-box {
          margin-top: 14px;
          border: 1px dashed #94a3b8;
          border-radius: 8px;
          background: #f8fafc;
          padding: 12px;
          font-size: 13px;
          color: #0f172a;
          word-break: break-all;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
            "Courier New", monospace;
        }

        .order-number {
          margin-top: 8px;
          font-size: 13px;
          color: #475569;
        }

        .modal-actions {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .copy-state {
          min-height: 18px;
          margin-top: 8px;
          font-size: 13px;
          color: #0f766e;
        }

        .close-modal-btn {
          margin-top: 8px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 13px;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
