import { FunctionComponent, memo } from "react";

export type FrameComponent7Type = {
  className?: string;
};

const FrameComponent7: FunctionComponent<FrameComponent7Type> = memo(
  ({ className = "" }) => {
    return (
      <section
        className={`self-stretch flex flex-row items-start justify-start pt-[0rem] pb-[4rem] pl-[0.062rem] pr-[0.5rem] box-border max-w-full text-left text-[1.125rem] text-white font-titulo-2 ${className}`}
      >
        <div className="flex-1 flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
          <div className="w-[33.813rem] relative leading-[1.625rem] flex items-center max-w-full z-[1]">
            Busca una partida por título de la partida o nombre del Máster:
          </div>
          <div className="self-stretch flex flex-row items-start justify-start gap-[2.531rem] max-w-full text-[0.875rem] text-nude mq750:gap-[1.25rem] mq1225:flex-wrap">
            <div className="w-[45.813rem] rounded-xl border-nude border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] px-[0.812rem] max-w-full z-[1]">
              <div className="self-stretch w-[45.813rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal max-w-full" />
              <div className="h-[3.125rem] w-[32.938rem] relative font-light flex items-center shrink-0 max-w-full z-[2]">
                Escribe el título de la partida o el nombre del Máster
              </div>
            </div>
            <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
              <button className="cursor-pointer border-nude border-[1px] border-solid py-[0.5rem] pl-[2rem] pr-[1.937rem] bg-[transparent] h-[2.625rem] rounded-31xl box-border flex flex-row items-start justify-start z-[1]">
                <div className="flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem]">
                  <img
                    className="w-[1.25rem] h-[1.25rem] relative overflow-hidden shrink-0"
                    alt=""
                    src="/xcircle.svg"
                  />
                </div>
                <div className="flex flex-col items-start justify-start py-[0rem] px-[0rem]">
                  <b className="ml-[-0.188rem] w-[4.5rem] relative text-[1.125rem] flex font-titulo-2 text-nude text-center items-center justify-center">
                    Limpiar
                  </b>
                </div>
              </button>
            </div>
            <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
              <button className="cursor-pointer [border:none] py-[0.625rem] pl-[2.5rem] pr-[2.25rem] bg-nude self-stretch rounded-31xl flex flex-row items-start justify-start gap-[0.187rem] z-[1]">
                <div className="flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem]">
                  <img
                    className="w-[1.25rem] h-[1.25rem] relative overflow-hidden shrink-0"
                    alt=""
                    src="/search.svg"
                  />
                </div>
                <b className="flex-1 relative text-[1.125rem] inline-block font-titulo-2 text-black text-center min-w-[3.375rem]">
                  Buscar
                </b>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default FrameComponent7;
