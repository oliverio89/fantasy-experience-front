// Componente unificado para tarjetas de masters
// Archivo: src/components/UnifiedMasterCard.tsx

import { FunctionComponent, memo, useCallback } from "react";
import CardMaster from "./CardMaster";
import { Master } from "../types/masters";

export type UnifiedMasterCardType = {
  master: Master;
  className?: string;
  onMasterClick?: (master: Master) => void;
  // Opción para usar formato de imagen (placeholders) o datos reales
  useImageFormat?: boolean;
};

const UnifiedMasterCard: FunctionComponent<UnifiedMasterCardType> = memo(
  ({ master, className = "", onMasterClick, useImageFormat = false }) => {
    const handleMasterClick = useCallback(() => {
      if (onMasterClick) {
        onMasterClick(master);
      }
    }, [master, onMasterClick]);

    // Si useImageFormat es true, usar el formato exacto de la imagen
    if (useImageFormat) {
      return (
        <CardMaster
          className={className}
          onSlide1ContainerClick={handleMasterClick}
          masterCard={master.avatar}
          MasterName={master.displayName}
          rate={master.rating}
          Sistema="Sistema de partida seleccionada"
          Preferencia={master.tiposPartida.join(", ")}
        />
      );
    }

    // Formato con datos reales
    return (
      <CardMaster
        className={className}
        onSlide1ContainerClick={handleMasterClick}
        masterCard={master.avatar}
        MasterName={master.displayName}
        rate={master.rating}
        Sistema={master.sistemas.join(", ")} // Mostrar todos los sistemas
        Preferencia={master.tiposPartida.join(", ")}
      />
    );
  }
);

UnifiedMasterCard.displayName = "UnifiedMasterCard";

export default UnifiedMasterCard;
