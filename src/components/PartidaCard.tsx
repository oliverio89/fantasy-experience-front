import { FunctionComponent, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export type TipoPartida = "Digital" | "Presencial" | "Online" | "Híbrida";
export type EstadoPartida = "active" | "full" | "cancelled" | "completed";

export interface ParticipantePartida {
  id: string;
  nombre: string;
}

// Interface que representa los datos de una partida (preparado para API)
export interface Partida {
  id: string | number;
  masterId?: string;
  titulo: string;
  masterName: string;
  sistemaJuego: string;
  fecha?: string;
  descripcion?: string;
  imagenUrl: string;
  tipoPartida: TipoPartida;
  rating: number; // de 0 a 5
  tags?: string[];
  jugadores?: string; // Total plazas
  jugadoresActuales?: number;
  participantes?: ParticipantePartida[];
  idioma?: string;
  edadMinima?: number;
  temporalidad?: string;
  recomendaciones?: string;
  ciudad?: string;
  contactoMaster?: string;
  precio?: string;
  horario?: string;
  herramientas?: string[];
  usoTarjetaX?: boolean;
  obligatorioCamara?: boolean;
  obligatorioMicrofono?: boolean;
  status?: EstadoPartida;
  digitalFileName?: string;
  digitalFileSizeBytes?: number;
  digitalMimeType?: string;
  digitalVersion?: number;
}

export type PartidaCardProps = {
  className?: string;
  partida: Partida;
  mostrarDescripcion?: boolean;
  onClick?: () => void;
  backgroundColor?: string;
};

const statusLabels: Record<EstadoPartida, string> = {
  active: "Abierta",
  full: "Completa",
  cancelled: "Cancelada",
  completed: "Completada",
};

// Componente interno para el rating con estrellas
const RatingStars: FunctionComponent<{ rating: number }> = memo(
  ({ rating }) => {
    const { t } = useTranslation();
    const stars = Array.from({ length: 5 }, (_, index) => index + 1);

    return (
      <div className="flex flex-row items-center justify-center gap-2 z-10">
        {stars.map((star) => (
          <img
            key={star}
            className="w-[30px] h-[30px] rounded-12xs"
            alt={star <= rating ? "Estrella llena" : "Estrella vacía"}
            src={star <= rating ? "/rating-star.svg" : "/rating-star-empty.svg"}
          />
        ))}
      </div>
    );
  }
);

RatingStars.displayName = "RatingStars";

// Componente interno para el badge de tipo de partida
const BadgeTipoPartida: FunctionComponent<{ tipo: TipoPartida }> = memo(
  ({ tipo }) => {
    const getBadgeConfig = () => {
      const normalizedTipo = tipo ? tipo.toLowerCase() : "digital";

      switch (normalizedTipo) {
        case "digital":
          return {
            icon: "/star-1.svg",
            texto: "Digital",
            color: "text-black",
          };
        case "presencial":
          return {
            icon: "/star-1.svg",
            texto: "En mesa",
            color: "text-black",
          };
        case "online":
          return {
            icon: "/star-1.svg",
            texto: "Online",
            color: "text-black",
          };
        case "híbrida":
        case "hibrida":
          return {
            icon: "/star-1.svg",
            texto: "Híbrida",
            color: "text-black",
          };
        default:
          return {
            icon: "/star-1.svg",
            texto: "Partida",
            color: "text-black",
          };
      }
    };

    const config = getBadgeConfig();

    return (
      <span className="relative z-[2] inline-flex rounded-full border border-[#edc777]/45 bg-[#100c09]/88 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#edc777] shadow-lg backdrop-blur-md">
        {config.texto}
      </span>
    );
  }
);

BadgeTipoPartida.displayName = "BadgeTipoPartida";

const PartidaCard: FunctionComponent<PartidaCardProps> = memo(
  ({
    className = "",
    partida,
    mostrarDescripcion = false,
    onClick,
    backgroundColor = "#1a1a1a",
  }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleCardClick = () => {
      if (onClick) {
        onClick();
      } else {
        // Navegación a los detalles de la partida
        navigate(`/detailsgame/${partida.id}`);
      }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/detailsgame/${partida.id}`);
    };

    // Determinar color de texto según el fondo
    const isDarkBackground = ["#1a1a1a", "#darkslategray", "#1b130d", "#21170f"].includes(
      backgroundColor,
    );
    const textColor = isDarkBackground ? "text-oldlace-100" : "text-black";

    // Calcular vacantes
    const maxJugadores = Number(partida.jugadores || 0);
    const actuales = partida.jugadoresActuales || 0;
    const vacantes = Math.max(0, maxJugadores - actuales);

    return (
      <div
        className={`fe-panel min-h-[530px] w-full max-w-full shrink-0 cursor-pointer overflow-hidden rounded-[24px] pb-5 text-left text-base ${textColor} font-titulo-2 transition duration-300 hover:-translate-y-1 hover:border-[#d8a651]/60 ${className}`}
        style={{ backgroundColor }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCardClick();
          }
        }}
        aria-label={`Ver detalles de ${partida.titulo} por ${partida.masterName}`}
      >
        {/* Header con imagen y badge */}
        <div
          className="relative z-[1] flex h-[220px] max-w-full items-start justify-end self-stretch bg-cover bg-center bg-no-repeat px-5 pt-5 after:absolute after:inset-0 after:-z-[1] after:bg-[linear-gradient(180deg,rgba(10,7,5,.08),rgba(10,7,5,.72))]"
          style={{
            backgroundImage: `url('${partida.imagenUrl}')`,
          }}
        >
          <BadgeTipoPartida tipo={partida.tipoPartida} />
        </div>

        {/* Contenido de la tarjeta */}
        <div className="relative flex flex-1 flex-col items-start justify-start gap-2.5 self-stretch px-6 pb-0 pt-7">
          {/* Disponibilidad: plazas para sesiones, descarga para productos */}
          <div className="absolute right-5 top-[-14px] z-[5] rounded-full border border-[#d8a651]/30 bg-[#d9a84f] px-3 py-1 text-xs font-bold text-[#120d09] shadow-md">
            {partida.tipoPartida === "Digital"
              ? partida.digitalFileName
                ? "Descarga digital"
                : "Próximamente"
              : vacantes > 0
              ? `${vacantes} ${t.partidaCard.spotsLeft}`
              : t.partidaCard.full}
          </div>

          {partida.status && (
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#d9a84f]">
              {statusLabels[partida.status]}
            </span>
          )}

          {/* Título - Máximo 2 líneas */}
          <h2 className="m-0 line-clamp-2 min-h-[64px] self-stretch overflow-hidden font-milonga text-[26px] font-normal leading-8 text-[#f2e6cf]">
            {partida.titulo}
          </h2>

          {/* Nombre del Master - Máximo 1 línea */}
          <b className="self-stretch truncate text-base text-[#e0ad50]">
            {partida.masterName}
          </b>

          {/* Sistema de juego - Máximo 1 línea */}
          <div className="self-stretch truncate text-sm leading-5 text-[#f2e6cf]/62">
            {partida.sistemaJuego}
          </div>

          {/* Fecha para sesiones; formato y precio para productos digitales */}
          {partida.tipoPartida === "Digital" ? (
            <div className="self-stretch truncate text-sm leading-5 text-[#f2e6cf]/62">
              {partida.digitalFileName?.split(".").pop()?.toUpperCase() || "Archivo"}
              {partida.precio ? ` · ${Number(partida.precio).toFixed(2)} €` : ""}
            </div>
          ) : partida.fecha ? (
            <div className="self-stretch truncate text-sm leading-5 text-[#f2e6cf]/62">
              {new Intl.DateTimeFormat("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(partida.fecha))}
            </div>
          ) : null}

          {/* La valoración corresponde a sesiones dirigidas, no al PDF vendido. */}
          {partida.tipoPartida !== "Digital" && (
            <div className="mt-2 text-center w-full">
              <RatingStars rating={partida.rating} />
            </div>
          )}

          {/* Tags */}
          {partida.tags && partida.tags.length > 0 && (
            <div className="mt-2 flex max-h-[60px] h-auto flex-row flex-wrap items-center justify-start gap-1.5 overflow-hidden self-stretch">
              {partida.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 text-xs rounded-full border border-solid ${
                    isDarkBackground
                      ? "border-[#d8a651]/32 text-[#e0ad50]"
                      : "border-black text-black"
                  } truncate max-w-[100px]`}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {partida.tags.length > 4 && (
                <span
                  className={`text-xs ${
                    isDarkBackground ? "text-goldenrod" : "text-black"
                  }`}
                >
                  +{partida.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Descripción (opcional) - Máximo 2 líneas */}
        {mostrarDescripcion && partida.descripcion && (
          <div className="mt-3 h-[48px] max-w-full self-stretch px-6">
            <div className="line-clamp-2 overflow-hidden text-sm font-light leading-6 text-[#f2e6cf]/54">
              {partida.descripcion}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="mt-auto flex max-w-full flex-row items-start justify-start px-6 pt-4 self-stretch">
          <button
            onClick={handleButtonClick}
            className="fe-button-secondary z-[1] flex-1 rounded-xl bg-transparent px-4 py-2"
            aria-label={`Ver detalles de ${partida.titulo}`}
            tabIndex={0}
          >
            <b className="text-center text-base font-bold text-[#f2e6cf] font-titulo-2">
              {partida.tipoPartida === "Digital"
                ? "Ver aventura"
                : t.partidaCard.viewDetails}
            </b>
          </button>
        </div>
      </div>
    );
  }
);

PartidaCard.displayName = "PartidaCard";

export default PartidaCard;
