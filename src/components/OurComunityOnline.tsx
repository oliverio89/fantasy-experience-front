import { FunctionComponent, memo } from "react";
import PlayedGamesImages from "./PlayedGamesImages";

export type FrameComponent3Type = {
  className?: string;
};

const OurComunityOnline: FunctionComponent<FrameComponent3Type> = memo(
  ({ className = "" }) => {
    return (
      <section
        className={`self-stretch bg-black flex flex-col items-start justify-start pt-24 px-20 pb-[100px] box-border gap-8 max-w-full z-[2] text-left text-61xl text-dark-gold font-titulo-2 lg:pt-[62px] lg:pb-[65px] lg:box-border mq750:gap-4 mq750:pt-10 mq750:px-10 mq750:pb-[42px] mq750:box-border mq450:pt-[26px] mq450:pb-[27px] mq450:box-border ${className}`}
      >
        <div className="w-[1280px] h-[1524px] relative bg-black hidden max-w-full" />
        <h1 className="m-0 w-[735px] h-[155px] relative text-inherit leading-[90%] inline-block shrink-0 max-w-full z-[3] font-[inherit] mq1050:text-21xl mq1050:leading-[43px] mq450:text-5xl mq450:leading-[29px]">
          <p className="m-0 font-extrabold">{`Nuestra `}</p>
          <p className="m-0">
            <i className="font-extrabold">comunidad</i>
            <span className="font-extrabold font-titulo-2"> online</span>
          </p>
        </h1>
        <div className="self-stretch flex flex-col items-start justify-start gap-11 max-w-full text-lg text-oldlace-100 mq750:gap-[22px]">
          <PlayedGamesImages konradKollerLcTJoDcUnsplash="/konradkollerlctjo2d9-2cunsplash-1-1@2x.png" />
          <div className="self-stretch rounded-xl bg-darkslategray flex flex-row items-end justify-start pt-[29px] px-7 pb-8 box-border gap-[33px] max-w-full z-[3] mq750:gap-4 mq1050:flex-wrap mq450:pt-5 mq450:pb-[21px] mq450:box-border">
            <div className="h-[351px] w-[1120px] relative rounded-xl bg-darkslategray hidden max-w-full" />
            <div className="flex-1 flex flex-col items-start justify-start gap-[11px] min-w-[382px] min-h-[290px] max-w-full mq750:min-w-full mq1050:min-h-[auto]">
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
                <div className="h-[33px] flex-1 relative inline-block min-w-[112px] z-[4]">
                  190 minutos de partida
                </div>
                <div className="h-[33px] flex-1 relative inline-block min-w-[112px] z-[4]">
                  DD/MM/YYYY
                </div>
              </div>
              <div className="relative leading-[26px] z-[4]">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
                sit amet, consectetur, adipisci velit.
              </div>
            </div>
            <img
              className="w-[443px] relative rounded-xl max-h-full object-cover max-w-full z-[4] mq1050:flex-1"
              loading="lazy"
              alt=""
              src="/konradkollerlctjo2d9-2cunsplash-1-1@2x.png"
            />
          </div>
          <PlayedGamesImages konradKollerLcTJoDcUnsplash="/konradkollerlctjo2d9-2cunsplash-1-1@2x.png" />
        </div>
      </section>
    );
  }
);

export default OurComunityOnline;
