import {
  FunctionComponent,
  memo,
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
import { useTranslation } from "../i18n";

const Root: FunctionComponent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<MasterFilters>(() => ({
    ...DEFAULT_MASTER_FILTERS,
    busqueda: searchParams.get("q")?.trim().slice(0, 100) || "",
  }));
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination (handled by MasterList mostly, but we keep state here if needed for API pagination later)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    const query = searchParams.get("q")?.trim().slice(0, 100) || "";
    setFilters((current) =>
      current.busqueda === query ? current : { ...current, busqueda: query }
    );
    setCurrentPage(1);
  }, [searchParams]);

  const fetchMasters = async () => {
    setLoading(true);
    try {
      const data = await ProfileService.getMasters();
      setProfiles(data);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar masters", "error");
    } finally {
      setLoading(false);
    }
  };

  const mappedMasters = useMemo(() => {
    return profiles.map(mapProfileToMaster);
  }, [profiles]);

  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, busqueda: query }));
    setSearchParams(query ? { q: query } : {}, { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, busqueda: "" }));
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  const handleSystemToggle = useCallback((system: SistemaJuego) => {
    setFilters((prev) => ({
      ...prev,
      sistemas: prev.sistemas.includes(system)
        ? prev.sistemas.filter((s) => s !== system)
        : [...prev.sistemas, system],
    }));
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(DEFAULT_MASTER_FILTERS);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  }, [setSearchParams]);

  const handleMasterClick = useCallback(
    (master: Master) => {
      // Navigate to Unified Profile
      navigate(`/user/${master.id}`);
    },
    [navigate]
  );

  const handleFiltersChange = useCallback((newFilters: MasterFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="w-full relative bg-black flex flex-col items-start justify-start pt-[7.75rem] pb-[5.562rem] pl-[4.937rem] pr-[4.5rem] box-border gap-[0.875rem] leading-[normal] tracking-[normal] text-left text-[1.125rem] text-white font-titulo-2 mq750:pl-[2.438rem] mq750:pr-[2.25rem] mq750:box-border mq450:pt-[4rem] mq450:pb-[3rem] mq450:pl-[1rem] mq450:pr-[1rem] mq450:gap-[0.5rem]">
      <div className="w-[80rem] h-[134.438rem] relative bg-black hidden max-w-full" />
      <section className="self-stretch flex flex-row items-start justify-start pt-[0rem] pb-[0.187rem] pl-[0.062rem] pr-[0.437rem] box-border max-w-full text-left text-[6.25rem] text-dark-gold font-titulo-2 mq450:px-[0.5rem] mq450:pb-[0.5rem]">
        <h1 className="m-0 h-[9rem] flex-1 relative text-inherit leading-[5rem] flex items-center max-w-full z-[1] font-[inherit] mq450:text-[1.875rem] mq450:leading-[2rem] mq450:h-auto mq450:py-[1rem] mq750:text-[3.125rem] mq750:leading-[3rem] mq750:h-[6rem]">
          <span>
            <p className="m-0 font-extrabold">{t.ourMasters.title1}</p>
            <p className="m-0">
              <i className="font-extrabold">{t.ourMasters.title2}</i>
              <span className="font-extrabold font-titulo-2"> {t.ourMasters.title3}</span>
            </p>
          </span>
        </h1>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.25rem] pr-[0.5rem] box-border min-h-[7.125rem] max-w-full text-left text-[1.125rem] text-nude font-titulo-2 mq450:px-[0.5rem] mq450:min-h-[5rem] mq450:text-[1rem]">
        <div className="flex-1 relative leading-[1.625rem] inline-block max-w-full z-[1] mq450:leading-[1.4rem]">
          {t.ourMasters.description}
        </div>
      </section>

      <MasterSystemFilters
        selectedSystems={filters.sistemas}
        onSystemToggle={handleSystemToggle}
        onClearAll={handleClearAllFilters}
      />

      <MasterSearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        initialValue={filters.busqueda}
      />

      <MasterAdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {loading ? (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="loader"></div>
        </div>
      ) : (
        <MasterList
          masters={mappedMasters}
          filters={filters}
          onMasterClick={handleMasterClick}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

    </div>
  );
};

export default Root;
