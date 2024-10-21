import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type EmailFieldType = {
  className?: string;
  correoElectrnico?: string;
  ingresaTuEmailPlaceholder?: string;

  /** Style props */
  propPadding?: CSSProperties["padding"];
};

const EmailField: FunctionComponent<EmailFieldType> = memo(
  ({
    className = "",
    correoElectrnico,
    ingresaTuEmailPlaceholder,
    propPadding,
  }) => {
    const emailFieldStyle: CSSProperties = useMemo(() => {
      return {
        padding: propPadding,
      };
    }, [propPadding]);

    return (
      <div
        className={`self-stretch flex flex-row items-start justify-center pt-[0rem] px-[1.25rem] pb-[0.312rem] box-border max-w-full text-left text-[1.125rem] text-black font-titulo-2 ${className}`}
        style={emailFieldStyle}
      >
        <div className="w-[21.625rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
          <div className="w-[20.313rem] relative font-medium flex items-center max-w-full z-[1]">
            {correoElectrnico}
          </div>
          <div className="self-stretch rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] pl-[0.812rem] pr-[0.437rem] max-w-full z-[1]">
            <div className="self-stretch w-[21.625rem] relative rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border hidden mix-blend-normal max-w-full" />
            <input
              className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[0.875rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12.125rem] p-0 max-w-full z-[2]"
              placeholder={ingresaTuEmailPlaceholder}
              type="text"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default EmailField;
