import {
  adminClient,
  authenticate,
  corsHeaders,
  handlePreflight,
  jsonResponse,
  readSmallJson,
} from "../_shared/http.ts";

const isSessionId = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 255 &&
  /^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(value);

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
    if (!isSessionId(payload.sessionId)) {
      return jsonResponse({ error: "Referencia de pago no válida" }, 400, cors);
    }

    const admin = adminClient();
    const { data, error } = await admin
      .from("payment_orders")
      .select("id,game_id,status,fulfillment_type,expires_at,paid_at,refunded_at")
      .eq("stripe_checkout_session_id", payload.sessionId)
      .eq("player_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonResponse({ error: "Pago no encontrado" }, 404, cors);

    let status = data.status;
    if (
      status === "pending" &&
      data.expires_at &&
      new Date(data.expires_at).getTime() <= Date.now()
    ) {
      const { error: expirationError } = await admin
        .from("payment_orders")
        .update({ status: "expired", checkout_url: null })
        .eq("id", data.id)
        .eq("status", "pending");
      if (expirationError) throw expirationError;
      status = "expired";
    }

    let downloadReady = false;
    if (
      data.fulfillment_type === "digital_download" &&
      data.game_id &&
      status === "paid"
    ) {
      const { data: entitlement, error: entitlementError } = await admin
        .from("digital_entitlements")
        .select("id")
        .eq("game_id", data.game_id)
        .eq("buyer_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (entitlementError) throw entitlementError;
      downloadReady = Boolean(entitlement);
    }

    return jsonResponse(
      {
        gameId: data.game_id,
        status,
        paidAt: data.paid_at,
        refundedAt: data.refunded_at,
        fulfillmentType: data.fulfillment_type,
        downloadReady,
      },
      200,
      cors,
    );
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return jsonResponse(
      { error: unauthorized ? "Sesión no válida" : "No se pudo consultar el pago" },
      unauthorized ? 401 : 500,
      cors,
    );
  }
});
