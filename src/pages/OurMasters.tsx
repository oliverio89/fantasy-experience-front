import {
  FunctionComponent,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MasterSearchBar from "../components/MasterSearchBar";
import MasterList from "../components/master-list";
import MasterSystemFilters from "../components/MasterSystemFilters";
import MasterAdvancedFilters from "../components/MasterAdvancedFilters";
import {
  MasterFilters,
  DEFAULT_MASTER_FILTERS,
  SistemaJuego,
  Master,
} from "../types/masters";
import {
  mapProfileToMaster,
  Profile,
  ProfileService,
} from "../services/profileService";
import { useToast } from "../context/ToastContext";

const Root: FunctionComponent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MasterFilters>(() => ({
    ...DEFAULT_MASTER_FILTERS,
    busqueda: searchParams.get("q")?.trim().slice(0, 100) || "",
  }));
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchMasters = async () => {
      setLoading(true);
      try {
        setProfiles(await ProfileService.getMasters());
      } catch (error) {
        console.error(error);
        showToast("Error al cargar Másters", "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchMasters();
  }, [showToast]);

  useEffect(() => {
    const query = searchParams.get("q")?.trim().slice(0, 100) || "";
    setFilters((current) =>
      current.busqueda === query ? current : { ...current, busqueda: query }
    );
    setCurrentPage(1);
  }, [searchParams]);

  const mappedMasters = useMemo(
    () => profiles.map(mapProfileToMaster),
    [profiles]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setFilters((prev) => ({ ...prev, busqueda: query }));
      setSearchParams(query ? { q: query } : {}, { replace: true });
      setCurrentPage(1);
    },
    [setSearchParams]
  );

  const handleClearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, busqueda: "" }));
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  const handleSystemToggle = useCallback((system: SistemaJuego) => {
    setFilters((prev) => ({
      ...prev,
      sistemas: prev.sistemas.includes(system)
        ? prev.sistemas.filter((item) => item !== system)
        : [...prev.sistemas, system],
    }));
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(DEFAULT_MASTER_FILTERS);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  const handleFiltersChange = useCallback((newFilters: MasterFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return (
    <main className="fe-surface-grid min-h-screen px-5 pb-24 pt-16 text-nude md:px-10 md:pt-20">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
        <header className="grid gap-8 xl:grid-cols-[1.45fr_0.55fr] xl:items-end">
          <div>
            <p className="fe-kicker mb-4">El gremio de narradores</p>
            <h1 className="fe-section-title max-w-[780px]">
              Encuentra al Máster de tu próxima historia
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#c9bba9]">
              Compara estilos, sistemas y experiencia con datos reales de su
              trayectoria dentro de la comunidad.
            </p>
          </div>
          <aside className="fe-panel p-5 text-sm leading-6 text-[#c9bba9]">
            <p className="fe-kicker mb-2">Ranking transparente</p>
            <p>
              Destacamos la valoración de jugadores, las partidas completadas
              y las aventuras publicadas. No hay posiciones compradas.
            </p>
          </aside>
        </header>

        <section className="fe-panel p-5 md:p-7" aria-label="Filtros de Másters">
          <MasterSystemFilters
            selectedSystems={filters.sistemas}
            onSystemToggle={handleSystemToggle}
            onClearAll={handleClearAllFilters}
          />
          <div className="fe-divider my-6" />
          <MasterSearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            initialValue={filters.busqueda}
          />
          <details className="group mt-6 border-t border-[#6f5436]/40 pt-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#d8b16a]">
              Afinar búsqueda
              <span className="text-xl transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <MasterAdvancedFilters
              className="mt-6"
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </details>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="fe-kicker">Perfiles públicos</p>
            <h2 className="mt-2 font-titulo-1 text-3xl text-[#f3e7d1] md:text-4xl">
              La mesa te está esperando
            </h2>
          </div>
          {!loading && (
            <span className="rounded-full border border-[#8d6a3e]/60 px-4 py-2 text-sm text-[#d4c4b0]">
              {mappedMasters.length} Másters
            </span>
          )}
        </div>

        {loading ? (
          <div className="fe-panel flex h-44 items-center justify-center" role="status">
            <div className="loader" />
            <span className="sr-only">Cargando Másters</span>
          </div>
        ) : (
          <MasterList
            masters={mappedMasters}
            filters={filters}
            onMasterClick={(master: Master) => navigate(`/master/${master.id}`)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </main>
  );
};

export default Root;
