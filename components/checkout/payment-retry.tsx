"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaystackResponse } from "./paystack-types";
import "./paystack-types"; // Import for global Window type declaration

interface PaymentRetryProps {
  orderNumber: string;
  amount: number; // in kobo
  email: string;
  publicKey: string;
  onPaymentSuccess?: () => void;
}

export function PaymentRetry({
  orderNumber,
  amount,
  email,
  publicKey,
  onPaymentSuccess,
}: PaymentRetryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePaymentRetry = async () => {
    if (!window.PaystackPop) {
      alert("Payment system is not ready. Please refresh the page.");
      return;
    }

    setIsProcessing(true);

    // Generate a new reference for retry
    const retryReference = `RETRY-${orderNumber}-${Date.now()}`;

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount, // in kobo
      ref: retryReference,
      currency: "NGN",
      metadata: {
        orderNumber, // Include order number so webhook can find the order
      },
      onClose: () => {
        setIsProcessing(false);
        alert("Payment was not completed. Please try again.");
      },
      onSuccess: (response: PaystackResponse) => {
        console.log("Payment successful!", response);
        setIsProcessing(false);

        if (onPaymentSuccess) {
          onPaymentSuccess();
        }

        alert("Payment successful! Your order status will update shortly.");
        
        // Reload to see updated status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
    });

    handler.openIframe();
  };

  if (!paystackLoaded) {
    return (
      <Card className="border-l-4 border-l-amber-500 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Loading...</h3>
            <p className="mt-2 text-sm text-amber-800">Preparing payment system...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-50 p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Payment Awaiting</h3>
          <p className="mt-2 text-sm text-amber-800">
            Your order is ready! Complete payment to activate your service.
          </p>
          <Button
            onClick={handlePaymentRetry}
            disabled={isProcessing}
            className="mt-4 cursor-pointer bg-amber-600 hover:bg-amber-700"
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
