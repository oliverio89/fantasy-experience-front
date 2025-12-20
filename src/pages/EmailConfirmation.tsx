import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";

const EmailConfirmation: FunctionComponent = () => {
  const navigate = useNavigate();

  const onLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="w-full relative bg-black overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center text-dark-gold font-milonga p-5 box-border">
      <div className="flex flex-col items-center justify-center gap-8 max-w-[600px] w-full animate-fade-in">
        {/* Logo or Icon */}
        <div className="text-[4rem] text-dark-gold">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="m-0 text-[3rem] font-normal leading-[1.2] mq450:text-[2rem]">
          ¡Correo Confirmado!
        </h1>

        <p className="m-0 text-[1.25rem] font-titulo-2 text-nude leading-[1.6]">
          Gracias por verificar tu correo electrónico. Tu cuenta ya está activa
          y lista para usar.
        </p>

        <div className="flex flex-row items-start justify-start pt-4 px-0 pb-0 box-border">
          <Button
            button1="Iniciar Sesión"
            button1Padding="1rem 3rem"
            button1Height="auto"
            button1Width="100%"
            button1Height1="auto"
            button1Width1="auto"
            button1FontSize="1.25rem"
            onClick={onLoginClick}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
