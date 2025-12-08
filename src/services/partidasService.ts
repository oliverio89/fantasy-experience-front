import { Partida } from "../components/PartidaCard";
import { supabase } from "../lib/supabase";

/**
 * Servicio para gestionar las llamadas a la API de partidas usando Supabase
 */

/**
 * Interface para los filtros de búsqueda de partidas
 */
export interface FiltrosPartida {
  tipo?: "digital" | "presencial" | "online";
  sistemaJuego?: string;
  masterId?: string | number;
  ratingMin?: number;
  limit?: number;
  page?: number;
}

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
      if (filtros?.tipo) {
        query = query.eq("tipo_partida", filtros.tipo);
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
        throw new Error(`Error de Supabase: ${error.message} (Código: ${error.code})`);
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
  static async obtenerPartidaPorId(id: string | number): Promise<Partida> {
    try {
      const { data, error } = await supabase
        .from("partidas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Partida con ID ${id} no encontrada`);
      }

      // Transformar datos de Supabase al formato Partida
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
      console.error(`Error al obtener partida ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene partidas destacadas (ordenadas por rating y fecha)
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

      // Transformar datos de Supabase al formato Partida
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
      }));
    } catch (error) {
      console.error("Error al obtener partidas destacadas:", error);
      throw error;
    }
  }

  /**
   * Obtiene próximas partidas (futuras, ordenadas por fecha)
   */
  static async obtenerProximasPartidas(limit: number = 4): Promise<Partida[]> {
    try {
      const hoy = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("partidas")
        .select("*")
        .gte("fecha", hoy) // Solo partidas con fecha >= hoy
        .order("fecha", { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      // Transformar datos de Supabase al formato Partida
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
      }));
    } catch (error) {
      console.error("Error al obtener próximas partidas:", error);
      throw error;
    }
  }

  /**
   * Crear una nueva partida (solo para Masters autenticados)
   */
  static async crearPartida(
    partida: Omit<Partida, "id">,
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
      };

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

      // Transformar respuesta al formato Partida
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
    datosActualizados: Partial<Partida>,
    token?: string
  ): Promise<Partida> {
    try {
      // Transformar datos al formato de Supabase
      const updateData: any = {};
      if (datosActualizados.titulo) updateData.titulo = datosActualizados.titulo;
      if (datosActualizados.masterName)
        updateData.master_name = datosActualizados.masterName;
      if (datosActualizados.sistemaJuego)
        updateData.sistema_juego = datosActualizados.sistemaJuego;
      if (datosActualizados.fecha) updateData.fecha = datosActualizados.fecha;
      if (datosActualizados.descripcion)
        updateData.descripcion = datosActualizados.descripcion;
      if (datosActualizados.imagenUrl)
        updateData.imagen_url = datosActualizados.imagenUrl;
      if (datosActualizados.tipoPartida)
        updateData.tipo_partida = datosActualizados.tipoPartida;
      if (datosActualizados.rating !== undefined)
        updateData.rating = datosActualizados.rating;

      const { data, error } = await supabase
        .from("partidas")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Partida con ID ${id} no encontrada`);
      }

      // Transformar respuesta al formato Partida
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
      const { error } = await supabase
        .from("partidas")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error al eliminar partida ${id}:`, error);
      throw error;
    }
  }
}

// Exportar una instancia por defecto si se prefiere
export default PartidasService;
