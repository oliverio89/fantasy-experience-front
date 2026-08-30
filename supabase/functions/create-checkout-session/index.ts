import {
  adminClient,
  authenticate,
  corsHeaders,
  handlePreflight,
  isUuid,
  jsonResponse,
  publicDatabaseMessage,
  readSmallJson,
  requiredEnv,
} from "../_shared/http.ts";
import {
  safeCheckoutUrl,
  stripeClient,
  type PaymentOrderPreparation,
} from "../_shared/stripe.ts";

Deno.serve(async (request) => {
  const cors = corsHeaders(request);
  const preflight = handlePreflight(request, cors);
  if (preflight) return preflight;
  if (!cors) return jsonResponse({ error: "Origen no permitido" }, 403);
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método no permitido" }, 405, cors);
  }

  let userId: string | null = null;
  let orderId: string | null = null;
  try {
    const user = await authenticate(request);
    userId = user.id;
    const payload = await readSmallJson(request);
    if (!isUuid(payload.gameId)) {
      return jsonResponse({ error: "Partida no válida" }, 400, cors);
    }

    const admin = adminClient();
    const { data: product, error: productError } = await admin
      .from("games")
      .select("game_type")
      .eq("id", payload.gameId)
      .maybeSingle();
    if (productError || !product) {
      return jsonResponse({ error: "Partida no encontrada" }, 404, cors);
    }
    const isDigital = product.game_type === "Digital";
    const { data, error } = isDigital
      ? await admin.rpc("prepare_digital_payment_order", {
          p_game_id: payload.gameId,
          p_buyer_id: user.id,
        })
      : await admin.rpc("prepare_payment_order", {
          p_game_id: payload.gameId,
          p_player_id: user.id,
        });
    if (error || !data) {
      return jsonResponse(
        { error: publicDatabaseMessage(error?.message) },
        409,
        cors,
      );
    }

    const order = data as PaymentOrderPreparation;
    orderId = order.orderId;
    if (
      order.status === "pending" &&
      order.expiresAt &&
      new Date(order.expiresAt).getTime() > Date.now() &&
      safeCheckoutUrl(order.checkoutUrl)
    ) {
      return jsonResponse(
        { checkoutUrl: order.checkoutUrl, orderId: order.orderId },
        200,
        cors,
      );
    }
    if (
      !isUuid(order.orderId) ||
      !isUuid(order.gameId) ||
      !Number.isInteger(order.amountCents) ||
      order.amountCents < 50 ||
      order.currency !== "eur"
    ) {
      throw new Error("INVALID_ORDER");
    }

    const configuredSite = new URL(requiredEnv("SITE_URL"));
    if (
      configuredSite.protocol !== "https:" &&
      configuredSite.hostname !== "localhost"
    ) {
      throw new Error("INVALID_SITE_URL");
    }
    const expiresAt = Math.floor(Date.now() / 1_000) + 31 * 60;
    const metadata = {
      app: "fantasy-experience",
      order_id: order.orderId,
      game_id: order.gameId,
      player_id: user.id,
      fulfillment_type: isDigital ? "digital_download" : "reservation",
    };
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "es",
        payment_method_types: ["card"],
        customer_email: user.email,
        client_reference_id: order.orderId,
        expires_at: expiresAt,
        success_url: `${configuredSite.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${configuredSite.origin}/detailsgame/${order.gameId}?payment=cancelled`,
        metadata,
        payment_intent_data: { metadata },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: order.currency,
              unit_amount: order.amountCents,
              product_data: {
                name: order.gameTitle.slice(0, 120),
                description: isDigital
                  ? "Compra de una aventura digital en Fantasy Experience"
                  : "Reserva de una plaza en Fantasy Experience",
              },
            },
          },
        ],
      },
      { idempotencyKey: `checkout-${order.orderId}` },
    );

    if (!session.url || !safeCheckoutUrl(session.url)) {
      throw new Error("INVALID_STRIPE_URL");
    }
    const { error: activationError } = await admin.rpc(
      "activate_payment_order",
      {
        p_order_id: order.orderId,
        p_player_id: user.id,
        p_session_id: session.id,
        p_checkout_url: session.url,
        p_expires_at: new Date(session.expires_at * 1_000).toISOString(),
      },
    );
    if (activationError) {
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch {
        // El webhook de expiración o de pago reconciliará cualquier carrera.
      }
      throw new Error("ORDER_ACTIVATION_FAILED");
    }

    return jsonResponse(
      { checkoutUrl: session.url, orderId: order.orderId },
      201,
      cors,
    );
  } catch (error) {
    if (orderId && userId) {
      await adminClient().rpc("fail_payment_order", {
        p_order_id: orderId,
        p_player_id: userId,
      });
    }
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    console.error("create-checkout-session failed", {
      kind: error instanceof Error ? error.name : "unknown",
    });
    return jsonResponse(
      { error: unauthorized ? "Sesión no válida" : "No se pudo iniciar el pago" },
      unauthorized ? 401 : 500,
      cors,
    );
  }
});
