import { FunctionComponent, memo, useCallback } from "react";

export type ButtonType = {
  className?: string;
};

const Button: FunctionComponent<ButtonType> = memo(({ className = "" }) => {
  const onButtonClick = useCallback(() => {
    // Please sync "Partidas v1.2" to the project
  }, []);

  return (
    <button
      className={`cursor-pointer [border:none] py-[0.625rem] px-[4.843rem] bg-dark-gold h-[2.625rem] w-[15.625rem] shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden shrink-0 flex flex-row items-start justify-start box-border z-[2] ${className}`}
      onClick={onButtonClick}
    >
      <b className="h-[1.375rem] w-[6rem] relative text-[1.125rem] flex font-radio-option text-black text-center items-center justify-center shrink-0">
        Crear partida
      </b>
    </button>
  );
});

export default Button;
