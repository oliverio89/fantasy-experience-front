import { FunctionComponent, memo } from "react";

export type PlayedGamesImagesType = {
  className?: string;
  konradKollerLcTJoDcUnsplash?: string;
};

const PlayedGamesImages: FunctionComponent<PlayedGamesImagesType> = memo(
  ({ className = "", konradKollerLcTJoDcUnsplash }) => {
    return (
      <div
        className={`self-stretch rounded-xl bg-darkslategray flex flex-row items-start justify-start pt-[29px] px-7 pb-[35px] box-border gap-[33px] max-w-full z-[3] text-left text-lg text-oldlace-100 font-titulo-2 mq750:gap-4 mq1050:flex-wrap mq450:pt-5 mq450:pb-[23px] mq450:box-border ${className}`}
      >
        <div className="h-[351px] w-[1120px] relative rounded-xl bg-darkslategray hidden max-w-full" />
        <img
          className="w-[443px] relative rounded-xl max-h-full object-cover max-w-full z-[4] mq1050:flex-1"
          alt=""
          src={konradKollerLcTJoDcUnsplash}
        />
        <div className="flex-1 flex flex-col items-start justify-start gap-[7.5px] min-w-[382px] min-h-[282px] max-w-full mq750:min-w-full mq1050:min-h-[auto]">
          <div className="w-[519px] flex flex-col items-start justify-start max-w-full text-5xl">
            <b className="self-stretch relative z-[4] mq450:text-lgi">
              Nombre de partida jugada
            </b>
            <div className="self-stretch relative text-xl font-medium z-[5] mt-[-5px] mq450:text-base">
              Nombre de Máster
            </div>
          </div>
          <div className="self-stretch flex flex-row items-start justify-start gap-[45.5px] mq750:gap-[23px] mq750:flex-wrap">
            <div className="w-[153px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border">
              <div className="self-stretch relative z-[4]">6 jugadores</div>
            </div>
            <div className="h-8 flex-1 relative inline-block min-w-[112px] z-[4]">
              190 minutos de partida
            </div>
            <div className="h-8 flex-1 relative inline-block min-w-[112px] z-[4]">
              DD/MM/YYYY
            </div>
          </div>
          <div className="relative leading-[26px] z-[4]">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
          </div>
        </div>
      </div>
    );
  }
);

export default PlayedGamesImages;
