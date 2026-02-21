// Paystack SDK TypeScript definitions

export interface PaystackSetupConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  currency: string;
  metadata?: Record<string, unknown>;
  onClose: () => void;
  onSuccess: (response: PaystackResponse) => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
}

export interface PaystackHandler {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackSetupConfig) => PaystackHandler;
    };
  }
}
