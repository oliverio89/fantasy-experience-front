import {
  adminClient,
  authenticate,
  corsHeaders,
  handlePreflight,
  isUuid,
  jsonResponse,
  publicDatabaseMessage,
  readSmallJson,
} from "../_shared/http.ts";
import { stripeClient } from "../_shared/stripe.ts";

type CancellationOrder = {
  orderId: string;
  status: string;
  sessionId: string | null;
  paymentIntentId: string | null;
};

Deno.serve(async (request) => {
  const cors = corsHeaders(request);
  const preflight = handlePreflight(request, cors);
  if (preflight) return preflight;
  if (!cors) return jsonResponse({ error: "Origen no permitido" }, 403);
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405, cors);
  }

  try {
    const user = await authenticate(request);
    const payload = await readSmallJson(request);
    if (!isUuid(payload.gameId)) {
      return jsonResponse({ error: "Partida no válida" }, 400, cors);
    }

    const admin = adminClient();
    const { data, error } = await admin.rpc("prepare_game_cancellation", {
      p_game_id: payload.gameId,
      p_actor_id: user.id,
    });
    if (error || !data) {
      return jsonResponse(
        { error: publicDatabaseMessage(error?.message) },
        403,
        cors,
      );
    }

    const orders = (data.orders ?? []) as CancellationOrder[];
    let stripe: ReturnType<typeof stripeClient> | null = null;
    const getStripe = () => {
      stripe ??= stripeClient();
      return stripe;
    };
    const failedRefunds: string[] = [];

    for (const order of orders) {
      if (!isUuid(order.orderId)) continue;
      if (
        ["creating", "pending"].includes(order.status) &&
        order.sessionId?.startsWith("cs_")
      ) {
        try {
          await getStripe().checkout.sessions.expire(order.sessionId);
        } catch {
          // Si el pago ganó la carrera, el webhook lo devuelve automáticamente.
        }
      }
      if (
        ["paid", "refund_pending"].includes(order.status) &&
        order.paymentIntentId?.startsWith("pi_")
      ) {
        try {
          await getStripe().refunds.create(
            {
              payment_intent: order.paymentIntentId,
              metadata: {
                app: "fantasy-experience",
                order_id: order.orderId,
                reason: "game_cancelled",
              },
            },
            { idempotencyKey: `game-cancel-refund-${order.orderId}` },
          );
          const { error: markError } = await admin.rpc(
            "mark_payment_refunded",
            { p_order_id: order.orderId },
          );
          if (markError) throw markError;
        } catch {
          failedRefunds.push(order.orderId);
        }
      } else if (["paid", "refund_pending"].includes(order.status)) {
        failedRefunds.push(order.orderId);
      }
    }

    if (failedRefunds.length > 0) {
      return jsonResponse(
        {
          cancelled: true,
          refundsPending: failedRefunds.length,
          error:
            "La partida está cancelada, pero hay devoluciones pendientes de revisión",
        },
        502,
        cors,
      );
    }
    return jsonResponse({ cancelled: true, refundsPending: 0 }, 200, cors);
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return jsonResponse(
      { error: unauthorized ? "Sesión no válida" : "No se pudo cancelar la partida" },
      unauthorized ? 401 : 500,
      cors,
    );
  }
});
