import { FunctionComponent, memo, useCallback } from "react";

export type PreviewTitleType = {
  className?: string;
  vector?: string;
  styleIcon?: string;
  styleLabel?: string;
  dateDetails?: string;
  vector1?: string;
};

const PreviewTitle: FunctionComponent<PreviewTitleType> = memo(
  ({ className = "", vector, styleIcon, styleLabel, dateDetails, vector1 }) => {
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
        const siblingContainerAccItem = accItem?.hasAttribute(
          "data-acc-original"
        )
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
        const closeClasses = [
          "pt-0",
          "pb-0",
          "mb-0",
          "mt-0",
          "grid-rows-[0fr]",
        ];

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

    return (
      <div
        className={`w-[198px] h-[102px] flex flex-col items-start justify-start gap-px [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] cursor-pointer text-center text-lg text-black font-texto-2 ${className}`}
        data-acc-item
        data-acc-open
        data-acc-header
        data-acc-original
        data-acc-default-open
        onClick={onAccordionHeaderClick}
      >
        <b className="w-[199px] h-[23px] relative flex items-end justify-center shrink-0 z-[3]">
          Título de partida
        </b>
        <div
          className="w-[198px] grid grid-rows-[1fr] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] text-sm accordion__open:grid-rows-[1fr] accordion__close:grid-rows-[0fr]"
          data-acc-content
        >
          <div className="w-[198px] [transition-property:all] ease-[cubic-bezier(0.4,_0,_0.2,_1)] duration-[150ms] overflow-hidden">
            <div className="w-[198px] h-[78px] flex flex-col items-start justify-start gap-[9px]">
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
      </div>
    );
  }
);

export default PreviewTitle;
