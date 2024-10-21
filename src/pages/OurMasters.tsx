import { FunctionComponent } from "react";
import FrameComponent7 from "../components/frame-component7";
import MasterList from "../components/master-list";

const Root: FunctionComponent = () => {
  return (
    <div className="w-full relative bg-black flex flex-col items-start justify-start pt-[7.75rem] pb-[5.562rem] pl-[4.937rem] pr-[4.5rem] box-border gap-[0.875rem] leading-[normal] tracking-[normal] text-left text-[1.125rem] text-white font-titulo-2 mq750:pl-[2.438rem] mq750:pr-[2.25rem] mq750:box-border">
      <div className="w-[80rem] h-[134.438rem] relative bg-black hidden max-w-full" />
      <section className="self-stretch flex flex-row items-start justify-start pt-[0rem] pb-[0.187rem] pl-[0.062rem] pr-[0.437rem] box-border max-w-full text-left text-[6.25rem] text-dark-gold font-titulo-2">
        <h1 className="m-0 h-[9rem] flex-1 relative text-inherit leading-[5rem] flex items-center max-w-full z-[1] font-[inherit] mq450:text-[1.875rem] mq450:leading-[2rem] mq750:text-[3.125rem] mq750:leading-[3rem]">
          <span>
            <p className="m-0 font-extrabold">{`Conoce a `}</p>
            <p className="m-0">
              <i className="font-extrabold">nuestros</i>
              <span className="font-extrabold font-titulo-2"> Masters</span>
            </p>
          </span>
        </h1>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.25rem] pr-[0.5rem] box-border min-h-[7.125rem] max-w-full text-left text-[1.125rem] text-nude font-titulo-2">
        <div className="flex-1 relative leading-[1.625rem] inline-block max-w-full z-[1]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </div>
      </section>
      <div className="w-[45.313rem] flex flex-row items-start justify-start pt-[0rem] px-[0.062rem] pb-[2.5rem] box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
          <div className="w-[12.125rem] relative leading-[1.625rem] flex items-center z-[1]">
            Elije el tipo de partida :
          </div>
          <div className="self-stretch flex flex-row items-start justify-start gap-[0.812rem] text-center text-[1rem] text-nude mq750:flex-wrap">
            <div className="flex-[0.8333] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] pl-[1.062rem] pr-[0.875rem] min-w-[6.813rem] min-h-[1.875rem] z-[1] mq450:flex-1">
              <div className="flex-1 relative leading-[1.25rem]">{`Dungeons& dragons`}</div>
            </div>
            <div className="h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] pl-[0.187rem] pr-[0rem] z-[1]">
              <div className="w-[5.375rem] relative leading-[1.25rem] flex items-center justify-center shrink-0">
                Chuthulu
              </div>
            </div>
            <div className="flex-1 [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] px-[0.125rem] min-w-[7.25rem] min-h-[1.875rem] z-[1] text-[0.75rem]">
              <div className="flex-1 relative leading-[1.25rem]">
                Vampiro la mascarada
              </div>
            </div>
            <div className="h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] pl-[0.562rem] pr-[0.375rem] z-[1]">
              <div className="flex-1 relative leading-[1.25rem] inline-block min-w-[5.375rem]">
                Hombre lobo
              </div>
            </div>
            <div className="h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] px-[0.5rem] z-[1] text-[0.75rem]">
              <div className="w-[2.813rem] relative leading-[1.25rem] flex items-center justify-center shrink-0">
                Z-Corp
              </div>
            </div>
            <div className="h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl bg-light-gold border-light-gold border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] px-[0.562rem] z-[1] text-[0.75rem] text-black1">
              <div className="w-[2.188rem] relative leading-[1.25rem] flex items-center justify-center shrink-0">
                FATE
              </div>
            </div>
          </div>
        </div>
      </div>
      <FrameComponent7 />
      <MasterList />
      <footer className="self-stretch flex flex-row items-start justify-end text-center text-[1.125rem] text-nude font-titulo-2">
        <div className="w-[13.188rem] flex flex-row items-start justify-start">
          <div className="h-[2.5rem] flex-1 relative">
            <b className="absolute top-[0rem] left-[0rem] [text-decoration:underline] flex items-center justify-center w-full h-full z-[1]">
              Atrás
            </b>
            <img
              className="absolute top-[0.75rem] left-[1.438rem] w-[1rem] h-[1rem] z-[1]"
              loading="lazy"
              alt=""
              src="/group-12.svg"
            />
          </div>
          <div className="h-[2.5rem] flex-1 relative ml-[-2.813rem]">
            <b className="absolute top-[0rem] left-[0rem] [text-decoration:underline] flex items-center justify-center w-full h-full z-[1]">
              Siguiente
            </b>
            <img
              className="absolute top-[0.75rem] left-[6.5rem] w-[1rem] h-[1rem] object-contain z-[1]"
              loading="lazy"
              alt=""
              src="/group-42@2x.png"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Root;
