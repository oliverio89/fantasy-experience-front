import { FunctionComponent, memo, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importamos useNavigate y useLocation

export type FrameComponent1Type = {
  className?: string;
};

const Navbar: FunctionComponent<FrameComponent1Type> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate(); // Hook para redireccionar
    const location = useLocation(); // Hook para obtener la ruta actual
    const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar el menú hamburguesa

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

    const onUserDetailTextClick = useCallback(() => {
      navigate("/user"); // Redirige a la ruta /contacto
      setMenuOpen(false);
    }, [navigate]);

    // Función para determinar si el enlace está activo
    const getLinkClass = (path: string) =>
      location.pathname === path ? "text-goldenrod" : "text-white";

    return (
      <section
        className={`self-stretch flex flex-row items-start justify-start pt-0 px-0  box-border top-[0] z-[99] sticky max-w-full ${className}`}
      >
        <header className="self-stretch flex-1 bg-black overflow-auto flex flex-row items-start justify-between py-0 px-20 box-border gap-5 max-w-full z-[1] text-center text-9xl text-dark-gold font-milonga mq750:pl-10 mq750:pr-10 mq750:box-border">
          <div className="self-stretch w-[1280px] relative bg-black hidden" />
          <h3 className="m-1 self-stretch w-[150px] relative text-inherit leading-[76.6%] font-normal font-[inherit] [display:-webkit-inline-box] items-center overflow-hidden text-ellipsis [-webkit-line-clamp:3] [-webkit-box-orient:vertical] shrink-0 z-[1]">
            <span className="[line-break:anywhere] w-full">
              <p className="m-1">Fantasy</p>
              <p className="m-1">Experience</p>
            </span>
          </h3>

          <div className="flex lg:hidden flex-row items-start justify-start gap-[145.3px] max-w-full text-4xs text-white font-titulo-2 mq1050:w-[337px] mq1050:gap-[73px] mq450:gap-9">
            <nav className="m-0 flex-1 flex flex-row items-start justify-start gap-[52px] max-w-full text-center text-xl text-oldlace-100 font-titulo-2 mq750:gap-[26px] mq1050:hidden">
              {/* Enlace Inicio */}
              <a
                className={`[text-decoration:none] h-20 relative font-medium flex items-center justify-center min-w-[52px] cursor-pointer z-[1] ${getLinkClass(
                  "/"
                )}`}
                onClick={onHomeTextClick}
              >
                Inicio
              </a>

              {/* Enlace Nuestros Másters */}
              <a
                className={`[text-decoration:none] h-20 w-[143px] relative font-medium flex items-center justify-center shrink-0 cursor-pointer z-[1] ${getLinkClass(
                  "/ourmasters"
                )}`}
                onClick={onNuestrosMastersTextClick}
              >
                Nuestros Másters
              </a>

              {/* Enlace Partidas */}
              <a
                className={`[text-decoration:none] h-20 relative font-medium flex items-center justify-center min-w-[70px] cursor-pointer z-[1] ${getLinkClass(
                  "/nextgames"
                )}`}
                onClick={onPartidasTextClick}
              >
                Partidas
              </a>

              {/* Enlace Contacto */}
              <a
                className={`[text-decoration:none] h-20 relative font-medium flex items-center justify-center min-w-[72px] cursor-pointer z-[1] ${getLinkClass(
                  "/contacto"
                )}`}
                onClick={onContactoTextClick}
              >
                Contacto
              </a>
            </nav>

            <div className="h-[61px] flex flex-col items-start justify-start pt-[19px] px-0 pb-0 box-border">
              <div className="self-stretch flex-1 flex flex-row items-start justify-start gap-[24.2px]">
                <div className="flex flex-col items-start justify-start pt-[7px] px-0 pb-0">
                  <div className="self-stretch flex flex-col items-end justify-start gap-[4.9px]">
                    <div className="self-stretch h-[19.1px] relative">
                      <img
                        className="absolute top-[0.3px] left-[0px] w-full h-full z-[1]"
                        loading="lazy"
                        alt=""
                        src="/vector.svg"
                      />
                      <div className="absolute top-[-1px] left-[10.7px] w-3 h-[13px]">
                        <div className="absolute top-[1px] left-[0px] rounded-[50%] bg-oldlace-100 w-3 h-3 z-[2]" />
                        <a className="[text-decoration:none] absolute top-[0px] left-[3.6px] text-[inherit] flex items-center justify-center w-[5.8px] h-3 min-w-[5.8px] z-[3]">
                          2
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-row items-start justify-end py-0 pl-[9px] pr-0.5">
                      <div className="h-[2.5px] w-[16.3px] relative">
                        <img
                          className="absolute top-[0px] left-[0px] w-[2.5px] h-[2.5px] z-[1]"
                          alt=""
                          src="/vector-1.svg"
                        />
                        <img
                          className="absolute top-[0px] left-[13.8px] w-[2.5px] h-[2.5px] z-[1]"
                          alt=""
                          src="/vector-2.svg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button className="cursor-pointer border-dark-gold border-[1px] border-solid py-[7px] px-[19px] bg-[transparent] self-stretch flex-1 rounded-11xl flex flex-row items-start justify-start gap-[5px] z-[1]">
                  <img
                    className="h-6 w-6 relative overflow-hidden shrink-0"
                    alt=""
                    src="/user.svg"
                  />
                  <div className="flex-1 flex flex-col items-start justify-start pt-px px-0 pb-0">
                    <a
                      className="[text-decoration:none] self-stretch relative text-lg font-bold font-titulo-2 text-dark-gold text-center"
                      onClick={onUserDetailTextClick}
                    >
                      Mi cuenta
                    </a>
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
              className="focus:outline-none bg-black border-2 border-dark-gold rounded-full p-2"
              style={{ height: "50px", width: "50px" }} // Aseguramos que el tamaño del botón sea consistente
            >
              <svg
                className="w-8 h-8 text-dark-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
              <div className="fixed top-0 left-0 w-auto h-full bg-black text-white z-50 overflow-y-auto lg:flex">
                <nav className="flex flex-col items-start justify-start text-xl font-titulo-2 text-white space-y-4 p-5">
                  <a
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/"
                    )}`}
                    onClick={onHomeTextClick}
                  >
                    Inicio
                  </a>
                  <a
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/ourmasters"
                    )}`}
                    onClick={onNuestrosMastersTextClick}
                  >
                    Nuestros Másters
                  </a>
                  <a
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/nextgames"
                    )}`}
                    onClick={onPartidasTextClick}
                  >
                    Partidas
                  </a>
                  <a
                    className={`[text-decoration:none] h-20 font-medium flex items-center justify-start w-full ${getLinkClass(
                      "/contacto"
                    )}`}
                    onClick={onContactoTextClick}
                  >
                    Contacto
                  </a>

                  {/* Carrito dentro del menú hamburguesa */}
                  <div className="flex flex-col items-start justify-start w-full gap-4">
                    <div className="flex flex-col items-start justify-start pt-[7px] px-0 pb-0">
                      <div className="self-stretch flex flex-col items-end justify-start gap-[4.9px]">
                        <div className="self-stretch h-[19.1px] relative">
                          <img
                            className="absolute top-[0.3px] left-[0px] w-full h-full z-[1]"
                            loading="lazy"
                            alt="Carrito"
                            src="/vector.svg"
                          />
                          <div className="absolute top-[-1px] left-[10.7px] w-3 h-[13px]">
                            <div className="absolute top-[1px] left-[0px] rounded-[50%] bg-oldlace-100 w-3 h-3 z-[2]" />
                            <a className="absolute top-[0px] left-[3.6px] text-[inherit] flex items-center justify-center w-[5.8px] h-3 min-w-[5.8px] z-[3]">
                              2
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-row items-start justify-end py-0 pl-[9px] pr-0.5">
                          <div className="h-[2.5px] w-[16.3px] relative">
                            <img
                              className="absolute top-[0px] left-[0px] w-[2.5px] h-[2.5px] z-[1]"
                              alt="icon"
                              src="/vector-1.svg"
                            />
                            <img
                              className="absolute top-[0px] left-[13.8px] w-[2.5px] h-[2.5px] z-[1]"
                              alt="icon"
                              src="/vector-2.svg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mi cuenta dentro del menú hamburguesa */}
                    <button className="cursor-pointer border-dark-gold border-[1px] border-solid py-[7px] px-[19px] bg-[transparent] rounded-11xl flex flex-row items-start justify-start gap-[5px]">
                      <img
                        className="h-6 w-6 relative overflow-hidden shrink-0"
                        alt="Mi cuenta"
                        src="/user.svg"
                      />
                      <div className="flex-1 flex flex-col items-start justify-start pt-px px-0 pb-0">
                        <a
                          className="relative text-lg font-bold font-titulo-2 text-dark-gold text-center"
                          onClick={onUserDetailTextClick}
                        >
                          Mi cuenta
                        </a>
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
