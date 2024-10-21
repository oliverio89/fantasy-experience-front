import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type Slide2Type = {
  className?: string;
  cedericVandenbergheDPhytVHw?: string;
  star1?: string;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const GameCard: FunctionComponent<Slide2Type> = memo(
  ({
    className = "",
    propBackgroundImage,
    cedericVandenbergheDPhytVHw,
  }) => {
    const frameDivStyle: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage,
      };
    }, [propBackgroundImage]);

    return (
      <div
        className={`w-[360px] shrink-0 flex flex-col items-start justify-start min-h-[480px] max-w-full text-center text-base text-black font-titulo-2 ${className}`}
      >
        <div className="self-stretch shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-goldenrod flex flex-col items-start justify-start pt-0 px-0 pb-[54px] box-border gap-3.5 max-w-full mq750:pb-[35px] mq750:box-border">
          <div className="self-stretch h-[280px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-goldenrod hidden" />
          <div
            className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end  box-border bg-cover bg-no-repeat bg-[top] max-w-full z-[1]"
            style={frameDivStyle}
          >
            <img
              className="h-60 w-auto relative rounded-t-xl rounded-b-none object-cover max-w-full"
              alt=""
              src={cedericVandenbergheDPhytVHw}
            />
            <div className="h-[100px] w-[100px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
              <img
                className="w-[120px] h-[120px] absolute !m-[0] right-[-20px] bottom-[-20px] rounded-lg"
                alt=""
                src="/star-1.svg"
              />
              <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[3.2px] bottom-[4.24px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
                Presencial
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 max-w-full text-13xl text-darkslategray">
            <div className="self-stretch flex flex-col items-start justify-start gap-px">
              <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] text-black1 z-[1] mq1050:text-7xl mq1050:leading-[19px] mq450:text-lgi mq450:leading-[14px]">
                Partida Título
              </h2>
              <b className="self-stretch relative text-xl z-[1] mq450:text-base">
                Master name
              </b>
              <div className="self-stretch flex flex-col items-start justify-start gap-[3px] text-lg">
                <div className="self-stretch relative leading-[20px] z-[1]">
                  Sistema de partida
                </div>
                <div className="self-stretch relative leading-[20px] z-[1]">
                  dd/mm/yyyy
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start py-0 px-2.5 box-border max-w-full text-base text-black">
              <div className="flex-1 relative leading-[24px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] max-w-full z-[1]">{`Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. `}</div>
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-row items-start justify-start py-0 pl-4 pr-6 mt-[-45px] text-lg text-black1">
          <div className="flex-1 rounded-xl bg-oldlace-100 flex flex-row items-start justify-start z-[3]">
            <div className="h-[30px] w-80 relative rounded-xl bg-oldlace-100 hidden" />
            <b className="flex-1 relative inline-block max-w-full z-[1]">
              Ver más detalles
            </b>
          </div>
        </div>
      </div>
    );
  }
);

export default GameCard;
