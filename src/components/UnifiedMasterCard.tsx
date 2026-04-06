// Componente unificado para tarjetas de masters
// Archivo: src/components/UnifiedMasterCard.tsx

import { FunctionComponent, memo, useCallback } from "react";
import CardMaster from "./CardMaster";
import { Master } from "../types/masters";

export type UnifiedMasterCardType = {
  master: Master;
  className?: string;
  onMasterClick?: (master: Master) => void;
};

const UnifiedMasterCard: FunctionComponent<UnifiedMasterCardType> = memo(
  ({ master, className = "", onMasterClick }) => {
    const handleMasterClick = useCallback(() => {
      if (onMasterClick) {
        onMasterClick(master);
      }
    }, [master, onMasterClick]);

    return (
      <CardMaster
        className={className}
        onSlide1ContainerClick={handleMasterClick}
        masterCard={master.avatar}
        MasterName={master.displayName}
        rate={master.rating}
        Sistema={master.sistemas.join(", ")}
        Preferencia={master.tiposPartida.join(", ")}
      />
    );
  }
);

UnifiedMasterCard.displayName = "UnifiedMasterCard";

export default UnifiedMasterCard;
