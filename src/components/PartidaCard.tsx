import { FunctionComponent, memo } from "react";
import { useNavigate } from "react-router-dom";

// Tipo de partida que vendrá de la API en el futuro
export type TipoPartida = "digital" | "presencial" | "online";

// Interface que representa los datos de una partida (preparado para API)
export interface Partida {
  id: string | number;
  titulo: string;
  masterName: string;
  sistemaJuego: string;
  fecha?: string;
  descripcion?: string;
  imagenUrl: string;
  tipoPartida: TipoPartida;
  rating: number; // de 0 a 5
}

export type PartidaCardProps = {
  className?: string;
  partida: Partida;
  mostrarDescripcion?: boolean;
  onClick?: () => void;
  backgroundColor?: string;
};

// Componente interno para el rating con estrellas
const RatingStars: FunctionComponent<{ rating: number }> = memo(
  ({ rating }) => {
    const stars = Array.from({ length: 5 }, (_, index) => index + 1);

    return (
      <div className="flex flex-row items-center justify-center gap-2 z-10">
        {stars.map((star) => (
          <img
            key={star}
            className="w-[30px] h-[30px] rounded-12xs"
            alt={`${star <= rating ? "Estrella llena" : "Estrella vacía"}`}
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
      switch (tipo) {
        case "digital":
          return {
            icon: "/star-1.svg",
            texto: "Digital",
            color: "text-black",
          };
        case "presencial":
          return {
            icon: "/star-1.svg",
            texto: "Presencial",
            color: "text-black",
          };
        case "online":
          return {
            icon: "/star-1.svg",
            texto: "Online",
            color: "text-black",
          };
        default:
          return {
            icon: "/star-1.svg",
            texto: "Digital",
            color: "text-black",
          };
      }
    };

    const config = getBadgeConfig();

    return (
      <div className="h-[120px] w-[120px] relative z-[2]">
        <img
          className="w-[120px] h-[120px] absolute !m-[0] right-[-20px] bottom-[-20px]"
          loading="lazy"
          alt=""
          src={config.icon}
        />
        <div
          className={`w-[86.8px] h-[42px] absolute !m-[0] right-[3.2px] bottom-[4.24px] text-base [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[3] ${config.color}`}
        >
          {config.texto}
        </div>
      </div>
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
    const isDarkBackground =
      backgroundColor === "#1a1a1a" || backgroundColor === "#darkslategray";
    const textColor = isDarkBackground ? "text-oldlace-100" : "text-black";

    return (
      <div
        className={`w-[360px] min-h-[536px] cursor-pointer shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl shrink-0 flex flex-col items-start justify-start pt-0 px-0 pb-[15px] box-border gap-3.5 max-w-full text-center text-base ${textColor} font-titulo-2 hover:scale-[1.02] transition-transform duration-200 ${className}`}
        style={{ backgroundColor }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick();
          }
        }}
        aria-label={`Click para ver detalles de ${partida.titulo} por ${partida.masterName}`}
      >
        {/* Header con imagen y badge */}
        <div
          className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-[7px] px-6 pb-[133px] box-border bg-cover bg-no-repeat bg-center max-w-full z-[1] h-[240px]"
          style={{
            backgroundImage: `url('${partida.imagenUrl}')`,
          }}
        >
          <BadgeTipoPartida tipo={partida.tipoPartida} />
        </div>

        {/* Contenido de la tarjeta */}
        <div className="self-stretch flex flex-col items-center justify-start pt-0 px-4 pb-0 gap-3 relative min-h-[196px]">
          {/* Título - Máximo 2 líneas */}
          <h2 className="m-0 self-stretch relative text-13xl font-bold font-[inherit] text-goldenrod z-[1] mq1050:text-7xl mq450:text-lgi overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] h-[80px]">
            {partida.titulo}
          </h2>

          {/* Nombre del Master - Máximo 1 línea */}
          <b className="self-stretch relative text-xl z-[1] mq450:text-base truncate">
            {partida.masterName}
          </b>

          {/* Sistema de juego - Máximo 1 línea */}
          <div className="self-stretch relative text-lg leading-[20px] z-[1] truncate">
            {partida.sistemaJuego}
          </div>

          {/* Fecha (opcional) - Máximo 1 línea */}
          {partida.fecha && (
            <div className="self-stretch relative text-lg leading-[20px] z-[1] truncate">
              {partida.fecha}
            </div>
          )}

          {/* Rating de estrellas */}
          <div className="mt-2">
            <RatingStars rating={partida.rating} />
          </div>
        </div>

        {/* Descripción (opcional) - Máximo 2 líneas */}
        {mostrarDescripcion && partida.descripcion && (
          <div className="self-stretch flex flex-row items-start justify-start py-0 px-2.5 box-border max-w-full h-[48px]">
            <div className="flex-1 relative leading-[24px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] z-[1]">
              {partida.descripcion}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="self-stretch flex flex-row items-start justify-start py-0 px-5 box-border max-w-full mt-auto">
          <button
            onClick={handleButtonClick}
            className={`flex-1 cursor-pointer [border:none] py-2 px-4 rounded-xl shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] transition-colors duration-200 z-[1] ${
              isDarkBackground
                ? "bg-oldlace-100 hover:bg-goldenrod"
                : "bg-white hover:bg-oldlace-100"
            }`}
            aria-label={`Ver detalles de ${partida.titulo}`}
            tabIndex={0}
          >
            <b className="relative text-lg font-titulo-2 text-black1 text-center">
              Ver detalles
            </b>
          </button>
        </div>
      </div>
    );
  }
);

PartidaCard.displayName = "PartidaCard";

export default PartidaCard;
