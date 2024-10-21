import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";
import Button from "./button";

export type GroupComponent2Type = {
  className?: string;
  cedericVandenbergheDPhytVHw?: string;
  star1?: string;
  presencial?: string;
  button1?: string;
  button1Padding?: string;
  button1Height?: string;
  button1Width?: string;
  button1Height1?: string;
  button1Width1?: string;
  button1FontSize?: string;
  button1BackgroundColor?: string;
  button1Border?: string;
  button1TextDecoration?: string;
  button1FontWeight?: string;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const GroupComponent2: FunctionComponent<GroupComponent2Type> = memo(
  ({
    className = "",
    cedericVandenbergheDPhytVHw,
    star1,
    presencial,
    propBackgroundImage,
    button1,
    button1Padding,
    button1Height,
    button1Width,
    button1Height1,
    button1Width1,
    button1FontSize,
    button1BackgroundColor,
    button1Border,
    button1TextDecoration,
    button1FontWeight,
  }) => {
    const frameDivStyle: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage,
      };
    }, [propBackgroundImage]);

    return (
      <div
        className={`w-[360px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold flex flex-col items-start justify-start pt-0 px-0 pb-[15px] box-border gap-3.5 min-w-[342px] max-w-full text-center text-base text-black font-texto ${className}`}
      >
        <div className="self-stretch h-[480px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold hidden" />
        <div
          className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-[7px] px-6 pb-[133px] box-border bg-[url('/public/frame-1@3x.png')] bg-cover bg-no-repeat bg-[top] max-w-full z-[1]"
          style={frameDivStyle}
        >
          <img
            className="h-60 w-[360px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
            alt=""
            src={cedericVandenbergheDPhytVHw}
          />
          <div className="h-[100px] w-[100px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
            <img
              className="w-[120px] h-[120px] absolute !m-[0] right-[-20px] bottom-[-20px] rounded-lg"
              loading="lazy"
              alt=""
              src={star1}
            />
            <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[3.2px] bottom-[4.24px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
              {presencial}
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start max-w-full text-lg text-darkslategray">
          <h2 className="m-0 self-stretch relative text-11xl font-extrabold font-[inherit] text-black1 z-[1] mq450:text-lg mq450:leading-[14px] mq1000:text-5xl mq1000:leading-[19px]">
            Partida Título
          </h2>
          <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[3px] text-xl">
            <b className="self-stretch relative z-[1] mq450:text-base">
              Master name
            </b>
            <div className="self-stretch relative text-lg leading-[20px] z-[1]">
              Sistema de partida
            </div>
          </div>
          <div className="self-stretch relative leading-[20px] z-[1]">
            Fecha
          </div>
          <div className="self-stretch flex flex-row items-start justify-start pt-0 px-2.5 pb-[9px] box-border max-w-full text-black">
            <div className="flex-1 relative leading-[25px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] max-w-full z-[1]">{`Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. `}</div>
          </div>
          <div className="flex flex-row items-start justify-start py-0 px-5">
            <Button
              button1={button1}
              button1Padding={button1Padding}
              button1Height={button1Height}
              button1Width={button1Width}
              button1Height1={button1Height1}
              button1Width1={button1Width1}
              button1FontSize={button1FontSize}
              button1BackgroundColor={button1BackgroundColor}
              button1Border={button1Border}
              button1TextDecoration={button1TextDecoration}
              button1FontWeight={button1FontWeight}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default GroupComponent2;
