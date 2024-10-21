import {
    FunctionComponent,
    memo,
    useMemo,
    type CSSProperties,
    useCallback,
  } from "react";
  import Button from "./button";
  
  export type GroupComponentType = {
    className?: string;
    cedericVandenbergheDPhytVHw?: string;
    matchImportance?: string;
    button1?: string;
    button1Padding?: string;
    button1Height?: string;
    button1Width?: string;
    button1Height1?: string;
    button1Width1?: string;
    button1FontSize?: string;
    button1BackgroundColor?: string;
  
    /** Style props */
    propLeft?: CSSProperties["left"];
    propBackgroundImage?: CSSProperties["backgroundImage"];
  };
  
  const GroupComponent: FunctionComponent<GroupComponentType> = memo(
    ({
      className = "",
      cedericVandenbergheDPhytVHw,
      matchImportance,
      propLeft,
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
          left: propLeft,
        };
      }, [propLeft]);
  
      const matchHeaderStyle: CSSProperties = useMemo(() => {
        return {
          backgroundImage: propBackgroundImage,
        };
      }, [propBackgroundImage]);
  
      const onGroupContainerClick = useCallback(() => {
        // Please sync "Partidas v1.2" to the project
      }, []);
  
      return (
        <div
          className={`absolute top-[93px] left-[391px] w-[340px] flex flex-row items-start justify-start max-w-full cursor-pointer z-[1] text-center text-base text-black font-titulo-2 ${className}`}
          onClick={onGroupContainerClick}
          style={groupDivStyle}
        >
          <div className="flex-1 shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold flex flex-col items-start justify-start pt-0 px-0 pb-[18.2px] box-border gap-[18.9px] max-w-full">
            <div className="self-stretch h-[413px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold hidden" />
            <div
              className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-1.5 px-[22px] pb-[97.1px] box-border bg-[url('/public/match-header@3x.png')] bg-cover bg-no-repeat bg-[top] max-w-full z-[1]"
              style={matchHeaderStyle}
            >
              <img
                className="h-[189.1px] w-[340px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
                alt=""
                src={cedericVandenbergheDPhytVHw}
              />
              <div className="h-[86px] w-[94.4px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
                <img
                  className="w-[120px] h-[120px] absolute !m-[0] right-[-25.6px] bottom-[-34px] rounded-lg"
                  loading="lazy"
                  alt=""
                  src={matchImportance}
                />
                <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[-2.4px] bottom-[-9.76px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
                  Presencial
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[46.6px] text-11xl text-black1">
              <div className="self-stretch flex flex-col items-start justify-start gap-[6.9px]">
                <h2 className="m-0 self-stretch h-[20.6px] relative text-inherit font-extrabold font-[inherit] flex items-center justify-center shrink-0 z-[1] mq450:text-lg mq925:text-5xl">
                  Partida Título
                </h2>
                <div className="self-stretch flex flex-col items-start justify-start gap-[3.3px] text-xl text-darkslategray">
                  <b className="self-stretch relative z-[1] mq450:text-base">
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
              </div>
              <div className="self-stretch flex flex-row items-start justify-start py-0 pl-2 pr-3">
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
        </div>
      );
    }
  );
  
  export default GroupComponent;
  