import { FunctionComponent, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export type ContentType = {
  className?: string;
};

const Header: FunctionComponent<ContentType> = memo(({ className = "" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section
      className={`relative isolate min-h-[690px] w-full overflow-hidden border-b border-[#d8a651]/20 mq750:min-h-[650px] ${className}`}
    >
      <img
        className="absolute inset-0 h-full w-full object-cover object-center"
        alt={t.home.heroImageAlt}
        src="/2hmediaz9jv6wrkrpaunsplash-1@2x.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,8,5,.98)_0%,rgba(12,8,5,.88)_44%,rgba(12,8,5,.34)_75%,rgba(12,8,5,.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(211,139,55,.12),transparent_24rem)]" />

      <div className="relative mx-auto grid min-h-[690px] w-full max-w-[1240px] grid-cols-[1.2fr_0.65fr] items-center gap-16 px-8 py-20 mq1050:grid-cols-1 mq750:min-h-[650px] mq750:px-5 mq750:py-14">
        <div className="max-w-[720px]">
          <p className="fe-kicker">Encuentra tu mesa</p>
          <h1 className="mb-6 mt-5 font-milonga text-[clamp(3.4rem,7.2vw,6.7rem)] font-normal leading-[0.93] tracking-[-0.055em] text-[#f2e6cf]">
            Tu próxima
            <span className="block text-[#d9a84f]">aventura empieza aquí</span>
          </h1>
          <p className="m-0 max-w-[620px] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-8 text-[#f2e6cf]/68">
            Descubre Másters, compara su experiencia y reserva partidas en mesa
            u online. También puedes llevarte aventuras digitales listas para
            jugar.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              className="fe-button gap-3"
              onClick={() => navigate("/nextgames")}
            >
              Explorar partidas <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="fe-button-secondary"
              onClick={() => navigate("/ourmasters")}
            >
              Conocer a los Másters
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-bold text-[#f2e6cf]/55">
            {[
              "Partidas en mesa",
              "Sesiones online",
              "Aventuras descargables",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#d9a84f]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="fe-panel relative rounded-[24px] p-7 mq1050:hidden">
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d9a84f]">
            Cómo funciona
          </p>
          <ol className="m-0 mt-5 list-none p-0">
            {[
              ["01", "Explora", "Filtra por sistema, modalidad y fecha."],
              ["02", "Elige", "Conoce el estilo y reputación del Máster."],
              ["03", "Juega", "Reserva tu plaza y entra en la historia."],
            ].map(([number, title, copy], index) => (
              <li
                key={number}
                className={`grid grid-cols-[42px_1fr] gap-4 py-5 ${
                  index > 0 ? "border-t border-[#d8a651]/15" : ""
                }`}
              >
                <span className="font-milonga text-2xl text-[#d9a84f]">{number}</span>
                <span>
                  <strong className="block text-lg text-[#f2e6cf]">{title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-[#f2e6cf]/52">
                    {copy}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
});

Header.displayName = "Header";

export default Header;
