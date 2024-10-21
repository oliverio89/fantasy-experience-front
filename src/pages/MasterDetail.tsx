import { FunctionComponent, memo, useCallback } from "react";
import PreviewTitle from "../components/preview-title";
import BioInfo from "../components/bio-info";
import { useNavigate } from "react-router-dom";
import GroupComponent1 from "../components/group-component1";

export type RootType = {
  className?: string;
};

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const navigate = useNavigate();

  const onAccordionHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.target as HTMLElement;

      const accItem: HTMLElement =
        element.closest("[data-acc-item]") || element;
      const accContent = accItem.querySelector(
        "[data-acc-content]"
      ) as HTMLElement;
      const isOpen = accItem.hasAttribute("data-acc-open");
      const nextOuterSibling =
        accItem?.nextElementSibling ||
        (accItem?.parentElement?.nextElementSibling as HTMLElement);
      const prevOuterSibling =
        accItem?.previousElementSibling ||
        (accItem?.parentElement?.previousElementSibling as HTMLElement);
      const siblingContainerAccItem = accItem?.hasAttribute("data-acc-original")
        ? accItem?.nextElementSibling ||
          nextOuterSibling?.querySelector("[data-acc-item]") ||
          nextOuterSibling
        : accItem?.previousElementSibling ||
          prevOuterSibling?.querySelector("[data-acc-item]") ||
          prevOuterSibling;
      const siblingAccItem =
        (siblingContainerAccItem?.querySelector(
          "[data-acc-item]"
        ) as HTMLElement) || siblingContainerAccItem;

      if (!siblingAccItem) return;
      const originalDisplay = "flex";
      const siblingDisplay = "flex";

      const openClasses = ["grid-rows-[1fr]"];
      const closeClasses = ["pt-0", "pb-0", "mb-0", "mt-0", "grid-rows-[0fr]"];

      if (isOpen) {
        accContent?.classList.remove(...openClasses);
        accContent?.classList.add(...closeClasses);

        setTimeout(() => {
          if (accItem) {
            accItem.style.display = "none";
            siblingAccItem.style.display = siblingDisplay;
          }
        }, 100);
      } else {
        if (accItem) {
          accItem.style.display = "none";
          siblingAccItem.style.display = originalDisplay;
        }
        const siblingAccContent = siblingAccItem?.querySelector(
          "[data-acc-content]"
        ) as HTMLElement;
        setTimeout(() => {
          siblingAccContent?.classList.remove(...closeClasses);
          siblingAccContent?.classList.add(...openClasses);
        }, 1);
      }
    },
    []
  );

  const onGroupContainerClick = useCallback(() => {
    navigate("/partidasdetalles-v12");
  }, [navigate]);

  return (
    <div
      className={`w-[1120px] max-w-full flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-center text-5xl text-nude font-texto-2 mq700:gap-5 mq900:flex-wrap ${className}`}
    >
      <div className="flex flex-col items-start justify-start gap-9 max-w-full mq450:gap-[18px] mq450:min-w-full mq900:flex-1">
        <img
          className="self-stretch h-[347px] relative rounded-xl max-w-full overflow-hidden shrink-0 object-cover"
          loading="lazy"
          alt=""
          src="/konradkollerlctjo2d9-2cunsplash-2@2x.png"
        />
        <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-4 px-0 pb-[30px] box-border gap-[26.7px] max-w-full mq450:pt-5 mq450:pb-5 mq450:box-border">
          <div className="self-stretch h-[376px] relative rounded-xl bg-darkslategray hidden" />
          <h2 className="m-0 self-stretch relative text-15xl font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
            Sobre el Máster
          </h2>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-light-gold">
            <b className="self-stretch relative z-[1] mq450:text-lgi">
              Sistemas preferidos
            </b>
            <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
              Menciona tus sistemas preferidos
            </div>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-1.5 text-light-gold">
            <b className="self-stretch relative z-[1] mq450:text-lgi mq450:leading-[18px]">
              Preferencia de partidas
            </b>
            <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
              Menciona tus partidas preferidas
            </div>
          </div>
          <div className="self-stretch flex flex-col items-end justify-start gap-[10.5px] max-w-full">
            <b className="self-stretch relative text-light-gold z-[1] mq450:text-lgi">
              Tags:
            </b>
            <div className="self-stretch flex flex-row items-start justify-end py-0 px-[67px] text-base mq450:pl-5 mq450:pr-5 mq450:box-border">
              <div className="flex-1 flex flex-row items-start justify-start gap-2.5">
                <div className="h-[30px] flex-1 [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                  <div className="ml-[-1px] flex-1 relative leading-[20px] shrink-0">{`Dungeons& dragons`}</div>
                </div>
                <div className="h-[30px] w-[71px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                  <div className="ml-[-7px] w-[86px] relative leading-[20px] flex items-center justify-center shrink-0">
                    Chuthulu
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-start justify-end py-0 px-[94px] box-border max-w-full text-xs mq450:pl-5 mq450:pr-5 mq450:box-border">
              <div className="h-[30px] w-[139px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                <div className="ml-[-17.5px] w-[175px] relative leading-[20px] flex items-center justify-center shrink-0">
                  Vampiro la mascarada
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-6 px-0 pb-[30px] gap-[27px] text-15xl mq700:pt-5 mq700:pb-5 mq700:box-border">
          <div className="self-stretch h-[536px] relative rounded-xl bg-darkslategray hidden" />
          <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
            Partidas jugadas
          </h2>
          <div className="self-stretch flex flex-row items-start justify-start py-0 px-5 text-lg text-black">
            <div className="self-stretch flex-1 flex flex-col items-start justify-start pt-[7px] pb-[11px] pl-[109px] pr-0 relative mq450:pl-5 mq450:box-border">
              <div className="w-full !m-[0] absolute top-[0px] right-[0px] left-[0px] rounded-xl bg-nude flex flex-row items-start justify-start z-[1]">
                <div className="self-stretch w-[307px] relative rounded-xl bg-nude hidden" />
                <img
                  className="h-[120px] w-[109px] relative rounded-tl-xl rounded-tr-none rounded-br-none rounded-bl-xl object-cover z-[2]"
                  loading="lazy"
                  alt=""
                  src="/2hmediaz9jv6wrkrpaunsplash-2@2x.png"
                />
              </div>
              <div className="w-full !m-[0] absolute right-[0px] bottom-[145px] left-[0px] rounded-xl bg-nude flex flex-row items-start justify-start z-[1]">
                <div className="self-stretch w-[307px] relative rounded-xl bg-nude hidden" />
                <img
                  className="h-[120px] w-[109px] relative rounded-tl-xl rounded-tr-none rounded-br-none rounded-bl-xl object-cover z-[2]"
                  loading="lazy"
                  alt=""
                  src="/2hmediaz9jv6wrkrpaunsplash-3@2x.png"
                />
              </div>
              <div className="w-full !m-[0] absolute right-[0px] bottom-[0px] left-[0px] rounded-xl bg-nude flex flex-row items-start justify-start z-[1]">
                <div className="self-stretch w-[307px] relative rounded-xl bg-nude hidden" />
                <img
                  className="h-[120px] w-[109px] relative rounded-tl-xl rounded-tr-none rounded-br-none rounded-bl-xl object-cover z-[2]"
                  loading="lazy"
                  alt=""
                  src="/2hmediaz9jv6wrkrpaunsplash-4@2x.png"
                />
              </div>
              <div
                className="self-stretch flex-1 flex flex-col items-start justify-start gap-[44.5px]"
                data-acc-group
              >
                <PreviewTitle
                  vector="/vector.svg"
                  styleIcon="/vector-1.svg"
                  styleLabel="/vector-2.svg"
                  dateDetails="/vector-3.svg"
                  vector1="/vector-4.svg"
                />
                <div
                  className="w-[198px] h-[102px] hidden flex-col items-start justify-start gap-px [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                  data-acc-item
                  data-acc-header
                  onClick={onAccordionHeaderClick}
                >
                  <b className="w-[199px] h-[23px] relative flex items-end justify-center shrink-0 z-[3]">
                    Título de partida
                  </b>
                  <div
                    className="w-[198px] grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-sm accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                    data-acc-content
                  >
                    <div className="w-[198px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                      <div className="w-[198px] h-[78px] hidden flex-col items-start justify-start gap-[9px]">
                        <div className="h-[18px] flex flex-row items-start justify-start py-0 pl-[51px] pr-[52px] box-border">
                          <div className="h-[18px] w-[95px] flex flex-row items-start justify-start gap-[6.5px]">
                            <div className="h-[18px] w-3.5 flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                              <img
                                className="w-3.5 h-4 relative z-[2]"
                                loading="lazy"
                                alt=""
                                src="/vector.svg"
                              />
                            </div>
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-1.svg"
                            />
                            <img
                              className="h-4 w-[13px] relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-2.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-3.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-4.svg"
                            />
                          </div>
                        </div>
                        <div className="w-[198px] h-[51px] flex flex-col items-start justify-start">
                          <div className="w-[199px] h-4 relative font-medium flex items-center justify-center shrink-0 z-[3]">
                            Tipo de partida
                          </div>
                          <i className="w-[199px] h-[18px] relative flex items-center justify-center shrink-0 z-[4]">
                            Estilo de juego
                          </i>
                          <div className="w-[199px] h-[17px] relative flex items-center justify-center shrink-0 z-[5]">
                            dd/mm/yyyy
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative text-[transparent] hidden" />
                  <div className="absolute w-0 h-0" />
                </div>
                <PreviewTitle
                  vector="/vector-5.svg"
                  styleIcon="/vector-6.svg"
                  styleLabel="/vector-7.svg"
                  dateDetails="/vector-8.svg"
                  vector1="/vector-9.svg"
                />
                <div
                  className="w-[198px] h-[102px] hidden flex-col items-start justify-start gap-px [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                  data-acc-item
                  data-acc-header
                  onClick={onAccordionHeaderClick}
                >
                  <b className="w-[199px] h-[23px] relative flex items-end justify-center shrink-0 z-[3]">
                    Título de partida
                  </b>
                  <div
                    className="w-[198px] grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-sm accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                    data-acc-content
                  >
                    <div className="w-[198px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                      <div className="w-[198px] h-[78px] hidden flex-col items-start justify-start gap-[9px]">
                        <div className="h-[18px] flex flex-row items-start justify-start py-0 pl-[51px] pr-[52px] box-border">
                          <div className="h-[18px] w-[95px] flex flex-row items-start justify-start gap-[6.5px]">
                            <div className="h-[18px] w-3.5 flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                              <img
                                className="w-3.5 h-4 relative z-[2]"
                                loading="lazy"
                                alt=""
                                src="/vector.svg"
                              />
                            </div>
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-1.svg"
                            />
                            <img
                              className="h-4 w-[13px] relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-2.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-3.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-4.svg"
                            />
                          </div>
                        </div>
                        <div className="w-[198px] h-[51px] flex flex-col items-start justify-start">
                          <div className="w-[199px] h-4 relative font-medium flex items-center justify-center shrink-0 z-[3]">
                            Tipo de partida
                          </div>
                          <i className="w-[199px] h-[18px] relative flex items-center justify-center shrink-0 z-[4]">
                            Estilo de juego
                          </i>
                          <div className="w-[199px] h-[17px] relative flex items-center justify-center shrink-0 z-[5]">
                            dd/mm/yyyy
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative text-[transparent] hidden" />
                  <div className="absolute w-0 h-0" />
                </div>
                <PreviewTitle
                  vector="/vector-10.svg"
                  styleIcon="/vector-11.svg"
                  styleLabel="/vector-12.svg"
                  dateDetails="/vector-13.svg"
                  vector1="/vector-14.svg"
                />
                <div
                  className="w-[198px] h-[102px] hidden flex-col items-start justify-start gap-px [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer"
                  data-acc-item
                  data-acc-header
                  onClick={onAccordionHeaderClick}
                >
                  <b className="w-[199px] h-[23px] relative flex items-end justify-center shrink-0 z-[3]">
                    Título de partida
                  </b>
                  <div
                    className="w-[198px] grid grid-rows-[0fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-sm accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
                    data-acc-content
                  >
                    <div className="w-[198px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
                      <div className="w-[198px] h-[78px] hidden flex-col items-start justify-start gap-[9px]">
                        <div className="h-[18px] flex flex-row items-start justify-start py-0 pl-[51px] pr-[52px] box-border">
                          <div className="h-[18px] w-[95px] flex flex-row items-start justify-start gap-[6.5px]">
                            <div className="h-[18px] w-3.5 flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
                              <img
                                className="w-3.5 h-4 relative z-[2]"
                                loading="lazy"
                                alt=""
                                src="/vector.svg"
                              />
                            </div>
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-1.svg"
                            />
                            <img
                              className="h-4 w-[13px] relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-2.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-3.svg"
                            />
                            <img
                              className="h-4 w-3.5 relative z-[2]"
                              loading="lazy"
                              alt=""
                              src="/vector-4.svg"
                            />
                          </div>
                        </div>
                        <div className="w-[198px] h-[51px] flex flex-col items-start justify-start">
                          <div className="w-[199px] h-4 relative font-medium flex items-center justify-center shrink-0 z-[3]">
                            Tipo de partida
                          </div>
                          <i className="w-[199px] h-[18px] relative flex items-center justify-center shrink-0 z-[4]">
                            Estilo de juego
                          </i>
                          <div className="w-[199px] h-[17px] relative flex items-center justify-center shrink-0 z-[5]">
                            dd/mm/yyyy
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative text-[transparent] hidden" />
                  <div className="absolute w-0 h-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="flex-1 flex flex-col items-start justify-start gap-[35.7px] min-w-[476px] max-w-full text-center text-21xl text-dark-gold font-texto-2 mq700:min-w-full mq900:gap-[18px]">
        <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-end justify-start pt-3.5 px-0 pb-[34.3px] gap-0.5">
          <div className="self-stretch h-[180px] relative rounded-xl bg-darkslategray hidden" />
          <h1 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-5xl mq900:text-13xl">
            Nombre del Máster
          </h1>
          <div className="self-stretch h-10 relative text-xl font-medium text-nude flex items-center justify-center shrink-0 z-[1] mq450:text-base">
            Valoración
          </div>
          <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5">
            <div className="flex flex-row items-start justify-start gap-[18px]">
              <img
                className="h-[40.7px] w-10 relative z-[1]"
                loading="lazy"
                alt=""
                src="/vector-15.svg"
              />
              <img
                className="h-[40.7px] w-10 relative z-[1]"
                loading="lazy"
                alt=""
                src="/vector-16.svg"
              />
              <img
                className="h-[40.7px] w-10 relative z-[1]"
                loading="lazy"
                alt=""
                src="/vector-17.svg"
              />
              <img
                className="h-[40.7px] w-10 relative z-[1]"
                loading="lazy"
                alt=""
                src="/vector-18.svg"
              />
              <img
                className="h-[40.7px] w-10 relative z-[1]"
                loading="lazy"
                alt=""
                src="/vector-19.svg"
              />
            </div>
          </div>
        </div>
        <BioInfo
          bio="Bio"
          loremIpsumDolorSitAmetConsect="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure  Duis aute irure ."
        />
        <BioInfo
          bio="Estilo de juego"
          loremIpsumDolorSitAmetConsect="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          propGap="14px"
          propHeight="234px"
          propMinHeight="unset"
        />
        <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-6 px-0 pb-[30px] box-border gap-[27px] max-w-full text-15xl text-nude mq700:pt-5 mq700:pb-5 mq700:box-border">
          <div className="self-stretch h-[536px] relative rounded-xl bg-darkslategray hidden" />
          <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
            Próximas partidas
          </h2>
          <div className="self-stretch flex flex-row items-start justify-start py-0 pl-[23px] pr-[25px] box-border max-w-full">
            <div className="flex-1 flex flex-row items-start justify-center gap-[37px] max-w-full mq700:gap-[18px] mq700:flex-wrap">
              <div
                className="flex-1 flex flex-row items-start justify-start min-w-[211px] max-w-full cursor-pointer z-[1]"
                onClick={onGroupContainerClick}
              >
                <GroupComponent1
                  cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
                  gameRating="/star-1.svg"
                  button1="Ver detalles"
                  button1Padding="6px 109.9px 6.1px 110px"
                  button1Height="34.1px"
                  button1Width="304.9px"
                  button1Height1="22px"
                  button1Width1="86px"
                  button1FontSize="18px"
                  button1BackgroundColor="#f2ecdd"
                />
              </div>
              <GroupComponent1
                cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
                gameRating="/star-1-1.svg"
                propMinWidth="211px"
                propBackgroundImage="url('/frame-2@3x.png')"
                button1="Ver detalles"
                button1Padding="6px 109.9px 6.1px 110px"
                button1Height="34.1px"
                button1Width="304.9px"
                button1Height1="22px"
                button1Width1="86px"
                button1FontSize="18px"
                button1BackgroundColor="#f2ecdd"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default Root;
