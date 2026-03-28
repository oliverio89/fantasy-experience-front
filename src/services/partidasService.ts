import { Partida } from "../components/PartidaCard";
import { supabase } from "../lib/supabase";

/**
 * Servicio para gestionar las llamadas a la API de partidas usando Supabase
 */

export interface FiltrosPartida {
  tipo?: string[];
  sistemaJuego?: string;
  masterId?: string | number;
  ratingMin?: number;
  limit?: number;
  page?: number;
  busqueda?: string;
  tags?: string[];
  fechaInicio?: string;
  fechaFin?: string;
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
  private static mapGameFromDB(row: any): Partida & any {
    return {
      id: row.id,
      titulo: row.title,
      masterId: row.master_id,
      // Intenta obtener el nombre del perfil si viene le join, sino master_id o default
      masterName: Array.isArray(row.profiles)
        ? row.profiles[0]?.full_name
        : row.profiles?.full_name || "Master Desconocido",
      sistemaJuego: row.game_system,
      fecha: row.start_date,
      descripcion: row.description,
      imagenUrl: row.image_url,
      tipoPartida: row.game_type,
      rating: row.rating || 0,
      tags: row.tags || [],

      // Campos extra
      idioma: row.language,
      edadMinima: row.min_age,
      jugadores: String(row.max_players || 0), // Max players
      jugadoresActuales: row.game_participants
        ? Array.isArray(row.game_participants) &&
          row.game_participants[0]?.count
          ? row.game_participants[0].count
          : row.game_participants.length
        : 0,
      participantes:
        Array.isArray(row.game_participants) && !row.game_participants[0]?.count
          ? row.game_participants.map((p: any) => ({
              id: p.player_id,
              nombre: p.profiles?.full_name || "Jugador",
            }))
          : [],

      temporalidad: row.temporalidad,
      recomendaciones: row.recommendations,
      ciudad: row.city,
      contactoMaster: row.master_contact,
      precio: String(row.price || 0),
      horario: row.schedule,
      herramientas: row.tools_needed,
      usoTarjetaX: row.use_x_card,
      obligatorioCamara: row.camera_mandatory,
      obligatorioMicrofono: row.microphone_mandatory,
    };
  }

  /**
   * Helper para mapear de Frontend (camelCase) a DB (snake_case)
   */
  private static mapGameToDB(partida: any, userId?: string) {
    const data: any = {
      title: partida.titulo,
      description: partida.descripcion,
      image_url: partida.imagenUrl,
      game_system: partida.sistemaJuego,
      game_type: partida.tipoPartida,
      start_date: partida.fecha,
      max_players: Number(partida.jugadores || 0),
      price: Number(partida.precio || 0),
      city: partida.ciudad,
      schedule: partida.horario,
      tags: partida.tags,
      language: partida.idioma,
      min_age: partida.edadMinima,
      temporalidad: partida.temporalidad,
      recommendations: partida.recomendaciones,
      master_contact: partida.contactoMaster,
      tools_needed: partida.herramientas,
      use_x_card: partida.usoTarjetaX,
      camera_mandatory: partida.obligatorioCamara,
      microphone_mandatory: partida.obligatorioMicrofono,
      rating: partida.rating || 0,
    };

    if (userId) {
      data.master_id = userId;
    }

    // Clean undefined
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key]
    );

    return data;
  }

  /**
   * Obtiene todas las partidas con filtros opcionales
   */
  static async obtenerPartidas(
    filtros?: FiltrosPartida
  ): Promise<RespuestaPartidas> {
    try {
      // Select con JOIN a profiles para sacar el nombre del master y count de participantes
      let query = supabase
        .from("games")
        .select("*, profiles:master_id(full_name), game_participants(count)", {
          count: "exact",
        });

      // Aplicar filtros
      if (filtros?.busqueda) {
        query = query.ilike("title", `%${filtros.busqueda}%`);
      }
      if (filtros?.tipo && filtros.tipo.length > 0) {
        query = query.in("game_type", filtros.tipo);
      }
      if (filtros?.tags && filtros.tags.length > 0) {
        query = query.overlaps("tags", filtros.tags);
      }
      if (filtros?.masterId) {
        query = query.eq("master_id", filtros.masterId);
      }
      if (filtros?.sistemaJuego) {
        query = query.eq("game_system", filtros.sistemaJuego);
      }
      if (filtros?.fechaInicio) {
        query = query.gte("start_date", filtros.fechaInicio);
      }
      if (filtros?.fechaFin) {
        query = query.lte("start_date", filtros.fechaFin);
      }

      // Paginación
      const limit = filtros?.limit || 10;
      const page = filtros?.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order("created_at", { ascending: false });

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
  static async obtenerPartidaPorId(id: string | number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          *, 
          profiles:master_id(full_name),
          game_participants(
            player_id,
            profiles:player_id(full_name)
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Partida no encontrada");

      return this.mapGameFromDB(data);
    } catch (error) {
      console.error(`Error al obtener partida ${id}:`, error);
      throw error;
    }
  }

  static async crearPartida(partida: any): Promise<Partida> {
    try {
      // Necesitamos el user actual
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuario no autenticado");

      const dbData = this.mapGameToDB(partida, session.user.id);

      const { data, error } = await supabase
        .from("games")
        .insert(dbData)
        .select()
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
    datosActualizados: Partial<any>
  ): Promise<Partida> {
    try {
      const dbData = this.mapGameToDB(datosActualizados);

      const { data, error } = await supabase
        .from("games")
        .update(dbData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return this.mapGameFromDB(data);
    } catch (error) {
      console.error(`Error al actualizar partida ${id}:`, error);
      throw error;
    }
  }

  static async eliminarPartida(id: string | number): Promise<void> {
    try {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw new Error(error.message);
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

      const { error } = await supabase.from("game_participants").insert({
        game_id: gameId,
        player_id: session.user.id,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya estás apuntado a esta partida");
        }
        throw new Error(error.message);
      }
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

      const { error } = await supabase
        .from("game_participants")
        .delete()
        .eq("game_id", gameId)
        .eq("player_id", session.user.id);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(`Error al salir de partida ${gameId}:`, error);
      throw error;
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
        .eq("game_id", gameId)
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
    playerId: string
  ): Promise<Partida[]> {
    try {
      // Usamos !inner para filtrar juegos donde haya una entrada en game_participants con ese player_id
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          *,
          profiles:master_id(full_name),
          game_participants!inner(player_id)
        `
        )
        .eq("game_participants.player_id", playerId)
        .order("start_date", { ascending: true });

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
      if (!archivo.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen");
      }
      if (archivo.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 5MB");
      }

      // Nombre único: timestamp-nombre
      const fileExt = archivo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("games-images") // IMPORTANTE: Este bucket debe existir en Supabase
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
}

export default PartidasService;
