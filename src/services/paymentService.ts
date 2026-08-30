import { supabase } from "../lib/supabase";

export type PaymentStatus =
  | "creating"
  | "pending"
  | "paid"
  | "expired"
  | "failed"
  | "refund_pending"
  | "refunded";

export interface PaymentStatusResponse {
  gameId: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  refundedAt: string | null;
  fulfillmentType: "reservation" | "digital_download";
  downloadReady: boolean;
}

const PAYMENT_STATUSES = new Set<PaymentStatus>([
  "creating",
  "pending",
  "paid",
  "expired",
  "failed",
  "refund_pending",
  "refunded",
]);

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

const isPaymentStatusResponse = (
  value: unknown
): value is PaymentStatusResponse => {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    isNullableString(payload.gameId) &&
    typeof payload.status === "string" &&
    PAYMENT_STATUSES.has(payload.status as PaymentStatus) &&
    isNullableString(payload.paidAt) &&
    isNullableString(payload.refundedAt) &&
    (payload.fulfillmentType === "reservation" ||
      payload.fulfillmentType === "digital_download") &&
    typeof payload.downloadReady === "boolean"
  );
};

const getFunctionError = async (
  error: unknown,
  fallback: string
): Promise<string> => {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const payload = (await context.clone().json()) as { error?: unknown };
        if (typeof payload.error === "string" && payload.error.length <= 300) {
          return payload.error;
        }
      } catch {
        // La respuesta sin JSON no se muestra directamente al usuario.
      }
    }
  }
  return fallback;
};

const isStripeCheckoutUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
};

const isSupabaseSignedStorageUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 4096) return false;
  try {
    const url = new URL(value);
    const supabaseOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
    return (
      url.protocol === "https:" &&
      url.origin === supabaseOrigin &&
      url.pathname.startsWith("/storage/v1/object/sign/digital-products/")
    );
  } catch {
    return false;
  }
};

export class PaymentService {
  static async iniciarPago(gameId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      { body: { gameId } }
    );
    if (error) {
      throw new Error(
        await getFunctionError(error, "No se pudo iniciar el pago seguro")
      );
    }
    if (!isStripeCheckoutUrl(data?.checkoutUrl)) {
      throw new Error("Stripe no ha devuelto una URL de pago válida");
    }
    return data.checkoutUrl;
  }

  static async consultarPago(sessionId: string): Promise<PaymentStatusResponse> {
    const { data, error } = await supabase.functions.invoke("payment-status", {
      body: { sessionId },
    });
    if (error) {
      throw new Error(
        await getFunctionError(error, "No se pudo comprobar el estado del pago")
      );
    }
    if (!isPaymentStatusResponse(data)) {
      throw new Error("La respuesta del pago no es válida");
    }
    return data;
  }

  static async obtenerDescargaDigital(
    gameId: string
  ): Promise<{ url: string; fileName: string }> {
    const { data, error } = await supabase.functions.invoke(
      "download-digital-product",
      { body: { gameId } }
    );
    if (error) {
      throw new Error(
        await getFunctionError(error, "No se pudo preparar la descarga")
      );
    }
    if (!isSupabaseSignedStorageUrl(data?.url)) {
      throw new Error("El enlace de descarga recibido no es válido");
    }
    return {
      url: data.url,
      fileName:
        typeof data.fileName === "string" ? data.fileName : "aventura-digital",
    };
  }

  static async cancelarPartida(gameId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke("cancel-game", {
      body: { gameId },
    });
    if (error) {
      throw new Error(
        await getFunctionError(
          error,
          data?.cancelled
            ? "La partida se canceló, pero quedan devoluciones pendientes. Contacta con soporte."
            : "No se pudo cancelar la partida"
        )
      );
    }
  }
}

export default PaymentService;
