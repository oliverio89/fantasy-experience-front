import Stripe from "npm:stripe@22.0.0";
import { requiredEnv } from "./http.ts";

export const stripeClient = () =>
  new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
    httpClient: Stripe.createFetchHttpClient(),
  });

export const stripeCryptoProvider = Stripe.createSubtleCryptoProvider();

export const safeCheckoutUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 2_048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
};

export type PaymentOrderPreparation = {
  orderId: string;
  gameId: string;
  gameTitle: string;
  amountCents: number;
  currency: "eur";
  status: "creating" | "pending";
  checkoutUrl: string | null;
  expiresAt: string | null;
  fulfillmentType?: "reservation" | "digital_download";
};
