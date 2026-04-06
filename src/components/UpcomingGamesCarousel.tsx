import { FunctionComponent, memo, useRef } from "react";
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
    const isDraggingRef = useRef(false);
    const initialScrollLeftRef = useRef(0);
    const startXRef = useRef(0);
    const { partidas, loading } = usePartidasDestacadas(6);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!cardContainerRef.current) return;
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      initialScrollLeftRef.current = cardContainerRef.current.scrollLeft;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDraggingRef.current || !cardContainerRef.current) return;
      cardContainerRef.current.scrollLeft = initialScrollLeftRef.current - (e.clientX - startXRef.current);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    return (
      <section
        className={`flex flex-col items-center justify-start py-8 pl-5 pr-5 box-border max-w-full text-center text-45xl text-black font-titulo-2 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
      >
        <div className="w-full flex flex-row items-start justify-center pt-0 pb-14 px-[79px] box-border max-w-full mq1050:px-[39px] mq1050:box-border">
          <h1 className="m-0 h-[140px] flex-1 relative text-inherit font-extrabold font-[inherit] inline-block max-w-full z-[2] mq1050:text-32xl mq450:text-19xl text-center">
            <p className="m-0">Partidas</p>
            <p className="m-0">digitales destacadas</p>
          </h1>
        </div>

        <div
          className="w-auto overflow-x-auto flex flex-row items-start justify-start pt-0 px-12 pb-[40px] box-border gap-[20.4px] max-w-full z-[1] mq750:pb-10 mq750:box-border scrollbar-hide select-none cursor-pointer"
          ref={cardContainerRef}
          onMouseDown={handleMouseDown}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full py-12">
              <div className="loader" />
            </div>
          ) : partidas.length === 0 ? (
            <div className="text-black text-xl py-12 px-6 font-titulo-2">
              No hay partidas destacadas disponibles aún.
            </div>
          ) : (
            partidas.map((partida) => (
              <PartidaCard
                key={partida.id}
                partida={partida}
                mostrarDescripcion={true}
              />
            ))
          )}
        </div>

        <div className="w-[507px] flex flex-row items-start justify-end py-0 px-20 box-border max-w-full mq750:pl-10 mq750:pr-10 mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[93px] pr-[92px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden flex flex-row items-start justify-center box-border max-w-full z-[2] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={() => navigate("/nextgames")}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Ver más partidas
            </b>
          </button>
        </div>
      </section>
    );
  });

export default UpcomingGamesCarousel;
