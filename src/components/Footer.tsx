import { FunctionComponent, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export type SocialContainerType = {
  className?: string;
};

const Footer: FunctionComponent<SocialContainerType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const exploreLinks = [
      { label: t.footer.masters, path: "/ourmasters" },
      { label: t.footer.games, path: "/nextgames" },
      { label: t.footer.contact, path: "/contacto" },
    ];
    const legalLinks = [
      { label: "Aviso legal", path: "/legal" },
      { label: "Privacidad", path: "/privacidad" },
      { label: "Cookies", path: "/cookies" },
      { label: "Términos de uso", path: "/terminos" },
    ];

    return (
      <footer
        className={`relative overflow-hidden border-t border-[#d8a651]/20 bg-[#0d0907] text-[#f2e6cf] ${className}`}
      >
        <div className="pointer-events-none absolute left-1/2 top-[-16rem] h-[30rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#a55e28]/10 blur-[110px]" />

        <div className="relative mx-auto w-full max-w-[1200px] px-8 pb-10 pt-16 mq750:px-5 mq750:pt-10">
          <section className="fe-panel mb-14 flex items-center justify-between gap-8 overflow-hidden rounded-[26px] px-10 py-9 mq750:flex-col mq750:items-start mq750:px-6">
            <div className="relative z-[1] max-w-[670px]">
              <p className="fe-kicker">La mesa está preparada</p>
              <h2 className="mb-3 mt-3 font-milonga text-[clamp(1.8rem,3.6vw,3.4rem)] font-normal leading-tight text-[#f2e6cf]">
                Tu próxima historia aún no se ha escrito.
              </h2>
              <p className="m-0 max-w-[590px] text-lg leading-7 text-[#f2e6cf]/62">
                Encuentra una mesa, conoce a quien la dirige y entra en una
                aventura que encaje contigo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/nextgames")}
              className="fe-button relative z-[1] shrink-0 gap-3"
            >
              Explorar aventuras
              <span aria-hidden="true">→</span>
            </button>
          </section>

          <div className="grid grid-cols-[1.4fr_0.8fr_0.9fr_1fr] gap-10 mq1050:grid-cols-2 mq750:grid-cols-1">
            <div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="bg-transparent p-0 text-left"
              >
                <span className="block font-milonga text-3xl text-[#e1ae4f]">
                  Fantasy Experience
                </span>
                <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.25em] text-[#f2e6cf]/42">
                  Comunidad rolera
                </span>
              </button>
              <p className="mb-0 mt-5 max-w-[330px] text-base leading-6 text-[#f2e6cf]/56">
                Partidas en mesa, sesiones online y aventuras digitales creadas
                por una comunidad de Másters y jugadores.
              </p>
            </div>

            <nav aria-label="Explorar">
              <h2 className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d9a84f]">
                Explorar
              </h2>
              <div className="mt-5 flex flex-col items-start gap-3">
                {exploreLinks.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="bg-transparent p-0 text-base font-semibold text-[#f2e6cf]/68 transition-colors hover:text-[#e4b45b]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>

            <nav aria-label="Información legal">
              <h2 className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d9a84f]">
                Información
              </h2>
              <div className="mt-5 flex flex-col items-start gap-3">
                {legalLinks.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="bg-transparent p-0 text-base font-semibold text-[#f2e6cf]/68 transition-colors hover:text-[#e4b45b]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>

            <div>
              <h2 className="m-0 text-xs font-extrabold uppercase tracking-[0.2em] text-[#d9a84f]">
                {t.footer.followUs}
              </h2>
              <div className="mt-5 flex flex-col items-start gap-3">
                <a
                  href="https://www.instagram.com/rolfantasyexp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-base font-semibold text-[#f2e6cf]/68 no-underline transition-colors hover:text-[#e4b45b]"
                >
                  <img className="h-5 w-5" alt="" src="/instagram.svg" />
                  Instagram
                </a>
                <a
                  href="https://x.com/RolFantasyExp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-base font-semibold text-[#f2e6cf]/68 no-underline transition-colors hover:text-[#e4b45b]"
                >
                  <img className="h-5 w-5" alt="" src="/twitter.svg" />
                  X / Twitter
                </a>
              </div>
            </div>
          </div>

          <div className="fe-divider mb-7 mt-12" />
          <div className="flex items-center justify-between gap-5 text-sm text-[#f2e6cf]/38 mq750:flex-col mq750:items-start">
            <p className="m-0">
              © {new Date().getFullYear()} Fantasy Experience. Todos los derechos
              reservados.
            </p>
            <p className="m-0">Hecho para quienes todavía creen en la magia de una buena mesa.</p>
          </div>
        </div>
      </footer>
    );
  },
);

Footer.displayName = "Footer";

export default Footer;
