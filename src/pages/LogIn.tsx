import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/login-form";

const LogInV: FunctionComponent = () => {
  const navigate = useNavigate();

  const onVolverAHomeClick = useCallback(() => {
    navigate("/home-v12");
  }, [navigate]);

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-row items-start justify-start leading-[normal] tracking-[normal] [row-gap:20px] text-center text-[6.25rem] text-dark-gold font-milonga mq1025:flex-wrap">
      <div className="bg-black flex flex-col items-start justify-start pt-[20.375rem] px-[0rem] pb-[12.5rem] box-border gap-[7.812rem] min-w-[38.75rem] max-w-full mq725:gap-[3.875rem] mq725:pt-[13.25rem] mq725:pb-[8.125rem] mq725:box-border mq725:min-w-full mq450:gap-[1.938rem] mq1025:flex-1">
        <div className="self-stretch h-[52rem] relative bg-black hidden" />
        <h1 className="m-0 self-stretch relative text-inherit leading-[76.6%] font-normal font-[inherit] z-[1] mq450:text-[1.875rem] mq450:leading-[1.938rem] mq975:text-[3.125rem] mq975:leading-[2.875rem]">
          <p className="m-0">{`Fantasy `}</p>
          <p className="m-0">Experience</p>
        </h1>
        <b
          className="self-stretch relative text-[1.5rem] [text-decoration:underline] font-titulo-2 text-nude cursor-pointer z-[1] mq450:text-[1.188rem]"
          onClick={onVolverAHomeClick}
        >
          volver a home
        </b>
      </div>
      <LoginForm />
    </div>
  );
};

export default LogInV;
