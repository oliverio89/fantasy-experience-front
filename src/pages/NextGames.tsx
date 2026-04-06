import {
  FunctionComponent,
  memo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { PRESET_TAGS } from "../constants";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import PartidaCard, { Partida } from "../components/PartidaCard";
import { usePartidas } from "../hooks/usePartidas"; // Usar el hook genérico
import { useTranslation } from "../i18n";

export type RootType = {
  className?: string;
};

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filtroTipo, setFiltroTipo] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState<string>("");
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const LIMIT = 12;

  // States for new filters
  const [filtroSistema, setFiltroSistema] = useState<string>("");
  const [filtroFecha, setFiltroFecha] = useState<string>("");

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [busqueda]);

  // Usar el hook genérico para ver TODAS las partidas
  const {
    partidas: proximasPartidas,
    loading,
    error,
    paginacion,
  } = usePartidas({
    limit: LIMIT,
    page: currentPage,
    tipo: filtroTipo.length > 0 ? filtroTipo : undefined,
    busqueda: debouncedBusqueda,
    sistemaJuego: filtroSistema || undefined,
    fechaInicio: filtroFecha || new Date().toISOString().split("T")[0],
  });

  const onButtonClick = useCallback(() => {
    navigate("/crearpartida");
  }, [navigate]);

  const handleLimpiar = useCallback(() => {
    setBusqueda("");
    setFiltroTipo([]);
    setFiltroTags([]);
    setFiltroSistema("");
    setFiltroFecha("");
    setCurrentPage(1);
  }, []);

  const handleBuscar = useCallback(() => {
    console.log(
      "Buscar:",
      busqueda,
      "Filtro:",
      filtroTipo,
      "Tags:",
      filtroTags,
      "Sistema:",
      filtroSistema,
      "Fecha:",
      filtroFecha
    );
  }, [busqueda, filtroTipo, filtroTags, filtroSistema, filtroFecha]);

  const toggleFiltro = useCallback((tipo: string) => {
    setFiltroTipo((prev) => {
      if (prev.includes(tipo)) {
        return prev.filter((t) => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
    setCurrentPage(1);
  }, []);

  const toggleTagFiltro = useCallback((tag: string) => {
    setFiltroTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

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
            {t.gamesPage.title}
          </h1>
          <Button
            button1={t.gamesPage.createButton}
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
            onClick={onButtonClick}
          />
        </header>

        {/* Descripción */}
        <div className="self-stretch text-left text-lg text-white leading-[26px] font-texto">
          {t.gamesPage.description}
        </div>

        {/* Filtros y búsqueda */}
        <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full">
          <div className="text-left text-lg text-white leading-[26px] font-texto mb-2">
            {t.gamesPage.filterTypeLabel}
          </div>

          {/* Botones de filtro - SIN "Todos" */}
          <div className="flex flex-row items-start justify-start gap-2.5 mb-[27px] flex-wrap">
            <button
              onClick={() => toggleFiltro("Online")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo.includes("Online")
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Online
              </span>
            </button>
            <button
              onClick={() => toggleFiltro("Presencial")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo.includes("Presencial")
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Presencial
              </span>
            </button>
            <button
              onClick={() => toggleFiltro("Digital")}
              className={`h-[30px] px-4 cursor-pointer [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border overflow-hidden flex flex-row items-center justify-center py-[3px] transition-all ${
                filtroTipo.includes("Digital")
                  ? "bg-nude text-black"
                  : "bg-transparent text-nude hover:bg-nude/20"
              }`}
            >
              <span className="relative leading-[20px] text-base font-texto">
                Digital
              </span>
            </button>
          </div>

          {/* Filtros Avanzados: Sistema y Fecha */}
          <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full mb-[27px]">
            <div className="text-left text-lg text-white leading-[26px] font-texto mb-2">
              {t.gamesPage.advancedFiltersTitle}
            </div>
            <div className="flex flex-row gap-4 flex-wrap">
              {/* Filtro Sistema */}
              <select
                value={filtroSistema}
                onChange={(e) => { setFiltroSistema(e.target.value); setCurrentPage(1); }}
                className="h-[42px] px-4 rounded-xl border-nude border-[1px] border-solid bg-transparent text-nude font-texto text-base focus:outline-none focus:border-dark-gold cursor-pointer"
              >
                <option value="" className="bg-black text-nude">
                  {t.gamesPage.allSystems}
                </option>
                <option value="D&D 5e" className="bg-black text-nude">
                  {t.gamesPage.systemDnD}
                </option>
                <option value="Cthulhu" className="bg-black text-nude">
                  {t.gamesPage.systemCthulhu}
                </option>
                <option value="Pathfinder 2e" className="bg-black text-nude">
                  {t.gamesPage.systemPathfinder}
                </option>
                <option value="Vampiro" className="bg-black text-nude">
                  {t.gamesPage.systemVampiro}
                </option>
                <option value="Otro" className="bg-black text-nude">
                  {t.gamesPage.systemOther}
                </option>
              </select>

              {/* Filtro Fecha Inicio */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-nude font-texto">{t.gamesPage.dateFromLabel}</span>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="h-[42px] px-4 rounded-xl border-nude border-[1px] border-solid bg-transparent text-nude font-texto text-base focus:outline-none focus:border-dark-gold cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="self-stretch flex flex-col items-start justify-start gap-[5px] max-w-full">
            <div className="text-left text-lg text-white leading-[26px] font-texto mb-2">
              {t.gamesPage.searchLabel}
            </div>
            <div className="self-stretch flex flex-row items-center justify-start gap-5 max-w-full mq1050:flex-wrap">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                placeholder={t.gamesPage.searchPlaceholder}
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
                  {t.common.clear}
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
                <b className="relative text-lg font-texto text-black">{t.common.search}</b>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de partidas - 3 columnas fijas */}
        {loading ? (
          <div className="self-stretch flex flex-col items-center justify-center py-20 text-white gap-4">
            <div className="loader"></div>
            <div className="text-nude font-texto">{t.gamesPage.loading}</div>
          </div>
        ) : error ? (
          <div className="self-stretch flex flex-col items-center justify-center py-20 text-white">
            <div className="text-2xl font-bold mb-4 text-red-500">
              {t.gamesPage.errorLoading}
            </div>
            <div className="text-nude">{error}</div>
          </div>
        ) : proximasPartidas.length === 0 ? (
          <div className="self-stretch flex flex-col items-center justify-center py-20 text-white">
            <div className="text-2xl font-bold mb-4">
              {t.gamesPage.noResults}
            </div>
          </div>
        ) : (
          <div className="self-stretch grid grid-cols-3 gap-x-[18px] gap-y-[43px] max-w-full mq1050:grid-cols-2 mq750:grid-cols-1">
            {proximasPartidas.map((partida, index) => (
              <PartidaCard
                key={partida.id}
                partida={partida}
                mostrarDescripcion={true}
                backgroundColor={getBackgroundColor(index)}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {paginacion && paginacion.totalPages > 1 && (
          <div className="self-stretch flex flex-row items-center justify-center gap-8 text-lg text-nude font-texto py-10">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className="cursor-pointer bg-transparent border-none flex flex-row items-center justify-center gap-2 hover:text-dark-gold transition-colors group"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nude group-hover:text-dark-gold" />
                </svg>
                <b className="relative text-lg [text-decoration:underline] font-texto text-nude group-hover:text-dark-gold">
                  {t.common.back}
                </b>
              </button>
            )}
            <span className="text-nude font-texto">
              {t.common.page} {currentPage} {t.common.of} {paginacion.totalPages}
            </span>
            {currentPage < paginacion.totalPages && (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="cursor-pointer bg-transparent border-none flex flex-row items-center justify-center gap-2 hover:text-dark-gold transition-colors group"
              >
                <b className="relative text-lg [text-decoration:underline] font-texto text-nude group-hover:text-dark-gold">
                  {t.common.next}
                </b>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nude group-hover:text-dark-gold" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default Root;
