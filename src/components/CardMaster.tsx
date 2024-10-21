import { FunctionComponent, memo, useCallback } from "react";

export type SlideType = {
  className?: string;
  masterCard?: string;
  MasterName?: string;
  rate?: number; // Rating del 1 al 5
  Sistema?: string;
  Preferencia?: string;

  /** Action props */
  onSlide1ContainerClick?: () => void;
};

const CardMaster: FunctionComponent<SlideType> = memo(
  ({ className = "", onSlide1ContainerClick, masterCard, MasterName, rate = 0, Sistema, Preferencia }) => {
    const onSlide1ContainerClick1 = useCallback(() => {
      // Please sync "Master-detalles v1.2" to the project
    }, []);

    // Normalizamos el rating entre 1 y 5
    const normalizedRating = Math.min(Math.max(rate, 0), 5);

    return (
      <div
        className={`h-[409px] w-[360px] relative shrink-0 max-w-full cursor-pointer text-center text-13xl text-dark-gold font-titulo-2 ${className}`}
        onClick={onSlide1ContainerClick}
      >
        <img
          className="absolute top-[0px] left-[80px] rounded-[50%] w-[200px] h-[200px] object-cover z-[1]"
          loading="lazy"
          alt="MasterCard"
          src={masterCard}
        />
        <div className="absolute top-[49px] left-[0px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black1 border-dark-gold border-[1px] border-solid box-border w-full flex flex-col items-end justify-start pt-40 px-0 pb-3.5 gap-4">
          <div className="self-stretch h-[360px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black1 border-dark-gold border-[1px] border-solid box-border hidden" />
          <h2 className="m-0 self-stretch h-[18px] relative text-inherit font-bold font-[inherit] flex items-center justify-center shrink-0 z-[1] mq1050:text-7xl mq450:text-lgi">
            {MasterName}
          </h2>

          {/* Rating dinámico */}
          <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5">
            <div className="flex flex-row items-start justify-start gap-[9.8px]">
              {[...Array(5)].map((_, index) => (
                <img
                  key={index}
                  className="h-[30px] w-[30px] relative rounded-12xs z-[1]"
                  alt={`Star ${index + 1}`}
                  src={index < normalizedRating ? "/rating-star.svg" : "/rating-star-empty.svg"}
                />
              ))}
            </div>
          </div>

          <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[9px] gap-[11px] text-xl text-oldlace-100">
            <b className="self-stretch relative z-[1] mq450:text-base">
              {Preferencia}
            </b>
            <div className="self-stretch relative text-lg z-[1]">
              {Sistema}
            </div>
          </div>

          <div className="self-stretch flex flex-row items-start justify-end py-0 px-5 text-lg">
            <div className="flex-1 rounded-xl bg-gray border-dark-gold border-[1px] border-solid flex flex-row items-start justify-start z-[1]">
              <div className="h-[30px] w-80 relative rounded-xl bg-gray border-dark-gold border-[1px] border-solid box-border hidden" />
              <b className="flex-1 relative inline-block max-w-full z-[1]">
                Ver perfil
              </b>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CardMaster;
