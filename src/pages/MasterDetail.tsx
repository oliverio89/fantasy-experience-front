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
            className="h-[40.7px] w-10"
            alt="Estrella llena"
            src="/rating-star.svg"
          />
        );
      }

      if (hasHalfStar) {
        stars.push(
          <div key="half" className="relative h-[40.7px] w-10">
            <img
              className="absolute h-[40.7px] w-10"
              alt="Estrella vacía"
              src="/rating-star-empty.svg"
            />
            <img
              className="absolute h-[40.7px] w-10"
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
            className="h-[40.7px] w-10"
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
      <div className={`w-full bg-black min-h-screen ${className}`}>
        {/* Botón de regreso */}
        <div className="w-full max-w-[1120px] mx-auto px-6 py-8">
          <button
            onClick={handleBackClick}
            className="mb-8 px-6 py-3 bg-transparent border border-nude text-nude rounded-xl hover:bg-nude hover:text-black transition-all duration-200 flex items-center gap-3 font-medium"
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
        <div className="w-full max-w-[1120px] mx-auto px-6 pb-12">
          <div className="flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-center text-5xl text-nude font-texto-2 mq700:gap-5 mq900:flex-wrap">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col items-start justify-start gap-9 max-w-full mq450:gap-[18px] mq450:min-w-full mq900:flex-1">
              {/* Foto del Master - Circular completo */}
              <div className="self-stretch flex justify-center">
                <img
                  className="w-[347px] h-[347px] rounded-full object-cover border-4 border-light-gold"
                  loading="lazy"
                  alt={`Avatar de ${master.displayName}`}
                  src={master.avatar}
                />
              </div>

              {/* Información sobre el Master */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 box-border gap-[26.7px] max-w-full mq450:p-4 mq450:box-border">
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
            </div>

            {/* COLUMNA DERECHA */}
            <section className="flex-1 flex flex-col items-start justify-start gap-[35.7px] min-w-[476px] max-w-full text-center text-21xl text-dark-gold font-texto-2 mq700:min-w-full mq900:gap-[18px]">
              {/* Nombre del Master y Rating */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-end justify-start p-6 gap-0.5">
                {master.isFeatured && (
                  <span className="self-center mb-2 rounded-full bg-dark-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-black">
                    Máster destacado
                  </span>
                )}
                <h1 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-5xl mq900:text-13xl text-light-gold">
                  {master.displayName}
                </h1>
                <div className="self-stretch h-10 relative text-xl font-medium text-nude flex items-center justify-center shrink-0 z-[1] mq450:text-base">
                  {t.masterDetail.rating}
                </div>
                <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5">
                  <div className="flex flex-row items-start justify-start gap-[18px]">
                    {renderStars(master.rating)}
                  </div>
                </div>
                <p className="self-center m-0 mt-2 text-sm text-nude/70">
                  {master.totalReviews} valoraciones verificadas
                </p>
              </div>

              <div className="self-stretch rounded-xl bg-darkslategray p-6 text-left">
                <h2 className="m-0 mb-4 text-2xl text-nude">Trayectoria verificada</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    [master.completedSessions, "Partidas jugadas"],
                    [master.publishedSessions, "Partidas publicadas"],
                    [master.playersServed, "Jugadores dirigidos"],
                    [master.totalReviews, "Valoraciones"],
                    [master.digitalProducts, "Aventuras digitales"],
                    [master.digitalSales, "Ventas digitales"],
                  ].map(([value, label]) => (
                    <div key={String(label)} className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                      <strong className="block text-2xl text-light-gold">{value}</strong>
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
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude">
                  {t.masterDetail.bio}
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  {master.bio}
                </div>
              </div>

              {/* Estilo de juego */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
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
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 box-border gap-[27px] max-w-full text-15xl text-nude mq700:p-4 mq700:box-border">
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

              <div className="self-stretch rounded-xl bg-darkslategray p-6 text-left text-nude mq700:p-4">
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
