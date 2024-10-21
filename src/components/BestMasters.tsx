import { FunctionComponent, memo, useCallback, useRef } from "react";
import CardMaster from "./CardMaster";

export type FrameComponent2Type = {
  className?: string;
};

const BestMasters: FunctionComponent<FrameComponent2Type> = memo(
  ({ className = "" }) => {
    const cardContainerRef = useRef<HTMLDivElement>(null);

    const onSlide1ContainerClick = useCallback(() => {
      // Please sync "Master-detalles v1.2" to the project
    }, []);

    const onViewAllMastersLinkClick = useCallback(() => {
      // Please sync "Masters v1.2" to the project
    }, []);

    // Funciones para desplazar el contenedor lateralmente
    const scrollLeft = () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({
          left: -300, // Desplazamiento a la izquierda
          behavior: "smooth",
        });
      }
    };

    const scrollRight = () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({
          left: 300, // Desplazamiento a la derecha
          behavior: "smooth",
        });
      }
    };

    return (
      <section
        className={`relative self-stretch bg-darkslategray flex flex-col items-start justify-start py-[100px] pl-[79px] pr-[79px] box-border gap-[62px] max-w-full text-left text-61xl text-dark-gold font-titulo-2 mq750:gap-[31px] mq750:pl-[39px] mq750:pt-[42px] mq750:pb-[42px] mq750:box-border mq1050:pt-[65px] mq1050:pb-[65px] mq1050:box-border mq450:gap-[15px] ${className}`}
      >
        <h1 className="m-0 relative text-inherit leading-[90%] inline-block max-w-full z-[1] font-[inherit] mq1050:text-21xl mq1050:leading-[43px] mq450:text-5xl mq450:leading-[29px]">
          <p className="m-0 font-extrabold">{`Nuestros `}</p>
          <p className="m-0">
            <i className="font-medium">mejores</i>
            <i className="font-bold font-titulo-2">{` `}</i>
            <span className="font-extrabold font-titulo-2">Masters</span>
          </p>
        </h1>

        <div className="relative w-full">
          {/* Botón para desplazar a la izquierda */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer [border:none] py-4 px-6 bg-dark-gold shadow-lg rounded-full hover:bg-darkgoldenrod text-black"
            onClick={scrollLeft}
          >
            &lt;
          </button>

          {/* Contenedor de las tarjetas */}
          <div className="relative mx-[70px]"> {/* Márgenes a los lados */}
            <div
              className="flex flex-row items-start justify-start pt-0 px-0 pb-[62px] box-border gap-[20.4px] max-w-full overflow-x-auto scroll-hidden scrollbar-hide"
              ref={cardContainerRef}
            >
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3@2x.png"
                MasterName="Master Name 1"
                rate={1}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3-1@2x.png"
                MasterName="Master Name 2"
                rate={2}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3@2x.png"
                MasterName="Master Name 3"
                rate={3}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3@2x.png"
                MasterName="Master Name 4"
                rate={4}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3-1@2x.png"
                MasterName="Master Name 5"
                rate={5}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
              <CardMaster
                onSlide1ContainerClick={onSlide1ContainerClick}
                masterCard="/ellipse-3@2x.png"
                MasterName="Master Name 6"
                rate={4}
                Sistema="Sistema de partida seleccionada"
                Preferencia="Preferencia de partida del máster"
              />
            </div>
          </div>

          {/* Botón para desplazar a la derecha */}
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer [border:none] py-4 px-6 bg-dark-gold shadow-lg rounded-full hover:bg-darkgoldenrod text-black"
            onClick={scrollRight}
          >
            &gt;
          </button>
        </div>

        {/* Botón para ver todos los másters */}
        <div className="w-[504px] flex flex-row items-start justify-end py-0 px-[79px] box-border max-w-full mq750:pl-[39px] mq750:pr-[39px] mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[47px] pr-[46px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-11xl overflow-hidden flex flex-row items-start justify-start box-border max-w-full z-[1] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={onViewAllMastersLinkClick}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Conoce a nuestros Másters
            </b>
          </button>
        </div>
      </section>
    );
  }
);

export default BestMasters;
