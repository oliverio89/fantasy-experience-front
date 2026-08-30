import { ChangeEvent, useState } from "react";
import PartidasService, {
  DigitalAssetUpload as UploadedDigitalAsset,
} from "../services/partidasService";

interface DigitalAssetUploadProps {
  currentFileName?: string;
  currentFileSizeBytes?: number;
  onUploaded: (asset: UploadedDigitalAsset) => void;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DigitalAssetUpload = ({
  currentFileName,
  currentFileSizeBytes,
  onUploaded,
}: DigitalAssetUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    try {
      onUploaded(await PartidasService.subirArchivoDigital(file));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el archivo"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-dark-gold/70 bg-black/30 p-5">
      <div className="flex flex-col gap-2">
        <strong className="text-nude font-titulo-2">
          Archivo privado de la aventura
        </strong>
        <p className="m-0 text-sm leading-5 text-nude/70 font-titulo-2">
          PDF, ZIP o RAR · máximo 100 MB. Sólo podrán descargarlo el autor y
          quienes tengan un pago confirmado.
        </p>
        {currentFileName && (
          <div className="mt-2 rounded-xl border border-nude/20 bg-darkslategray px-4 py-3 text-sm text-nude">
            <span aria-hidden="true">📜 </span>
            <span className="font-bold">{currentFileName}</span>
            {currentFileSizeBytes ? ` · ${formatBytes(currentFileSizeBytes)}` : ""}
          </div>
        )}
        <label className="mt-2 inline-flex min-h-11 w-fit cursor-pointer items-center justify-center rounded-xl bg-dark-gold px-5 py-2 font-bold text-black transition-colors hover:bg-goldenrod focus-within:ring-2 focus-within:ring-goldenrod">
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.zip,.rar,application/pdf,application/zip,application/vnd.rar"
            onChange={(event) => void handleFile(event)}
            disabled={uploading}
          />
          {uploading
            ? "Subiendo de forma segura…"
            : currentFileName
            ? "Sustituir archivo"
            : "Seleccionar archivo"}
        </label>
        {error && (
          <p role="alert" className="m-0 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default DigitalAssetUpload;
