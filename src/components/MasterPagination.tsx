// Componente de paginación para masters
// Archivo: src/components/MasterPagination.tsx

import { FunctionComponent, memo, useCallback } from "react";

export type MasterPaginationType = {
  className?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const MasterPagination: FunctionComponent<MasterPaginationType> = memo(
  ({
    className = "",
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
  }) => {
    const handlePageChange = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages) {
          onPageChange(page);
        }
      },
      [onPageChange, totalPages]
    );

    const handlePrevious = useCallback(() => {
      handlePageChange(currentPage - 1);
    }, [currentPage, handlePageChange]);

    const handleNext = useCallback(() => {
      handlePageChange(currentPage + 1);
    }, [currentPage, handlePageChange]);

    // Calcular elementos mostrados
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generar números de página a mostrar
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        // Mostrar todas las páginas si son pocas
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Lógica para mostrar páginas con elipsis
        if (currentPage <= 3) {
          // Páginas iniciales
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Páginas finales
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Páginas del medio
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    if (totalPages <= 1) {
      return null; // No mostrar paginación si solo hay una página
    }

    return (
      <div
        className={`w-full flex flex-col items-center justify-center gap-4 py-6 ${className}`}
      >
        {/* Información de resultados */}
        <div className="text-center text-nude text-sm mq450:text-xs">
          Mostrando {startItem}-{endItem} de {totalItems} masters
        </div>

        {/* Controles de paginación */}
        <div className="flex flex-row items-center justify-center gap-2">
          {/* Botón Anterior */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 mq450:px-2 mq450:py-1.5 mq450:text-xs ${
              currentPage === 1
                ? "bg-transparent border-gray-600 text-gray-600 cursor-not-allowed"
                : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
            }`}
            aria-label="Página anterior"
          >
            ← Anterior
          </button>

          {/* Números de página */}
          <div className="flex flex-row items-center justify-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-nude text-sm mq450:text-xs"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 mq450:px-2 mq450:py-1.5 mq450:text-xs ${
                    isCurrentPage
                      ? "bg-light-gold border-light-gold text-black font-semibold"
                      : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
                  }`}
                  aria-label={`Ir a página ${pageNumber}`}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 mq450:px-2 mq450:py-1.5 mq450:text-xs ${
              currentPage === totalPages
                ? "bg-transparent border-gray-600 text-gray-600 cursor-not-allowed"
                : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
            }`}
            aria-label="Página siguiente"
          >
            Siguiente →
          </button>
        </div>

        {/* Información adicional */}
        <div className="text-center text-nude text-xs mq450:text-xs">
          Página {currentPage} de {totalPages}
        </div>
      </div>
    );
  }
);

MasterPagination.displayName = "MasterPagination";

export default MasterPagination;
