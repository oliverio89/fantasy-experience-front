import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";
import Button from "./button";

export type GroupComponent1Type = {
  className?: string;
  cedericVandenbergheDPhytVHw?: string;
  gameRating?: string;
  button1?: string;
  button1Padding?: string;
  button1Height?: string;
  button1Width?: string;
  button1Height1?: string;
  button1Width1?: string;
  button1FontSize?: string;
  button1BackgroundColor?: string;

  /** Style props */
  propMinWidth?: CSSProperties["minWidth"];
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const GroupComponent1: FunctionComponent<GroupComponent1Type> = memo(
  ({
    className = "",
    cedericVandenbergheDPhytVHw,
    gameRating,
    propMinWidth,
    propBackgroundImage,
    button1,
    button1Padding,
    button1Height,
    button1Width,
    button1Height1,
    button1Width1,
    button1FontSize,
    button1BackgroundColor,
  }) => {
    const groupDivStyle: CSSProperties = useMemo(() => {
      return {
        minWidth: propMinWidth,
      };
    }, [propMinWidth]);

    const gameHeaderStyle: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage,
      };
    }, [propBackgroundImage]);

    return (
      <div
        className={`flex-1 shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold flex flex-col items-start justify-start pt-0 px-0 pb-[18.2px] box-border gap-[18.9px] max-w-full text-center text-base text-black font-texto-2 ${className}`}
        style={groupDivStyle}
      >
        <div className="self-stretch h-[413px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold hidden" />
        <div
          className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-1.5 px-[21px] pb-[97.1px] box-border bg-[url('/public/game-header@3x.png')] bg-cover bg-no-repeat bg-[top] max-w-full z-[1]"
          style={gameHeaderStyle}
        >
          <img
            className="h-[189.1px] w-[324px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
            alt=""
            src={cedericVandenbergheDPhytVHw}
          />
          <div className="h-[86px] w-[90px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
            <img
              className="w-[120px] h-[120px] absolute !m-[0] right-[-30px] bottom-[-34px] rounded-lg"
              loading="lazy"
              alt=""
              src={gameRating}
            />
            <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[-6.8px] bottom-[-9.76px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
              Presencial
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start gap-[46.6px] text-11xl text-darkslategray mq450:gap-[23px]">
          <div className="self-stretch flex flex-col items-start justify-start gap-[6.8px]">
            <h2 className="m-0 self-stretch h-[20.6px] relative text-inherit font-extrabold font-[inherit] text-black1 flex items-center justify-center shrink-0 z-[1] mq450:text-lg mq900:text-5xl">
              Partida Título
            </h2>
            <b className="self-stretch relative text-xl z-[1] mq450:text-base">
              Master name
            </b>
            <div className="self-stretch flex flex-col items-start justify-start gap-[10.1px] text-lg">
              <div className="self-stretch relative leading-[20px] z-[1]">
                Sistema de partida
              </div>
              <div className="self-stretch relative leading-[20px] z-[1]">
                Fecha
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-row items-start justify-start py-0 pl-[7px] pr-[11px]">
            <Button
              button1={button1}
              button1Padding={button1Padding}
              button1Height={button1Height}
              button1Width={button1Width}
              button1Height1={button1Height1}
              button1Width1={button1Width1}
              button1FontSize={button1FontSize}
              button1BackgroundColor={button1BackgroundColor}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default GroupComponent1;
