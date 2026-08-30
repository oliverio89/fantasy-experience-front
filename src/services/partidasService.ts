import { Partida } from "../components/PartidaCard";
import type { Database } from "../lib/database.types";
import { supabase } from "../lib/supabase";
import { FALLBACK_GAME_IMAGE_URL } from "../constants";
import PaymentService from "./paymentService";

type GameRow = Database["public"]["Tables"]["games"]["Row"];
type GameWritePayload = Partial<
  Database["public"]["Tables"]["games"]["Insert"]
>;

interface RelatedProfile {
  full_name: string | null;
  rating?: number | null;
}

interface RelatedParticipant {
  player_id?: string;
  count?: number;
  profiles?: RelatedProfile | RelatedProfile[] | null;
}

type GameWithRelations = Omit<GameRow, "master_contact" | "digital_asset_path"> & {
  master_contact?: string | null;
  profiles?: RelatedProfile | RelatedProfile[] | null;
  game_participants?: RelatedParticipant[] | null;
};

const PUBLIC_GAME_COLUMNS =
  "id,master_id,title,description,image_url,game_system,game_type,tags,language,min_age,start_date,max_players,price,currency,city,schedule,temporalidad,recommendations,tools_needed,use_x_card,camera_mandatory,microphone_mandatory,rating,status,current_players,pending_players,digital_file_name,digital_file_size_bytes,digital_mime_type,digital_version,created_at,updated_at" as const;
const GAME_LIST_SELECT =
  `${PUBLIC_GAME_COLUMNS},profiles:master_id(full_name,rating)` as const;
const GAME_DETAIL_SELECT =
  `${PUBLIC_GAME_COLUMNS},profiles:master_id(full_name,rating)` as const;
const GAME_IMAGE_EXTENSIONS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const DIGITAL_FILE_TYPES: Readonly<Record<string, string>> = {
  pdf: "application/pdf",
  zip: "application/zip",
  rar: "application/vnd.rar",
};

const hasExpectedDigitalSignature = async (
  file: File,
  extension: string
): Promise<boolean> => {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (extension === "pdf") {
    return [0x25, 0x50, 0x44, 0x46, 0x2d].every(
      (byte, index) => bytes[index] === byte
    );
  }
  if (extension === "zip") {
    return (
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
        (bytes[2] === 0x05 && bytes[3] === 0x06) ||
        (bytes[2] === 0x07 && bytes[3] === 0x08))
    );
  }
  if (extension === "rar") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x61 &&
      bytes[2] === 0x72 &&
      bytes[3] === 0x21 &&
      bytes[4] === 0x1a &&
      bytes[5] === 0x07 &&
      (bytes[6] === 0x00 || (bytes[6] === 0x01 && bytes[7] === 0x00))
    );
  }
  return false;
};

export interface DigitalAssetUpload {
  path: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

const getOwnedGameImagePath = (
  imageUrl: string | null | undefined,
  userId: string
): string | null => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = "/storage/v1/object/public/games-images/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const path = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    return path.startsWith(`${userId}/`) ? path : null;
  } catch {
    return null;
  }
};

const removeOwnedGameImage = async (
  imageUrl: string | null | undefined,
  userId: string
): Promise<void> => {
  const path = getOwnedGameImagePath(imageUrl, userId);
  if (!path) return;

  const { error } = await supabase.storage.from("games-images").remove([path]);
  if (error) {
    console.warn("No se pudo retirar una imagen antigua de partida:", error.message);
  }
};

export type PartidaInput = Omit<
  Partial<Partida>,
  "jugadores" | "precio" | "edadMinima" | "herramientas" | "temporalidad"
> & {
  titulo?: string;
  descripcion?: string;
  imagenUrl?: string;
  sistemaJuego?: string;
  tipoPartida?: Partida["tipoPartida"];
  fecha?: string;
  jugadores?: string | number;
  precio?: string | number;
  edadMinima?: string | number;
  herramientas?: string[] | string;
  temporalidad?: string;
  digitalAssetPath?: string | null;
  digitalFileName?: string | null;
  digitalFileSizeBytes?: number | null;
  digitalMimeType?: string | null;
  digitalVersion?: number;
};

/**
 * Servicio para gestionar las llamadas a la API de partidas usando Supabase
 */

export interface FiltrosPartida {
  tipo?: Partida["tipoPartida"][];
  sistemaJuego?: string;
  masterId?: string;
  limit?: number;
  page?: number;
  busqueda?: string;
  tags?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  status?: Partida["status"] | "all";
  ordenarPor?: "created_at" | "start_date";
  ordenAscendente?: boolean;
}

export interface RespuestaPartidas {
  partidas: Partida[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio de Partidas
 */
export class PartidasService {
  /**
   * Helper para mapear de DB (snake_case) a Frontend (camelCase)
   */
  static mapGameFromDB(row: GameWithRelations): Partida {
    const masterProfile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    const participantRows = Array.isArray(row.game_participants)
      ? row.game_participants
      : [];
    const countRow = participantRows.find(
      (participant) => typeof participant.count === "number"
    );

    return {
      id: row.id,
      titulo: row.title,
      masterId: row.master_id,
      masterName: masterProfile?.full_name || "Master Desconocido",
      sistemaJuego: row.game_system,
      fecha: row.start_date ?? undefined,
      descripcion: row.description ?? undefined,
      imagenUrl: row.image_url || FALLBACK_GAME_IMAGE_URL,
      tipoPartida: row.game_type,
      rating: masterProfile?.rating ?? row.rating ?? 0,
      tags: row.tags || [],

      // Campos extra
      idioma: row.language || undefined,
      edadMinima: row.min_age ?? undefined,
      jugadores: String(row.max_players || 0), // Max players
      jugadoresActuales:
        (row.current_players ?? countRow?.count ?? participantRows.length) +
        (row.pending_players ?? 0),
      participantes: participantRows
        .filter((participant) => participant.player_id)
        .map((participant) => {
          const participantProfile = Array.isArray(participant.profiles)
            ? participant.profiles[0]
            : participant.profiles;
          return {
            id: participant.player_id as string,
            nombre: participantProfile?.full_name || "Jugador",
          };
        }),

      temporalidad: row.temporalidad ?? undefined,
      recomendaciones: row.recommendations ?? undefined,
      ciudad: row.city ?? undefined,
      contactoMaster: row.master_contact ?? undefined,
      precio: String(row.price || 0),
      horario: row.schedule ?? undefined,
      herramientas: row.tools_needed ?? undefined,
      usoTarjetaX: row.use_x_card,
      obligatorioCamara: row.camera_mandatory,
      obligatorioMicrofono: row.microphone_mandatory,
      status: row.status,
      digitalFileName: row.digital_file_name ?? undefined,
      digitalFileSizeBytes: row.digital_file_size_bytes ?? undefined,
      digitalMimeType: row.digital_mime_type ?? undefined,
      digitalVersion: row.digital_version,
    };
  }

  /**
   * Helper para mapear de Frontend (camelCase) a DB (snake_case)
   */
  static mapGameToDB(
    partida: PartidaInput,
    userId?: string
  ): GameWritePayload {
    const tools = Array.isArray(partida.herramientas)
      ? partida.herramientas.map((tool) => tool.trim()).filter(Boolean)
      : partida.herramientas
      ? partida.herramientas
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean)
      : undefined;
    const normalizedTools = tools ? Array.from(new Set(tools)) : undefined;
    const normalizedTags = partida.tags
      ? Array.from(
          new Set(partida.tags.map((tag) => tag.trim()).filter(Boolean))
        )
      : undefined;

    const isDigital = partida.tipoPartida === "Digital";
    const data: GameWritePayload = {
      title: partida.titulo?.trim(),
      description: partida.descripcion?.trim(),
      image_url: partida.imagenUrl?.trim(),
      game_system: partida.sistemaJuego?.trim(),
      game_type: partida.tipoPartida,
      start_date: isDigital ? null : partida.fecha,
      max_players: isDigital ? 1 : Number(partida.jugadores || 0),
      price: Number(partida.precio || 0),
      city: isDigital ? null : partida.ciudad?.trim() || null,
      schedule: isDigital ? null : partida.horario?.trim() || null,
      tags: normalizedTags,
      language: partida.idioma?.trim(),
      min_age:
        partida.edadMinima === undefined || partida.edadMinima === ""
          ? undefined
          : Number(partida.edadMinima),
      temporalidad: isDigital
        ? null
        : (partida.temporalidad as GameRow["temporalidad"]) ?? undefined,
      recommendations: partida.recomendaciones?.trim() || null,
      master_contact: isDigital ? null : partida.contactoMaster?.trim(),
      tools_needed: isDigital ? null : normalizedTools,
      use_x_card: isDigital ? false : partida.usoTarjetaX,
      camera_mandatory: isDigital ? false : partida.obligatorioCamara,
      microphone_mandatory: isDigital ? false : partida.obligatorioMicrofono,
      digital_asset_path: isDigital ? partida.digitalAssetPath : null,
      digital_file_name: isDigital ? partida.digitalFileName : null,
      digital_file_size_bytes: isDigital ? partida.digitalFileSizeBytes : null,
      digital_mime_type: isDigital ? partida.digitalMimeType : null,
      digital_version: isDigital ? partida.digitalVersion : undefined,
    };

    if (userId) {
      data.master_id = userId;
    }

    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as GameWritePayload;
  }

  /**
   * Obtiene todas las partidas con filtros opcionales
   */
  static async obtenerPartidas(
    filtros?: FiltrosPartida
  ): Promise<RespuestaPartidas> {
    try {
      const rawSearchTerm = filtros?.busqueda?.normalize("NFKC");
      const searchTerm = rawSearchTerm
        ?.replace(/[^\p{L}\p{N}\s&+#:@/_-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      let matchingMasterIds: string[] = [];

      if (searchTerm) {
        const { data: matchingMasters, error: mastersError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("full_name", `%${searchTerm}%`)
          .limit(50);

        if (mastersError) {
          throw new Error(`Error buscando Másters: ${mastersError.message}`);
        }

        matchingMasterIds = (matchingMasters || []).map((profile) => profile.id);
      }

      // Select con JOIN a profiles para sacar el nombre del master y count de participantes
      let query = supabase
        .from("games")
        .select(GAME_LIST_SELECT, {
          count: "exact",
        });

      // Aplicar filtros
      if (searchTerm) {
        const searchFilters = [
          `title.ilike.%${searchTerm}%`,
          `game_system.ilike.%${searchTerm}%`,
          `game_type.ilike.%${searchTerm}%`,
        ];
        if (matchingMasterIds.length > 0) {
          searchFilters.push(`master_id.in.(${matchingMasterIds.join(",")})`);
        }
        query = query.or(searchFilters.join(","));
      }
      if (filtros?.tipo && filtros.tipo.length > 0) {
        query = query.in("game_type", filtros.tipo);
      }
      if (filtros?.tags && filtros.tags.length > 0) {
        query = query.overlaps("tags", filtros.tags);
      }
      if (filtros?.masterId) {
        query = query.eq("master_id", String(filtros.masterId));
      }
      if (filtros?.sistemaJuego) {
        query = query.eq("game_system", filtros.sistemaJuego);
      }
      const selectedTypes = filtros?.tipo;
      const includesDigital =
        !selectedTypes || selectedTypes.length === 0 || selectedTypes.includes("Digital");
      const includesLive =
        !selectedTypes ||
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => type !== "Digital");
      const liveDateFilters = [
        filtros?.fechaInicio ? `start_date.gte.${filtros.fechaInicio}` : null,
        filtros?.fechaFin ? `start_date.lte.${filtros.fechaFin}` : null,
      ].filter((value): value is string => Boolean(value));

      if (liveDateFilters.length > 0 && includesLive && includesDigital) {
        query = query.or(
          `game_type.eq.Digital,and(${liveDateFilters.join(",")})`
        );
      } else if (liveDateFilters.length > 0 && includesLive) {
        if (filtros?.fechaInicio) {
          query = query.gte("start_date", filtros.fechaInicio);
        }
        if (filtros?.fechaFin) {
          query = query.lte("start_date", filtros.fechaFin);
        }
      }
      if (filtros?.status !== "all") {
        query = query.eq("status", filtros?.status || "active");
      }

      // Paginación
      const limit = Math.min(
        Math.max(Math.trunc(filtros?.limit || 10), 1),
        100
      );
      const page = Math.max(Math.trunc(filtros?.page || 1), 1);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const onlyDigital =
        selectedTypes?.length === 1 && selectedTypes[0] === "Digital";
      const requestedOrder = filtros?.ordenarPor || "created_at";
      const orderColumn =
        onlyDigital && requestedOrder === "start_date"
          ? "created_at"
          : requestedOrder;
      query = query.range(from, to).order(orderColumn, {
        ascending: onlyDigital
          ? false
          : filtros?.ordenAscendente ?? requestedOrder === "start_date",
        nullsFirst: false,
      });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      const partidas = (data || []).map((row) => this.mapGameFromDB(row));
      const totalPages = count ? Math.ceil(count / limit) : 0;

      return {
        partidas,
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error("Error al obtener partidas:", error);
      throw error;
    }
  }

  /**
   * Obtiene una partida por su ID
   */
  static async obtenerPartidaPorId(id: string | number): Promise<Partida> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(GAME_DETAIL_SELECT)
        .eq("id", String(id))
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Partida no encontrada");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      let participants: RelatedParticipant[] = [];
      if (session?.user) {
        const { data: participantData, error: participantsError } =
          await supabase
            .from("game_participants")
            .select("player_id,profiles:player_id(full_name)")
            .eq("game_id", String(id));
        if (participantsError) throw new Error(participantsError.message);
        participants = participantData || [];
      }

      const partida = this.mapGameFromDB({
        ...data,
        game_participants: participants,
      });
      if (session?.user) {
        const { data: contact, error: contactError } = await supabase.rpc(
          "get_game_contact",
          {
          p_game_id: String(id),
          }
        );
        if (contactError) throw new Error(contactError.message);
        partida.contactoMaster = contact ?? undefined;
      }

      return partida;
    } catch (error) {
      console.error(`Error al obtener partida ${id}:`, error);
      throw error;
    }
  }

  static async crearPartida(partida: PartidaInput): Promise<Partida> {
    try {
      // Necesitamos el user actual
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw new Error(profileError.message);
      if (profile?.role !== "master" && profile?.role !== "admin") {
        throw new Error("Solo los perfiles de Máster pueden publicar partidas.");
      }

      const maxCreadas = profile.role === "admin" ? 50 : 5;

      const { count: creadasCount, error: countError } = await supabase
        .from("games")
        .select("id", { count: "exact", head: true })
        .eq("master_id", session.user.id)
        .in("status", ["active", "full"]);

      if (countError) throw new Error(countError.message);

      if ((creadasCount ?? 0) >= maxCreadas) {
        throw new Error(
          `Has alcanzado el límite de ${maxCreadas} partidas publicadas.`
        );
      }

      const dbData = this.mapGameToDB(partida, session.user.id);
      if (
        !dbData.master_id ||
        !dbData.title ||
        !dbData.game_system ||
        !dbData.game_type
      ) {
        throw new Error("Faltan datos obligatorios para publicar la partida");
      }

      const { data, error } = await supabase
        .from("games")
        .insert(
          dbData as Database["public"]["Tables"]["games"]["Insert"]
        )
        .select(PUBLIC_GAME_COLUMNS)
        .single();

      if (error) throw new Error(error.message);

      return this.mapGameFromDB(data);
    } catch (error) {
      console.error("Error al crear partida:", error);
      throw error;
    }
  }

  static async actualizarPartida(
    id: string | number,
    datosActualizados: PartidaInput
  ): Promise<Partida> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const { data: previousDigitalAsset, error: previousDigitalError } =
        await supabase.rpc("get_owned_digital_asset", {
          p_game_id: String(id),
        });
      if (previousDigitalError) throw new Error(previousDigitalError.message);

      const { data: previousGame, error: previousGameError } = await supabase
        .from("games")
        .select("image_url")
        .eq("id", String(id))
        .maybeSingle();
      if (previousGameError) throw new Error(previousGameError.message);
      if (!previousGame) throw new Error("Partida no encontrada");

      const dbData = this.mapGameToDB(datosActualizados);

      const { data, error } = await supabase
        .from("games")
        .update(dbData)
        .eq("id", String(id))
        .select(PUBLIC_GAME_COLUMNS)
        .single();

      if (error) throw new Error(error.message);

      if (data.image_url !== previousGame.image_url) {
        await removeOwnedGameImage(previousGame.image_url, session.user.id);
      }
      const previousDigitalPath = previousDigitalAsset?.path ?? null;
      const nextDigitalPath = Object.prototype.hasOwnProperty.call(
        dbData,
        "digital_asset_path"
      )
        ? dbData.digital_asset_path ?? null
        : previousDigitalPath;
      if (
        previousDigitalPath &&
        previousDigitalPath !== nextDigitalPath
      ) {
        await this.eliminarArchivoDigital(previousDigitalPath);
      }

      return this.mapGameFromDB(data);
    } catch (error) {
      console.error(`Error al actualizar partida ${id}:`, error);
      throw error;
    }
  }

  static async eliminarPartida(id: string | number): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const { data: digitalAsset, error: digitalAssetError } =
        await supabase.rpc("get_owned_digital_asset", {
          p_game_id: String(id),
        });
      if (digitalAssetError) throw new Error(digitalAssetError.message);

      const { data: game, error: gameError } = await supabase
        .from("games")
        .select("image_url")
        .eq("id", String(id))
        .maybeSingle();
      if (gameError) throw new Error(gameError.message);
      if (!game) throw new Error("Partida no encontrada");

      const { error } = await supabase
        .from("games")
        .delete()
        .eq("id", String(id));
      if (error) throw new Error(error.message);

      await removeOwnedGameImage(game.image_url, session.user.id);
      if (digitalAsset?.path) {
        await this.eliminarArchivoDigital(digitalAsset.path);
      }
    } catch (error) {
      console.error(`Error al eliminar partida ${id}:`, error);
      throw error;
    }
  }

  static async unirsePartida(gameId: string | number): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.rpc("join_game", {
        p_game_id: String(gameId),
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(`Error al unirse a partida ${gameId}:`, error);
      throw error;
    }
  }

  static async salirPartida(gameId: string | number): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.rpc("leave_game", {
        p_game_id: String(gameId),
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(`Error al salir de partida ${gameId}:`, error);
      throw error;
    }
  }

  static async cambiarEstado(
    gameId: string | number,
    status: "active" | "cancelled" | "completed"
  ): Promise<void> {
    if (status === "cancelled") {
      await PaymentService.cancelarPartida(String(gameId));
      return;
    }
    const { error } = await supabase.rpc("set_game_status", {
      p_game_id: String(gameId),
      p_status: status,
    });

    if (error) throw new Error(error.message);
  }

  static async obtenerPartidasDestacadas(limit: number = 6): Promise<Partida[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(GAME_LIST_SELECT)
        .eq("game_type", "Digital")
        .eq("status", "active")
        .not("digital_file_name", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      return (data || []).map((row) => this.mapGameFromDB(row));
    } catch (error) {
      console.error("Error al obtener partidas destacadas:", error);
      return [];
    }
  }

  static async obtenerProximasPartidas(limit: number = 6): Promise<Partida[]> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(GAME_LIST_SELECT)
        .in("game_type", ["Online", "Presencial", "Híbrida"])
        .eq("status", "active")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) throw new Error(error.message);

      return (data || []).map((row) => this.mapGameFromDB(row));
    } catch (error) {
      console.error("Error al obtener próximas partidas:", error);
      return [];
    }
  }

  static async verificarInscripcion(gameId: string | number): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { data, error } = await supabase
        .from("game_participants")
        .select("id")
        .eq("game_id", String(gameId))
        .eq("player_id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error(`Error verificando inscripción ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene las partidas donde el usuario es participante
   */
  static async obtenerPartidasComoJugador(
    playerId: string,
    options: { history?: boolean } = {}
  ): Promise<Partida[]> {
    try {
      // Usamos !inner para filtrar juegos donde haya una entrada en game_participants con ese player_id
      let query = supabase
        .from("games")
        .select(
          `${PUBLIC_GAME_COLUMNS},profiles:master_id(full_name,rating),game_participants!inner(player_id)`
        )
        .eq("game_participants.player_id", playerId);

      query = options.history
        ? query
            .in("status", ["cancelled", "completed"])
            .order("start_date", { ascending: false })
        : query
            .in("status", ["active", "full"])
            .gte("start_date", new Date().toISOString())
            .order("start_date", { ascending: true });

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      return (data || []).map((row) => this.mapGameFromDB(row));
    } catch (error) {
      console.error("Error al obtener partidas como jugador:", error);
      throw error;
    }
  }
  /**
   * Sube una imagen al bucket 'games-images'
   */
  static async subirImagen(archivo: File): Promise<string> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      // Validar tipo y tamaño
      const fileExt = GAME_IMAGE_EXTENSIONS[archivo.type];
      if (!fileExt) throw new Error("La imagen debe ser JPG, PNG o WebP");
      if (archivo.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 5MB");
      }

      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("games-images")
        .upload(filePath, archivo);

      if (uploadError) throw new Error(uploadError.message);

      // Obtener URL pública
      const { data } = supabase.storage
        .from("games-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    }
  }

  static async eliminarImagenSubida(imageUrl: string): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    await removeOwnedGameImage(imageUrl, session.user.id);
  }

  static async subirArchivoDigital(
    archivo: File
  ): Promise<DigitalAssetUpload> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuario no autenticado");

    const extension = archivo.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = DIGITAL_FILE_TYPES[extension];
    if (!mimeType) {
      throw new Error("La aventura debe ser un archivo PDF, ZIP o RAR");
    }
    if (archivo.size <= 0 || archivo.size > 100 * 1024 * 1024) {
      throw new Error("El archivo debe tener contenido y no superar los 100 MB");
    }
    const compatibleMimes = new Set([
      "",
      mimeType,
      "application/octet-stream",
      extension === "zip" ? "application/x-zip-compressed" : "",
      extension === "rar" ? "application/x-rar-compressed" : "",
    ]);
    if (!compatibleMimes.has(archivo.type)) {
      throw new Error("El contenido del archivo no coincide con su extensión");
    }
    if (!(await hasExpectedDigitalSignature(archivo, extension))) {
      throw new Error("La firma interna del archivo no coincide con PDF, ZIP o RAR");
    }

    const safeOriginalName = archivo.name
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}._ -]/gu, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    const path = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("digital-products")
      .upload(path, archivo, { contentType: mimeType, upsert: false });
    if (error) throw new Error(error.message);

    return {
      path,
      fileName: safeOriginalName || `aventura.${extension}`,
      fileSizeBytes: archivo.size,
      mimeType,
    };
  }

  static async eliminarArchivoDigital(path: string): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user || !path.startsWith(`${session.user.id}/`)) return;

    const { error } = await supabase.storage
      .from("digital-products")
      .remove([path]);
    if (error) {
      console.warn("No se pudo retirar el archivo digital:", error.message);
    }
  }

  static async tieneAccesoDigital(gameId: string | number): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data, error } = await supabase.rpc("has_digital_entitlement", {
      p_game_id: String(gameId),
    });
    if (error) throw new Error(error.message);
    return Boolean(data);
  }
}

export default PartidasService;
