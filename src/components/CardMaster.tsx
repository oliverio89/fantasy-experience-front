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
  ({
    className = "",
    onSlide1ContainerClick,
    masterCard,
    MasterName,
    rate = 0,
    Sistema,
    Preferencia,
  }) => {
    const handleClick = useCallback(() => {
      if (onSlide1ContainerClick) {
        onSlide1ContainerClick();
      }
    }, [onSlide1ContainerClick]);

    // Normalizamos el rating entre 1 y 5
    const normalizedRating = Math.min(Math.max(rate, 0), 5);

    // Función para renderizar estrellas con soporte para medias estrellas
    const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(normalizedRating);
      const hasHalfStar = normalizedRating % 1 >= 0.5;

      // Estrellas completas
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <img
            key={`full-${i}`}
            className="h-[30px] w-[30px] relative rounded-12xs z-[1]"
            alt={`Star ${i + 1}`}
            src="/rating-star.svg"
          />
        );
      }

      // Media estrella
      if (hasHalfStar) {
        stars.push(
          <div
            key="half-star"
            className="h-[30px] w-[30px] relative rounded-12xs z-[1] overflow-hidden"
          >
            <img
              className="absolute top-0 left-0 h-[30px] w-[30px]"
              alt="Half star"
              src="/rating-star.svg"
              style={{
                clipPath: "inset(0 50% 0 0)",
              }}
            />
            <img
              className="absolute top-0 left-0 h-[30px] w-[30px]"
              alt="Half star empty"
              src="/rating-star-empty.svg"
              style={{
                clipPath: "inset(0 0 0 50%)",
              }}
            />
          </div>
        );
      }

      // Estrellas vacías
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <img
            key={`empty-${i}`}
            className="h-[30px] w-[30px] relative rounded-12xs z-[1]"
            alt={`Empty star ${i + 1}`}
            src="/rating-star-empty.svg"
          />
        );
      }

      return stars;
    };

    return (
      <div
        className={`h-[409px] w-[360px] relative shrink-0 max-w-full cursor-pointer text-center text-13xl text-dark-gold font-titulo-2 ${className}`}
        onClick={handleClick}
      >
        <img
          className="absolute top-[0px] left-[80px] rounded-[50%] w-[200px] h-[200px] object-cover z-[1] border-[3px] border-solid border-dark-gold"
          loading="lazy"
          alt="MasterCard"
          src={masterCard}
        />
        <div className="absolute top-[49px] left-[0px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black border-dark-gold border-[1px] border-solid box-border w-full flex flex-col items-end justify-start pt-40 px-0 pb-3.5 gap-4">
          <div className="self-stretch h-[360px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black border-dark-gold border-[1px] border-solid box-border hidden" />
          <h2 className="m-0 self-stretch h-[18px] relative text-inherit font-bold font-[inherit] flex items-center justify-center shrink-0 z-[1] mq1050:text-7xl mq450:text-lgi">
            {MasterName}
          </h2>

          {/* Rating dinámico con estrellas parciales */}
          <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5">
            <div className="flex flex-row items-start justify-start gap-[9.8px]">
              {renderStars()}
            </div>
          </div>

          <div className="self-stretch flex flex-col items-center justify-start pt-0 px-4 pb-[9px] gap-[4px] text-xl text-white">
            <b className="self-stretch relative z-[1] mq450:text-base leading-tight">
              <span className="line-clamp-2">{Sistema}</span>
            </b>
            <div className="self-stretch relative text-base z-[1] text-nude leading-normal font-medium flex items-center justify-center">
              {Preferencia}
            </div>
          </div>

          <div className="self-stretch flex flex-row items-start justify-center py-0 px-5 text-lg mt-auto">
            <div className="w-[80%] rounded-full border border-dark-gold py-1 px-4 text-dark-gold hover:bg-dark-gold hover:text-black transition-colors z-[1]">
              Ver perfil
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CardMaster;
