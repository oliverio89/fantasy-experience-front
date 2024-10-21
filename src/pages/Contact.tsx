import { FunctionComponent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/form-container";
import Button from "../components/button";


const ContactoV: FunctionComponent = () => {
  const navigate = useNavigate();

  const onButtonClick = useCallback(() => {
    navigate("/home-v12");
  }, [navigate]);

  return (
  
    <div className="w-full relative bg-white overflow-hidden flex flex-row items-start justify-start leading-[normal] tracking-[normal] [row-gap:20px] text-center text-[6.25rem] text-nude font-titulo-2 mq1025:flex-wrap">
      <div className="bg-black flex flex-col items-start justify-start pt-[20.375rem] px-[0rem] pb-[10.687rem] box-border gap-[2.343rem] min-w-[38.75rem] max-w-full z-[1] mq725:gap-[1.188rem] mq725:pt-[13.25rem] mq725:pb-[6.938rem] mq725:box-border mq725:min-w-full mq1025:flex-1">
        <div className="self-stretch h-[52rem] relative bg-black hidden" />
        <h1 className="m-0 self-stretch h-[11.313rem] relative text-inherit leading-[76.6%] font-normal font-milonga text-dark-gold flex items-center shrink-0 z-[2] mq450:text-[1.875rem] mq450:leading-[1.938rem] mq975:text-[3.125rem] mq975:leading-[2.875rem]">
          <span>
            <p className="m-0">{`Fantasy `}</p>
            <p className="m-0">Experience</p>
          </span>
        </h1>
        <div className="self-stretch relative text-[1.125rem] leading-[1.625rem] z-[2]">
          Si quieres ser Master, escríbenos a email@fantasyexperience.com
        </div>
        <h3
          className="m-0 self-stretch h-[3.625rem] relative text-[1.5rem] [text-decoration:underline] font-bold font-[inherit] flex items-center justify-center shrink-0 cursor-pointer z-[2] mq450:text-[1.188rem]"
          onClick={onButtonClick}
        >
          volver a home
        </h3>
      </div>
      <div className="flex-1 bg-nude flex flex-col items-end justify-start pt-[8.312rem] px-[0.312rem] pb-[8.187rem] box-border gap-[2.062rem] min-w-[26.813rem] max-w-full text-[2.25rem] text-black mq725:gap-[1rem] mq725:pt-[5.375rem] mq725:pb-[5.313rem] mq725:box-border mq725:min-w-full">
        <div className="self-stretch h-[52rem] relative bg-nude hidden" />
        <div className="self-stretch flex flex-row items-start justify-start pt-[0rem] px-[0rem] pb-[0.687rem] box-border max-w-full">
          <h1 className="m-0 flex-1 relative text-inherit leading-[90%] font-bold font-[inherit] inline-block max-w-full z-[1] mq450:text-[1.375rem] mq450:leading-[1.188rem] mq975:text-[1.813rem] mq975:leading-[1.625rem]">
            <p className="m-0">{`Ponte en contacto `}</p>
            <p className="m-0">con nosotros</p>
          </h1>
        </div>
        <FormContainer />
        <div className="self-stretch flex flex-row items-start justify-center py-[0rem] pl-[1.25rem] pr-[1.375rem] box-border max-w-full text-left text-[1.25rem]">
          <div className="w-[21.375rem] flex flex-col items-start justify-start gap-[3.187rem] max-w-full mq450:gap-[1.563rem]">
            <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
              <div className="self-stretch relative font-medium z-[1] mq450:text-[1rem]">
                Correo electrónico
              </div>
              <div className="self-stretch rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] pl-[0.812rem] pr-[0.437rem] max-w-full z-[1]">
                <div className="self-stretch w-[21.375rem] relative rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border hidden mix-blend-normal max-w-full" />
                <input
                  className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12rem] p-0 z-[2]"
                  placeholder="Ingresa tu email"
                  type="text"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
              <div className="w-[20.063rem] relative font-medium flex items-center max-w-full z-[1] mq450:text-[1rem]">
                Mensaje
              </div>
              <textarea
                className="border-black border-[1px] border-solid bg-whitesmoke h-[8.75rem] w-auto [outline:none] self-stretch rounded-xl box-border flex flex-row items-start justify-start py-[0rem] px-[0.875rem] font-titulo-2 font-light text-[1rem] text-black z-[1]"
                placeholder="Escríbenos tu mensaje"
                rows={7}
                cols={17}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start justify-end py-[0rem] px-[9.625rem] box-border max-w-full mq450:pl-[4.813rem] mq450:pr-[4.813rem] mq450:box-border">
          <Button
            button1="Enviar"
            button1Padding="0.312rem 3.312rem"
            button1Height="2rem"
            button1Width="9.5rem"
            button1Height1="1.375rem"
            button1Width1="2.938rem"
            button1FontSize="1.125rem"
            __PH1__={onButtonClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactoV;
