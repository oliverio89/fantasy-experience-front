import { FunctionComponent, memo, useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "../i18n";
import UnifiedMasterCard from "./UnifiedMasterCard";
import { useNavigate } from "react-router-dom";
import { Master } from "../types/masters";
import { mapProfileToMaster, ProfileService } from "../services/profileService";

export type FrameComponent2Type = {
  className?: string;
};

const BestMasters: FunctionComponent<FrameComponent2Type> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const [bestMasters, setBestMasters] = useState<Master[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      ProfileService.getMasters()
        .then((profiles) => {
          const masters = profiles
            .map(mapProfileToMaster)
            .sort(
              (a, b) =>
                Number(b.isFeatured) - Number(a.isFeatured) ||
                b.rankingScore - a.rankingScore ||
                b.completedSessions - a.completedSessions
            )
            .slice(0, 6);
          setBestMasters(masters);
        })
        .catch(() => setBestMasters([]))
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
        className={`relative border-b border-[#d8a651]/15 bg-[#17100b] px-8 py-24 text-left mq750:px-5 mq750:py-16 ${className}`}
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <p className="fe-kicker">Reputación verificable</p>
          <div className="mt-4 flex items-end justify-between gap-8 mq750:flex-col mq750:items-start">
            <h2 className="fe-section-title max-w-[740px]">
              Másters que dejan <em>huella</em>
            </h2>
            <p className="m-0 max-w-[330px] text-right text-base leading-6 text-[#f2e6cf]/52 mq750:text-left">
              Ordenados por partidas finalizadas, valoraciones verificadas y
              constancia en la comunidad.
            </p>
          </div>

        <div className="relative mt-14 w-full">
          {/* Botón para desplazar a la izquierda */}
          <button
            type="button"
            aria-label="Ver Másters anteriores"
            className="fe-icon-button absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-[#100c09] text-xl"
            onClick={scrollLeft}
          >
            ←
          </button>

          {/* Contenedor de las tarjetas */}
          <div className="relative mx-[64px] mq750:mx-0">
            <div
              className="flex max-w-full flex-row items-stretch justify-start gap-5 overflow-x-auto px-1 pb-8 pt-1 scrollbar-hide"
              ref={cardContainerRef}
            >
              {loading ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="loader" />
                </div>
              ) : bestMasters.length === 0 ? (
                <div className="text-nude text-xl py-12 font-titulo-2">
                  {t.bestMasters.noMasters}
                </div>
              ) : (
                bestMasters.map((master) => (
                  <UnifiedMasterCard
                    key={master.id}
                    master={master}
                    onMasterClick={onSlide1ContainerClick}
                  />
                ))
              )}
            </div>
          </div>

          {/* Botón para desplazar a la derecha */}
          <button
            type="button"
            aria-label="Ver más Másters"
            className="fe-icon-button absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-[#100c09] text-xl mq750:hidden"
            onClick={scrollRight}
          >
            →
          </button>
        </div>

        {/* Botón para ver todos los másters */}
        <div className="mt-2 flex justify-start">
          <button
            type="button"
            className="fe-button-secondary gap-3"
            onClick={onViewAllMastersLinkClick}
          >
            {t.bestMasters.viewAll} <span aria-hidden="true">→</span>
          </button>
        </div>
        </div>
      </section>
    );
  }
);

export default BestMasters;
