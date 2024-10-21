import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type InputFieldsContainerType = {
  className?: string;
  correoElectrnico?: string;
  ingresaTuEmailPlaceholder?: string;

  /** Style props */
  propPadding?: CSSProperties["padding"];
  propGap?: CSSProperties["gap"];
  propPadding1?: CSSProperties["padding"];
  propMinWidth?: CSSProperties["minWidth"];
};

const InputFieldsContainer: FunctionComponent<InputFieldsContainerType> = memo(
  ({
    className = "",
    correoElectrnico,
    ingresaTuEmailPlaceholder,
    propPadding,
    propGap,
    propPadding1,
    propMinWidth,
  }) => {
    const inputFieldsContainerStyle: CSSProperties = useMemo(() => {
      return {
        padding: propPadding,
      };
    }, [propPadding]);

    const frameDivStyle: CSSProperties = useMemo(() => {
      return {
        gap: propGap,
      };
    }, [propGap]);

    const frameDiv1Style: CSSProperties = useMemo(() => {
      return {
        padding: propPadding1,
      };
    }, [propPadding1]);

    const ingresaTuEmailStyle: CSSProperties = useMemo(() => {
      return {
        minWidth: propMinWidth,
      };
    }, [propMinWidth]);

    return (
      <div
        className={`self-stretch flex flex-row items-start justify-center py-[0rem] px-[1.25rem] box-border max-w-full text-left text-[1.25rem] text-black font-titulo-2 ${className}`}
        style={inputFieldsContainerStyle}
      >
        <div
          className="w-[21.625rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full"
          style={frameDivStyle}
        >
          <div className="self-stretch relative font-medium z-[1] mq450:text-[1rem]">
            {correoElectrnico}
          </div>
          <div
            className="self-stretch rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] pl-[0.812rem] pr-[0.437rem] max-w-full z-[1]"
            style={frameDiv1Style}
          >
            <div className="self-stretch w-[21.625rem] relative rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border hidden mix-blend-normal max-w-full" />
            <input
              className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12.125rem] p-0 max-w-full z-[2]"
              placeholder={ingresaTuEmailPlaceholder}
              type="text"
              style={ingresaTuEmailStyle}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default InputFieldsContainer;
