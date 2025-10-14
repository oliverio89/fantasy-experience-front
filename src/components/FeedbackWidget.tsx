import { FunctionComponent, useState } from "react";
import { useForm } from "@web3forms/react";

const FeedbackWidget: FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Access Key de Web3Forms configurada
  const { submit, submitting } = useForm({
    access_key: "defc80b9-eb2b-446c-9e4c-bd4731c6f2d4",
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 3000);
    },
    onError: (error) => {
      console.error("Error al enviar feedback:", error);
      alert("Error al enviar el feedback. Por favor, inténtalo de nuevo.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit(e);

    // Limpiar el formulario después del envío exitoso
    if (!submitting) {
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-dark-gold hover:bg-light-gold transition-all duration-300 text-black font-bold py-4 px-3 rounded-l-lg shadow-lg z-[100] ${
          isOpen ? "right-[420px]" : "right-0"
        }`}
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        <span className="text-sm tracking-wider">FEEDBACK</span>
      </button>

      {/* Panel del formulario */}
      <div
        className={`fixed right-0 top-0 h-full w-[420px] bg-black shadow-2xl transform transition-transform duration-300 ease-in-out z-[99] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-dark-gold p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-milonga text-black">
                Feedback
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black hover:text-white transition-colors text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-black mt-2 font-titulo-2">
              Cuéntanos tu experiencia con Fantasy Experience
            </p>
          </div>

          {/* Formulario */}
          <div className="flex-1 overflow-y-auto p-6">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-6xl">✅</div>
                <h3 className="text-2xl font-bold text-dark-gold font-milonga">
                  ¡Gracias!
                </h3>
                <p className="text-center text-nude font-titulo-2">
                  Tu feedback ha sido enviado correctamente. Lo revisaremos
                  pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos ocultos requeridos por Web3Forms */}
                <input
                  type="hidden"
                  name="subject"
                  value="Nuevo Feedback - Fantasy Experience"
                />
                <input
                  type="hidden"
                  name="from_name"
                  value="Fantasy Experience - Widget de Feedback"
                />

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    Tu nombre (opcional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 rounded-xl bg-darkslategray border border-nude text-nude placeholder-gray-400 focus:outline-none focus:border-dark-gold transition-colors font-titulo-2"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    Tu email <span className="text-dark-gold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-darkslategray border border-nude text-nude placeholder-gray-400 focus:outline-none focus:border-dark-gold transition-colors font-titulo-2"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-nude font-medium mb-2 font-titulo-2"
                  >
                    Tu mensaje <span className="text-dark-gold">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-darkslategray border border-nude text-nude placeholder-gray-400 focus:outline-none focus:border-dark-gold transition-colors resize-none font-titulo-2"
                    placeholder="Comparte tu feedback, sugerencias o reporta problemas..."
                  />
                </div>

                {/* Nota informativa */}
                <div className="bg-darkslategray border border-dark-gold rounded-lg p-4">
                  <p className="text-xs text-nude font-titulo-2">
                    📧 Tu feedback será enviado directamente a nuestro equipo.
                    Nos comprometemos a leer cada mensaje.
                  </p>
                </div>

                {/* Botón enviar */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-dark-gold hover:bg-light-gold disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-xl transition-colors duration-200 font-titulo-2 text-lg"
                >
                  {submitting ? "Enviando..." : "Enviar Feedback"}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-darkslategray p-4 bg-darkslategray">
            <p className="text-xs text-center text-nude font-titulo-2">
              Tu feedback nos ayuda a mejorar 🌟
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
