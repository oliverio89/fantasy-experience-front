import { FunctionComponent, memo } from "react";
import GroupComponent3 from "./group-component3";
import GroupComponent4 from "./group-component4";

export type MasterListType = {
  className?: string;
};

const MasterList: FunctionComponent<MasterListType> = memo(
  ({ className = "" }) => {
    return (
      <section
        className={`self-stretch flex flex-row items-start justify-start flex-wrap content-start pt-[0rem] px-[0rem] pb-[2.937rem] box-border gap-x-[1.187rem] gap-y-[3.812rem] max-w-full text-center text-[2.125rem] text-dark-gold font-titulo-2 mq450:pb-[1.938rem] mq450:box-border ${className}`}
      >
        <GroupComponent3
          masterAvatars="/ellipse-4@2x.png"
          group29="/group-29.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-1@2x.png"
          group29="/group-29-1.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-2@2x.png"
          group29="/group-29-2.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-3@2x.png"
          group29="/group-29-3.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-4@2x.png"
          group29="/group-29-4.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent4
          ellipse4="/ellipse-4-5@2x.png"
          group29="/group-29-5.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-6@2x.png"
          group29="/group-29-6.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent3
          masterAvatars="/ellipse-4-7@2x.png"
          group29="/group-29-7.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
        <GroupComponent4
          ellipse4="/ellipse-4-8@2x.png"
          group29="/group-29-8.svg"
          button1="Ver perfil"
          button1Padding="0.531rem 7.593rem"
          button1Height="2.438rem"
          button1Width="19.375rem"
          button1Height1="1.375rem"
          button1Width1="4.25rem"
          button1FontSize="1.125rem"
          button1BackgroundColor="#cd9c20"
          button1Border="none"
          button1TextDecoration="unset"
          button1FontWeight="unset"
        />
      </section>
    );
  }
);

export default MasterList;
