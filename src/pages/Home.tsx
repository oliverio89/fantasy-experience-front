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
    <div className="w-full relative bg-white overflow-y-auto flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <Header />
      <section className="self-stretch bg-oldlace-100 flex flex-row items-start justify-start pt-[100px] px-20 pb-[100px] box-border gap-10 max-w-full text-left text-81xl text-black font-titulo-2 mq750:gap-5 mq750:pt-[61px] mq750:px-10 mq750:pb-[65px] mq750:box-border mq1050:flex-wrap">
        <div className="h-[625px] w-[1280px] relative bg-oldlace-100 hidden max-w-full" />
        <img
          className="h-[431px] flex-1 relative rounded-xl max-w-full overflow-hidden object-cover min-w-[352px] z-[1] mq750:min-w-full"
          loading="lazy"
          alt={t.home.heroImageAlt}
          src="/konradkollerlctjo2d9-2cunsplash-1@2x.png"
        />
        <div className="flex-1 flex flex-col items-start justify-start min-w-[352px] min-h-[431px] max-w-full mq750:min-w-full mq1050:min-h-[auto]">
          <h1 className="m-0 relative text-inherit leading-[80px] font-extrabold font-[inherit] z-[1] mq1050:text-[50px] mq1050:leading-[48px] mq450:text-11xl mq450:leading-[32px]">
            <p className="m-0">{t.home.sectionTitle}</p>
          </h1>
          <div className="m-2 self-stretch relative text-lg leading-[26px] text-darkslategray z-[2]">
            {t.home.sectionDescription}
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
