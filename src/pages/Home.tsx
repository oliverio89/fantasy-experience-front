import { FunctionComponent } from "react";
import Header from "../components/Header";
import { useTranslation } from "../i18n";
import BestMasters from "../components/BestMasters";
import NextGames from "../components/NextGames";
import UpcomingGamesCarousel from "../components/UpcomingGamesCarousel";
import OurComunityOnline from "../components/OurComunityOnline";

const HomeV: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full overflow-y-auto bg-[#100c09] leading-[normal] tracking-[normal]">
      <Header />
      <section className="fe-surface-grid border-b border-[#d8a651]/15 px-8 py-24 mq750:px-5 mq750:py-16">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[0.9fr_1.1fr] items-center gap-20 mq1050:grid-cols-1 mq750:gap-10">
          <figure className="relative m-0 min-h-[470px] mq750:min-h-[350px]">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-[24px] border border-[#d8a651]/28" />
            <img
              className="relative h-[470px] w-full rounded-[24px] object-cover shadow-[0_26px_70px_rgba(0,0,0,.36)] mq750:h-[350px]"
              loading="lazy"
              alt={t.home.heroImageAlt}
              src="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
            />
            <figcaption className="absolute bottom-5 right-[-18px] rounded-xl border border-[#d8a651]/25 bg-[#17100b]/95 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d9a84f] shadow-xl mq750:right-3">
              Historias compartidas
            </figcaption>
          </figure>

          <div>
            <p className="fe-kicker">Más que una reserva</p>
            <h2 className="fe-section-title mb-7 mt-4">
              Somos una comunidad alrededor de <em>la mesa</em>
            </h2>
            <p className="m-0 text-xl leading-8 text-[#f2e6cf]/64">
              {t.home.sectionDescription}
            </p>
            <div className="fe-divider my-8" />
            <div className="grid grid-cols-3 gap-4 mq750:grid-cols-1">
              {[
                ["Encuentra", "una mesa que encaje contigo"],
                ["Conoce", "la trayectoria de cada Máster"],
                ["Comparte", "tu opinión tras la partida"],
              ].map(([title, copy]) => (
                <div key={title}>
                  <strong className="block text-lg text-[#e2b45d]">{title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-[#f2e6cf]/48">
                    {copy}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <BestMasters />
      <NextGames />
      <UpcomingGamesCarousel />
      <OurComunityOnline />
    </div>
  );
};

export default HomeV;
