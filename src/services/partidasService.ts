import { Partida } from "../components/PartidaCard";

/**
 * Servicio para gestionar las llamadas a la API de partidas
 * Este archivo está preparado para cuando se integre la API real
 */

// URL base de la API (configurar según el entorno)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api.fantasy-experience.com";

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
      // Construir query params
      const params = new URLSearchParams();

      if (filtros?.tipo) params.append("tipo", filtros.tipo);
      if (filtros?.sistemaJuego) params.append("sistema", filtros.sistemaJuego);
      if (filtros?.masterId)
        params.append("masterId", filtros.masterId.toString());
      if (filtros?.ratingMin)
        params.append("ratingMin", filtros.ratingMin.toString());
      if (filtros?.limit) params.append("limit", filtros.limit.toString());
      if (filtros?.page) params.append("page", filtros.page.toString());

      const url = `${API_BASE_URL}/partidas${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Agregar token de autenticación si es necesario
          // "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: RespuestaPartidas = await response.json();
      return data;
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
      const response = await fetch(`${API_BASE_URL}/partidas/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const partida: Partida = await response.json();
      return partida;
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
      const response = await fetch(
        `${API_BASE_URL}/partidas/destacadas?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const partidas: Partida[] = await response.json();
      return partidas;
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
      const response = await fetch(
        `${API_BASE_URL}/partidas/proximas?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const partidas: Partida[] = await response.json();
      return partidas;
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
    token: string
  ): Promise<Partida> {
    try {
      const response = await fetch(`${API_BASE_URL}/partidas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partida),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const nuevaPartida: Partida = await response.json();
      return nuevaPartida;
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
    token: string
  ): Promise<Partida> {
    try {
      const response = await fetch(`${API_BASE_URL}/partidas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const partidaActualizada: Partida = await response.json();
      return partidaActualizada;
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
    token: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/partidas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error al eliminar partida ${id}:`, error);
      throw error;
    }
  }
}

// Exportar una instancia por defecto si se prefiere
export default PartidasService;
