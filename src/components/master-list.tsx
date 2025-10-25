import { FunctionComponent, memo, useMemo } from "react";
import UnifiedMasterCard from "./UnifiedMasterCard";
import MasterPagination from "./MasterPagination";
import { MASTERS_DATA } from "../data/mastersData";
import { Master, MasterFilters, SistemaJuego } from "../types/masters";

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
      let result = masters || MASTERS_DATA;

      if (!filters) return result;

      // Debug: mostrar filtros activos
      console.log("Filtros activos:", filters);

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
        console.log("Filtrando por sistemas:", filters.sistemas);
        result = result.filter((master) => {
          const hasSystem = filters.sistemas.some((sistema) =>
            master.sistemas.includes(sistema)
          );
          console.log(
            `Master ${master.displayName}: sistemas ${master.sistemas.join(
              ", "
            )}, tiene sistema: ${hasSystem}`
          );
          return hasSystem;
        });
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

      // Ordenamiento
      result.sort((a, b) => {
        let comparison = 0;

        switch (filters.ordenarPor) {
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
            // Convertir precios a números para comparar
            const precioA =
              parseFloat(a.precioPorSesion.replace(/[^\d]/g, "")) || 0;
            const precioB =
              parseFloat(b.precioPorSesion.replace(/[^\d]/g, "")) || 0;
            comparison = precioA - precioB;
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
      } else {
        // Navegación por defecto al perfil del master
        console.log("Navegando al perfil de:", master.displayName);
        // TODO: Implementar navegación real cuando tengamos la página de perfil
      }
    };

    return (
      <div
        className={`w-full flex flex-col items-start justify-start ${className}`}
      >
        {/* Lista de masters */}
        <section
          className={`self-stretch flex flex-row items-start justify-start flex-wrap content-start pt-[0rem] px-[0rem] pb-[2.937rem] box-border gap-x-[1.187rem] gap-y-[3.812rem] max-w-full text-center text-[2.125rem] text-dark-gold font-titulo-2 mq450:pb-[1.938rem] mq450:box-border mq450:gap-x-[0.5rem] mq450:gap-y-[1.5rem] mq450:px-[0.5rem]`}
        >
          {paginatedMasters.length > 0 ? (
            paginatedMasters.map((master) => (
              <UnifiedMasterCard
                key={master.id}
                master={master}
                onMasterClick={handleMasterClick}
              />
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-8 text-center mq450:py-4">
              <div className="text-2xl text-nude mb-4 mq450:text-xl mq450:mb-2">
                🔍
              </div>
              <h3 className="text-xl text-white font-titulo-2 mb-2 mq450:text-lg mq450:mb-1">
                No se encontraron masters
              </h3>
              <p className="text-nude text-sm mq450:text-xs">
                Intenta ajustar los filtros o la búsqueda para encontrar más
                resultados.
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
