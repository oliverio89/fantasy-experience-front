import { useState, useEffect, useCallback } from "react";
import { Partida } from "../components/PartidaCard";
import PartidasService, {
  FiltrosPartida,
  RespuestaPartidas,
} from "../services/partidasService";

/**
 * Estados posibles de la carga de datos
 */
type EstadoCarga = "idle" | "loading" | "success" | "error";

/**
 * Hook personalizado para gestionar partidas
 *
 * Ejemplo de uso:
 * ```typescript
 * const MiComponente = () => {
 *   const { partidas, loading, error, recargar } = usePartidas({ tipo: "digital" });
 *
 *   if (loading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       {partidas.map(partida => (
 *         <PartidaCard key={partida.id} partida={partida} />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const usePartidas = (filtros?: FiltrosPartida) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [paginacion, setPaginacion] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cargarPartidas = async () => {
      try {
        setLoading(true);
        setEstado("loading");
        setError(null);

        const respuesta: RespuestaPartidas =
          await PartidasService.obtenerPartidas(filtros);

        // Solo actualizar estado si el componente sigue montado
        if (isMounted) {
          setPartidas(respuesta.partidas);
          setPaginacion({
            total: respuesta.total,
            page: respuesta.page,
            limit: respuesta.limit,
            totalPages: respuesta.totalPages,
          });
          setEstado("success");
        }
      } catch (err) {
        if (isMounted) {
          const mensaje =
            err instanceof Error
              ? err.message
              : "Error desconocido al cargar partidas";
          setError(mensaje);
          setEstado("error");
          console.error("Error en usePartidas:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    cargarPartidas();

    // Cleanup para evitar actualizaciones si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [
    filtros?.tipo,
    filtros?.sistemaJuego,
    filtros?.masterId,
    filtros?.ratingMin,
    filtros?.limit,
    filtros?.page,
    filtros?.busqueda,
  ]);

  const recargar = useCallback(async () => {
    try {
      setLoading(true);
      setEstado("loading");
      setError(null);

      const respuesta: RespuestaPartidas =
        await PartidasService.obtenerPartidas(filtros);

      setPartidas(respuesta.partidas);
      setPaginacion({
        total: respuesta.total,
        page: respuesta.page,
        limit: respuesta.limit,
        totalPages: respuesta.totalPages,
      });
      setEstado("success");
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar partidas";
      setError(mensaje);
      setEstado("error");
      console.error("Error en usePartidas (recargar):", err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  return {
    partidas,
    loading,
    error,
    estado,
    paginacion,
    recargar,
  };
};

/**
 * Hook para obtener partidas destacadas
 */
export const usePartidasDestacadas = (limit: number = 6) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPartidas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PartidasService.obtenerPartidasDestacadas(limit);
      setPartidas(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    cargarPartidas();
  }, [cargarPartidas]);

  return { partidas, loading, error, recargar: cargarPartidas };
};

/**
 * Hook para obtener próximas partidas
 */
export const useProximasPartidas = (limit: number = 4) => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPartidas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PartidasService.obtenerProximasPartidas(limit);
      setPartidas(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    cargarPartidas();
  }, [cargarPartidas]);

  return { partidas, loading, error, recargar: cargarPartidas };
};

/**
 * Hook para obtener una partida individual por ID
 */
export const usePartida = (id: string | number) => {
  const [partida, setPartida] = useState<Partida | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPartida = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PartidasService.obtenerPartidaPorId(id);
      setPartida(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarPartida();
  }, [cargarPartida]);

  return { partida, loading, error, recargar: cargarPartida };
};

export default usePartidas;
