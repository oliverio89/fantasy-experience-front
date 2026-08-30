import { FunctionComponent, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PartidaCard from "./PartidaCard";
import { usePartidasDestacadas } from "../hooks/usePartidas";

export type UpcomingGamesCarouselType = {
  className?: string;
};

const UpcomingGamesCarousel: FunctionComponent<UpcomingGamesCarouselType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const trackRef = useRef<HTMLDivElement>(null);
    const { partidas, loading } = usePartidasDestacadas(6);
    const digitalAdventures = partidas.filter((partida) => partida.tipoPartida === "Digital");
    const move = (direction: number) =>
      trackRef.current?.scrollBy({ left: direction * 370, behavior: "smooth" });

    return (
      <section className={`fe-surface-grid px-5 py-24 md:px-10 ${className}`}>
        <div className="mx-auto w-full max-w-[1180px]">
          <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="fe-kicker mb-4">Llévate la aventura</p>
              <h2 className="fe-section-title">Aventuras digitales</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9aa98]">
                Material listo para dirigir: compra el archivo una vez y recíbelo
                de forma segura en tu biblioteca.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => move(-1)} className="fe-icon-button" aria-label="Ver aventuras anteriores">←</button>
              <button type="button" onClick={() => move(1)} className="fe-icon-button" aria-label="Ver más aventuras">→</button>
            </div>
          </header>

          {loading ? (
            <div className="fe-panel flex h-56 items-center justify-center" role="status">
              <div className="loader" />
              <span className="sr-only">Cargando aventuras digitales</span>
            </div>
          ) : digitalAdventures.length === 0 ? (
            <div className="fe-panel flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <span className="mb-3 text-2xl text-[#d6a64c]" aria-hidden="true">◇</span>
              <h3 className="m-0 font-titulo-1 text-2xl text-[#f3e7d1]">Nuevos tomos en preparación</h3>
              <p className="mb-0 mt-3 text-sm text-[#a99986]">Las próximas aventuras descargables aparecerán aquí.</p>
            </div>
          ) : (
            <div ref={trackRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 scrollbar-hide">
              {digitalAdventures.map((partida) => (
                <PartidaCard
                  key={partida.id}
                  partida={partida}
                  mostrarDescripcion
                  className="w-[340px] snap-start"
                  backgroundColor="#21170f"
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button type="button" className="fe-button-secondary" onClick={() => navigate("/nextgames?tipo=Digital")}>
              Ver catálogo digital <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
    );
  }
);

UpcomingGamesCarousel.displayName = "UpcomingGamesCarousel";

export default UpcomingGamesCarousel;
