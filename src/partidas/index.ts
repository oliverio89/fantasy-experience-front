/**
 * Exportaciones centralizadas para el módulo de Partidas
 *
 * Este archivo facilita las importaciones relacionadas con partidas
 * en toda la aplicación.
 *
 * Ejemplo de uso:
 * import { PartidaCard, usePartidas, PartidasService, type Partida } from '@/partidas';
 */

// Componentes
export { default as PartidaCard } from "../components/PartidaCard";

// Tipos
export type {
  Partida,
  TipoPartida,
  PartidaCardProps,
} from "../components/PartidaCard";

// Hooks
export {
  default as usePartidas,
  usePartidasDestacadas,
  useProximasPartidas,
  usePartida,
} from "../hooks/usePartidas";

// Servicios
export { default as PartidasService } from "../services/partidasService";

// Tipos del servicio
export type {
  FiltrosPartida,
  RespuestaPartidas,
} from "../services/partidasService";
