import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Master } from "../types/masters";
import { MASTERS_DATA } from "../data/mastersData";
import PartidaCard, { Partida } from "../components/PartidaCard";

export type MasterDetailType = {
  className?: string;
};

const MasterDetail: FunctionComponent<MasterDetailType> = memo(
  ({ className = "" }) => {
    const { masterId } = useParams<{ masterId: string }>();
    const navigate = useNavigate();
    const [master, setMaster] = useState<Master | null>(null);

    // Datos de partidas de ejemplo para este master
    const partidasEjemplo: Partida[] = [
      {
        id: "partida-upcoming-1",
        titulo: "La Torre Perdida de Eldoria",
        masterName: master?.displayName || "Master Name",
        sistemaJuego: "Dungeons & Dragons 5e",
        fecha: "15/12/2024",
        descripcion:
          "Una aventura épica en las ruinas de una antigua torre mágica donde los secretos del pasado esperan ser descubiertos.",
        imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
        tipoPartida: "presencial",
        rating: 4.5,
      },
      {
        id: "partida-upcoming-2",
        titulo: "Misterios de Cthulhu",
        masterName: master?.displayName || "Master Name",
        sistemaJuego: "Call of Cthulhu",
        fecha: "22/12/2024",
        descripcion:
          "Investiga los horrores cósmicos que acechan en las sombras de Arkham. ¿Podrás mantener tu cordura?",
        imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
        tipoPartida: "online",
        rating: 4.8,
      },
    ];

    useEffect(() => {
      if (masterId) {
        const foundMaster = MASTERS_DATA.find((m) => m.id === masterId);
        if (foundMaster) {
          setMaster(foundMaster);
        } else {
          navigate("/ourmasters");
        }
      }
    }, [masterId, navigate]);

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

                <div className="self-stretch flex flex-col items-end justify-start gap-[10.5px] max-w-full">
                  <b className="self-stretch relative text-light-gold z-[1] mq450:text-lgi">
                    Tags:
                  </b>
                  <div className="self-stretch flex flex-row items-start justify-end py-0 px-[67px] text-base mq450:pl-5 mq450:pr-5 mq450:box-border">
                    <div className="flex-1 flex flex-row items-start justify-start gap-2.5">
                      <div className="h-[30px] flex-1 [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                        <div className="ml-[-1px] flex-1 relative leading-[20px] shrink-0 text-nude">
                          Dungeons & Dragons
                        </div>
                      </div>
                      <div className="h-[30px] w-[71px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                        <div className="ml-[-7px] w-[86px] relative leading-[20px] flex items-center justify-center shrink-0 text-nude">
                          Cthulhu
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-start justify-end py-0 px-[94px] box-border max-w-full text-xs mq450:pl-5 mq450:pr-5 mq450:box-border">
                    <div className="h-[30px] w-[139px] [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden shrink-0 flex flex-row items-start justify-start py-[3px] px-0 z-[1]">
                      <div className="ml-[-17.5px] w-[175px] relative leading-[20px] flex items-center justify-center shrink-0 text-nude">
                        Vampiro la mascarada
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partidas jugadas - Partida 2 y Partida 3 */}
              <div className="self-stretch flex flex-col items-start justify-start gap-4">
                {/* Partida 2 */}
                <div
                  className="self-stretch rounded-xl bg-nude border border-darkslategray flex flex-col items-center justify-center py-12 px-6 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleGameClick("partida-2")}
                >
                  <div className="text-black text-lg font-semibold">
                    Partida 2
                  </div>
                </div>

                {/* Partida 3 */}
                <div
                  className="self-stretch rounded-xl bg-nude border border-darkslategray flex flex-col items-center justify-center py-12 px-6 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleGameClick("partida-3")}
                >
                  <div className="text-black text-lg font-semibold">
                    Partida 3
                  </div>
                </div>
              </div>
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
                <div className="self-stretch flex flex-row items-start justify-start py-0 px-0 box-border max-w-full">
                  <div className="flex-1 flex flex-row items-start justify-center gap-[37px] max-w-full mq700:gap-[18px] mq700:flex-wrap">
                    {partidasEjemplo.map((partida) => (
                      <PartidaCard
                        key={partida.id}
                        partida={partida}
                        mostrarDescripcion={true}
                        onClick={() => handleGameClick(String(partida.id))}
                        className="flex-1 min-w-[211px] max-w-full"
                      />
                    ))}
                  </div>
                </div>
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
