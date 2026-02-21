"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { setClientSession } from "@/app/actions/track-session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function TrackLoginForm() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const errorParam = searchParams.get("error");
  const errorMessages: Record<string, string> = {
    invalid_token: "Invalid tracking ID or order number. Please check and try again.",
    server_error: "An error occurred. Please try again.",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!token.trim()) {
      setError("Please enter your tracking ID or order number");
      return;
    }

    setIsLoading(true);
    try {
      await setClientSession(token.trim());
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // Redirection happened, component will unmount
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      {errorParam && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessages[errorParam] || "An error occurred. Please try again."}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium text-slate-700">
            Tracking ID or Order Number
          </label>
          <input
            id="token"
            type="text"
            placeholder="Enter your tracking ID or order number"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
            className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-sm outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/15 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 cursor-pointer bg-(--color-primary) hover:bg-(--color-primary)/90 text-white font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            "View Order Status"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Use the tracking link, tracking ID, or order number from your confirmation email.
      </p>
    </>
  );
}

export default function TrackLoginPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-semibold text-(--color-primary)">
            Track Your Order
          </h1>
          <p className="text-sm text-slate-600">
            Enter your tracking ID or order number to view your order status.
          </p>
        </div>

        <Suspense fallback={<div className="h-12 bg-slate-100 rounded-lg animate-pulse" />}>
          <TrackLoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
