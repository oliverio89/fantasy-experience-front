import { FunctionComponent, memo, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importamos useNavigate y useLocation
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../i18n";

export type FrameComponent1Type = {
  className?: string;
};

const Navbar: FunctionComponent<FrameComponent1Type> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate(); // Hook para redireccionar
    const location = useLocation(); // Hook para obtener la ruta actual
    const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar el menú hamburguesa
    const { user } = useAuth();
    const { t } = useTranslation();

    // Función para alternar el estado del menú
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };

    // Funciones para navegar
    const onHomeTextClick = useCallback(() => {
      navigate("/"); // Redirige a la ruta principal
      setMenuOpen(false); // Cierra el menú en pantallas pequeñas
    }, [navigate]);

    const onNuestrosMastersTextClick = useCallback(() => {
      navigate("/ourmasters"); // Redirige a la ruta /masters
      setMenuOpen(false);
    }, [navigate]);

    const onPartidasTextClick = useCallback(() => {
      navigate("/nextgames"); // Redirige a la ruta /partidas
      setMenuOpen(false);
    }, [navigate]);

    const onContactoTextClick = useCallback(() => {
      navigate("/contacto"); // Redirige a la ruta /contacto
      setMenuOpen(false);
    }, [navigate]);

    const onCrearPartidaClick = useCallback(() => {
      navigate("/crearpartida");
      setMenuOpen(false);
    }, [navigate]);

    const onUserDetailTextClick = useCallback(() => {
      if (user) {
        navigate("/user");
      } else {
        navigate("/login");
      }
      setMenuOpen(false);
    }, [navigate, user]);

    // Función para determinar si el enlace está activo
    const getLinkClass = (path: string) =>
      location.pathname === path ? "text-goldenrod" : "text-white";

    return (
      <section
        className={`self-stretch h-[90px] flex flex-row items-start justify-start pt-0 px-0 box-border top-[0] z-[99] sticky max-w-full ${className}`}
      >
        <header className="self-stretch flex-1 bg-black overflow-auto flex flex-row items-start justify-between py-1 px-20 box-border gap-5 max-w-full z-[1] text-center text-9xl text-dark-gold font-milonga mq750:pl-10 mq750:pr-10 mq750:box-border">
          <div className="self-stretch w-full relative bg-black hidden" />
          <h3 className="m-1 self-stretch w-[150px] p-1 relative text-inherit leading-[76.6%] font-normal font-[inherit] [display:-webkit-inline-box] items-center overflow-hidden text-ellipsis [-webkit-line-clamp:3] [-webkit-box-orient:vertical] shrink-0 z-[1]">
            <span className="[line-break:anywhere] w-full">
              <p className="m-1">Fantasy</p>
              <p className="m-1">Experience</p>
            </span>
          </h3>

          <div className="flex lg:hidden flex-row items-start justify-start gap-[145px] max-w-full text-4xs text-white font-titulo-2 mq1050:w-[337px] mq1050:gap-[73px] mq450:gap-9">
            <nav aria-label={t.navbar.ariaNav} className="m-0 flex-1 flex flex-row items-start justify-start gap-[52px] max-w-full text-center text-xl text-oldlace-100 font-titulo-2 mq750:gap-[26px] mq1050:hidden">
              {/* Enlace Inicio */}
              <a
                role="link"
                aria-label={t.navbar.ariaHome}
                aria-current={location.pathname === "/" ? "page" : undefined}
                className={`[text-decoration:none] h-20 relative font-medium flex items-center justify-center min-w-[52px] font-milonga cursor-pointer z-[1] ${getLinkClass(
                  "/"
                )}`}
                onClick={onHomeTextClick}
              >
                {t.navbar.home}
              </a>

              {/* Enlace Nuestros Másters */}
              <a
                role="link"
                aria-label={t.navbar.ariaMasters}
                aria-current={location.pathname === "/ourmasters" ? "page" : undefined}
                className={`[text-decoration:none] h-20 w-[143px] relative font-medium flex items-center font-milonga justify-center shrink-0 cursor-pointer z-[1] ${getLinkClass(
                  "/ourmasters"
                )}`}
                onClick={onNuestrosMastersTextClick}
              >
                {t.navbar.masters}
              </a>

              {/* Enlace Partidas */}
              <a
                role="link"
                aria-label={t.navbar.ariaGames}
                aria-current={location.pathname === "/nextgames" ? "page" : undefined}
                className={`[text-decoration:none] h-20 relative font-medium flex items-center font-milonga justify-center min-w-[70px] cursor-pointer z-[1] ${getLinkClass(
                  "/nextgames"
                )}`}
                onClick={onPartidasTextClick}
              >
                {t.navbar.games}
              </a>

              {/* Enlace Contacto */}
              <a
                role="link"
                aria-label={t.navbar.ariaContact}
                aria-current={location.pathname === "/contacto" ? "page" : undefined}
                className={`[text-decoration:none] h-20 relative font-medium flex items-center justify-center font-milonga min-w-[72px] cursor-pointer z-[1] ${getLinkClass(
                  "/contacto"
                )}`}
                onClick={onContactoTextClick}
              >
                {t.navbar.contact}
              </a>

              {/* Crear partida — solo si hay sesión activa */}
              {user && (
                <a
                  role="link"
                  aria-label={t.navbar.ariaCreateGame}
                  aria-current={location.pathname === "/crearpartida" ? "page" : undefined}
                  className="[text-decoration:none] h-20 relative font-medium flex items-center justify-center font-milonga cursor-pointer z-[1] text-dark-gold hover:text-goldenrod transition-colors"
                  onClick={onCrearPartidaClick}
                >
                  {t.navbar.createGame}
                </a>
              )}
            </nav>

            <div className="h-[61px] flex flex-col items-start justify-start pt-[19px] px-0 pb-0 box-border">
              <div className="self-stretch flex-1 flex flex-row items-start justify-start gap-[24.2px]">
                <button
                  onClick={onUserDetailTextClick}
                  aria-label={user ? t.navbar.ariaMyAccount : t.navbar.ariaLogin}
                  className="cursor-pointer border-dark-gold border-[1px] border-solid py-[7px] px-[19px] bg-[transparent] self-stretch flex-1 rounded-11xl flex flex-row items-start justify-start gap-[5px] z-[1] hover:bg-dark-gold/10 transition-colors"
                >
                  <img
                    className="h-6 w-6 relative overflow-hidden shrink-0"
                    alt=""
                    aria-hidden="true"
                    src="/user.svg"
                  />
                  <div className="flex-1 flex flex-col items-start justify-start pt-px px-0 pb-0">
                    <span className="[text-decoration:none] self-stretch relative text-lg font-bold font-titulo-2  text-dark-gold text-center whitespace-nowrap">
                      {user ? t.navbar.myAccount : t.navbar.login}
                    </span>
                  </div>
                  <div className="h-[42px] w-[140px] relative rounded-11xl border-dark-gold border-[1px] border-solid box-border hidden" />
                </button>
              </div>
            </div>
          </div>

          {/* Menú hamburguesa */}
          <div className="hidden lg:flex items-center justify-center p-2">
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? t.navbar.ariaCloseMenu : t.navbar.ariaOpenMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="focus:outline-none bg-black border-2 border-dark-gold rounded-full p-2"
              style={{ height: "50px", width: "50px" }}
            >
              <svg
                className="w-8 h-8 text-dark-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                  stroke="currentColor"
                ></path>
              </svg>
            </button>
          </div>

          {/* Fondo semitransparente detrás del menú hamburguesa */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleMenu}
              ></div>
              <div id="mobile-menu" className="fixed top-0 left-0 w-auto h-full bg-black text-white z-50 overflow-y-auto lg:flex animate-slide-in-right">
                <nav aria-label={t.navbar.ariaMobileNav} className="flex flex-col items-start justify-start text-xl font-titulo-2 text-white space-y-4 p-5">
                  <a
                    aria-label={t.navbar.ariaHome}
                    aria-current={location.pathname === "/" ? "page" : undefined}
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/"
                    )}`}
                    onClick={onHomeTextClick}
                  >
                    {t.navbar.home}
                  </a>
                  <a
                    aria-label={t.navbar.ariaMasters}
                    aria-current={location.pathname === "/ourmasters" ? "page" : undefined}
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/ourmasters"
                    )}`}
                    onClick={onNuestrosMastersTextClick}
                  >
                    {t.navbar.masters}
                  </a>
                  <a
                    aria-label={t.navbar.ariaGames}
                    aria-current={location.pathname === "/nextgames" ? "page" : undefined}
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/nextgames"
                    )}`}
                    onClick={onPartidasTextClick}
                  >
                    {t.navbar.games}
                  </a>
                  <a
                    aria-label={t.navbar.ariaContact}
                    aria-current={location.pathname === "/contacto" ? "page" : undefined}
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/contacto"
                    )}`}
                    onClick={onContactoTextClick}
                  >
                    {t.navbar.contact}
                  </a>

                  {/* Crear partida en menú móvil */}
                  <a
                    aria-label={t.navbar.ariaCreateGame}
                    className="[text-decoration:none] h-20 font-medium flex items-center justify-start w-full text-dark-gold"
                    onClick={onCrearPartidaClick}
                  >
                    {t.navbar.createGame}
                  </a>

                  {/* Mi cuenta dentro del menú hamburguesa */}
                  <div className="flex flex-col items-start justify-start w-full gap-4">
                    <button
                      onClick={onUserDetailTextClick}
                      className="cursor-pointer border-dark-gold border-[1px] border-solid py-[7px] px-[19px] bg-[transparent] rounded-11xl flex flex-row items-start justify-start gap-[5px]"
                    >
                      <img
                        className="h-6 w-6 relative overflow-hidden shrink-0"
                        alt={t.navbar.myAccount}
                        src="/user.svg"
                      />
                      <div className="flex-1 flex flex-col items-start justify-start pt-px px-0 pb-0">
                        <span className="relative text-lg font-bold font-titulo-2 text-dark-gold text-center whitespace-nowrap">
                          {user ? t.navbar.myAccount : t.navbar.login}
                        </span>
                      </div>
                    </button>
                  </div>
                </nav>
              </div>
            </>
          )}
        </header>
      </section>
    );
  }
);

export default Navbar;
