import { Partida } from "../components/PartidaCard";
import { supabase } from "../lib/supabase";

/**
 * Servicio para gestionar las llamadas a la API de partidas usando Supabase
 */

/**
 * Interface para los filtros de búsqueda de partidas
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
}

// ... existing code ...

/**
 * Interface para la respuesta paginada de la API
 */
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
   * Obtiene todas las partidas con filtros opcionales
   */
  static async obtenerPartidas(
    filtros?: FiltrosPartida
  ): Promise<RespuestaPartidas> {
    try {
      // Construir query de Supabase
      let query = supabase.from("partidas").select("*", { count: "exact" });

      // Aplicar filtros
      if (filtros?.busqueda) {
        query = query.or(
          `titulo.ilike.%${filtros.busqueda}%,master_name.ilike.%${filtros.busqueda}%`
        );
      }
      if (filtros?.tipo && filtros.tipo.length > 0) {
        query = query.in("tipo_partida", filtros.tipo);
      }
      if (filtros?.tags && filtros.tags.length > 0) {
        query = query.overlaps("tags", filtros.tags);
      }
      if (filtros?.sistemaJuego) {
        query = query.eq("sistema_juego", filtros.sistemaJuego);
      }
      if (filtros?.masterId) {
        query = query.eq("master_id", filtros.masterId);
      }
      if (filtros?.ratingMin) {
        query = query.gte("rating", filtros.ratingMin);
      }

      // Paginación
      const limit = filtros?.limit || 10;
      const page = filtros?.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(
          `Error de Supabase: ${error.message} (Código: ${error.code})`
        );
      }

      // Transformar datos de Supabase al formato Partida
      const partidas: Partida[] = (data || []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        masterName: row.master_name || row.masterName,
        sistemaJuego: row.sistema_juego || row.sistemaJuego,
        fecha: row.fecha,
        descripcion: row.descripcion,
        imagenUrl: row.imagen_url || row.imagenUrl,
        tipoPartida: row.tipo_partida || row.tipoPartida,
        rating: row.rating || 0,
        tags: PartidasService.parseTags(row.tags),
      }));

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
        .from("partidas")
        .select("*")
        .eq("id", id)
        .maybeSingle(); // Usamos maybeSingle para evitar error si no existe

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Partida con ID ${id} no encontrada`);
      }

      // Transformar datos de Supabase al formato Partida, incluyendo extras
      return {
        id: data.id,
        titulo: data.titulo,
        masterName: data.master_name || data.masterName,
        sistemaJuego: data.sistema_juego || data.sistemaJuego,
        fecha: data.fecha,
        descripcion: data.descripcion,
        imagenUrl: data.imagen_url || data.imagenUrl,
        tipoPartida: data.tipo_partida || data.tipoPartida,
        rating: data.rating || 0,

        // Campos extra (si existen en la DB retornarán valor, sino undefined)
        idioma: data.idioma,
        edadMinima: data.edad_minima || data.edadMinima, // Soporte retrocompatibilidad por si acaso
        jugadores: data.jugadores,
        temporalidad: data.temporalidad,
        tags: PartidasService.parseTags(data.tags),
        recomendaciones: data.recomendaciones,
        ciudad: data.ciudad,
        contactoMaster: data.contacto_master || data.contactoMaster,
        precio: data.precio,
        horario: data.horario,
        herramientas: data.herramientas,
        usoTarjetaX: data.uso_tarjeta_x || data.usoTarjetaX,
        obligatorioCamara: data.obligatorio_camara || data.obligatorioCamara,
        obligatorioMicrofono:
          data.obligatorio_microfono || data.obligatorioMicrofono,
      };
    } catch (error) {
      console.error(`Error al obtener partida ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene partidas destacadas
   */
  static async obtenerPartidasDestacadas(
    limit: number = 6
  ): Promise<Partida[]> {
    try {
      const { data, error } = await supabase
        .from("partidas")
        .select("*")
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        masterName: row.master_name || row.masterName,
        sistemaJuego: row.sistema_juego || row.sistemaJuego,
        fecha: row.fecha,
        descripcion: row.descripcion,
        imagenUrl: row.imagen_url || row.imagenUrl,
        tipoPartida: row.tipo_partida || row.tipoPartida,
        rating: row.rating || 0,
        tags: PartidasService.parseTags(row.tags),
      }));
    } catch (error) {
      console.error("Error al obtener partidas destacadas:", error);
      throw error;
    }
  }

  /**
   * Obtiene próximas partidas
   */
  static async obtenerProximasPartidas(limit: number = 4): Promise<Partida[]> {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("partidas")
        .select("*")
        .gte("fecha", hoy)
        .order("fecha", { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        masterName: row.master_name || row.masterName,
        sistemaJuego: row.sistema_juego || row.sistemaJuego,
        fecha: row.fecha,
        descripcion: row.descripcion,
        imagenUrl: row.imagen_url || row.imagenUrl,
        tipoPartida: row.tipo_partida || row.tipoPartida,
        rating: row.rating || 0,
        tags: PartidasService.parseTags(row.tags),
      }));
    } catch (error) {
      console.error("Error al obtener próximas partidas:", error);
      throw error;
    }
  }

  /**
   * Helper para parsear tags de forma segura
   */
  private static parseTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        // Intentar parsear como JSON si parece un array
        if (tags.trim().startsWith("[")) {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) return parsed;
        }
        // Si no, asumir separado por comas
        return tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      } catch (e) {
        console.warn("Error parsing tags:", tags, e);
        return [];
      }
    }
    return [];
  }

  /**
   * Crear una nueva partida
   */
  static async crearPartida(
    partida: any, // Usamos any para permitir los campos extra
    token?: string
  ): Promise<Partida> {
    try {
      // Transformar datos al formato de Supabase
      const partidaData = {
        titulo: partida.titulo,
        master_name: partida.masterName,
        sistema_juego: partida.sistemaJuego,
        fecha: partida.fecha,
        descripcion: partida.descripcion,
        imagen_url: partida.imagenUrl,
        tipo_partida: partida.tipoPartida,
        rating: partida.rating || 0,
        idioma: partida.idioma,
        edad_minima: partida.edadMinima,
        jugadores: partida.jugadores,
        temporalidad: partida.temporalidad,
        tags: partida.tags,
        recomendaciones: partida.recomendaciones,
        ciudad: partida.ciudad,
        contacto_master: partida.contactoMaster,
        precio: partida.precio,
        horario: partida.horario,
        herramientas: partida.herramientas,
        uso_tarjeta_x: partida.usoTarjetaX,
        obligatorio_camara: partida.obligatorioCamara,
        obligatorio_microfono: partida.obligatorioMicrofono,
      };

      // Limpiamos undefined para que Supabase use defaults o NULL
      Object.keys(partidaData).forEach(
        (key) =>
          (partidaData as any)[key] === undefined &&
          delete (partidaData as any)[key]
      );

      const { data, error } = await supabase
        .from("partidas")
        .insert(partidaData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      if (!data) {
        throw new Error("No se pudo crear la partida");
      }

      return {
        id: data.id,
        titulo: data.titulo,
        masterName: data.master_name || data.masterName,
        sistemaJuego: data.sistema_juego || data.sistemaJuego,
        fecha: data.fecha,
        descripcion: data.descripcion,
        imagenUrl: data.imagen_url || data.imagenUrl,
        tipoPartida: data.tipo_partida || data.tipoPartida,
        rating: data.rating || 0,
      };
    } catch (error) {
      console.error("Error al crear partida:", error);
      throw error;
    }
  }

  /**
   * Actualizar una partida existente
   */
  static async actualizarPartida(
    id: string | number,
    datosActualizados: Partial<any>, // Usamos any para campos extra
    token?: string
  ): Promise<Partida> {
    try {
      const updateData: any = {};

      // Mapeo manual de campos conocidos
      if (datosActualizados.titulo !== undefined)
        updateData.titulo = datosActualizados.titulo;
      if (datosActualizados.masterName !== undefined)
        updateData.master_name = datosActualizados.masterName;
      if (datosActualizados.sistemaJuego !== undefined)
        updateData.sistema_juego = datosActualizados.sistemaJuego;
      if (datosActualizados.fecha !== undefined)
        updateData.fecha = datosActualizados.fecha;
      if (datosActualizados.descripcion !== undefined)
        updateData.descripcion = datosActualizados.descripcion;
      if (datosActualizados.imagenUrl !== undefined)
        updateData.imagen_url = datosActualizados.imagenUrl;
      if (datosActualizados.tipoPartida !== undefined)
        updateData.tipo_partida = datosActualizados.tipoPartida;
      if (datosActualizados.rating !== undefined)
        updateData.rating = datosActualizados.rating;

      // Campos extra
      if (datosActualizados.idioma !== undefined)
        updateData.idioma = datosActualizados.idioma;
      if (datosActualizados.edadMinima !== undefined)
        updateData.edad_minima = datosActualizados.edadMinima;
      if (datosActualizados.jugadores !== undefined)
        updateData.jugadores = datosActualizados.jugadores;
      if (datosActualizados.temporalidad !== undefined)
        updateData.temporalidad = datosActualizados.temporalidad;
      if (datosActualizados.tags !== undefined)
        updateData.tags = datosActualizados.tags;
      if (datosActualizados.recomendaciones !== undefined)
        updateData.recomendaciones = datosActualizados.recomendaciones;
      if (datosActualizados.ciudad !== undefined)
        updateData.ciudad = datosActualizados.ciudad;
      if (datosActualizados.contactoMaster !== undefined)
        updateData.contacto_master = datosActualizados.contactoMaster;
      if (datosActualizados.precio !== undefined)
        updateData.precio = datosActualizados.precio;
      if (datosActualizados.horario !== undefined)
        updateData.horario = datosActualizados.horario;
      if (datosActualizados.herramientas !== undefined)
        updateData.herramientas = datosActualizados.herramientas;
      if (datosActualizados.usoTarjetaX !== undefined)
        updateData.uso_tarjeta_x = datosActualizados.usoTarjetaX;
      if (datosActualizados.obligatorioCamara !== undefined)
        updateData.obligatorio_camara = datosActualizados.obligatorioCamara;
      if (datosActualizados.obligatorioMicrofono !== undefined)
        updateData.obligatorio_microfono =
          datosActualizados.obligatorioMicrofono;

      // Usamos .select() en lugar de .single() para evitar error si no devuelve nada (por RLS o ID incorrecto)
      const { data, error } = await supabase
        .from("partidas")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error(
          `No se pudo actualizar la partida. Verifique permisos o existencia.`
        );
      }

      const row = data[0];

      return {
        id: row.id,
        titulo: row.titulo,
        masterName: row.master_name || row.masterName,
        sistemaJuego: row.sistema_juego || row.sistemaJuego,
        fecha: row.fecha,
        descripcion: row.descripcion,
        imagenUrl: row.imagen_url || row.imagenUrl,
        tipoPartida: row.tipo_partida || row.tipoPartida,
        rating: row.rating || 0,
      };
    } catch (error) {
      console.error(`Error al actualizar partida ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una partida
   */
  static async eliminarPartida(
    id: string | number,
    token?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("partidas").delete().eq("id", id);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error al eliminar partida ${id}:`, error);
      throw error;
    }
  }
}

export default PartidasService;
