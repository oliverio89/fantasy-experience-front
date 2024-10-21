import { FunctionComponent, memo, useCallback } from "react";
import Button from "./button";

export type GroupComponent4Type = {
  className?: string;
  ellipse4?: string;
  group29?: string;
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
};

const GroupComponent4: FunctionComponent<GroupComponent4Type> = memo(
  ({
    className = "",
    ellipse4,
    group29,
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
    const onGroupContainerClick = useCallback(() => {
      // Please sync "Master-detalles v1.2" to the project
    }, []);

    return (
      <div
        className={`w-[22.563rem] flex flex-row items-start justify-start max-w-full cursor-pointer z-[1] text-center text-[1.25rem] text-nude font-titulo-2 ${className}`}
        onClick={onGroupContainerClick}
      >
        <div className="flex-1 shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black1 border-dark-gold border-[4px] border-solid box-border flex flex-col items-end justify-start pt-[1.625rem] px-[0rem] pb-[0.937rem] gap-[0.812rem] max-w-full mq450:pt-[1.25rem] mq450:box-border">
          <div className="self-stretch h-[23.75rem] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-black1 border-dark-gold border-[4px] border-solid box-border hidden" />
          <h2 className="m-0 self-stretch h-[1.125rem] relative text-[2.125rem] font-extrabold font-[inherit] text-dark-gold flex items-center justify-center shrink-0 z-[1] mq450:text-[1.25rem] mq750:text-[1.688rem]">
            Master name
          </h2>
          <div className="self-stretch flex flex-row items-start justify-center py-[0rem] pl-[1.312rem] pr-[1.25rem]">
            <img
              className="h-[8.75rem] w-[8.75rem] relative rounded-[50%] object-cover z-[1]"
              loading="lazy"
              alt=""
              src={ellipse4}
            />
          </div>
          <div className="self-stretch flex flex-row items-start justify-center py-[0rem] pl-[1.312rem] pr-[1.25rem]">
            <img
              className="h-[1.625rem] w-[11.619rem] relative z-[1]"
              loading="lazy"
              alt=""
              src={group29}
            />
          </div>
          <b className="self-stretch relative z-[1] mq450:text-[1rem]">
            Preferencia de partida del máster
          </b>
          <div className="self-stretch flex flex-row items-start justify-end pt-[0rem] pb-[0.312rem] pl-[0rem] pr-[0.062rem] box-border max-w-full">
            <div className="flex-1 relative inline-block max-w-full z-[1] mq450:text-[1rem]">
              Sistema de partida seleccionada
            </div>
          </div>
          <div className="flex flex-row items-start justify-end py-[0rem] pl-[1.75rem] pr-[1.437rem]">
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

export default GroupComponent4;
