import { FunctionComponent, memo, useMemo } from "react";
import UnifiedMasterCard from "./UnifiedMasterCard";
import MasterPagination from "./MasterPagination";
import { Master, MasterFilters, RangoPrecio } from "../types/masters";

const priceRank: Record<RangoPrecio, number> = {
  Gratis: 0,
  "1-5€": 1,
  "6-10€": 2,
  "11-20€": 3,
  "21-30€": 4,
  "30€+": 5,
};

export type MasterListType = {
  className?: string;
  masters?: Master[];
  filters?: MasterFilters;
  onMasterClick?: (master: Master) => void;
  // Props de paginación
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
};

const MasterList: FunctionComponent<MasterListType> = memo(
  ({
    className = "",
    masters,
    filters,
    onMasterClick,
    currentPage = 1,
    itemsPerPage = 9,
    onPageChange,
  }) => {
    // Función para filtrar masters
    const filteredMasters = useMemo(() => {
      let result = [...(masters || [])];

      if (!filters) return result;

      // Filtro por búsqueda de texto
      if (filters.busqueda) {
        const searchTerm = filters.busqueda.toLowerCase();
        result = result.filter(
          (master) =>
            master.displayName.toLowerCase().includes(searchTerm) ||
            master.username.toLowerCase().includes(searchTerm) ||
            master.bio.toLowerCase().includes(searchTerm) ||
            master.sistemas.some((sistema) =>
              sistema.toLowerCase().includes(searchTerm)
            )
        );
      }

      // Filtro por sistemas de juego
      if (filters.sistemas.length > 0) {
        result = result.filter((master) =>
          filters.sistemas.some((sistema) =>
            master.sistemas.includes(sistema)
          )
        );
      }

      // Filtro por tipos de partida
      if (filters.tiposPartida.length > 0) {
        result = result.filter((master) =>
          filters.tiposPartida.some((tipo) =>
            master.tiposPartida.includes(tipo)
          )
        );
      }

      // Filtro por experiencia
      if (filters.experiencia.length > 0) {
        result = result.filter((master) =>
          filters.experiencia.includes(master.experiencia)
        );
      }

      // Filtro por disponibilidad
      if (filters.disponibilidad.length > 0) {
        result = result.filter((master) =>
          filters.disponibilidad.includes(master.disponibilidad)
        );
      }

      // Filtro por rating mínimo
      if (filters.ratingMin > 0) {
        result = result.filter((master) => master.rating >= filters.ratingMin);
      }

      if (filters.precioMin) {
        result = result.filter(
          (master) => master.precioPorSesion === filters.precioMin
        );
      }

      // Ordenamiento
      result.sort((a, b) => {
        let comparison = 0;

        switch (filters.ordenarPor) {
          case "ranking":
            comparison =
              Number(a.isFeatured) - Number(b.isFeatured) ||
              a.rankingScore - b.rankingScore;
            break;
          case "rating":
            comparison = a.rating - b.rating;
            break;
          case "nombre":
            comparison = a.displayName.localeCompare(b.displayName);
            break;
          case "experiencia":
            comparison = a.experiencia.localeCompare(b.experiencia);
            break;
          case "precio":
            comparison =
              priceRank[a.precioPorSesion] - priceRank[b.precioPorSesion];
            break;
          case "fechaRegistro":
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          default:
            comparison = 0;
        }

        return filters.ordenDireccion === "asc" ? comparison : -comparison;
      });

      return result;
    }, [masters, filters]);

    // Calcular masters paginados
    const paginatedMasters = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredMasters.slice(startIndex, endIndex);
    }, [filteredMasters, currentPage, itemsPerPage]);

    // Calcular total de páginas
    const totalPages = Math.ceil(filteredMasters.length / itemsPerPage);

    const handleMasterClick = (master: Master) => {
      if (onMasterClick) {
        onMasterClick(master);
      }
    };

    return (
      <div
        className={`w-full flex flex-col items-start justify-start ${className}`}
      >
        {/* Lista de masters */}
        <section className="grid w-full grid-cols-1 gap-5 pb-10 md:grid-cols-2 xl:grid-cols-3">
          {paginatedMasters.length > 0 ? (
            paginatedMasters.map((master) => (
              <UnifiedMasterCard
                key={master.id}
                master={master}
                onMasterClick={handleMasterClick}
              />
            ))
          ) : (
            <div className="fe-panel col-span-full flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 text-2xl text-[#d6a64c]" aria-hidden="true">◇</div>
              <h3 className="mb-2 font-titulo-1 text-2xl text-[#f3e7d1]">
                No encontramos Másters con esos filtros
              </h3>
              <p className="max-w-md text-sm leading-6 text-[#b8a894]">
                Prueba con otro sistema o abre los filtros avanzados para ampliar la búsqueda.
              </p>
            </div>
          )}
        </section>

        {/* Paginación */}
        {filteredMasters.length > 0 && onPageChange && (
          <MasterPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMasters.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    );
  }
);

export default MasterList;
