import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/login-form";
import { useTranslation } from "../i18n";

const LogInV: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onVolverAHomeClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="w-full min-h-screen relative bg-black overflow-hidden flex flex-row items-stretch justify-start leading-[normal] tracking-[normal] text-center text-[6.25rem] text-dark-gold font-milonga mq1025:flex-wrap">
      <div className="w-1/2 bg-black flex flex-col items-center justify-center px-8 box-border gap-[4rem] mq1025:w-full mq1025:py-20">
        <div className="self-stretch h-[52rem] relative bg-black hidden" />
        <h1 className="m-0 self-stretch relative text-inherit leading-[76.6%] font-normal font-[inherit] z-[1] mq450:text-[1.875rem] mq450:leading-[1.938rem] mq975:text-[3.125rem] mq975:leading-[2.875rem]">
          <p className="m-0">{`Fantasy `}</p>
          <p className="m-0">Experience</p>
        </h1>
        <b
          className="self-stretch relative text-[1.5rem] [text-decoration:underline] font-titulo-2 text-nude cursor-pointer z-[1] mq450:text-[1.188rem]"
          onClick={onVolverAHomeClick}
        >
          {t.common.backHome}
        </b>
      </div>
      <LoginForm />
    </div>
  );
};

export default LogInV;
