import { FunctionComponent, ReactNode, useEffect, useRef } from "react";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  type?: "error" | "info" | "success";
  actions?: ReactNode;
};

const Modal: FunctionComponent<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
  actions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const borderColor =
    type === "error"
      ? "border-red-500"
      : type === "success"
      ? "border-green-500"
      : "border-dark-gold";

  const titleColor =
    type === "error"
      ? "text-red-500"
      : type === "success"
      ? "text-green-500"
      : "text-dark-gold";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md p-6 m-4 bg-darkslategray rounded-xl border-2 ${borderColor} shadow-[0_0_20px_rgba(0,0,0,0.5)] transform transition-all duration-300 scale-100 animate-scale-in`}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          {type === "error" && (
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}

          {title && (
            <h3 className={`text-2xl font-bold font-titulo-2 ${titleColor}`}>
              {title}
            </h3>
          )}

          <div className="text-nude text-base font-titulo-2 font-light leading-relaxed break-words whitespace-pre-line w-full">
            {children}
          </div>

          {actions ? (
            <div className="mt-6 flex flex-col gap-3 w-full items-center">
              {actions}
              <button
                onClick={onClose}
                className="px-8 py-2 text-gray-400 font-titulo-2 text-sm hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2 bg-dark-gold text-black font-bold font-titulo-2 rounded-full hover:bg-darkgoldenrod transition-colors shadow-lg"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
