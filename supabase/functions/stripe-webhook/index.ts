import Stripe from "npm:stripe@22.0.0";
import {
  adminClient,
  jsonResponse,
  requiredEnv,
} from "../_shared/http.ts";
import {
  stripeClient,
  stripeCryptoProvider,
} from "../_shared/stripe.ts";

const referenceId = (value: string | Stripe.PaymentIntent | null): string | null =>
  typeof value === "string" ? value : value?.id ?? null;

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 1_048_576) {
    return jsonResponse({ error: "Evento demasiado grande" }, 413);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature || signature.length > 2_048) {
    return jsonResponse({ error: "Firma ausente" }, 400);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > 1_048_576) {
    return jsonResponse({ error: "Evento demasiado grande" }, 413);
  }

  let stripe: ReturnType<typeof stripeClient>;
  let webhookSecret: string;
  try {
    stripe = stripeClient();
    webhookSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");
  } catch {
    return jsonResponse({ error: "Webhook no configurado" }, 500);
  }
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      stripeCryptoProvider,
    );
  } catch {
    return jsonResponse({ error: "Firma no válida" }, 400);
  }

  try {
    let object: Record<string, unknown> | null = null;
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.app !== "fantasy-experience") {
        return jsonResponse({ received: true, ignored: true }, 200);
      }
      if (session.mode !== "payment") {
        return jsonResponse({ received: true, ignored: true }, 200);
      }
      object = {
        sessionId: session.id,
        orderId: session.metadata.order_id ?? null,
        gameId: session.metadata.game_id ?? null,
        playerId: session.metadata.player_id ?? null,
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        paymentIntentId: referenceId(session.payment_intent),
      };
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      object = {
        paymentIntentId: referenceId(charge.payment_intent),
        fullyRefunded: charge.refunded && charge.amount_refunded >= charge.amount,
      };
    } else {
      return jsonResponse({ received: true, ignored: true }, 200);
    }
    if (!object) {
      return jsonResponse({ received: true, ignored: true }, 200);
    }

    const admin = adminClient();
    let fulfillmentType: string | null = null;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.expired") {
      const orderId = typeof object.orderId === "string" ? object.orderId : null;
      if (!orderId) {
        throw new Error("PAYMENT_ORDER_REFERENCE_MISSING");
      }
      if (orderId) {
        const { data: order, error: orderError } = await admin
          .from("payment_orders")
          .select("fulfillment_type")
          .eq("id", orderId)
          .maybeSingle();
        if (orderError || !order) {
          throw new Error("PAYMENT_ORDER_NOT_FOUND");
        }
        fulfillmentType = order?.fulfillment_type ?? null;
      }
    } else if (event.type === "charge.refunded") {
      const paymentIntentId = typeof object.paymentIntentId === "string"
        ? object.paymentIntentId
        : null;
      if (paymentIntentId) {
        const { data: order, error: orderError } = await admin
          .from("payment_orders")
          .select("fulfillment_type")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();
        if (orderError) throw new Error("PAYMENT_ORDER_LOOKUP_FAILED");
        fulfillmentType = order?.fulfillment_type ?? null;
      }
    }

    if (
      fulfillmentType !== null &&
      fulfillmentType !== "reservation" &&
      fulfillmentType !== "digital_download"
    ) {
      throw new Error("INVALID_FULFILLMENT_TYPE");
    }

    const reconciliationFunction = fulfillmentType === "digital_download"
      ? "process_digital_stripe_event"
      : "process_stripe_event";
    const { data, error } = await admin.rpc(reconciliationFunction, {
      p_event_id: event.id,
      p_event_type: event.type,
      p_object: object,
    });
    if (error || !data) throw new Error("DATABASE_RECONCILIATION_FAILED");

    if (data.needsRefund === true && typeof data.paymentIntentId === "string") {
      await stripe.refunds.create(
        {
          payment_intent: data.paymentIntentId,
          metadata: {
            app: "fantasy-experience",
            order_id: String(data.orderId),
            reason: fulfillmentType === "digital_download"
              ? "digital_product_unavailable"
              : "reservation_unavailable",
          },
        },
        { idempotencyKey: `automatic-refund-${String(data.orderId)}` },
      );
      const { error: markError } = await admin.rpc("mark_payment_refunded", {
        p_order_id: data.orderId,
      });
      if (markError) throw new Error("REFUND_RECONCILIATION_FAILED");
    }

    return jsonResponse({ received: true }, 200);
  } catch (error) {
    console.error("stripe-webhook failed", {
      kind: error instanceof Error ? error.name : "unknown",
    });
    return jsonResponse({ error: "Evento no procesado" }, 500);
  }
});
