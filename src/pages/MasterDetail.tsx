import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Master,
  ExperienciaMaster,
  DisponibilidadMaster,
  RangoPrecio,
  SistemaJuego,
} from "../types/masters";
import { ProfileService, Profile } from "../services/profileService";
import PartidaCard, { Partida } from "../components/PartidaCard";
import PartidasService from "../services/partidasService";

export type MasterDetailType = {
  className?: string;
};

const mapProfileToMaster = (profile: Profile): Master => ({
  id: profile.id,
  username: profile.fullName?.toLowerCase().replace(/\s+/g, "") || profile.id,
  displayName: profile.fullName || "Master",
  email: "hidden",
  avatar: profile.avatarUrl || "/default-avatar.png",
  bio: profile.bio || "Sin biografía.",
  experiencia: (profile.experiencia as ExperienciaMaster) || "Intermedio",
  sistemas: (profile.sistemas as SistemaJuego[]) || [],
  tiposPartida: (profile.tiposPartida as any[]) || [],
  disponibilidad: (profile.disponibilidad as DisponibilidadMaster) || "Disponible",
  estilos: (profile.estilos as any[]) || [],
  idiomas: (profile.idiomas as any[]) || [],
  precioPorSesion: (profile.precioPorSesion as RangoPrecio) || "Gratis",
  duracionSesion: (profile.duracionSesion as any[]) || [],
  numeroJugadores: (profile.numeroJugadores as any[]) || [],
  rating: profile.rating || 0,
  totalReviews: profile.totalReviews || 0,
  timezone: profile.timezone || "Europe/Madrid",
  createdAt: new Date(profile.updatedAt || Date.now()),
  lastActive: new Date(),
});

const MasterDetail: FunctionComponent<MasterDetailType> = memo(
  ({ className = "" }) => {
    const { masterId } = useParams<{ masterId: string }>();
    const navigate = useNavigate();
    const [master, setMaster] = useState<Master | null>(null);
    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [loadingPartidas, setLoadingPartidas] = useState(false);

    useEffect(() => {
      if (!masterId) return;
      ProfileService.getProfile(masterId)
        .then((profile) => {
          if (profile) {
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

    const handleBackClick = useCallback(() => {
      navigate("/ourmasters");
    }, [navigate]);

    const handleGameClick = useCallback(
      (partidaId?: string) => {
        if (partidaId) {
          navigate(`/partidasdetalles-v12/${partidaId}`);
        } else {
          navigate("/partidasdetalles-v12");
        }
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
            Cargando información del master...
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
            Volver a Masters
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
                  Sobre el Máster
                </h2>

                <div className="self-stretch flex flex-col items-start justify-start gap-2 text-light-gold">
                  <b className="self-stretch relative z-[1] mq450:text-lgi">
                    Sistemas preferidos
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {master.sistemas.join(", ")}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-start justify-start gap-1.5 text-light-gold">
                  <b className="self-stretch relative z-[1] mq450:text-lgi mq450:leading-[18px]">
                    Preferencia de partidas
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {master.tiposPartida.join(", ")}
                  </div>
                </div>

                {master.sistemas.length > 0 && (
                  <div className="self-stretch flex flex-col items-start justify-start gap-2">
                    <b className="self-stretch relative text-light-gold z-[1] mq450:text-lgi">
                      Tags:
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
                <h1 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-5xl mq900:text-13xl text-light-gold">
                  {master.displayName}
                </h1>
                <div className="self-stretch h-10 relative text-xl font-medium text-nude flex items-center justify-center shrink-0 z-[1] mq450:text-base">
                  Valoración
                </div>
                <div className="self-stretch flex flex-row items-start justify-center py-0 pl-[21px] pr-5">
                  <div className="flex flex-row items-start justify-start gap-[18px]">
                    {renderStars(master.rating)}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude">
                  Bio
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  {master.bio}
                </div>
              </div>

              {/* Estilo de juego */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude">
                  Estilo de juego
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  <p className="mb-4">
                    <strong>Duración de sesión:</strong>{" "}
                    {master.duracionSesion.join(", ")}
                  </p>
                  <p className="mb-4">
                    <strong>Número de jugadores:</strong>{" "}
                    {master.numeroJugadores.join(", ")}
                  </p>
                  <p className="mb-4">
                    <strong>Estilos de juego:</strong>{" "}
                    {master.estilos.join(", ")}
                  </p>
                  <p>
                    <strong>Idiomas:</strong> {master.idiomas.join(", ")}
                  </p>
                </div>
              </div>

              {/* Próximas partidas */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 box-border gap-[27px] max-w-full text-15xl text-nude mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
                  Próximas partidas
                </h2>
                {loadingPartidas ? (
                  <div className="flex items-center justify-center w-full py-6">
                    <div className="loader" />
                  </div>
                ) : partidas.length === 0 ? (
                  <p className="text-nude/60 font-titulo-2">
                    Este master no tiene partidas publicadas aún.
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
            </section>
          </div>
        </div>
      </div>
    );
  }
);

MasterDetail.displayName = "MasterDetail";

export default MasterDetail;
