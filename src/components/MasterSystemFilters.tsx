// Componente para filtros de sistemas de juego
// Archivo: src/components/MasterSystemFilters.tsx

import { FunctionComponent, memo, useCallback } from "react";
import { SistemaJuego, SISTEMAS_POPULARES } from "../types/masters";

export type MasterSystemFiltersType = {
  className?: string;
  selectedSystems: SistemaJuego[];
  onSystemToggle: (system: SistemaJuego) => void;
  onClearAll: () => void;
};

const MasterSystemFilters: FunctionComponent<MasterSystemFiltersType> = memo(
  ({ className = "", selectedSystems, onSystemToggle, onClearAll }) => {
    const handleSystemClick = useCallback(
      (system: SistemaJuego) => {
        onSystemToggle(system);
      },
      [onSystemToggle]
    );

    const handleClearAll = useCallback(() => {
      onClearAll();
    }, [onClearAll]);

    // Sistemas que están en la página actual (los que están hardcodeados)
    const currentSystems: SistemaJuego[] = [
      "Dungeons & Dragons 5e",
      "Call of Cthulhu",
      "Vampiro: La Mascarada",
      "Hombre Lobo: El Apocalipsis",
      "FATE Core",
      "Z-Corp", // Este parece ser un sistema personalizado
    ];

    return (
      <div
        className={`w-[45.313rem] flex flex-row items-start justify-start pt-[0rem] px-[0.062rem] pb-[2.5rem] box-border max-w-full mq450:w-full mq450:px-[0.5rem] mq450:pb-[1.5rem] ${className}`}
      >
        <div className="flex-1 flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
          <div className="w-[12.125rem] relative leading-[1.625rem] flex items-center z-[1] text-white font-titulo-2 mq450:w-full mq450:text-[1rem]">
            Elije el sistema de juego:
          </div>
          <div className="self-stretch flex flex-row items-start justify-start gap-[0.812rem] text-center text-[1rem] text-nude mq750:flex-wrap mq450:gap-[0.5rem] mq450:flex-wrap">
            {currentSystems.map((system) => {
              const isSelected = selectedSystems.includes(system);
              const systemDisplayName =
                system === "Dungeons & Dragons 5e"
                  ? "Dungeons& dragons"
                  : system === "Call of Cthulhu"
                  ? "Chuthulu"
                  : system === "Vampiro: La Mascarada"
                  ? "Vampiro la mascarada"
                  : system === "Hombre Lobo: El Apocalipsis"
                  ? "Hombre lobo"
                  : system === "FATE Core"
                  ? "FATE"
                  : system; // Z-Corp se mantiene igual

              return (
                <button
                  key={system}
                  onClick={() => handleSystemClick(system)}
                  className={`h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] px-[0.5rem] z-[1] transition-all duration-200 hover:scale-105 mq450:h-[2rem] mq450:px-[0.75rem] mq450:text-[0.8rem] ${
                    isSelected
                      ? "bg-light-gold border-light-gold text-black font-semibold"
                      : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
                  }`}
                  aria-label={`Filtrar por ${system}`}
                >
                  <div className="relative leading-[1.25rem] flex items-center justify-center shrink-0 text-[0.75rem] mq450:text-[0.8rem]">
                    {systemDisplayName}
                  </div>
                </button>
              );
            })}

            {/* Botón para limpiar todos los filtros */}
            {selectedSystems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="h-[1.875rem] [backdrop-filter:blur(4px)] rounded-xl border-[1px] border-solid box-border overflow-hidden flex flex-row items-start justify-start py-[0.187rem] px-[0.5rem] z-[1] transition-all duration-200 hover:scale-105 bg-transparent border-red-400 text-red-400 hover:bg-red-400 hover:text-white hover:border-red-500 mq450:h-[2rem] mq450:px-[0.75rem] mq450:text-[0.8rem]"
                aria-label="Limpiar todos los filtros"
              >
                <div className="relative leading-[1.25rem] flex items-center justify-center shrink-0 text-[0.75rem] mq450:text-[0.8rem]">
                  ✕ Limpiar
                </div>
              </button>
            )}
          </div>

          {/* Indicador de filtros activos */}
          {selectedSystems.length > 0 && (
            <div className="self-stretch flex flex-row items-center justify-start gap-[0.5rem] text-sm text-light-gold mq450:text-xs mq450:gap-[0.25rem]">
              <span>Filtros activos:</span>
              <span className="bg-dark-gold px-2 py-1 rounded text-xs mq450:px-1 mq450:py-0.5">
                {selectedSystems.length} sistema
                {selectedSystems.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MasterSystemFilters.displayName = "MasterSystemFilters";

export default MasterSystemFilters;
