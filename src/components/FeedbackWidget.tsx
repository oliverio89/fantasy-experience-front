import { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslation } from "../i18n";
import { publicConfig } from "../lib/publicConfig";
import { useToast } from "../context/ToastContext";

interface FeedbackFormData {
  name?: string;
  email: string;
  message: string;
}

const FeedbackWidget: FunctionComponent = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FeedbackFormData>();

  const { submit } = useWeb3Forms({
    access_key: publicConfig.web3FormsAccessKey,
    settings: {
      from_name: "Fantasy Experience - Widget de Feedback",
      subject: "Nuevo Feedback - Fantasy Experience",
    },
    onSuccess: () => {
      setShowSuccess(true);
      reset();
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 3000);
    },
    onError: (error) => {
      console.error("Error al enviar feedback:", error);
      showToast(t.feedback.errorMsg, "error");
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!publicConfig.web3FormsAccessKey) {
      showToast(t.feedback.configError, "error");
      return;
    }
    await submit(data);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="fe-button-secondary fixed bottom-6 right-6 z-[100] gap-2 bg-[#17100b]/95 px-5 py-2 text-sm shadow-2xl mq450:bottom-4 mq450:right-4"
      >
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 5.5h14v10H9l-4 3v-13Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
        <span>{t.feedback.buttonLabel}</span>
      </button>

      {/* Panel del formulario */}
      <div
        className={`fixed right-0 top-0 z-[99] h-full w-[min(420px,100vw)] transform border-l border-[#d8a651]/25 bg-[#100c09] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b border-[#d8a651]/22 bg-[#1b130d] p-6">
            <div className="flex justify-between items-center">
              <h2 className="m-0 font-milonga text-2xl font-normal text-[#e1ae4f]">
                {t.feedback.title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar feedback"
                className="bg-transparent p-1 text-3xl font-bold leading-none text-[#f2e6cf]/60 transition-colors hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="mb-0 mt-2 text-sm text-[#f2e6cf]/55 font-titulo-2">
              {t.feedback.subtitle}
            </p>
          </div>

          {/* Formulario */}
          <div className="flex-1 overflow-y-auto p-6">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-6xl">✅</div>
                <h3 className="text-2xl font-bold text-dark-gold font-milonga">
                  {t.feedback.successTitle}
                </h3>
                <p className="text-center text-nude font-titulo-2">
                  {t.feedback.successMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    {t.feedback.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", { maxLength: 80 })}
                    className="w-full rounded-xl border border-[#d8a651]/24 bg-[#1b130d] px-4 py-3 text-nude placeholder:text-nude/35 focus:border-[#d8a651] focus:outline-none font-titulo-2"
                    placeholder={t.feedback.namePlaceholder}
                    maxLength={80}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    {t.feedback.emailLabel} <span className="text-dark-gold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", {
                      required: true,
                      maxLength: 254,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    })}
                    className="w-full rounded-xl border border-[#d8a651]/24 bg-[#1b130d] px-4 py-3 text-nude placeholder:text-nude/35 focus:border-[#d8a651] focus:outline-none font-titulo-2"
                    placeholder="tu@email.com"
                    maxLength={254}
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    {t.feedback.messageLabel} <span className="text-dark-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    {...register("message", {
                      required: true,
                      minLength: 10,
                      maxLength: 3000,
                    })}
                    rows={6}
                    className="w-full resize-none rounded-xl border border-[#d8a651]/24 bg-[#1b130d] px-4 py-3 text-nude placeholder:text-nude/35 focus:border-[#d8a651] focus:outline-none font-titulo-2"
                    placeholder={t.feedback.messagePlaceholder}
                    minLength={10}
                    maxLength={3000}
                  />
                </div>

                {/* Nota informativa */}
                <div className="rounded-xl border border-[#d8a651]/18 bg-[#1b130d] p-4">
                  <p className="text-xs text-nude font-titulo-2">
                    {t.feedback.privacyNote}
                    {" "}
                    <a
                      href="/privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark-gold underline"
                    >
                      Política de privacidad
                    </a>
                  </p>
                </div>

                {/* Botón enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="fe-button w-full rounded-xl text-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t.feedback.submitting : t.feedback.submit}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#d8a651]/15 bg-[#17100b] p-4">
            <p className="text-xs text-center text-nude font-titulo-2">
              {t.feedback.footerNote}
            </p>
          </div>
        </div>
      </div>

      {/* Overlay cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[98]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FeedbackWidget;
