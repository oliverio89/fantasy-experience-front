// Componente para filtros avanzados de masters
// Archivo: src/components/MasterAdvancedFilters.tsx

import { FunctionComponent, memo, useCallback } from "react";
import {
  MasterFilters,
  ExperienciaMaster,
  RangoPrecio,
  DisponibilidadMaster,
  EXPERIENCIA_MASTER,
  RANGOS_PRECIO,
  DISPONIBILIDAD_MASTER,
} from "../types/masters";

export type MasterAdvancedFiltersType = {
  className?: string;
  filters: MasterFilters;
  onFiltersChange: (filters: MasterFilters) => void;
};

const MasterAdvancedFilters: FunctionComponent<MasterAdvancedFiltersType> =
  memo(({ className = "", filters, onFiltersChange }) => {
    const handleExperienciaToggle = useCallback(
      (experiencia: ExperienciaMaster) => {
        const newExperiencia = filters.experiencia.includes(experiencia)
          ? filters.experiencia.filter((e) => e !== experiencia)
          : [...filters.experiencia, experiencia];

        onFiltersChange({
          ...filters,
          experiencia: newExperiencia,
        });
      },
      [filters, onFiltersChange]
    );

    const handlePrecioToggle = useCallback(
      (precio: RangoPrecio) => {
        const newPrecios = filters.tiposPartida.includes(precio as any)
          ? filters.tiposPartida.filter((p) => p !== precio)
          : [...filters.tiposPartida, precio as any];

        onFiltersChange({
          ...filters,
          tiposPartida: newPrecios,
        });
      },
      [filters, onFiltersChange]
    );

    const handleDisponibilidadToggle = useCallback(
      (disponibilidad: DisponibilidadMaster) => {
        const newDisponibilidad = filters.disponibilidad.includes(
          disponibilidad
        )
          ? filters.disponibilidad.filter((d) => d !== disponibilidad)
          : [...filters.disponibilidad, disponibilidad];

        onFiltersChange({
          ...filters,
          disponibilidad: newDisponibilidad,
        });
      },
      [filters, onFiltersChange]
    );

    const handleRatingChange = useCallback(
      (rating: number) => {
        onFiltersChange({
          ...filters,
          ratingMin: rating,
        });
      },
      [filters, onFiltersChange]
    );

    const clearAllFilters = useCallback(() => {
      onFiltersChange({
        ...filters,
        experiencia: [],
        disponibilidad: [],
        ratingMin: 0,
      });
    }, [filters, onFiltersChange]);

    return (
      <div
        className={`w-full flex flex-col items-start justify-start gap-6 ${className}`}
      >
        {/* Filtros de Experiencia */}
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <h3 className="text-lg text-white font-titulo-2">Experiencia</h3>
          <div className="flex flex-row items-start justify-start gap-2 flex-wrap">
            {EXPERIENCIA_MASTER.map((experiencia) => {
              const isSelected = filters.experiencia.includes(experiencia);
              return (
                <button
                  key={experiencia}
                  onClick={() => handleExperienciaToggle(experiencia)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "bg-light-gold border-light-gold text-black font-semibold"
                      : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
                  }`}
                >
                  {experiencia}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros de Precio */}
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <h3 className="text-lg text-white font-titulo-2">
            Precio por Sesión
          </h3>
          <div className="flex flex-row items-start justify-start gap-2 flex-wrap">
            {RANGOS_PRECIO.map((precio) => {
              const isSelected = filters.tiposPartida.includes(precio as any);
              return (
                <button
                  key={precio}
                  onClick={() => handlePrecioToggle(precio)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "bg-light-gold border-light-gold text-black font-semibold"
                      : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
                  }`}
                >
                  {precio}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros de Disponibilidad */}
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <h3 className="text-lg text-white font-titulo-2">Disponibilidad</h3>
          <div className="flex flex-row items-start justify-start gap-2 flex-wrap">
            {DISPONIBILIDAD_MASTER.map((disponibilidad) => {
              const isSelected =
                filters.disponibilidad.includes(disponibilidad);
              return (
                <button
                  key={disponibilidad}
                  onClick={() => handleDisponibilidadToggle(disponibilidad)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "bg-light-gold border-light-gold text-black font-semibold"
                      : "bg-transparent border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold"
                  }`}
                >
                  {disponibilidad}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Rating */}
        <div className="w-full flex flex-col items-start justify-start gap-3">
          <h3 className="text-lg text-white font-titulo-2">Rating Mínimo</h3>
          <div className="flex flex-row items-center justify-start gap-2">
            <span className="text-nude text-sm">0⭐</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.ratingMin}
              onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-nude rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-nude text-sm">{filters.ratingMin}⭐</span>
          </div>
        </div>

        {/* Botón Limpiar */}
        {(filters.experiencia.length > 0 ||
          filters.disponibilidad.length > 0 ||
          filters.ratingMin > 0) && (
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-lg border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-200 hover:scale-105"
            >
              ✕ Limpiar Filtros Avanzados
            </button>
            <span className="text-light-gold text-sm">
              {filters.experiencia.length +
                filters.disponibilidad.length +
                (filters.ratingMin > 0 ? 1 : 0)}{" "}
              filtros activos
            </span>
          </div>
        )}
      </div>
    );
  });

MasterAdvancedFilters.displayName = "MasterAdvancedFilters";

export default MasterAdvancedFilters;
