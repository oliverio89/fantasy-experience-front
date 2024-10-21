import { FunctionComponent, memo, useCallback } from "react";
import GameCard from "./GameCard";


export type UpcomingCarouselType = {
  className?: string;
};

const NextGames: FunctionComponent<UpcomingCarouselType> = memo(
  ({ className = "" }) => {
    const onSlide1ContainerClick = useCallback(() => {
      // Please sync "Partidas-detalles v1.2" to the project
    }, []);

    const onMoreGamesContainerClick = useCallback(() => {
      // Please sync "Partidas v1.2" to the project
    }, []);

    return (
      <section className="self-stretch bg-oldlace-100 flex flex-col items-end justify-start py-[100px] px-0 box-border gap-10 max-w-full z-[1] text-right text-61xl text-black font-titulo-2 lg:pt-[65px] lg:pb-[65px] lg:box-border mq750:gap-5 mq1050:pt-[42px] mq1050:pb-[42px] mq1050:box-border mq450:pt-[27px] mq450:pb-[27px] mq450:box-border">
      <div className="self-stretch h-[1829px] relative bg-oldlace-100 hidden" />
      <div className="w-[796px] flex flex-row items-start justify-end py-0 pl-[78px] pr-[79px] box-border max-w-full mq1050:pl-[39px] mq1050:pr-[39px] mq1050:box-border">
        <h1 className="m-0 flex-1 relative text-inherit font-extrabold font-[inherit] inline-block max-w-full z-[2] mq1050:text-21xl mq450:text-5xl">
          Próximas partidas
        </h1>
      </div>
      
      <div
        className={`flex flex-col items-end justify-start pt-0 pb-[60px] pl-5 pr-0 box-border max-w-full text-center text-base text-black font-titulo-2 mq750:pb-[39px] mq750:box-border ${className}`}
      >
        <div className="w-[1200px] overflow-x-auto flex flex-row items-start justify-start pt-0 px-0 pb-[62px] box-border gap-[20.4px] max-w-full z-[3] mq750:pb-10 mq750:box-border">
          <div
            className="w-[360px] shrink-0 flex flex-col items-start justify-start min-h-[480px] max-w-full cursor-pointer"
            onClick={onSlide1ContainerClick}
          >
                       
          <GameCard
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            // onClick={onSlide1ContainerClick}
          />
          </div>
          <GameCard
            propBackgroundImage="unset"
            cedericVandenbergheDPhytVHw="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
          />
          <GameCard
            propBackgroundImage="unset"
            cedericVandenbergheDPhytVHw="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
          />
          <GameCard
          propBackgroundImage="unset"
          cedericVandenbergheDPhytVHw="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
        />
        <GameCard
            propBackgroundImage="unset"
            cedericVandenbergheDPhytVHw="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
          />
          <GameCard
          propBackgroundImage="unset"
          cedericVandenbergheDPhytVHw="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
        />
          
        </div>
        <div className="w-[507px] flex flex-row items-start justify-end py-0 px-20 box-border max-w-full mq750:pl-10 mq750:pr-10 mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[93px] pr-[92px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden flex flex-row items-start justify-center box-border max-w-full z-[2] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={onMoreGamesContainerClick}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Ver más partidas
            </b>
          </button>
        </div>
      </div>
      </section>
    );
  }
);

export default NextGames;
