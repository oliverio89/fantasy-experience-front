import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslation } from "../i18n";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactoV: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ContactFormData>();

  const { submit } = useWeb3Forms({
    access_key: "defc80b9-eb2b-446c-9e4c-bd4731c6f2d4",
    settings: {
      from_name: "Fantasy Experience - Formulario de Contacto",
      subject: "Nuevo Mensaje de Contacto - Fantasy Experience",
    },
    onSuccess: () => {
      setShowSuccess(true);
      reset();
    },
    onError: (error) => {
      console.error("Error al enviar el mensaje:", error);
      alert(t.contact.errorGeneric);
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    await submit(data);
  };

  return (
    <div className="w-full relative bg-black overflow-hidden flex flex-row items-start justify-start leading-[normal] tracking-[normal] [row-gap:20px] text-center text-[6.25rem] text-nude font-titulo-2 mq1025:flex-wrap">
      <div className="bg-black flex w-1/2 flex-col items-start justify-start pt-[20.375rem] px-[0rem] pb-[10.687rem] box-border gap-[2.343rem] min-w-[38.75rem] max-w-full z-[1] mq725:gap-[1.188rem] mq725:pt-[13.25rem] mq725:pb-[6.938rem] mq725:box-border mq725:min-w-full mq1025:flex-1">
        <div className="self-stretch relative h-full bg-black hidden" />
        <h1 className="m-0 self-stretch h-[11.313rem] relative text-inherit leading-[76.6%] font-normal font-milonga text-dark-gold items-center shrink-0 z-[2] mq450:text-[1.875rem] mq450:leading-[1.938rem] mq975:text-[3.125rem] mq975:leading-[2.875rem]">
          <span>
            <p className="m-0 ">Fantasy</p>
            <p className="m-0">Experience</p>
          </span>
        </h1>
        <div className="self-stretch relative text-[1.125rem] leading-[1.625rem] z-[2]">
          {t.contact.sideNote}
        </div>
        <h3
          className="m-0 self-stretch h-[3.625rem] relative text-[1.5rem] [text-decoration:underline] font-bold font-[inherit] flex items-center justify-center shrink-0 cursor-pointer z-[2] mq450:text-[1.188rem]"
          onClick={() => navigate("/")}
        >
          {t.common.backHome}
        </h3>
      </div>
      <div className="flex-1 bg-nude w-1/2 flex flex-col items-end justify-start pt-[8.312rem] px-[0.312rem] pb-[8.187rem] box-border gap-[2.062rem] min-w-[26.813rem] max-w-full text-[2.25rem] text-black mq725:gap-[1rem] mq725:pt-[5.375rem] mq725:pb-[5.313rem] mq725:box-border mq725:min-w-full">
        <div className="self-stretch flex flex-row items-start justify-start pt-[0rem] px-[0rem] pb-[0.687rem] box-border max-w-full">
          <h1 className="m-0 flex-1 relative text-inherit leading-[90%] font-bold font-[inherit] inline-block max-w-full z-[1] mq450:text-[1.375rem] mq450:leading-[1.188rem] mq975:text-[1.813rem] mq975:leading-[1.625rem]">
            <p className="m-0">{t.contact.title1}</p>
            <p className="m-0">{t.contact.title2}</p>
          </h1>
        </div>

        {showSuccess ? (
          <div className="self-stretch flex flex-col items-center justify-center gap-4 py-16 px-6">
            <div className="text-6xl">✅</div>
            <h3 className="m-0 text-2xl font-bold font-milonga text-black">
              {t.contact.successTitle}
            </h3>
            <p className="text-center text-black font-titulo-2 text-[1.125rem]">
              {t.contact.successMsg}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-dark-gold hover:bg-darkgoldenrod text-black font-bold py-3 px-8 rounded-full font-titulo-2 text-[1.125rem] cursor-pointer border-none transition-colors duration-200"
            >
              {t.contact.backHome}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="self-stretch flex flex-col items-end justify-start gap-[2.062rem] max-w-full"
          >
            {/* Nombre */}
            <div className="self-stretch flex flex-row items-start justify-center pt-[0rem] pb-[1.187rem] pl-[1.25rem] pr-[1.375rem] box-border max-w-full text-left text-[1.25rem] text-black font-titulo-2">
              <div className="w-[21.375rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
                <div className="self-stretch relative font-medium z-[1] mq450:text-[1rem]">
                  {t.contact.nameLabel}
                </div>
                <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.875rem] pr-[0.5rem] relative">
                  <div className="h-full w-full absolute !m-[0] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem] [filter:blur(1px)] rounded-xl bg-whitesmoke border-light-gold border-[1px] border-solid box-border mix-blend-normal z-[1]" />
                  <input
                    {...register("name", { required: t.contact.nameRequired })}
                    className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12rem] p-0 z-[2]"
                    placeholder={t.contact.namePlaceholder}
                    type="text"
                  />
                </div>
                {errors.name && (
                  <span className="text-red-500 text-sm font-titulo-2">{errors.name.message}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="self-stretch flex flex-row items-start justify-center py-[0rem] pl-[1.25rem] pr-[1.375rem] box-border max-w-full text-left text-[1.25rem]">
              <div className="w-[21.375rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
                <div className="self-stretch relative font-medium z-[1] mq450:text-[1rem]">
                  {t.contact.emailLabel}
                </div>
                <div className="self-stretch rounded-xl bg-whitesmoke border-black border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] pl-[0.812rem] pr-[0.437rem] max-w-full z-[1]">
                  <input
                    {...register("email", {
                      required: t.contact.emailRequired,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t.contact.emailInvalid,
                      },
                    })}
                    className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12rem] p-0 z-[2]"
                    placeholder={t.contact.emailPlaceholder}
                    type="email"
                  />
                </div>
                {errors.email && (
                  <span className="text-red-500 text-sm font-titulo-2">{errors.email.message}</span>
                )}
              </div>
            </div>

            {/* Mensaje */}
            <div className="self-stretch flex flex-row items-start justify-center py-[0rem] pl-[1.25rem] pr-[1.375rem] box-border max-w-full text-left text-[1.25rem]">
              <div className="w-[21.375rem] flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
                <div className="w-[20.063rem] relative font-medium flex items-center max-w-full z-[1] mq450:text-[1rem]">
                  {t.contact.messageLabel}
                </div>
                <textarea
                  {...register("message", { required: t.contact.messageRequired })}
                  className="border-black border-[1px] border-solid bg-whitesmoke h-[8.75rem] w-auto [outline:none] self-stretch rounded-xl box-border flex flex-row items-start justify-start py-[0rem] px-[0.875rem] font-titulo-2 font-light text-[1rem] text-black z-[1]"
                  placeholder={t.contact.messagePlaceholder}
                  rows={7}
                  cols={17}
                />
                {errors.message && (
                  <span className="text-red-500 text-sm font-titulo-2">{errors.message.message}</span>
                )}
              </div>
            </div>

            {/* Botón enviar */}
            <div className="flex flex-row items-start justify-end py-[0rem] px-[9.625rem] box-border max-w-full mq450:pl-[4.813rem] mq450:pr-[4.813rem] mq450:box-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer border-none py-[0.312rem] px-[3.312rem] bg-dark-gold shadow-[0px_2px_4px_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center h-[2rem] w-[9.5rem] hover:bg-darkgoldenrod disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <b className="relative text-[1.125rem] font-titulo-2 text-black text-center">
                  {isSubmitting ? t.contact.submitting : t.contact.submit}
                </b>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactoV;
