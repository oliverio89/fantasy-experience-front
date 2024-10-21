import { FunctionComponent, memo } from "react";

export type SessionInfoHeaderType = {
  className?: string;
  settings?: string;
  informacinDeLaSesin?: string;
};

const SessionInfoHeader: FunctionComponent<SessionInfoHeaderType> = memo(
  ({ className = "", settings, informacinDeLaSesin }) => {
    return (
      <button
        className={`cursor-pointer [border:none] py-[1.125rem] pl-[0.625rem] pr-[0.437rem] bg-oldlace-300 w-[15.625rem] rounded-xl flex flex-row items-start justify-start box-border gap-[0.125rem] z-[2] hover:bg-lightgray-200 ${className}`}
      >
        <div className="h-[3.75rem] w-[15.625rem] relative rounded-xl bg-oldlace-300 hidden" />
        <img
          className="h-[1.5rem] w-[1.5rem] relative overflow-hidden shrink-0 z-[3]"
          alt=""
          src={settings}
        />
        <b className="flex-1 relative text-[1.25rem] font-radio-option text-nude whitespace-pre-wrap text-left z-[3]">
          {informacinDeLaSesin}
        </b>
      </button>
    );
  }
);

export default SessionInfoHeader;
