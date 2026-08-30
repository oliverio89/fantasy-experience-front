import { FunctionComponent, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PartidaCard from "./PartidaCard";
import { useProximasPartidas } from "../hooks/usePartidas";

export type UpcomingCarouselType = {
  className?: string;
};

const NextGames: FunctionComponent<UpcomingCarouselType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const trackRef = useRef<HTMLDivElement>(null);
    const { partidas, loading } = useProximasPartidas(6);
    const move = (direction: number) =>
      trackRef.current?.scrollBy({ left: direction * 370, behavior: "smooth" });

    return (
      <section className={`border-y border-[#d8a651]/15 bg-[#0d0907] px-5 py-24 md:px-10 ${className}`}>
        <div className="mx-auto w-full max-w-[1180px]">
          <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="fe-kicker mb-4">Reserva tu sitio</p>
              <h2 className="fe-section-title">Próximas partidas</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9aa98]">
                Sesiones en mesa y online con plazas abiertas. Elige el sistema,
                conoce al Máster y entra en la historia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => move(-1)} className="fe-icon-button" aria-label="Ver partidas anteriores">
                ←
              </button>
              <button type="button" onClick={() => move(1)} className="fe-icon-button" aria-label="Ver más partidas">
                →
              </button>
            </div>
          </header>

          {loading ? (
            <div className="fe-panel flex h-56 items-center justify-center" role="status">
              <div className="loader" />
              <span className="sr-only">Cargando partidas</span>
            </div>
          ) : partidas.length === 0 ? (
            <div className="fe-panel flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <span className="mb-3 text-2xl text-[#d6a64c]" aria-hidden="true">◇</span>
              <h3 className="m-0 font-titulo-1 text-2xl text-[#f3e7d1]">La agenda se está preparando</h3>
              <p className="mb-0 mt-3 text-sm text-[#a99986]">Todavía no hay próximas sesiones publicadas.</p>
            </div>
          ) : (
            <div ref={trackRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 scrollbar-hide">
              {partidas.map((partida) => (
                <PartidaCard
                  key={partida.id}
                  partida={partida}
                  mostrarDescripcion={false}
                  className="w-[340px] snap-start"
                  backgroundColor="#1b130d"
                />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button type="button" className="fe-button" onClick={() => navigate("/nextgames")}>
              Explorar todas las partidas <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
    );
  }
);

NextGames.displayName = "NextGames";

export default NextGames;
