import { FunctionComponent, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmailField from "./email-field";
import Button from "./button";

export type LoginFormType = {
  className?: string;
};

const LoginForm: FunctionComponent<LoginFormType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();

    const onButtonClick = useCallback(() => {
      navigate("/home-v12");
    }, [navigate]);

    return (
      <form
        className={`m-0 flex-1 bg-nude flex flex-col items-start justify-start pt-[11.375rem] px-[0rem] pb-[10.25rem] box-border gap-[3rem] min-w-[26.813rem] max-w-full mq725:gap-[1.5rem] mq725:pt-[7.375rem] mq725:pb-[6.688rem] mq725:box-border mq725:min-w-full ${className}`}
      >
        <div className="self-stretch h-[52rem] relative bg-nude hidden" />
        <h1 className="m-0 self-stretch relative text-[2.25rem] font-bold font-titulo-2 text-black text-center z-[1] mq450:text-[1.375rem] mq975:text-[1.813rem]">
          Entra a tu cuenta
        </h1>
        <EmailField
          correoElectrnico="Correo electrónico"
          ingresaTuEmailPlaceholder="Ingresa tu email"
        />
        <EmailField
          correoElectrnico="Contraseña"
          ingresaTuEmailPlaceholder="Ingresa tu contraseña"
          propPadding="0rem 1.25rem 0.875rem"
        />
        <div className="flex flex-row items-start justify-start pt-[0rem] px-[9.812rem] pb-[2.625rem] box-border max-w-full mq725:pl-[4.875rem] mq725:pr-[4.875rem] mq725:box-border mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border">
          <Button
            button1="Ingresar"
            button1Padding="0.312rem 8.906rem"
            button1Height="2rem"
            button1Width="21.625rem"
            button1Height1="1.375rem"
            button1Width1="3.875rem"
            button1FontSize="1.125rem"
            __PH1__={onButtonClick}
          />
        </div>
        <div className="self-stretch relative text-[1.25rem] text-black text-center z-[1] mq450:text-[1rem]">
          <span className="font-titulo-2">{`Si no tienes cuenta, `}</span>
          <span className="[text-decoration:underline] font-medium font-titulo-2">
            Regístrate aquí.
          </span>
        </div>
      </form>
    );
  }
);

export default LoginForm;
