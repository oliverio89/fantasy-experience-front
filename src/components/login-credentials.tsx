import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type LoginCredentialsType = {
  className?: string;
  nombreDeUsuario?: string;
  johnPlaceholder?: string;

  /** Style props */
  propPadding?: CSSProperties["padding"];
};

const LoginCredentials: FunctionComponent<LoginCredentialsType> = memo(
  ({ className = "", nombreDeUsuario, johnPlaceholder, propPadding }) => {
    const johnStyle: CSSProperties = useMemo(() => {
      return {
        padding: propPadding,
      };
    }, [propPadding]);

    return (
      <div
        className={`self-stretch flex flex-col items-start justify-start gap-1.5 max-w-full text-left text-xl text-nude font-titulo-2 ${className}`}
      >
        <div className="w-[370.2px] relative leading-[16px] font-medium flex items-center max-w-full z-[1] mq450:text-base mq450:leading-[13px]">
          {nombreDeUsuario}
        </div>
        <div className="self-stretch flex flex-row items-start justify-start py-0 px-5 relative">
          <div className="h-full w-full absolute !m-[0] top-[0px] right-[0px] bottom-[0px] left-[0px] [filter:blur(1px)] rounded-xl border-dark-gold border-[1px] border-solid box-border mix-blend-normal z-[1]" />
          <input
            className="w-[295.3px] [border:none] [outline:none] font-light font-titulo-2 text-sm bg-[transparent] h-10 relative text-nude text-left flex items-center p-0 z-[2]"
            placeholder={johnPlaceholder}
            type="text"
            style={johnStyle}
          />
        </div>
      </div>
    );
  }
);

export default LoginCredentials;
