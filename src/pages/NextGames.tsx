import { FunctionComponent, memo, useCallback } from "react";
import Button from "../components/button";
import GameCard from "../components/GameCard";
import GameTypeBadge from "../components/GameTypeBadge";

export type RootType = {
  className?: string;
};

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const onButtonClick = useCallback(() => {
    // Please sync "Crear partida v1.2" to the project
  }, []);

  const onMatchTypeOptionsClick = useCallback(() => {
    // Please sync "Partidas v1.2-filtrado" to the project
  }, []);

  return (
    <div
      className={`w-[1129px] max-w-full flex flex-col items-end justify-start gap-[55px] leading-[normal] tracking-[normal] text-center text-lg text-nude font-texto mq725:gap-[27px] ${className}`}
    >
      <main className="self-stretch flex flex-row items-start justify-end py-0 pl-0 pr-[7px] box-border max-w-full">
        <section className="flex-1 flex flex-col items-start justify-start gap-9 max-w-full text-left text-lg text-nude font-texto mq725:gap-[18px]">
          <header className="self-stretch flex flex-row items-start justify-end pt-4 px-0 pb-0 sticky top-[0] z-[99] text-left text-81xl text-dark-gold font-texto">
            <h1 className="!m-[0] w-full absolute top-[0px] left-[0px] text-inherit leading-[80px] font-extrabold font-[inherit] flex items-center whitespace-nowrap h-full">
              Próximas partidas
            </h1>
            <Button
              button1="Crear nueva partida"
              button1Padding="10px 54px"
              button1Height="42px"
              button1Width="250px"
              button1Height1="22px"
              button1Width1="143px"
              button1FontSize="18px"
              button1BackgroundColor="#cd9c20"
              button1Border="none"
              button1TextDecoration="none"
              button1FontWeight="700"
              __PH1__={onButtonClick}
            />
          </header>
          <div className="self-stretch flex flex-col items-start justify-start pt-0 pb-7 pl-0 pr-0.5 box-border gap-[27px] max-w-full">
            <div className="relative leading-[26px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full text-white">
              <div className="w-[194px] h-8 relative leading-[26px] flex items-center shrink-0">
                Elije el tipo de partida :
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-[27px] max-w-full text-center text-base text-nude">
                <div className="flex flex-row items-start justify-start py-0 pl-0 pr-5 gap-2.5">
                  <div className="h-[30px] w-[66px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0">
                    <a className="ml-[-34px] [text-decoration:none] w-[135px] relative leading-[20px] text-[inherit] flex items-center justify-center shrink-0">
                      Online
                    </a>
                  </div>
                  <div
                    className="h-[30px] flex-1 [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[3px] pl-[3px] pr-0 cursor-pointer"
                    onClick={onMatchTypeOptionsClick}
                  >
                    <a className="[text-decoration:none] w-[86px] relative leading-[20px] text-[inherit] flex items-center justify-center shrink-0">
                      Presencial
                    </a>
                  </div>
                  <div className="h-[30px] w-[68px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0 text-xs">
                    <a className="ml-[-53px] [text-decoration:none] w-[175px] relative leading-[20px] text-[inherit] flex items-center justify-center shrink-0">
                      Digital
                    </a>
                  </div>
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full text-left text-lg text-white">
                  <div className="w-[541px] h-8 relative leading-[26px] flex items-center shrink-0 max-w-full">
                    Busca una partida por título de la partida o nombre del
                    Máster:
                  </div>
                  <div className="self-stretch flex flex-row items-start justify-start gap-[40.5px] max-w-full text-sm text-nude mq725:gap-5 mq1050:flex-wrap">
                    <div className="w-[733px] rounded-xl border-nude border-[1px] border-solid box-border flex flex-row items-start justify-start py-0 px-[13px] max-w-full">
                      <div className="self-stretch w-[733px] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal max-w-full" />
                      <div className="h-[50px] w-[527px] relative font-light flex items-center shrink-0 max-w-full z-[1]">
                        Escribe el título de la partida o el nombre del Máster
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start pt-1 px-0 pb-0">
                      <button className="cursor-pointer border-nude border-[1px] border-solid py-2 pl-8 pr-[31px] bg-[transparent] h-[42px] rounded-31xl box-border flex flex-row items-start justify-start">
                        <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                          <img
                            className="w-5 h-5 relative overflow-hidden shrink-0"
                            alt=""
                            src="/xcircle.svg"
                          />
                        </div>
                        <div className="flex flex-col items-start justify-start py-0 px-0">
                          <b className="ml-[-3px] w-[72px] relative text-lg flex font-texto text-nude text-center items-center justify-center">
                            Limpiar
                          </b>
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-col items-start justify-start pt-1 px-0 pb-0">
                      <button className="cursor-pointer [border:none] py-2.5 pl-10 pr-9 bg-nude self-stretch rounded-31xl flex flex-row items-start justify-start gap-[3px]">
                        <div className="flex flex-col items-start justify-start pt-px px-0 pb-0">
                          <img
                            className="w-5 h-5 relative overflow-hidden shrink-0"
                            alt=""
                            src="/search.svg"
                          />
                        </div>
                        <b className="flex-1 relative text-lg inline-block font-texto text-black text-center min-w-[54px]">
                          Buscar
                        </b>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-row items-start justify-start flex-wrap content-start gap-x-[18px] gap-y-[43px] min-h-[1003px] max-w-full text-center text-11xl text-black1">
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1.svg"
              badgeText="Presencial"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1-1.svg"
              badgeText="Online"
              propBackgroundImage="url('/frame-3@3x.png')"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1-2.svg"
              badgeText="Digital"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1-3.svg"
              badgeText="Digital"
              propBackgroundImage="url('/frame-6@3x.png')"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1-4.svg"
              badgeText="Presencial"
              propBackgroundImage="url('/frame-2@3x.png')"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
            <GameCard
              variant="detailed"
              imageUrl="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              badgeIcon="/star-1-5.svg"
              badgeText="Online"
              propBackgroundImage="url('/frame-4@3x.png')"
              buttonText="Ver detalles"
              backgroundColor="#f2ecdd"
              showDescription={true}
              description="Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem."
            />
          </div>
        </section>
      </main>
      <div className="w-[211px] flex flex-row items-start justify-start">
        <div className="h-10 flex-1 relative">
          <b className="absolute top-[0px] left-[0px] [text-decoration:underline] flex items-center justify-center w-full h-full">
            Atrás
          </b>
          <img
            className="absolute top-[12px] left-[23px] w-4 h-4 z-[1]"
            loading="lazy"
            alt=""
            src="/group-12.svg"
          />
        </div>
        <div className="h-10 flex-1 relative ml-[-45px]">
          <b className="absolute top-[0px] left-[0px] [text-decoration:underline] flex items-center justify-center w-full h-full z-[1]">
            Siguiente
          </b>
          <img
            className="absolute top-[12px] left-[104px] w-4 h-4 object-contain z-[2]"
            loading="lazy"
            alt=""
            src="/group-42@2x.png"
          />
        </div>
      </div>
    </div>
  );
});

export default Root;
