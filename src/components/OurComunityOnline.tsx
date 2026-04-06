import { FunctionComponent, memo, useEffect, useState } from "react";
import {
  MasterVideo,
  MasterVideosService,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
} from "../services/masterVideosService";
import { useTranslation } from "../i18n";

export type FrameComponent3Type = {
  className?: string;
};

const VideoCard: FunctionComponent<{
  video: MasterVideo;
  reverse?: boolean;
}> = ({ video, reverse = false }) => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(video.youtubeUrl);
  const thumbnail = getYoutubeThumbnail(video.youtubeUrl);

  const embed = (
    <div className="relative w-full mq1050:w-full" style={{ minWidth: 0, flex: "0 0 52%" }}>
      {/* Glow dorado */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-dark-gold/30 to-transparent blur-xl pointer-events-none" />
      <div className="relative rounded-2xl overflow-hidden border border-dark-gold/40 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="aspect-video w-full">
          {playing ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              className="relative w-full h-full block cursor-pointer border-none p-0 bg-transparent"
              onClick={() => setPlaying(true)}
              aria-label={`${t.ourCommunity.playAriaPrefix} ${video.title}`}
            >
              {/* Thumbnail alta resolución */}
              <img
                src={thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback a hqdefault si maxresdefault no existe
                  (e.target as HTMLImageElement).src = thumbnail.replace(
                    "maxresdefault",
                    "hqdefault"
                  );
                }}
              />
              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-200" />
              {/* Botón play de YouTube */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center shadow-[0_4px_20px_rgba(255,0,0,0.5)] hover:scale-110 transition-transform duration-200">
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const info = (
    <div
      className="flex flex-col justify-center gap-4 mq1050:w-full"
      style={{ flex: "0 0 44%" }}
    >
      {/* Badge sistema de juego */}
      {video.gameSystem && (
        <span className="self-start px-3 py-1 rounded-full border border-dark-gold/60 text-dark-gold text-base font-medium">
          {video.gameSystem}
        </span>
      )}

      {/* Título */}
      <h2 className="m-0 text-5xl font-extrabold text-oldlace-100 leading-tight line-clamp-3 mq450:text-lgi font-titulo-2">
        {video.title}
      </h2>

      {/* Master */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-dark-gold/20 border border-dark-gold/40 flex items-center justify-center shrink-0">
          <svg className="w-[14px] h-[14px] text-dark-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <span className="text-dark-gold font-semibold text-xl mq450:text-lg">{video.masterName}</span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        {video.numPlayers && (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1 border border-white/10">
            <svg className="w-[14px] h-[14px] text-nude shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span className="text-nude text-base">{video.numPlayers} {t.ourCommunity.players}</span>
          </div>
        )}
        {video.durationMinutes && (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1 border border-white/10">
            <svg className="w-[14px] h-[14px] text-nude shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            <span className="text-nude text-base">{video.durationMinutes} {t.ourCommunity.minutes}</span>
          </div>
        )}
        {video.playedAt && (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1 border border-white/10">
            <svg className="w-[14px] h-[14px] text-nude shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
            </svg>
            <span className="text-nude text-base">
              {new Date(video.playedAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Descripción */}
      {video.description && (
        <p className="text-oldlace-100 text-lg leading-[26px] line-clamp-4 m-0 opacity-70">
          {video.description}
        </p>
      )}

      {/* CTA */}
      <a
        href={video.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start flex items-center gap-2 mt-1 px-5 py-2 rounded-full bg-dark-gold text-black font-bold text-base hover:bg-goldenrod transition-colors duration-200 no-underline"
        aria-label={`${t.ourCommunity.watchAriaPrefix} ${video.title} ${t.ourCommunity.watchAriaSuffix}`}
      >
        <svg className="w-[14px] h-[14px] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-2.7A17.42 17.42 0 0 0 12 3.5a17.42 17.42 0 0 0-3.82.49 4.83 4.83 0 0 1-3.77 2.7A4.78 4.78 0 0 0 2.5 10v4a4.78 4.78 0 0 0 1.91 3.81 4.83 4.83 0 0 1 3.77 2.7A17.42 17.42 0 0 0 12 21a17.42 17.42 0 0 0 3.82-.49 4.83 4.83 0 0 1 3.77-2.7A4.78 4.78 0 0 0 21.5 14v-4a4.78 4.78 0 0 0-1.91-3.31zM10 15.5v-7l6 3.5z"/>
        </svg>
        {t.ourCommunity.watchOnYoutube}
      </a>
    </div>
  );

  return (
    <div className="self-stretch rounded-2xl bg-darkslategray border border-white/5 flex flex-row items-center justify-start p-8 box-border gap-10 max-w-full z-[3] font-titulo-2 mq1050:flex-col mq1050:p-6 mq450:p-4 mq450:gap-6 hover:border-dark-gold/20 transition-colors duration-300">
      {reverse ? (
        <>
          {info}
          {embed}
        </>
      ) : (
        <>
          {embed}
          {info}
        </>
      )}
    </div>
  );
};

const OurComunityOnline: FunctionComponent<FrameComponent3Type> = memo(
  ({ className = "" }) => {
    const { t } = useTranslation();
    const [videos, setVideos] = useState<MasterVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      MasterVideosService.getVideosDestacados(3)
        .then(setVideos)
        .finally(() => setLoading(false));
    }, []);

    return (
      <section
        className={`self-stretch bg-black flex flex-col items-start justify-start pt-24 px-20 pb-[100px] box-border gap-10 max-w-full z-[2] text-left text-61xl text-dark-gold font-titulo-2 lg:pt-[62px] lg:pb-[65px] lg:box-border mq750:gap-6 mq750:pt-10 mq750:px-10 mq750:pb-[42px] mq750:box-border mq450:pt-[26px] mq450:pb-[27px] mq450:px-4 mq450:box-border ${className}`}
      >
        {/* Título de sección */}
        <div className="flex flex-col gap-2 z-[3]">
          <h1 className="m-0 relative text-inherit leading-[90%] inline-block max-w-full font-[inherit] mq1050:text-21xl mq1050:leading-[43px] mq450:text-5xl mq450:leading-[29px]">
            <p className="m-0 font-extrabold">{t.ourCommunity.title1}</p>
            <p className="m-0">
              <i className="font-extrabold">{t.ourCommunity.title2}</i>
              <span className="font-extrabold font-titulo-2"> {t.ourCommunity.title3}</span>
            </p>
          </h1>
          <p className="m-0 text-lg text-oldlace-100 font-titulo-2 font-normal max-w-xl opacity-60">
            {t.ourCommunity.description}
          </p>
        </div>

        {/* Cards */}
        <div className="self-stretch flex flex-col items-start justify-start gap-8 max-w-full mq750:gap-5">
          {loading ? (
            <div className="flex items-center justify-center w-full py-16">
              <div className="loader" />
            </div>
          ) : videos.length === 0 ? (
            <div className="self-stretch rounded-2xl bg-darkslategray border border-white/5 p-12 flex flex-col items-center justify-center gap-4">
              <div className="text-4xl">🎲</div>
              <p className="text-oldlace-100/60 text-lg font-titulo-2 text-center m-0">
                {t.ourCommunity.comingSoon}
              </p>
            </div>
          ) : (
            videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                reverse={index % 2 !== 0}
              />
            ))
          )}
        </div>
      </section>
    );
  }
);

export default OurComunityOnline;
