import { FunctionComponent, memo } from "react";
import { SistemaJuego, SISTEMAS_POPULARES } from "../types/masters";

export type MasterSystemFiltersType = {
  className?: string;
  selectedSystems: SistemaJuego[];
  onSystemToggle: (system: SistemaJuego) => void;
  onClearAll: () => void;
};

const shortName = (system: SistemaJuego) => {
  const names: Partial<Record<SistemaJuego, string>> = {
    "Dungeons & Dragons 5e": "D&D 5e",
    "Call of Cthulhu": "Cthulhu",
    "Vampiro: La Mascarada": "Vampiro",
    "Hombre Lobo: El Apocalipsis": "Hombre Lobo",
    "FATE Core": "FATE",
  };
  return names[system] || system;
};

const MasterSystemFilters: FunctionComponent<MasterSystemFiltersType> = memo(
  ({ className = "", selectedSystems, onSystemToggle, onClearAll }) => (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8b16a]">
          Sistema de juego
        </p>
        {selectedSystems.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-[#b8a894] underline decoration-[#8d6a3e] underline-offset-4 hover:text-white"
          >
            Restablecer filtros
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {SISTEMAS_POPULARES.map((system) => {
          const selected = selectedSystems.includes(system);
          return (
            <button
              key={system}
              type="button"
              onClick={() => onSystemToggle(system)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selected
                  ? "border-[#e0b255] bg-[#d6a64c] text-[#171008]"
                  : "border-[#6f5436]/70 bg-[#120d09]/50 text-[#cdbda9] hover:border-[#c49345] hover:text-white"
              }`}
            >
              {shortName(system)}
            </button>
          );
        })}
      </div>
    </div>
  )
);

MasterSystemFilters.displayName = "MasterSystemFilters";

export default MasterSystemFilters;
