import {
  FunctionComponent,
  memo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { PRESET_TAGS } from "../constants";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/button";
import PartidaCard, { Partida } from "../components/PartidaCard";
import { usePartidas } from "../hooks/usePartidas"; // Usar el hook genérico
import { useTranslation } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { SISTEMAS_JUEGO, TIPOS_PARTIDA } from "../types/masters";

export type RootType = {
  className?: string;
};

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<Partida["tipoPartida"][]>(() => {
    const requestedType = searchParams.get("tipo") as Partida["tipoPartida"] | null;
    return requestedType && TIPOS_PARTIDA.includes(requestedType) ? [requestedType] : [];
  });
  const [busqueda, setBusqueda] = useState<string>("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState<string>("");
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [catalogStart] = useState(() => new Date().toISOString());
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
    recargar,
  } = usePartidas({
    limit: LIMIT,
    page: currentPage,
    tipo: filtroTipo.length > 0 ? filtroTipo : undefined,
    busqueda: debouncedBusqueda,
    tags: filtroTags.length > 0 ? filtroTags : undefined,
    sistemaJuego: filtroSistema || undefined,
    fechaInicio: filtroFecha || catalogStart,
    status: "active",
    ordenarPor: "start_date",
    ordenAscendente: true,
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
    setDebouncedBusqueda(busqueda.trim());
    setCurrentPage(1);
  }, [busqueda]);

  const toggleFiltro = useCallback((tipo: Partida["tipoPartida"]) => {
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
    setCurrentPage(1);
  }, []);

  // Función para alternar colores de fondo
  const getBackgroundColor = (index: number) => {
    return index % 2 === 0 ? "#1b130d" : "#21170f";
  };

  return (
    <div
      className={`fe-surface-grid flex min-h-screen w-full flex-col items-center justify-start px-8 py-16 leading-[normal] tracking-[normal] mq750:px-5 mq750:py-10 ${className}`}
    >
      <div className="flex w-full max-w-[1180px] flex-col items-start justify-start gap-8">
        {/* Header con título y botón */}
        <header className="flex self-stretch items-end justify-between gap-8 mq1050:flex-wrap">
          <div>
            <p className="fe-kicker">El tablón de la taberna</p>
            <h1 className="fe-section-title mt-4">
              Partidas y <em>aventuras</em>
            </h1>
          </div>
          {(userRole === "master" || userRole === "admin") && (
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
          )}
        </header>

        {/* Descripción */}
        <div className="max-w-[720px] text-left text-lg leading-7 text-[#f2e6cf]/58 font-texto">
          {t.gamesPage.description}
        </div>

        {/* Filtros y búsqueda */}
        <div className="fe-panel flex max-w-full self-stretch flex-col items-start justify-start gap-5 rounded-[24px] p-8 mq750:p-5">
          <div className="mb-0 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#d9a84f]">
            {t.gamesPage.filterTypeLabel}
          </div>

          {/* Botones de filtro - SIN "Todos" */}
          <div className="mb-1 flex flex-row flex-wrap items-start justify-start gap-2.5">
            {TIPOS_PARTIDA.map((tipo) => (
              <button
                key={tipo}
                onClick={() => toggleFiltro(tipo)}
                className={`flex min-h-[38px] items-center justify-center overflow-hidden rounded-full border px-5 py-2 transition-all ${
                  filtroTipo.includes(tipo)
                    ? "border-[#d9a84f] bg-[#d9a84f] text-[#120d09]"
                    : "border-[#f2e6cf]/25 bg-transparent text-nude/75 hover:border-[#d9a84f]/65 hover:text-[#e1ae4f]"
                }`}
              >
                <span className="relative leading-[20px] text-base font-texto">
                  {tipo === "Presencial"
                    ? "En mesa"
                    : tipo === "Digital"
                    ? "Aventura descargable"
                    : tipo}
                </span>
              </button>
            ))}
          </div>

          {/* Filtros Avanzados: Sistema y Fecha */}
          <div className="mb-1 flex max-w-full flex-col items-start justify-start gap-3 self-stretch">
            <div className="text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#d9a84f]">
              {t.gamesPage.advancedFiltersTitle}
            </div>
            <div className="flex flex-row gap-4 flex-wrap">
              {/* Filtro Sistema */}
              <select
                value={filtroSistema}
                onChange={(e) => { setFiltroSistema(e.target.value); setCurrentPage(1); }}
                className="h-[46px] rounded-xl border border-[#d8a651]/25 bg-[#100c09]/55 px-4 text-nude font-texto text-base focus:border-[#d9a84f] focus:outline-none"
              >
                <option value="" className="bg-black text-nude">
                  {t.gamesPage.allSystems}
                </option>
                {SISTEMAS_JUEGO.map((sistema) => (
                  <option
                    key={sistema}
                    value={sistema}
                    className="bg-black text-nude"
                  >
                    {sistema}
                  </option>
                ))}
              </select>

              {/* Filtro Fecha Inicio */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-nude font-texto">{t.gamesPage.dateFromLabel}</span>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => {
                    setFiltroFecha(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[46px] rounded-xl border border-[#d8a651]/25 bg-[#100c09]/55 px-4 text-nude font-texto text-base focus:border-[#d9a84f] focus:outline-none [color-scheme:dark]"
                  disabled={filtroTipo.length === 1 && filtroTipo[0] === "Digital"}
                />
              </div>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="flex max-w-full flex-col items-start justify-start gap-3 self-stretch">
            <div className="text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#d9a84f]">
              {t.gamesPage.searchLabel}
            </div>
            <div className="self-stretch flex flex-row items-center justify-start gap-5 max-w-full mq1050:flex-wrap">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                placeholder={t.gamesPage.searchPlaceholder}
                className="h-[50px] min-w-[300px] flex-1 rounded-xl border border-[#d8a651]/25 bg-[#100c09]/55 px-4 py-3 text-sm font-light text-nude placeholder:text-nude/35 focus:border-[#d9a84f] focus:outline-none font-texto"
              />
              <button
                onClick={handleLimpiar}
                className="fe-button-secondary group h-[46px] gap-2 bg-transparent px-6"
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
                className="fe-button h-[46px] gap-2 px-8"
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
            <button
              type="button"
              onClick={() => void recargar()}
              className="mt-6 rounded-full bg-dark-gold px-6 py-2 text-black font-bold"
            >
              Reintentar
            </button>
          </div>
        ) : proximasPartidas.length === 0 ? (
          <div className="self-stretch flex flex-col items-center justify-center py-20 text-white">
            <div className="text-2xl font-bold mb-4">
              {t.gamesPage.noResults}
            </div>
          </div>
        ) : (
          <div className="grid max-w-full grid-cols-3 gap-6 self-stretch mq1050:grid-cols-2 mq750:grid-cols-1">
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
