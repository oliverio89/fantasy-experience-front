import { FunctionComponent, memo } from "react";
import CardMaster from "./CardMaster";

export type MasterListType = {
  className?: string;
};

const MasterList: FunctionComponent<MasterListType> = memo(
  ({ className = "" }) => {
    return (
      <section
        className={`self-stretch flex flex-row items-start justify-start flex-wrap content-start pt-[0rem] px-[0rem] pb-[2.937rem] box-border gap-x-[1.187rem] gap-y-[3.812rem] max-w-full text-center text-[2.125rem] text-dark-gold font-titulo-2 mq450:pb-[1.938rem] mq450:box-border ${className}`}
      >
        <CardMaster
          masterCard="/ellipse-4@2x.png"
          MasterName="Master name"
          rate={4}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-1@2x.png"
          MasterName="Master name"
          rate={5}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-2@2x.png"
          MasterName="Master name"
          rate={3}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-3@2x.png"
          MasterName="Master name"
          rate={4}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-4@2x.png"
          MasterName="Master name"
          rate={5}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-5@2x.png"
          MasterName="Master name"
          rate={4}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-6@2x.png"
          MasterName="Master name"
          rate={3}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-7@2x.png"
          MasterName="Master name"
          rate={5}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
        <CardMaster
          masterCard="/ellipse-4-8@2x.png"
          MasterName="Master name"
          rate={4}
          Sistema="Sistema de partida seleccionada"
          Preferencia="Preferencia de partida del máster"
        />
      </section>
    );
  }
);

export default MasterList;
