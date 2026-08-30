import { createClient, type User } from "npm:@supabase/supabase-js@2.86.0";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export const requiredEnv = (name: string): string => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing server secret: ${name}`);
  return value;
};

const configuredOrigins = (): Set<string> => {
  const origins = [
    ...(Deno.env.get("ALLOWED_ORIGINS") ?? "").split(","),
    Deno.env.get("SITE_URL") ?? "",
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  return new Set(origins);
};

export const corsHeaders = (request: Request): HeadersInit | null => {
  const origin = request.headers.get("origin");
  if (!origin) return { Vary: "Origin" };
  if (!configuredOrigins().has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
};

export const jsonResponse = (
  body: unknown,
  status: number,
  cors: HeadersInit = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...cors },
  });

export const handlePreflight = (
  request: Request,
  cors: HeadersInit | null,
): Response | null => {
  if (request.method !== "OPTIONS") return null;
  if (!cors) return jsonResponse({ error: "Origen no permitido" }, 403);
  return new Response(null, { status: 204, headers: cors });
};

export const readSmallJson = async (
  request: Request,
  maxBytes = 2_048,
): Promise<Record<string, unknown>> => {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  const value: unknown = JSON.parse(body);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_JSON");
  }
  return value as Record<string, unknown>;
};

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const authenticate = async (request: Request): Promise<User> => {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization) || authorization.length > 8_192) {
    throw new Error("UNAUTHORIZED");
  }
  const client = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return data.user;
};

export const adminClient = () =>
  createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

export const publicDatabaseMessage = (message?: string): string => {
  const knownMessages = [
    "Partida no encontrada",
    "Perfil de jugador no encontrado",
    "No puedes reservar tu propia partida",
    "La partida no admite nuevas reservas",
    "La partida ya ha comenzado",
    "Esta partida no requiere pago",
    "El precio mínimo para cobrar con tarjeta es 0,50 €",
    "Ya tienes una plaza confirmada en esta partida",
    "Demasiados intentos de pago. Inténtalo más tarde",
    "Has alcanzado el límite de 5 reservas activas",
    "La partida está completa",
    "Aventura digital no encontrada",
    "No puedes comprar tu propia aventura",
    "La aventura digital no está disponible",
    "La descarga todavía no está disponible",
    "Ya has comprado esta aventura",
    "No tienes permiso para cancelar esta partida",
    "Una partida completada no puede cancelarse",
  ];
  return knownMessages.find((known) => message?.includes(known)) ??
    "No se ha podido completar la operación";
};
