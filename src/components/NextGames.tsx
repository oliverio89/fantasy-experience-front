import { FunctionComponent, memo, useRef, useEffect } from "react";
import PartidaCard from "./PartidaCard";
import { useNavigate } from "react-router-dom";
import { useProximasPartidas } from "../hooks/usePartidas";
import { useTranslation } from "../i18n";

export type UpcomingCarouselType = {
  className?: string;
};

const NextGames: FunctionComponent<UpcomingCarouselType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const startXRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const { partidas, loading } = useProximasPartidas(6);

    // Duplicar para efecto de bucle infinito (solo si hay datos)
    const extendedGameCards = partidas.length > 0
      ? [...partidas, ...partidas]
      : [];

    // Efecto de desplazamiento infinito
    useEffect(() => {
      const handleScroll = () => {
        if (!cardContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } =
          cardContainerRef.current;

        // Volver al inicio o al final para crear el efecto de bucle
        if (scrollLeft <= 0) {
          cardContainerRef.current.scrollLeft = scrollWidth / 2 - clientWidth;
        } else if (scrollLeft + clientWidth >= scrollWidth) {
          cardContainerRef.current.scrollLeft = scrollWidth / 2 - clientWidth;
        }
      };

      const container = cardContainerRef.current;
      if (container) {
        container.addEventListener("scroll", handleScroll);
      }

      return () => {
        if (container) container.removeEventListener("scroll", handleScroll);
      };
    }, []);

    // Manejo de arrastre para desplazamiento manual continuo
    const handleMouseDown = (e: React.MouseEvent) => {
      isScrollingRef.current = true;
      startXRef.current = e.clientX;
      hasDraggedRef.current = false;
      cardContainerRef.current?.addEventListener("mousemove", handleMouseMove);
    };

    const handleMouseUp = () => {
      isScrollingRef.current = false;
      cardContainerRef.current?.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrollingRef.current || !cardContainerRef.current) return;
      if (Math.abs(e.clientX - startXRef.current) > 5) {
        hasDraggedRef.current = true;
      }
      cardContainerRef.current.scrollLeft += -e.movementX * 1;
    };

    return (
      <section
        className="self-stretch bg-oldlace-100 flex flex-col items-end justify-start py-[100px] px-0 box-border gap-10 max-w-full z-[1] text-right text-61xl text-black font-titulo-2 lg:pt-[65px] lg:pb-[65px] lg:box-border mq750:gap-5 mq1050:pt-[42px] mq1050:pb-[42px] mq1050:box-border mq450:pt-[27px] mq450:pb-[27px] mq450:box-border select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="self-stretch h-[1829px] relative bg-oldlace-100 hidden" />
        <div className="w-[796px] flex flex-row items-start justify-end py-0 pl-[78px] pr-[79px] box-border max-w-full mq1050:pl-[39px] mq1050:pr-[39px] mq1050:box-border">
          <h1 className="m-0 flex-1 relative text-inherit font-extrabold font-[inherit] inline-block max-w-full z-[2] mq1050:text-21xl mq450:text-5xl">
            {t.nextGamesCarousel.title}
          </h1>
        </div>

        <div
          className={`flex flex-col items-end justify-start px-20 pb-[60px] box-border max-w-full text-center text-base text-black font-titulo-2 mq750:pb-[39px] mq750:box-border ${className}`}
        >
          <div
            ref={cardContainerRef}
            onMouseDown={handleMouseDown}
            className="w-auto overflow-x-auto flex flex-row items-start justify-start pt-0 px-12 pb-[40px] box-border gap-[20.4px] max-w-full z-[1] mq750:pb-10 mq750:box-border scrollbar-hide cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="loader" />
              </div>
            ) : extendedGameCards.length === 0 ? (
              <div className="text-darkslategray text-xl py-12 px-6 font-titulo-2">
                {t.nextGamesCarousel.empty}
              </div>
            ) : (
              extendedGameCards.map((partida, index) => (
                <PartidaCard
                  key={`${partida.id}-${index}`}
                  partida={partida}
                  mostrarDescripcion={false}
                  onClick={() => {
                    if (!hasDraggedRef.current) {
                      navigate(`/detailsgame/${partida.id}`);
                    }
                  }}
                />
              ))
            )}
          </div>

          <div className="w-[507px] flex flex-row items-start justify-end py-0 px-20 box-border max-w-full mq750:pl-10 mq750:pr-10 mq750:box-border">
            <button className="cursor-pointer [border:none] py-[15.5px] pl-[93px] pr-[92px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden flex flex-row items-start justify-center box-border max-w-full z-[2] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border">
              <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
                {t.nextGamesCarousel.viewMore}
              </b>
            </button>
          </div>
        </div>
      </section>
    );
  }
);

export default NextGames;
