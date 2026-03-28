import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "../context/ToastContext";
import PartidasService from "../services/partidasService";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({
  currentImage,
  onImageUploaded,
  className = "",
}: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast("La imagen no puede superar los 5MB", "error");
        return;
      }

      setLoading(true);
      try {
        const publicUrl = await PartidasService.subirImagen(file);
        onImageUploaded(publicUrl);
        showToast("Imagen subida correctamente", "success");
      } catch (error: any) {
        console.error("Error uploading image:", error);
        showToast("Error al subir la imagen", "error");
      } finally {
        setLoading(false);
      }
    },
    [onImageUploaded, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group ${
        isDragActive
          ? "border-dark-gold bg-dark-gold/10"
          : "border-nude/30 hover:border-dark-gold hover:bg-black/40"
      } ${className}`}
    >
      <input {...getInputProps()} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-dark-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-nude font-radio-option">Subiendo...</span>
          </div>
        </div>
      )}

      {/* Preview or Placeholder */}
      {currentImage ? (
        <div className="w-full h-full relative">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-radio-option flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Cambiar imagen
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-nude/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-12 h-12 mb-2 transition-transform duration-300 ${
              isDragActive ? "scale-110 text-dark-gold" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="font-radio-option text-center">
            {isDragActive
              ? "¡Suelta la imagen aquí!"
              : "Arrastra una imagen o haz clic para seleccionar"}
          </p>
          <p className="text-xs mt-2 opacity-50 font-radio-option">
            (Máx. 5MB - JPG, PNG, WEBP)
          </p>
        </div>
      )}
    </div>
  );
};
