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

      // Redirect to tracking page
      alert(
        `Order ${result.orderNumber} placed! You can pay anytime from your tracking page.`
      );
      window.location.href = result.trackingUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error("Place order error:", err);
    } finally {
      setIsLoading(false);
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
        onClose: () => {
          setIsPaying(false);
          setError("Payment cancelled. Your order wasn't placed yet. Try again or place an order without paying.");
        },
        onSuccess: (response: PaystackResponse) => {
          console.log("Payment successful!", response);
          setIsPaying(false);
          alert(
            "Payment successful! Your order is being processed. Check your email for order details."
          );
          setFormData({ name: "", email: "", phone: "", companyName: "" });
          // Redirect home after a delay
          setTimeout(() => {
            window.location.href = "/";
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
      `}</style>
    </div>
  );
}
