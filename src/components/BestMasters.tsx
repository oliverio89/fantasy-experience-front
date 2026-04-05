import { FunctionComponent, memo, useCallback, useRef, useState, useEffect } from "react";
import UnifiedMasterCard from "./UnifiedMasterCard";
import { useNavigate } from "react-router-dom";
import {
  Master,
  ExperienciaMaster,
  DisponibilidadMaster,
  RangoPrecio,
  SistemaJuego,
} from "../types/masters";
import { ProfileService, Profile } from "../services/profileService";

export type FrameComponent2Type = {
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

const BestMasters: FunctionComponent<FrameComponent2Type> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const [bestMasters, setBestMasters] = useState<Master[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      ProfileService.getMasters()
        .then((profiles) => {
          const masters = profiles
            .map(mapProfileToMaster)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
          setBestMasters(masters);
        })
        .finally(() => setLoading(false));
    }, []);

    const onSlide1ContainerClick = useCallback(
      (master: Master) => {
        navigate(`/master/${master.id}`);
      },
      [navigate]
    );

    const onViewAllMastersLinkClick = useCallback(() => {
      navigate("/ourmasters");
    }, [navigate]);

    // Funciones para desplazar el contenedor lateralmente
    const scrollLeft = () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({
          left: -300, // Desplazamiento a la izquierda
          behavior: "smooth",
        });
      }
    };

    const scrollRight = () => {
      if (cardContainerRef.current) {
        cardContainerRef.current.scrollBy({
          left: 300, // Desplazamiento a la derecha
          behavior: "smooth",
        });
      }
    };

    return (
      <section
        className={`relative self-stretch bg-darkslategray flex flex-col items-start justify-start py-[100px] pl-[79px] pr-[79px] box-border gap-[62px] max-w-full text-left text-61xl text-dark-gold font-titulo-2 mq750:gap-[31px] mq750:pl-[39px] mq750:pt-[42px] mq750:pb-[42px] mq750:box-border mq1050:pt-[65px] mq1050:pb-[65px] mq1050:box-border mq450:gap-[15px] ${className}`}
      >
        <h1 className="m-0 relative text-inherit leading-[90%] inline-block max-w-full z-[1] font-[inherit] mq1050:text-21xl mq1050:leading-[43px] mq450:text-5xl mq450:leading-[29px]">
          <p className="m-0 font-extrabold">{`Nuestros `}</p>
          <p className="m-0">
            <i className="font-medium">mejores</i>
            <i className="font-bold font-titulo-2">{` `}</i>
            <span className="font-extrabold font-titulo-2">Masters</span>
          </p>
        </h1>

        <div className="relative w-full">
          {/* Botón para desplazar a la izquierda */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer [border:none] py-4 px-6 bg-dark-gold shadow-lg rounded-full hover:bg-darkgoldenrod text-black"
            onClick={scrollLeft}
          >
            &lt;
          </button>

          {/* Contenedor de las tarjetas */}
          <div className="relative mx-[70px]">
            <div
              className="flex flex-row items-start justify-start pt-0 px-0 pb-[62px] box-border gap-[20.4px] max-w-full overflow-x-auto scroll-hidden scrollbar-hide"
              ref={cardContainerRef}
            >
              {loading ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="loader" />
                </div>
              ) : bestMasters.length === 0 ? (
                <div className="text-nude text-xl py-12 font-titulo-2">
                  Aún no hay masters registrados.
                </div>
              ) : (
                bestMasters.map((master) => (
                  <UnifiedMasterCard
                    key={master.id}
                    master={master}
                    onMasterClick={onSlide1ContainerClick}
                    useImageFormat={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Botón para desplazar a la derecha */}
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer [border:none] py-4 px-6 bg-dark-gold shadow-lg rounded-full hover:bg-darkgoldenrod text-black"
            onClick={scrollRight}
          >
            &gt;
          </button>
        </div>

        {/* Botón para ver todos los másters */}
        <div className="w-[504px] flex flex-row items-start justify-end py-0 px-[79px] box-border max-w-full mq750:pl-[39px] mq750:pr-[39px] mq750:box-border">
          <button
            className="cursor-pointer [border:none] py-[15.5px] pl-[47px] pr-[46px] bg-dark-gold flex-1 shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-11xl overflow-hidden flex flex-row items-start justify-start box-border max-w-full z-[1] hover:bg-darkgoldenrod mq450:pl-5 mq450:pr-5 mq450:box-border"
            onClick={onViewAllMastersLinkClick}
          >
            <b className="flex-1 relative text-5xl font-titulo-2 text-black text-center">
              Conoce a nuestros Másters
            </b>
          </button>
        </div>
      </section>
    );
  }
);

export default BestMasters;
