import { FunctionComponent, memo } from "react";

export type PartidaDetailsType = {
  className?: string;
};

const PartidaDetails: FunctionComponent<PartidaDetailsType> = memo(
  ({ className = "" }) => {
    return (
      <div
        className={`self-stretch flex flex-row items-start justify-start gap-[2.5rem] max-w-full text-center text-[2.5rem] text-dark-gold font-titulo-2 mq750:gap-[1.25rem] mq1050:flex-wrap ${className}`}
      >
        <img
          className="w-[21.688rem] relative rounded-xl max-h-full object-cover max-w-full z-[1] mq1050:flex-1"
          loading="lazy"
          alt=""
          src="/konradkollerlctjo2d9-2cunsplash-2@2x.png"
        />
        <div className="flex-1 rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-[0.125rem] px-[0rem] pb-[1.5rem] box-border gap-[1.437rem] min-w-[29.875rem] max-w-full z-[1] mq750:min-w-full">
          <div className="self-stretch h-[21.813rem] relative rounded-xl bg-darkslategray hidden" />
          <div className="self-stretch flex flex-col items-start justify-start">
            <h2 className="m-0 self-stretch h-[4.438rem] relative text-inherit font-bold font-[inherit] flex items-center justify-center shrink-0 z-[2] mq450:text-[1.5rem] mq1050:text-[2rem]">
              Título de la partida
            </h2>
            <h3 className="m-0 self-stretch relative text-[2.25rem] italic font-bold font-[inherit] text-nude z-[3] mt-[-0.938rem] mq450:text-[1.375rem] mq1050:text-[1.813rem]">
              Master Name
            </h3>
          </div>
          <div className="self-stretch flex flex-col items-start justify-start max-w-full text-[2.125rem] text-nude">
            <h3 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[2] mq450:text-[1.25rem] mq1050:text-[1.688rem]">
              Descripción
            </h3>
            <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[1.187rem] pr-[1.062rem] box-border min-h-[10.25rem] max-w-full text-left text-[1.125rem]">
              <div className="flex-1 relative leading-[1.625rem] whitespace-pre-wrap inline-block max-w-full z-[3]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
                Duis aute irure Duis aute irure Duis aute irure Duis aute irure
                Duis aute irure Duis aute irure Duis aute irure Duis aute irure
                Duis aute irure .
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default PartidaDetails;
