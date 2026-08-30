import {
  adminClient,
  authenticate,
  corsHeaders,
  handlePreflight,
  isUuid,
  jsonResponse,
  readSmallJson,
} from "../_shared/http.ts";

const safeFileName = (value: string): string => {
  const cleaned = value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._ -]/gu, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return cleaned || "aventura-digital";
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
      return jsonResponse({ error: "Aventura digital no válida" }, 400, cors);
    }

    const admin = adminClient();
    const { data: game, error: gameError } = await admin
      .from("games")
      .select(
        "id,master_id,game_type,status,digital_asset_path,digital_file_name",
      )
      .eq("id", payload.gameId)
      .maybeSingle();
    if (gameError) throw gameError;
    if (
      !game ||
      game.game_type !== "Digital" ||
      !game.digital_asset_path ||
      !game.digital_file_name
    ) {
      return jsonResponse({ error: "Descarga no disponible" }, 404, cors);
    }

    let allowed = game.master_id === user.id;
    if (!allowed) {
      const { data: entitlement, error: entitlementError } = await admin
        .from("digital_entitlements")
        .select("id")
        .eq("game_id", game.id)
        .eq("buyer_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (entitlementError) throw entitlementError;
      allowed = Boolean(entitlement);
    }
    if (!allowed) {
      return jsonResponse(
        { error: "Necesitas comprar esta aventura para descargarla" },
        403,
        cors,
      );
    }

    const downloadName = safeFileName(game.digital_file_name);
    const { data: signed, error: signedError } = await admin.storage
      .from("digital-products")
      .createSignedUrl(game.digital_asset_path, 300, { download: downloadName });
    if (signedError || !signed?.signedUrl) throw signedError;

    if (game.master_id !== user.id) {
      await admin.rpc("record_digital_download", {
        p_game_id: game.id,
        p_buyer_id: user.id,
      });
    }

    return jsonResponse(
      { url: signed.signedUrl, fileName: downloadName, expiresIn: 300 },
      200,
      cors,
    );
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return jsonResponse(
      { error: unauthorized ? "Sesión no válida" : "No se pudo preparar la descarga" },
      unauthorized ? 401 : 500,
      cors,
    );
  }
});
