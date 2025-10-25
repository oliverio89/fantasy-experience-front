/**
 * ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN (TODAVÍA)
 *
 * Este es un ejemplo de cómo se vería UpcomingGamesCarousel
 * cuando se integre con la API real.
 *
 * Para usar este componente:
 * 1. Renombrar este archivo eliminando .FUTURE_API
 * 2. Renombrar el componente actual a .BACKUP
 * 3. Asegurarse de que la API esté configurada y funcionando
 */

import { FunctionComponent, memo, useRef, useState } from "react";
import PartidaCard from "./PartidaCard";
import { useNavigate } from "react-router-dom";
import { usePartidasDestacadas } from "../hooks/usePartidas";

export type UpcomingGamesCarouselType = {
  className?: string;
};

const UpcomingGamesCarousel: FunctionComponent<UpcomingGamesCarouselType> =
  memo(({ className = "" }) => {
    const navigate = useNavigate();
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [initialMouseX, setInitialMouseX] = useState<number | null>(null);
    const [initialScrollLeft, setInitialScrollLeft] = useState<number | null>(
      null
    );

    // Usar el hook personalizado para obtener partidas destacadas desde la API
    const {
      partidas: partidasDestacadas,
      loading,
      error,
      recargar,
    } = usePartidasDestacadas(6);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!cardContainerRef.current) return;
      setIsDragging(true);
      setInitialMouseX(e.clientX);
      setInitialScrollLeft(cardContainerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (
        !isDragging ||
        initialMouseX === null ||
        initialScrollLeft === null ||
        !cardContainerRef.current
      )
        return;

      const deltaX = e.clientX - initialMouseX;
      cardContainerRef.current.scrollLeft = initialScrollLeft - deltaX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleVerMasPartidas = () => {
      navigate("/nextgames");
    };

    // Estados de carga y error
    if (loading) {
      return (
        <section className="flex flex-col items-center justify-center py-20">
          <div className="text-2xl font-bold text-black">
            Cargando partidas destacadas...
          </div>
          <div className="mt-4 w-16 h-16 border-4 border-goldenrod border-t-transparent rounded-full animate-spin"></div>
        </section>
      );
    }

    if (error) {
      return (
        <section className="flex flex-col items-center justify-center py-20">
          <div className="text-2xl font-bold text-red-600">
            Error al cargar partidas
          </div>
          <p className="text-lg text-gray-600 mt-2">{error}</p>
          <button
            onClick={recargar}
            className="mt-4 px-6 py-3 bg-goldenrod text-black font-bold rounded-lg hover:bg-darkgoldenrod transition-colors"
          >
            Reintentar
          </button>
        </section>
      );
    }

    // Si no hay partidas
    if (partidasDestacadas.length === 0) {
      return (
        <section className="flex flex-col items-center justify-center py-20">
          <div className="text-2xl font-bold text-black">
            No hay partidas destacadas disponibles
          </div>
        </section>
      );
    }

    return (
      <section
        className={`flex flex-col items-end justify-start py-8 pl-5 pr-0 box-border max-w-full text-right text-45xl text-black font-titulo-2 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
      >
        <div className="w-auto flex flex-row items-start justify-end pt-0 pb-14 pl-[79px] pr-20 box-border max-w-full mq1050:pl-[39px] mq1050:pr-10 mq1050:box-border">
          <h1 className="m-0 h-[140px] flex-1 relative text-inherit font-extrabold font-[inherit] inline-block max-w-full z-[2] mq1050:text-32xl mq450:text-19xl">
            <p className="m-0">Partidas</p>
            <p className="m-0">digitales destacadas</p>
          </h1>
        </div>

        <div
          className="w-auto overflow-x-auto flex flex-row items-start justify-start pt-0 px-12 pb-[40px] box-border gap-[20.4px] max-w-full z-[1] mq750:pb-10 mq750:box-border scrollbar-hide select-none cursor-pointer"
          ref={cardContainerRef}
          onMouseDown={handleMouseDown}
        >
          {partidasDestacadas.map((partida) => (
            <PartidaCard
              key={partida.id}
              partida={partida}
              mostrarDescripcion={true}
            />
          ))}
        </div>

        <div className="w-[507px] flex flex-row items-start justify-end py-0 px-20 box-border max-w-full mq750:pl-10 mq750:pr-10 mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[93px] pr-[92px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden flex flex-row items-start justify-center box-border max-w-full z-[2] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={handleVerMasPartidas}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Ver más partidas
            </b>
          </button>
        </div>
      </section>
    );
  });

UpcomingGamesCarousel.displayName = "UpcomingGamesCarousel";

export default UpcomingGamesCarousel;
