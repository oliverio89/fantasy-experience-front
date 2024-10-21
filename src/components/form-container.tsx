import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type FormContainerType = {
  className?: string;

  /** Style props */
  propPadding?: CSSProperties["padding"];
  propWidth?: CSSProperties["width"];
  propMinWidth?: CSSProperties["minWidth"];
};

const FormContainer: FunctionComponent<FormContainerType> = memo(
  ({ className = "", propPadding, propWidth, propMinWidth }) => {
    const formContainerStyle: CSSProperties = useMemo(() => {
      return {
        padding: propPadding,
      };
    }, [propPadding]);

    const nameInputStyle: CSSProperties = useMemo(() => {
      return {
        width: propWidth,
      };
    }, [propWidth]);

    const ingresaTuNombreStyle: CSSProperties = useMemo(() => {
      return {
        minWidth: propMinWidth,
      };
    }, [propMinWidth]);

    return (
      <div
        className={`self-stretch flex flex-row items-start justify-center pt-[0rem] pb-[1.187rem] pl-[1.25rem] pr-[1.375rem] box-border max-w-full text-left text-[1.25rem] text-black font-titulo-2 ${className}`}
        style={formContainerStyle}
      >
        <div
          className="w-[21.375rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full"
          style={nameInputStyle}
        >
          <div className="self-stretch relative font-medium z-[1] mq450:text-[1rem]">
            Nombre
          </div>
          <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.875rem] pr-[0.5rem] relative">
            <div className="h-full w-full absolute !m-[0] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem] [filter:blur(1px)] rounded-xl bg-whitesmoke border-light-gold border-[1px] border-solid box-border mix-blend-normal z-[1]" />
            <input
              className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12rem] p-0 z-[2]"
              placeholder="Ingresa tu nombre"
              type="text"
              style={ingresaTuNombreStyle}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default FormContainer;
