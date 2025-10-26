import { FunctionComponent, memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import PartidaCard, { Partida } from "../components/PartidaCard";

export type RootType = {
  className?: string;
};

// Datos de ejemplo (hardcodeados - vendrán de API)
const partidasEjemplo: Partida[] = [
  {
    id: 1,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "presencial",
    rating: 4,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
  {
    id: 2,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "online",
    rating: 5,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
  {
    id: 3,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "digital",
    rating: 3,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
  {
    id: 4,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "digital",
    rating: 4,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
  {
    id: 5,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "presencial",
    rating: 5,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
  {
    id: 6,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "online",
    rating: 4,
    descripcion:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  },
];

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  const onButtonClick = useCallback(() => {
    navigate("/crearpartida");
  }, [navigate]);

  const handleLimpiar = useCallback(() => {
    setBusqueda("");
    setFiltroTipo("");
  }, []);

  const handleBuscar = useCallback(() => {
    console.log("Buscar:", busqueda, "Filtro:", filtroTipo);
  }, [busqueda, filtroTipo]);

  // Función para alternar colores de fondo
  const getBackgroundColor = (index: number) => {
    return index % 2 === 0 ? "#f2ecdd" : "#DAB16A";
  };

  return (
    <div
      className={`w-full min-h-screen bg-black flex flex-col items-center justify-start py-10 px-5 leading-[normal] tracking-[normal] ${className}`}
    >
      <div className="w-full max-w-[1280px] flex flex-col items-start justify-start gap-[55px] mq725:gap-[27px]">
        {/* Header con título y botón */}
        <header className="self-stretch flex flex-row items-start justify-between pt-4 px-0 pb-0 gap-4 text-left text-81xl text-dark-gold font-texto mq1050:flex-wrap">
          <h1 className="m-0 text-inherit leading-[80px] font-extrabold font-[inherit] flex items-center whitespace-nowrap mq1050:text-[60px] mq1050:leading-[64px] mq450:text-[40px] mq450:leading-[48px]">
            Próximas partidas
          </h1>
          <Button
            button1="Crear nueva partida"
            button1Padding="10px 54px"
            button1Height="42px"
            button1Width="250px"
            button1Height1="22px"
            button1Width1="143px"
            button1FontSize="18px"
            button1BackgroundColor="#cd9c20"
            button1Border="none"
            button1TextDecoration="none"
            button1FontWeight="700"
            __PH1__={onButtonClick}
          />
        </header>

        {/* Descripción */}
        <div className="self-stretch text-left text-lg text-white leading-[26px] font-texto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </div>

        {/* Filtros y búsqueda */}
        <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full">
          <div className="text-left text-lg text-white leading-[26px] font-texto mb-2">
            Elije el tipo de partida :
          </div>

          {/* Botones de filtro - SIN "Todos" */}
          <div className="flex flex-row items-start justify-start gap-2.5 mb-[27px] flex-wrap">
            <button
              onClick={() => setFiltroTipo("online")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo === "online"
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Online
              </span>
            </button>
            <button
              onClick={() => setFiltroTipo("presencial")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo === "presencial"
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Presencial
              </span>
            </button>
            <button
              onClick={() => setFiltroTipo("rol")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo === "rol"
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                ROL
              </span>
            </button>
            <button
              onClick={() => setFiltroTipo("digital")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo === "digital"
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Digital
              </span>
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full">
            <div className="text-left text-lg text-white leading-[26px] font-texto mb-2">
              Busca una partida por título de la partida o nombre del Máster:
            </div>
            <div className="self-stretch flex flex-row items-center justify-start gap-5 max-w-full mq1050:flex-wrap">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escribe el título de la partida o el nombre del Máster"
                className="flex-1 min-w-[300px] rounded-xl border-nude border-[1px] border-solid box-border py-3 px-[13px] h-[50px] bg-transparent text-nude text-sm font-light font-texto placeholder:text-nude/60 focus:outline-none focus:border-dark-gold"
              />
              <button
                onClick={handleLimpiar}
                className="cursor-pointer border-nude border-[1px] border-solid py-2 px-8 bg-transparent h-[42px] rounded-31xl box-border flex flex-row items-center justify-center gap-2 hover:bg-nude hover:text-black transition-all group"
              >
                <svg
                  className="w-5 h-5 relative overflow-hidden shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-nude group-hover:text-black"
                  />
                  <path
                    d="M15 9L9 15M9 9L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-nude group-hover:text-black"
                  />
                </svg>
                <b className="relative text-lg font-texto text-nude group-hover:text-black">
                  Limpiar
                </b>
              </button>
              <button
                onClick={handleBuscar}
                className="cursor-pointer [border:none] py-2.5 px-10 bg-nude h-[42px] rounded-31xl flex flex-row items-center justify-center gap-1 hover:bg-dark-gold transition-all"
              >
                <svg
                  className="w-5 h-5 relative overflow-hidden shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-black"
                  />
                  <path
                    d="M21 21L16.5 16.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-black"
                  />
                </svg>
                <b className="relative text-lg font-texto text-black">Buscar</b>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de partidas - 3 columnas fijas */}
        <div className="self-stretch grid grid-cols-3 gap-x-[18px] gap-y-[43px] max-w-full mq1050:grid-cols-2 mq750:grid-cols-1">
          {partidasEjemplo.map((partida, index) => (
            <PartidaCard
              key={partida.id}
              partida={partida}
              mostrarDescripcion={true}
              backgroundColor={getBackgroundColor(index)}
            />
          ))}
        </div>

        {/* Paginación */}
        <div className="self-stretch flex flex-row items-center justify-center gap-8 text-lg text-nude font-texto py-10">
          <button className="cursor-pointer bg-transparent border-none flex flex-row items-center justify-center gap-2 hover:text-dark-gold transition-colors group">
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-nude group-hover:text-dark-gold"
              />
            </svg>
            <b className="relative text-lg [text-decoration:underline] font-texto text-nude group-hover:text-dark-gold">
              Atrás
            </b>
          </button>
          <button className="cursor-pointer bg-transparent border-none flex flex-row items-center justify-center gap-2 hover:text-dark-gold transition-colors group">
            <b className="relative text-lg [text-decoration:underline] font-texto text-nude group-hover:text-dark-gold">
              Siguiente
            </b>
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-nude group-hover:text-dark-gold"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default Root;
