import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Master } from "../types/masters";
import { mapProfileToMaster, ProfileService } from "../services/profileService";
import PartidaCard, { Partida } from "../components/PartidaCard";
import PartidasService from "../services/partidasService";
import { useTranslation } from "../i18n";
import ReviewService, { PublicMasterReview } from "../services/reviewService";

export type MasterDetailType = {
  className?: string;
};

const MasterDetail: FunctionComponent<MasterDetailType> = memo(
  ({ className = "" }) => {
    const { masterId } = useParams<{ masterId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [master, setMaster] = useState<Master | null>(null);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loadingPartidas, setLoadingPartidas] = useState(false);
    const [reviews, setReviews] = useState<PublicMasterReview[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
      if (!masterId) return;
      ProfileService.getProfile(masterId)
        .then((profile) => {
          if (profile && (profile.role === "master" || profile.role === "admin")) {
            setMaster(mapProfileToMaster(profile));
          } else {
            navigate("/ourmasters");
          }
        })
        .catch(() => navigate("/ourmasters"));
    }, [masterId, navigate]);

    useEffect(() => {
      if (!masterId) return;
      setLoadingPartidas(true);
      PartidasService.obtenerPartidas({ masterId, limit: 4 })
        .then((resp) => setPartidas(resp.partidas))
        .catch(() => setPartidas([]))
        .finally(() => setLoadingPartidas(false));
    }, [masterId]);

    useEffect(() => {
      if (!masterId) return;
      setLoadingReviews(true);
      ReviewService.getPublicMasterReviews(masterId)
        .then(setReviews)
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }, [masterId]);

    const handleBackClick = useCallback(() => {
      navigate("/ourmasters");
    }, [navigate]);

    const handleGameClick = useCallback(
      (partidaId: string) => {
        navigate(`/detailsgame/${partidaId}`);
      },
      [navigate]
    );

    const renderStars = (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <img
            key={i}
            className="h-7 w-7"
            alt="Estrella llena"
            src="/rating-star.svg"
          />
        );
      }

      if (hasHalfStar) {
        stars.push(
          <div key="half" className="relative h-7 w-7">
            <img
              className="absolute h-7 w-7"
              alt="Estrella vacía"
              src="/rating-star-empty.svg"
            />
            <img
              className="absolute h-7 w-7"
              alt="Media estrella"
              src="/rating-star.svg"
              style={{
                clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
              }}
            />
          </div>
        );
      }

      const emptyStars = 5 - Math.ceil(rating);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(
          <img
            key={`empty-${i}`}
            className="h-7 w-7"
            alt="Estrella vacía"
            src="/rating-star-empty.svg"
          />
        );
      }

      return stars;
    };

    if (!master) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-nude text-xl">
            {t.masterDetail.loading}
          </div>
        </div>
      );
    }

    return (
      <div className={`fe-surface-grid min-h-screen w-full ${className}`}>
        {/* Botón de regreso */}
        <div className="mx-auto w-full max-w-[1180px] px-8 py-10 mq750:px-5 mq750:py-7">
          <button
            onClick={handleBackClick}
            className="fe-button-secondary gap-3 bg-transparent"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t.masterDetail.backToMasters}
          </button>
        </div>

        {/* Layout principal de 2 columnas - Diseño Original */}
        <div className="mx-auto w-full max-w-[1180px] px-8 pb-24 mq750:px-5">
          <div className="flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-center text-5xl text-nude font-texto-2 mq700:gap-5 mq900:flex-wrap">
            {/* COLUMNA IZQUIERDA */}
            <aside className="flex w-[340px] shrink-0 flex-col items-start justify-start gap-7 max-w-full mq450:min-w-full mq900:flex-1">
              {/* Foto del Master - Circular completo */}
              <div className="self-stretch flex justify-center">
                <img
                  className="h-[370px] w-[330px] rounded-[28px] border border-[#d8a651]/55 bg-[#17100b] object-cover p-2 shadow-[0_24px_60px_rgba(0,0,0,.4)]"
                  loading="lazy"
                  alt={`Avatar de ${master.displayName}`}
                  src={master.avatar}
                />
              </div>

              {/* Información sobre el Master */}
              <div className="fe-panel self-stretch rounded-[24px] p-7 text-left mq450:p-5">
                <h2 className="m-0 self-stretch relative text-15xl font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
                  {t.masterDetail.about}
                </h2>

                <div className="self-stretch flex flex-col items-start justify-start gap-2 text-light-gold">
                  <b className="self-stretch relative z-[1] mq450:text-lgi">
                    {t.masterDetail.preferredSystems}
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {master.sistemas.join(", ")}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-start justify-start gap-1.5 text-light-gold">
                  <b className="self-stretch relative z-[1] mq450:text-lgi mq450:leading-[18px]">
                    {t.masterDetail.gamePreference}
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {master.tiposPartida.join(", ")}
                  </div>
                </div>

                {master.sistemas.length > 0 && (
                  <div className="self-stretch flex flex-col items-start justify-start gap-2">
                    <b className="self-stretch relative text-light-gold z-[1] mq450:text-lgi">
                      {t.masterDetail.tagsLabel}
                    </b>
                    <div className="flex flex-row flex-wrap gap-2">
                      {master.sistemas.slice(0, 4).map((sistema) => (
                        <span
                          key={sistema}
                          className="h-[30px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid px-3 flex items-center text-nude text-sm z-[1]"
                        >
                          {sistema}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Partidas del master */}
              {loadingPartidas ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loader" />
                </div>
              ) : partidas.length > 0 ? (
                <div className="self-stretch flex flex-col items-start justify-start gap-4">
                  {partidas.map((partida) => (
                    <div
                      key={partida.id}
                      className="self-stretch rounded-xl bg-nude border border-darkslategray cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleGameClick(String(partida.id))}
                    >
                      <PartidaCard partida={partida} mostrarDescripcion={false} />
                    </div>
                  ))}
                </div>
              ) : null}
            </aside>

            {/* COLUMNA DERECHA */}
            <section className="flex min-w-[476px] max-w-full flex-1 flex-col items-start justify-start gap-6 text-center text-21xl text-dark-gold font-texto-2 mq700:min-w-full mq900:gap-[18px]">
              {/* Nombre del Master y Rating */}
              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left mq700:p-6">
                {master.isFeatured && (
                  <span className="mb-4 inline-flex rounded-full border border-[#d8a651]/35 bg-[#d9a84f]/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#e1ae4f]">
                    Máster destacado
                  </span>
                )}
                <h1 className="m-0 font-milonga text-[clamp(2.3rem,5vw,4.3rem)] font-normal leading-tight text-[#f2e6cf]">
                  {master.displayName}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex flex-row items-start justify-start gap-2">
                    {renderStars(master.rating)}
                  </div>
                  <strong className="text-lg text-[#e1ae4f]">
                    {master.rating.toFixed(1)} / 5
                  </strong>
                  <span className="text-sm text-nude/55">
                    {master.totalReviews} opiniones verificadas
                  </span>
                </div>
              </div>

              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left mq700:p-6">
                <p className="fe-kicker">Datos públicos</p>
                <h2 className="mb-5 mt-3 font-milonga text-3xl font-normal text-nude">
                  Trayectoria verificada
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    [master.completedSessions, "Partidas jugadas"],
                    [master.publishedSessions, "Partidas publicadas"],
                    [master.playersServed, "Jugadores dirigidos"],
                    [master.totalReviews, "Valoraciones"],
                    [master.digitalProducts, "Aventuras digitales"],
                    [master.digitalSales, "Ventas digitales"],
                  ].map(([value, label]) => (
                    <div key={String(label)} className="rounded-xl border border-[#d8a651]/14 bg-black/20 p-4 text-center">
                      <strong className="block font-milonga text-3xl font-normal text-[#e1ae4f]">{value}</strong>
                      <span className="text-xs leading-tight text-nude/70">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="m-0 mt-4 text-sm leading-5 text-nude/60">
                  El distintivo se obtiene con al menos 3 partidas finalizadas, 3 opiniones,
                  una media mínima de 4/5 y una tasa de cancelación no superior al 25 %.
                </p>
              </div>

              {/* Bio */}
              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left text-15xl mq700:p-6">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude">
                  {t.masterDetail.bio}
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  {master.bio}
                </div>
              </div>

              {/* Estilo de juego */}
              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left text-15xl mq700:p-6">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude">
                  {t.masterDetail.gameStyle}
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  <p className="mb-4">
                    <strong>{t.masterDetail.sessionDuration}</strong>{" "}
                    {master.duracionSesion.join(", ")}
                  </p>
                  <p className="mb-4">
                    <strong>{t.masterDetail.numPlayers}</strong>{" "}
                    {master.numeroJugadores.join(", ")}
                  </p>
                  <p className="mb-4">
                    <strong>{t.masterDetail.gameStyles}</strong>{" "}
                    {master.estilos.join(", ")}
                  </p>
                  <p>
                    <strong>{t.masterDetail.languages}</strong> {master.idiomas.join(", ")}
                  </p>
                </div>
              </div>

              {/* Próximas partidas */}
              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left text-15xl text-nude mq700:p-6">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
                  Partidas y aventuras disponibles
                </h2>
                {loadingPartidas ? (
                  <div className="flex items-center justify-center w-full py-6">
                    <div className="loader" />
                  </div>
                ) : partidas.length === 0 ? (
                  <p className="text-nude/60 font-titulo-2">
                    {t.masterDetail.noGames}
                  </p>
                ) : (
                  <div className="self-stretch flex flex-row items-start justify-center gap-[37px] max-w-full mq700:gap-[18px] mq700:flex-wrap">
                    {partidas.map((partida) => (
                      <PartidaCard
                        key={partida.id}
                        partida={partida}
                        mostrarDescripcion={true}
                        onClick={() => handleGameClick(String(partida.id))}
                        className="flex-1 min-w-[211px] max-w-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="fe-panel self-stretch rounded-[24px] p-8 text-left text-nude mq700:p-6">
                <h2 className="m-0 text-3xl">Opiniones de jugadores</h2>
                <p className="mt-2 mb-5 text-sm text-nude/60">
                  Solo pueden opinar jugadores que participaron en una partida finalizada.
                </p>
                {loadingReviews ? (
                  <div className="flex justify-center py-6"><div className="loader" /></div>
                ) : reviews.length === 0 ? (
                  <p className="text-base text-nude/60">Todavía no hay opiniones verificadas.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reviews.map((review) => (
                      <article key={review.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-lg text-light-gold">{review.gameTitle}</strong>
                          <span className="text-dark-gold" aria-label={`${review.rating} de 5 estrellas`}>
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </span>
                        </div>
                        <p className="my-3 text-base leading-6">{review.comment}</p>
                        <div className="flex justify-between gap-3 text-xs text-nude/50">
                          <span>Jugador verificado</span>
                          <time dateTime={review.createdAt}>
                            {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
);

MasterDetail.displayName = "MasterDetail";

export default MasterDetail;
