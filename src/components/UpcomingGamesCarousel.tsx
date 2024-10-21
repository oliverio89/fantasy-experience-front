import { FunctionComponent, memo, useCallback } from "react";
import Slide3 from "./Slide3";
// import FrameComponent from "./FrameComponent";
import Slide4 from "./Slide4";

export type UpcomingGamesCarouselType = {
  className?: string;
};

const UpcomingGamesCarousel: FunctionComponent<UpcomingGamesCarouselType> =
  memo(({ className = "" }) => {
    const onFrameButtonClick = useCallback(() => {
      // Please sync "Partidas v1.2" to the project
    }, []);

    return (
      <div
        className={`flex flex-col items-end justify-start py-0 pl-5 pr-0 box-border max-w-full text-right text-45xl text-black font-titulo-2 ${className}`}
      >
        <div className="w-[990px] flex flex-row items-start justify-end pt-0 pb-14 pl-[79px] pr-20 box-border max-w-full mq1050:pl-[39px] mq1050:pr-10 mq1050:box-border">
          <h1 className="m-0 h-[140px] flex-1 relative text-inherit font-extrabold font-[inherit] inline-block max-w-full z-[2] mq1050:text-32xl mq450:text-19xl">
            <p className="m-0">Partidas</p>
            <p className="m-0">digitales destacadas</p>
          </h1>
        </div>
        <div className="w-[1200px] overflow-x-auto flex flex-row items-start justify-start pt-0 px-0 pb-[55px] box-border gap-[20.4px] max-w-full z-[3] text-center text-base text-oldlace-100 mq750:pb-9 mq750:box-border">
          <Slide3
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            digitalGameStars="/star-1.svg"
          />
          <Slide3
            propBackgroundImage="url('/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png')"
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            digitalGameStars="/star-1.svg"
          />
          <Slide3
            propBackgroundImage="url('/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png')"
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            digitalGameStars="/star-1.svg"
          />
          <div className="w-[360px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-darkslategray shrink-0 flex flex-col items-start justify-start pt-0 px-0 pb-[54px] box-border relative gap-3.5 max-w-full text-13xl mq750:pb-[35px] mq750:box-border">
            <div className="self-stretch h-[480px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-darkslategray hidden z-[0]" />
            {/* <FrameComponent
              cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              star1="/star-1.svg"
              presencial="Digital"
            /> */}
            <div className="w-[78px] flex flex-col items-start justify-start pt-0 pb-[21px] pl-0 pr-5 box-border gap-px">
              <h2 className="m-0 w-[361px] relative text-inherit font-bold font-[inherit] text-goldenrod flex items-center justify-center max-w-[623%] z-[1] mq1050:text-7xl mq1050:leading-[19px] mq450:text-lgi mq450:leading-[14px]">
                Partida Título
              </h2>
              <b className="w-[361px] relative text-xl flex items-center justify-center max-w-[623%] z-[1] mq450:text-base">
                Master name
              </b>
              <div className="w-[361px] relative text-lg leading-[20px] flex items-center justify-center max-w-[623%] z-[1]">
                Sistema de partida
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start py-0 px-2.5 box-border max-w-full text-base">
              <div className="flex-1 relative leading-[24px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] max-w-full z-[1]">{`Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. `}</div>
            </div>
            <img
              className="w-[30px] h-[30px] absolute !m-[0] bottom-[117px] left-[85px] rounded-12xs z-[1]"
              alt=""
              src="/rating-star.svg"
            />
            <img
              className="w-[30px] h-[30px] absolute !m-[0] bottom-[117px] left-[124.8px] rounded-12xs z-[1]"
              alt=""
              src="/rating-star1.svg"
            />
            <img
              className="w-[30px] h-[30px] absolute !m-[0] bottom-[117px] left-[164.5px] rounded-12xs z-[1]"
              alt=""
              src="/rating-star2.svg"
            />
            <img
              className="w-[30px] h-[30px] absolute !m-[0] right-[125.7px] bottom-[117px] rounded-12xs z-[1]"
              alt=""
              src="/rating-star3.svg"
            />
            <img
              className="w-[30px] h-[30px] absolute !m-[0] right-[86px] bottom-[117px] rounded-12xs z-[2]"
              alt=""
              src="/rating-star.svg"
            />
            <div className="w-[38px] h-[30px] absolute !m-[0] bottom-[15px] left-[20px] text-lg text-black1">
              <div className="absolute top-[0px] left-[0px] rounded-xl bg-oldlace-100 w-80 h-[30px] z-[1]" />
              <b className="absolute top-[0px] left-[0px] flex items-center justify-center w-[321px] h-[30px] whitespace-nowrap z-[2]">
                Ver más detalles
              </b>
            </div>
          </div>
          <Slide4
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            star1="/star-1.svg"
          />
          <Slide4
            propBackgroundImage="url('/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png')"
            cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
            star1="/star-1.svg"
          />
        </div>
        <div className="w-[507px] flex flex-row items-start justify-end py-0 px-20 box-border max-w-full mq750:pl-10 mq750:pr-10 mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[93px] pr-[92px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden flex flex-row items-start justify-center box-border max-w-full z-[2] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={onFrameButtonClick}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Ver más partidas
            </b>
          </button>
        </div>
      </div>
    );
  });

export default UpcomingGamesCarousel;
