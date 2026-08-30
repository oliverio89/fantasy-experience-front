import { FunctionComponent, memo, useCallback } from "react";

export type SlideType = {
  className?: string;
  masterCard?: string;
  MasterName?: string;
  rate?: number;
  totalReviews?: number;
  completedSessions?: number;
  publishedSessions?: number;
  isFeatured?: boolean;
  Sistema?: string;
  Preferencia?: string;
  onSlide1ContainerClick?: () => void;
};

const CardMaster: FunctionComponent<SlideType> = memo(
  ({
    className = "",
    onSlide1ContainerClick,
    masterCard,
    MasterName,
    rate = 0,
    totalReviews = 0,
    completedSessions = 0,
    publishedSessions = 0,
    isFeatured = false,
    Sistema,
    Preferencia,
  }) => {
    const handleClick = useCallback(() => {
      onSlide1ContainerClick?.();
    }, [onSlide1ContainerClick]);

    const normalizedRating = Math.min(Math.max(rate, 0), 5);

    return (
      <article
        className={`fe-panel group relative min-h-[480px] w-[330px] shrink-0 overflow-hidden rounded-[24px] text-[#f2e6cf] transition duration-300 hover:-translate-y-2 hover:border-[#d8a651]/65 hover:shadow-[0_28px_70px_rgba(0,0,0,.42)] ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={MasterName ? `Ver perfil de ${MasterName}` : "Ver perfil del Máster"}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") handleClick();
        }}
      >
        <div className="relative h-[132px] overflow-hidden border-b border-[#d8a651]/18 bg-[radial-gradient(circle_at_50%_10%,rgba(216,166,81,.2),transparent_54%),linear-gradient(135deg,#291b10,#130e0a)]">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(30deg,transparent_48%,rgba(230,193,119,.25)_49%,rgba(230,193,119,.25)_51%,transparent_52%)] [background-size:20px_34px]" />
          {isFeatured && (
            <span className="absolute right-4 top-4 z-[2] rounded-full border border-[#e7bd69]/30 bg-[#120d09]/85 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#e7bd69]">
              Destacado
            </span>
          )}
        </div>

        <img
          className="absolute left-1/2 top-[66px] z-[2] h-[132px] w-[132px] -translate-x-1/2 rounded-full border-[3px] border-[#d9a84f] bg-[#17100b] object-cover p-1 shadow-[0_12px_30px_rgba(0,0,0,.45)]"
          loading="lazy"
          alt={MasterName ? `Foto de perfil de ${MasterName}` : "Foto de perfil del Máster"}
          src={masterCard}
        />

        <div className="relative z-[1] flex min-h-[348px] flex-col px-6 pb-6 pt-[78px] text-center">
          <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d9a84f]">
            Director de juego
          </p>
          <h2 className="mb-2 mt-2 line-clamp-1 font-milonga text-[27px] font-normal text-[#f2e6cf]">
            {MasterName}
          </h2>

          <div
            className="flex items-center justify-center gap-2 text-sm"
            aria-label={`${normalizedRating.toFixed(1)} de 5 estrellas`}
          >
            <span aria-hidden="true" className="tracking-[0.08em] text-[#d9a84f]">
              {Array.from({ length: 5 }, (_, index) =>
                index < Math.round(normalizedRating) ? "★" : "☆",
              ).join("")}
            </span>
            <strong className="text-[#f2e6cf]/72">{normalizedRating.toFixed(1)}</strong>
          </div>

          <p className="mb-1 mt-4 line-clamp-1 text-base font-bold text-[#f2e6cf]/88">
            {Sistema || "Sistemas por descubrir"}
          </p>
          <p className="m-0 line-clamp-1 text-sm text-[#f2e6cf]/48">
            {Preferencia || "Modalidad por concretar"}
          </p>

          <dl className="my-5 grid grid-cols-3 gap-2 border-y border-[#d8a651]/14 py-4">
            {[
              [completedSessions, "jugadas"],
              [publishedSessions, "publicadas"],
              [totalReviews, "opiniones"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="order-2 text-[11px] uppercase tracking-wide text-[#f2e6cf]/40">
                  {label}
                </dt>
                <dd className="order-1 m-0 font-milonga text-2xl text-[#e2b45d]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <span className="mt-auto inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#d9a84f] transition-all group-hover:gap-3">
            Abrir ficha <span aria-hidden="true">→</span>
          </span>
        </div>
      </article>
    );
  },
);

CardMaster.displayName = "CardMaster";

export default CardMaster;
