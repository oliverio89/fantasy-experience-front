import { Link, useLocation } from "react-router-dom";

type ComingSoonLocationState = {
  feature?: unknown;
};

const getFeatureName = (state: unknown): string | null => {
  if (!state || typeof state !== "object") return null;
  const feature = (state as ComingSoonLocationState).feature;
  if (typeof feature !== "string") return null;
  const normalized = feature.trim();
  return normalized.length > 0 && normalized.length <= 80 ? normalized : null;
};

const ComingSoon = () => {
  const location = useLocation();
  const feature = getFeatureName(location.state);

  return (
    <main className="fe-surface-grid flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-16 text-nude">
      <section
        aria-labelledby="coming-soon-title"
        className="fe-panel w-full max-w-2xl rounded-[26px] px-6 py-12 text-center sm:px-12"
      >
        <p className="m-0 text-sm font-bold uppercase tracking-[0.2em] text-dark-gold">
          Próximamente
        </p>
        <h1
          id="coming-soon-title"
          className="mb-4 mt-4 font-milonga text-4xl font-normal text-nude"
        >
          Estamos trabajando en ello
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-7 text-nude/80">
          {feature
            ? `${feature} todavía no está disponible. Estamos preparando esta función para que sea segura, clara y útil antes de publicarla.`
            : "Esta función todavía no está disponible. Estamos preparándola para que sea segura, clara y útil antes de publicarla."}
        </p>

        <aside className="mb-9 rounded-lg border border-nude/20 bg-black/30 p-5 text-left">
          <h2 className="m-0 mb-2 text-base text-dark-gold">Aviso</h2>
          <p className="m-0 text-sm leading-6 text-nude/70">
            Esta página es informativa. No constituye una oferta, una reserva ni
            un compromiso sobre una fecha de lanzamiento. No se realizará ningún
            cobro desde una funcionalidad que aún esté en desarrollo.
          </p>
        </aside>

        <Link
          to="/"
          className="fe-button"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
};

export default ComingSoon;
