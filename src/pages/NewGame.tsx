import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PRESET_TAGS } from "../constants";
import PartidasService, {
  PartidaInput,
} from "../services/partidasService";
import type { TipoPartida } from "../components/PartidaCard";
import { useToast } from "../context/ToastContext";
import { CustomRadio } from "../components/ui/CustomRadio";
import { useAuth } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";
import { useTranslation } from "../i18n";
import { getErrorMessage } from "../lib/errors";
import { TIPOS_PARTIDA } from "../types/masters";
import DigitalAssetUpload from "../components/DigitalAssetUpload";
import type { DigitalAssetUpload as UploadedDigitalAsset } from "../services/partidasService";

const toLocalDateTimeInput = (isoDate: string): string => {
  const date = new Date(isoDate);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
};

const NewGame: FunctionComponent = () => {
  const navigate = useNavigate();
  const { partidaId } = useParams<{ partidaId: string }>();
  const isEditing = !!partidaId;
  const { showToast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form Fields State
  const INPUT_STYLE =
    "w-full bg-transparent border border-nude rounded-lg p-3 text-nude placeholder:text-nude/50 focus:border-white transition-colors outline-none font-radio-option";

  const [titulo, setTitulo] = useState("");
  const [tipoPartida, setTipoPartida] = useState<TipoPartida | "">("");
  const [idioma, setIdioma] = useState("");
  const [edadMinima, setEdadMinima] = useState("");
  const [jugadores, setJugadores] = useState("");
  const [temporalidad, setTemporalidad] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const pendingImageRef = useRef<string | null>(null);
  const imagePersistedRef = useRef(false);
  const [digitalAssetPath, setDigitalAssetPath] = useState("");
  const [digitalFileName, setDigitalFileName] = useState("");
  const [digitalFileSizeBytes, setDigitalFileSizeBytes] = useState<number>();
  const [digitalMimeType, setDigitalMimeType] = useState("");
  const [digitalVersion, setDigitalVersion] = useState(1);
  const pendingDigitalAssetRef = useRef<string | null>(null);
  const digitalAssetPersistedRef = useRef(false);
  const [descripcion, setDescripcion] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [contactoMaster, setContactoMaster] = useState("");
  const [precio, setPrecio] = useState("");
  const [horario, setHorario] = useState("");
  const [herramientas, setHerramientas] = useState("");
  const [usoTarjetaX, setUsoTarjetaX] = useState(false);
  const [obligatorioCamara, setObligatorioCamara] = useState(false);
  const [obligatorioMicrofono, setObligatorioMicrofono] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Nuevos estados para Horario desglosado
  const [horarioDia, setHorarioDia] = useState("");
  const [horarioFrecuencia, setHorarioFrecuencia] = useState("");
  const [sistemaJuego, setSistemaJuego] = useState("");
  const [fechaPartida, setFechaPartida] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auth state — rendering is handled via conditional return below

  // Sincronizar horarioDia y horarioFrecuencia con el string final horario
  useEffect(() => {
    if (horarioDia || horarioFrecuencia) {
      setHorario(
        `${horarioDia || "A convenir"} - ${horarioFrecuencia || "A convenir"}`
      );
    }
  }, [horarioDia, horarioFrecuencia]);

  useEffect(
    () => () => {
      if (!imagePersistedRef.current && pendingImageRef.current) {
        void PartidasService.eliminarImagenSubida(pendingImageRef.current);
      }
      if (!digitalAssetPersistedRef.current && pendingDigitalAssetRef.current) {
        void PartidasService.eliminarArchivoDigital(
          pendingDigitalAssetRef.current
        );
      }
    },
    []
  );

  const handleImageUploaded = useCallback((url: string) => {
    const previousPendingImage = pendingImageRef.current;
    pendingImageRef.current = url;
    setImagenUrl(url);

    if (previousPendingImage && previousPendingImage !== url) {
      void PartidasService.eliminarImagenSubida(previousPendingImage);
    }
  }, []);

  const handleDigitalAssetUploaded = useCallback(
    (asset: UploadedDigitalAsset) => {
      const previousPendingAsset = pendingDigitalAssetRef.current;
      pendingDigitalAssetRef.current = asset.path;
      setDigitalAssetPath(asset.path);
      setDigitalFileName(asset.fileName);
      setDigitalFileSizeBytes(asset.fileSizeBytes);
      setDigitalMimeType(asset.mimeType);
      setDigitalVersion((version) => version + (digitalFileName ? 1 : 0));

      if (previousPendingAsset && previousPendingAsset !== asset.path) {
        void PartidasService.eliminarArchivoDigital(previousPendingAsset);
      }
    },
    [digitalFileName]
  );

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const currentTags = Array.isArray(prev) ? prev : [];
      if (!currentTags.includes(tag) && currentTags.length >= 20) {
        showToast("Puedes añadir un máximo de 20 etiquetas", "error");
        return currentTags;
      }
      return currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
    });
  };

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTagInput(e.target.value);
  };

  const addCustomTag = () => {
    const newTag = customTagInput.trim();
    if (!newTag) return;
    if (newTag.length > 40) {
      showToast("Cada etiqueta puede tener como máximo 40 caracteres", "error");
      return;
    }
    if (tags.length >= 20) {
      showToast("Puedes añadir un máximo de 20 etiquetas", "error");
      return;
    }
    if (!tags.some((tag) => tag.toLocaleLowerCase() === newTag.toLocaleLowerCase())) {
      setTags((currentTags) => [...currentTags, newTag]);
    }
    setCustomTagInput("");
  };

  // Load Data
  useEffect(() => {
    const fetchPartida = async () => {
      if (
        partidaId &&
        !authLoading &&
        user &&
        (userRole === "master" || userRole === "admin")
      ) {
        setLoading(true);
        try {
          const data = await PartidasService.obtenerPartidaPorId(
            partidaId
          );
          if (data.masterId !== user.id && userRole !== "admin") {
            showToast("No tienes permiso para editar esta partida", "error");
            navigate(`/detailsgame/${partidaId}`, { replace: true });
            return;
          }
          setTitulo(data.titulo || "");
          setTipoPartida(data.tipoPartida || "");
          setDescripcion(data.descripcion || "");
          setImagenUrl(data.imagenUrl || "");
          setIdioma(data.idioma || "");
          setEdadMinima(
            data.edadMinima !== undefined ? String(data.edadMinima) : ""
          );
          setJugadores(data.jugadores || "");
          setTemporalidad(data.temporalidad || "");

          setTags(data.tags || []);

          setRecomendaciones(data.recomendaciones || "");
          setCiudad(data.ciudad || "");
          setContactoMaster(data.contactoMaster || "");
          setPrecio(data.precio || "");
          setHorario(data.horario || "");

          // Parsear horario si existe para rellenar los radio buttons
          if (data.horario) {
            const parts = data.horario.split(" - ");
            if (parts.length === 2) {
              setHorarioDia(parts[0]);
              setHorarioFrecuencia(parts[1]);
            }
          }

          setHerramientas(
            Array.isArray(data.herramientas)
              ? data.herramientas.join(", ")
              : data.herramientas || ""
          );
          setUsoTarjetaX(!!data.usoTarjetaX);
          setObligatorioCamara(!!data.obligatorioCamara);
          setObligatorioMicrofono(!!data.obligatorioMicrofono);
          setSistemaJuego(data.sistemaJuego || "");
          setFechaPartida(data.fecha ? toLocalDateTimeInput(data.fecha) : "");
          setDigitalFileName(data.digitalFileName || "");
          setDigitalFileSizeBytes(data.digitalFileSizeBytes);
          setDigitalMimeType(data.digitalMimeType || "");
          setDigitalVersion(data.digitalVersion || 1);
        } catch (err) {
          console.error("Error cargando partida:", err);
          showToast("Error al cargar la partida", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPartida();
  }, [
    partidaId,
    authLoading,
    user,
    userRole,
    navigate,
    showToast,
  ]);

  // Validation Logic
  const renderError = (field: string) =>
    errors[field] ? (
      <span className="text-red-500 text-sm mt-1">{errors[field]}</span>
    ) : null;

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (step === 1) {
      if (!titulo.trim()) newErrors.titulo = "El título es obligatorio";
      else if (titulo.trim().length < 3 || titulo.trim().length > 120)
        newErrors.titulo = "El título debe tener entre 3 y 120 caracteres";
      if (!descripcion.trim())
        newErrors.descripcion = "La descripción es obligatoria";
      else if (
        descripcion.trim().length < 20 ||
        descripcion.trim().length > 5000
      )
        newErrors.descripcion =
          "La descripción debe tener entre 20 y 5000 caracteres";
      if (!imagenUrl.trim()) newErrors.imagenUrl = "La imagen es obligatoria";
      if (!sistemaJuego.trim())
        newErrors.sistemaJuego = "El sistema de juego es obligatorio";
      else if (sistemaJuego.trim().length > 80)
        newErrors.sistemaJuego =
          "El sistema de juego no puede superar 80 caracteres";
      if (!tipoPartida.trim())
        newErrors.tipoPartida = "El tipo de partida es obligatorio";
    }

    if (step === 2) {
      if (!idioma.trim()) newErrors.idioma = "El idioma es obligatorio";
      if (tipoPartida !== "Digital" && !jugadores.trim())
        newErrors.jugadores = "El número de jugadores es obligatorio";
      else if (
        (tipoPartida !== "Digital" &&
          !Number.isInteger(Number(jugadores))) ||
        (tipoPartida !== "Digital" &&
          (Number(jugadores) < 1 || Number(jugadores) > 20))
      )
        newErrors.jugadores = "El número de jugadores debe estar entre 1 y 20";
      if (tipoPartida !== "Digital" && !fechaPartida)
        newErrors.fechaPartida = "La fecha de inicio es obligatoria";
      else if (
        (tipoPartida !== "Digital" &&
          !Number.isFinite(new Date(fechaPartida).getTime())) ||
        (tipoPartida !== "Digital" &&
          new Date(fechaPartida).getTime() <= Date.now())
      )
        newErrors.fechaPartida = "La fecha y hora deben estar en el futuro";
      if (tipoPartida !== "Digital" && !temporalidad)
        newErrors.temporalidad = "Selecciona la temporalidad de la partida";
      if (
        edadMinima &&
        (!Number.isInteger(Number(edadMinima)) ||
          Number(edadMinima) < 0 ||
          Number(edadMinima) > 99)
      )
        newErrors.edadMinima = "La edad mínima debe estar entre 0 y 99";
      if (
        (precio || tipoPartida === "Digital") &&
        (!Number.isFinite(Number(precio)) ||
          Number(precio) < (tipoPartida === "Digital" ? 0.5 : 0) ||
          (tipoPartida !== "Digital" &&
            Number(precio) > 0 &&
            Number(precio) < 0.5) ||
          Number(precio) > 999999.99)
      )
        newErrors.precio =
          tipoPartida === "Digital"
            ? "La aventura digital debe tener un precio desde 0,50 €"
            : "Usa 0 para una partida gratuita o un precio desde 0,50 €";
      if (
        (tipoPartida === "Presencial" || tipoPartida === "Híbrida") &&
        !ciudad.trim()
      ) {
        newErrors.ciudad =
          "La ciudad es obligatoria para partidas con parte presencial";
      }
      if (ciudad.trim().length > 100)
        newErrors.ciudad = "La ciudad no puede superar 100 caracteres";
      if (tipoPartida !== "Digital" && contactoMaster.trim().length > 500)
        newErrors.contactoMaster =
          "El contacto no puede superar 500 caracteres";
      else if (tipoPartida !== "Digital" && !contactoMaster.trim())
        newErrors.contactoMaster =
          "Indica cómo contactarán contigo los jugadores con reserva";
      if (recomendaciones.trim().length > 2000)
        newErrors.recomendaciones =
          "Las recomendaciones no pueden superar 2000 caracteres";
    }

    if (step === 3) {
      if (
        tipoPartida === "Digital" &&
        (!digitalFileName || (!digitalAssetPath && !isEditing))
      ) {
        newErrors.digitalAsset =
          "Sube el PDF, ZIP o RAR antes de publicar la aventura";
      }
      const toolCount = herramientas
        .split(",")
        .map((tool) => tool.trim())
        .filter(Boolean).length;
      if (tipoPartida !== "Digital" && herramientas.trim().length > 1000) {
        newErrors.herramientas =
          "Las herramientas no pueden superar 1000 caracteres";
      } else if (tipoPartida !== "Digital" && toolCount > 20) {
        newErrors.herramientas =
          "Puedes indicar un máximo de 20 herramientas separadas por comas";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Por favor corrige los errores antes de continuar", "error");
      isValid = false;
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleCrear = useCallback(async () => {
    if (!validateStep(currentStep)) {
      showToast("Por favor corrige los errores del formulario", "error");
      return;
    }

    try {
      setLoading(true);

      const datosPartida: PartidaInput = {
        titulo,
        sistemaJuego,
        fecha:
          tipoPartida === "Digital"
            ? undefined
            : new Date(fechaPartida).toISOString(),
        descripcion,
        imagenUrl,
        tipoPartida: tipoPartida || undefined,
        idioma,
        edadMinima,
        jugadores,
        temporalidad,
        tags,
        recomendaciones,
        ciudad,
        contactoMaster,
        precio,
        horario,
        herramientas,
        usoTarjetaX,
        obligatorioCamara,
        obligatorioMicrofono,
        digitalAssetPath: digitalAssetPath || undefined,
        digitalFileName: digitalFileName || undefined,
        digitalFileSizeBytes,
        digitalMimeType: digitalMimeType || undefined,
        digitalVersion,
      };

      if (isEditing && partidaId) {
        await PartidasService.actualizarPartida(partidaId, datosPartida);
        showToast(
          tipoPartida === "Digital"
            ? "Aventura digital actualizada con éxito"
            : "Partida actualizada con éxito",
          "success"
        );
      } else {
        await PartidasService.crearPartida(datosPartida);
        showToast(
          tipoPartida === "Digital"
            ? "¡Aventura digital publicada con éxito!"
            : "¡Partida creada con éxito!",
          "success"
        );
      }

      imagePersistedRef.current = true;
      digitalAssetPersistedRef.current = tipoPartida === "Digital";
      navigate("/nextgames");
    } catch (error: unknown) {
      console.error("Error al guardar partida:", error);
      showToast(
        `Error: ${
          getErrorMessage(error, t.newGame.errorSave)
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [
    user,
    titulo,
    jugadores,
    idioma,
    edadMinima,
    precio,
    ciudad,
    contactoMaster,
    tipoPartida,
    temporalidad,
    descripcion,
    recomendaciones,
    herramientas,
    horario,
    usoTarjetaX,
    obligatorioCamara,
    obligatorioMicrofono,
    imagenUrl,
    tags,
    sistemaJuego,
    fechaPartida,
    digitalAssetPath,
    digitalFileName,
    digitalFileSizeBytes,
    digitalMimeType,
    digitalVersion,
    isEditing,
    partidaId,
    navigate,
    showToast,
    currentStep,
    t,
  ]);

  // Cargando sesión
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  // No hay sesión activa → pantalla de aviso
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg flex flex-col items-center gap-8">
          {/* Icono */}
          <div className="w-24 h-24 rounded-full bg-dark-gold/10 border border-dark-gold/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-dark-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
            </svg>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="m-0 text-oldlace-100 font-extrabold font-titulo-2 whitespace-pre-line" style={{ fontSize: "2rem" }}>
              {t.newGame.authTitle}
            </h1>
            <p className="m-0 text-oldlace-100/60 text-lg font-titulo-2 leading-relaxed">
              {t.newGame.authDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={() => navigate("/register")}
              className="flex-1 py-3 px-6 bg-dark-gold text-black font-bold rounded-full font-titulo-2 text-lg cursor-pointer border-none hover:bg-goldenrod transition-colors duration-200"
            >
              {t.newGame.createAccount}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-3 px-6 bg-transparent text-dark-gold font-bold rounded-full font-titulo-2 text-lg cursor-pointer border border-dark-gold hover:bg-dark-gold/10 transition-colors duration-200"
            >
              {t.newGame.loginButton}
            </button>
          </div>

          <button
            onClick={() => navigate("/nextgames")}
            className="text-oldlace-100/40 text-base font-titulo-2 cursor-pointer bg-transparent border-none hover:text-oldlace-100/70 transition-colors underline"
          >
            {t.newGame.browseGames}
          </button>
        </div>
      </div>
    );
  }

  if (userRole !== "master" && userRole !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg flex flex-col items-center gap-6">
          <h1 className="m-0 text-oldlace-100 font-extrabold font-titulo-2 text-3xl">
            {t.newGame.masterOnlyTitle}
          </h1>
          <p className="m-0 text-oldlace-100/60 text-lg font-titulo-2 leading-relaxed">
            {t.newGame.masterOnlyDescription}
          </p>
          <button
            onClick={() => navigate("/nextgames")}
            className="py-3 px-6 bg-dark-gold text-black font-bold rounded-full font-titulo-2 text-lg cursor-pointer border-none"
          >
            {t.newGame.browseGames}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <main className="self-stretch bg-black flex flex-col items-end justify-start pt-[0rem] px-[4.875rem] pb-[7.562rem] box-border max-w-full text-center text-[1.125rem] text-black1 font-radio-option lg:pb-[4.938rem] lg:box-border mq1050:pb-[3.188rem] mq1050:box-border mq450:pb-[2.063rem] mq450:box-border mq750:pl-[2.438rem] mq750:pr-[2.438rem] mq750:box-border">
        {/* Background */}
        <div className="w-[80rem] h-[116.25rem] relative bg-black hidden max-w-full z-[1]" />

        <section className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-[4rem] px-[6.062rem] pb-[5.312rem] box-border gap-[2.25rem] max-w-full z-[1] mt-[-1.813rem] text-left text-[2.25rem] text-nude font-radio-option lg:pt-[4rem] lg:px-[3rem] lg:pb-[3.438rem] lg:box-border mq1050:pb-[2.25rem] mq1050:box-border mq450:pb-[1.438rem] mq450:box-border mq750:gap-[1.125rem] mq750:pl-[1.5rem] mq750:pr-[1.5rem] mq750:box-border">
          <div className="w-[70.125rem] h-[101.938rem] relative rounded-xl bg-darkslategray hidden max-w-full" />

          {/* Header Title */}
          <div className="self-stretch flex flex-col items-start justify-start">
            <h1 className="m-0 self-stretch relative text-inherit font-extrabold font-[inherit] z-[2] mq1050:text-[1.813rem] mq1050:leading-[1.75rem] mq450:text-[1.375rem] mq450:leading-[1.313rem]">
              {isEditing
                ? tipoPartida === "Digital"
                  ? "Editar aventura digital"
                  : t.newGame.titleEdit
                : tipoPartida === "Digital"
                ? "Nueva aventura digital"
                : t.newGame.titleCreate}
            </h1>
            <div className="self-stretch h-[2.688rem] relative text-[1.125rem] leading-[1.625rem] flex items-center shrink-0 z-[2] mt-[-0.625rem]">
              {isEditing
                ? tipoPartida === "Digital"
                  ? "Modifica los datos y el archivo de tu producto"
                  : t.newGame.subtitleEdit
                : tipoPartida === "Digital"
                ? "Publica un PDF, ZIP o RAR para venderlo sin dirigir una sesión"
                : t.newGame.subtitleCreate}
            </div>
          </div>

          <div className="self-stretch flex flex-col items-start justify-start max-w-full text-base text-nude">
            <form className="w-full flex flex-col gap-8">
              {currentStep === 1 && (
                <div className="flex flex-col gap-6 animate-slide-in-right">
                  {/* Title */}
                  <div>
                    <label className="block text-nude mb-2 font-radio-option">
                      {t.newGame.titleLabel}
                    </label>
                    <input
                      className={`${INPUT_STYLE} ${
                        errors.titulo ? "border-red-500" : ""
                      }`}
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder={t.newGame.titlePlaceholder}
                      maxLength={120}
                    />
                    {renderError("titulo")}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-nude mb-2 font-radio-option">
                      {t.newGame.descriptionLabel}
                    </label>
                    <textarea
                      className={`${INPUT_STYLE} h-32 ${
                        errors.descripcion ? "border-red-500" : ""
                      }`}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder={t.newGame.descriptionPlaceholder}
                      maxLength={5000}
                    />
                    {renderError("descripcion")}
                  </div>

                  {/* Image URL - Drag & Drop */}
                  <div>
                    <label className="block text-nude mb-2 font-radio-option">
                      {t.newGame.imageLabel}
                    </label>
                    <div className="mb-2">
                      <ImageUpload
                        currentImage={imagenUrl}
                        onImageUploaded={handleImageUploaded}
                      />
                      {renderError("imagenUrl")}
                    </div>
                  </div>

                  {/* Sistema de Juego */}
                  <div>
                    <label className="block text-nude mb-2 font-radio-option">
                      {t.newGame.systemLabel}
                    </label>
                    <input
                      className={`${INPUT_STYLE} ${
                        errors.sistemaJuego ? "border-red-500" : ""
                      }`}
                      value={sistemaJuego}
                      onChange={(e) => setSistemaJuego(e.target.value)}
                      placeholder={t.newGame.systemPlaceholder}
                      maxLength={80}
                    />
                    {renderError("sistemaJuego")}
                  </div>

                  {/* Tipo Partida */}
                  <div>
                    <label className="block text-nude mb-4 font-radio-option">
                      {t.newGame.typeLabel}
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {TIPOS_PARTIDA.map((type) => (
                        <label
                          key={type}
                          className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-xl border p-4 font-titulo-2 transition-colors ${
                            tipoPartida === type
                              ? "border-dark-gold bg-dark-gold/10"
                              : "border-nude/30 hover:border-nude"
                          }`}
                        >
                          <CustomRadio checked={tipoPartida === type} />
                          <input
                            type="radio"
                            className="hidden"
                            checked={tipoPartida === type}
                            onChange={() => setTipoPartida(type)}
                          />
                          <span>
                            <strong className="block text-nude">
                              {type === "Presencial" ? "En mesa" : type}
                            </strong>
                            <small className="mt-1 block leading-4 text-nude/60">
                              {type === "Presencial"
                                ? "Sesión dirigida en una ubicación física."
                                : type === "Online"
                                ? "Sesión en directo por voz o videollamada."
                                : "Archivo PDF, ZIP o RAR para comprar y descargar."}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {renderError("tipoPartida")}
                  </div>

                  <div>
                    <label className="block text-nude mb-4">{t.newGame.tagsLabel}</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PRESET_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-full text-sm transition-all border ${
                            Array.isArray(tags) && tags.includes(tag)
                              ? "bg-nude text-black border-nude font-bold"
                              : "bg-transparent text-nude border-nude/50 hover:bg-nude/10"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Tags seleccionados e inputs extra */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(tags) &&
                        tags
                          .filter((t) => !PRESET_TAGS.includes(t))
                          .map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-1 px-3 py-1 rounded-full bg-nude/20 text-nude border border-nude/30 text-xs"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="hover:text-white cursor-pointer ml-1 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                    </div>

                    <div className="relative">
                      <input
                        className="w-full bg-transparent border-b border-nude text-nude p-2 outline-none placeholder:text-nude/50"
                        placeholder="Otro... (escribe y pulsa Enter)"
                        value={customTagInput}
                        onChange={handleCustomTagChange}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addCustomTag();
                          }
                        }}
                        maxLength={40}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DETALLES DE SESIÓN */}
              {currentStep === 2 && (
                <div className="self-stretch flex flex-col gap-6 animate-slide-in-right">
                  <div className="rounded-xl bg-oldlace-300 flex items-center p-4 gap-2 z-[2] w-fit">
                    <img src="/settings.svg" alt="" className="w-6 h-6" />
                    <b className="text-[1.25rem] text-nude">
                      {tipoPartida === "Digital"
                        ? "Detalles del producto"
                        : t.newGame.step2Header}
                    </b>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="flex flex-col gap-6">
                      {/* Grupos de inputs en 2 columnas para ahorrar espacio */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tipoPartida !== "Digital" ? (
                          <div>
                            <label className="block text-nude mb-2 font-radio-option">
                              {t.newGame.playersLabel}
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              className={`${INPUT_STYLE.replace(
                                "w-full",
                                "w-32"
                              )} ${errors.jugadores ? "border-red-500" : ""}`}
                              placeholder="3"
                              value={jugadores}
                              onChange={(e) => setJugadores(e.target.value)}
                            />
                            {renderError("jugadores")}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dark-gold/40 bg-black/20 p-4 text-sm leading-5 text-nude/70">
                            Se vende como descarga. No tendrá fecha, aforo ni reserva de plaza.
                          </div>
                        )}

                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.ageLabel}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={99}
                            className={`${INPUT_STYLE.replace("w-full", "w-32")} ${
                              errors.edadMinima ? "border-red-500" : ""
                            }`}
                            placeholder="18"
                            value={edadMinima}
                            onChange={(e) => setEdadMinima(e.target.value)}
                          />
                          {renderError("edadMinima")}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {tipoPartida !== "Digital" ? <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.sessionsLabel}
                          </label>
                          <select
                            className={`${INPUT_STYLE.replace("w-full", "w-48")} ${
                              errors.temporalidad ? "border-red-500" : ""
                            }`}
                            value={temporalidad}
                            onChange={(e) => setTemporalidad(e.target.value)}
                          >
                            <option value="" className="bg-black">
                              Selecciona una opción
                            </option>
                            <option value="One-shot" className="bg-black">One-shot</option>
                            <option value="Campaña corta" className="bg-black">Campaña corta</option>
                            <option value="Campaña larga" className="bg-black">Campaña larga</option>
                            <option value="Abierta" className="bg-black">Abierta</option>
                          </select>
                          {renderError("temporalidad")}
                        </div> : (
                          <div className="flex items-center rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-nude/70">
                            Producto digital de compra única.
                          </div>
                        )}
                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.priceLabel}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={999999.99}
                            step="0.01"
                            className={`${INPUT_STYLE.replace("w-full", "w-32")} ${
                              errors.precio ? "border-red-500" : ""
                            }`}
                            placeholder="0"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                          />
                          {renderError("precio")}
                        </div>
                      </div>

                      {tipoPartida !== "Digital" && <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.dateLabel}
                        </label>
                        <input
                          type="datetime-local"
                          className={`${INPUT_STYLE} ${
                            errors.fechaPartida ? "border-red-500" : ""
                          }`}
                          value={fechaPartida}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFechaPartida(e.target.value)}
                          style={{ colorScheme: "dark" }}
                        />
                        {renderError("fechaPartida")}
                      </div>}

                      {tipoPartida !== "Digital" && <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.cityLabel}
                        </label>
                        <input
                          className={`${INPUT_STYLE} ${
                            errors.ciudad ? "border-red-500" : ""
                          }`}
                          placeholder="Madrid, Barcelona..."
                          value={ciudad}
                          onChange={(e) => setCiudad(e.target.value)}
                          maxLength={100}
                        />
                        {renderError("ciudad")}
                      </div>}
                    </div>

                    {/* Right Column: Schedule */}
                    <div className="flex flex-col gap-6">
                      {tipoPartida !== "Digital" && <div>
                        <label className="block text-nude mb-4 text-lg font-radio-option">
                          {t.newGame.scheduleLabel}
                        </label>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Momento */}
                          <div className="flex flex-col gap-2">
                            <span className="text-nude/70 text-xs font-bold uppercase tracking-wider font-radio-option">
                              {t.newGame.scheduleMoment}
                            </span>
                            {[t.newGame.scheduleMorning, t.newGame.scheduleAfternoon, t.newGame.scheduleToBeAgreed].map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center text-nude gap-2 cursor-pointer hover:opacity-80 font-radio-option"
                              >
                                <CustomRadio
                                  checked={horarioDia === opt}
                                  size="sm"
                                />
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={horarioDia === opt}
                                  onChange={() => setHorarioDia(opt)}
                                />
                                <span className="text-xs">{opt}</span>
                              </label>
                            ))}
                          </div>

                          {/* Frecuencia */}
                          <div className="flex flex-col gap-2">
                            <span className="text-nude/70 text-xs font-bold uppercase tracking-wider font-radio-option">
                              {t.newGame.scheduleFrequency}
                            </span>
                            {[
                              t.newGame.scheduleWeekly,
                              t.newGame.scheduleFortnightly,
                              t.newGame.scheduleToBeAgreed,
                            ].map((opt) => (
                              <label
                                key={opt}
                                className="flex items-center text-nude gap-2 cursor-pointer hover:opacity-80 font-radio-option"
                              >
                                <CustomRadio
                                  checked={horarioFrecuencia === opt}
                                  size="sm"
                                />
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={horarioFrecuencia === opt}
                                  onChange={() => setHorarioFrecuencia(opt)}
                                />
                                <span className="text-xs">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>}

                      <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.languageLabel}
                        </label>
                        <div className="flex gap-4">
                          {[t.newGame.languageSpanish, t.newGame.languageEnglish].map((lang) => (
                            <label
                              key={lang}
                              className="flex items-center text-nude gap-2 cursor-pointer hover:opacity-80 font-radio-option"
                            >
                              <CustomRadio checked={idioma === lang} />
                              <input
                                type="radio"
                                className="hidden"
                                checked={idioma === lang}
                                onChange={() => setIdioma(lang)}
                              />
                              {lang}
                            </label>
                          ))}
                        </div>
                        {renderError("idioma")}
                      </div>

                      {tipoPartida !== "Digital" && <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.contactLabel}
                        </label>
                        <input
                          className={INPUT_STYLE}
                          placeholder={t.newGame.contactPlaceholder}
                          value={contactoMaster}
                          onChange={(e) => setContactoMaster(e.target.value)}
                          maxLength={500}
                        />
                        {renderError("contactoMaster")}
                      </div>}

                      <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.recommendationsLabel}
                        </label>
                        <textarea
                          className={`${INPUT_STYLE} h-24`}
                          placeholder={t.newGame.recommendationsPlaceholder}
                          value={recomendaciones}
                          onChange={(e) => setRecomendaciones(e.target.value)}
                          maxLength={2000}
                        />
                        {renderError("recomendaciones")}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TÉCNICO Y EXTRAS */}
              {currentStep === 3 && (
                <div className="self-stretch flex flex-col gap-6 animate-slide-in-right">
                  <div className="rounded-xl bg-oldlace-300 flex items-center p-4 gap-2 z-[2] w-fit">
                    <img src="/tool.svg" alt="" className="w-6 h-6" />
                    <b className="text-[1.25rem] text-nude">
                      {tipoPartida === "Digital"
                        ? "Archivo y entrega"
                        : t.newGame.step3Header}
                    </b>
                  </div>

                  {tipoPartida === "Digital" ? (
                    <div className="flex flex-col gap-3">
                      <DigitalAssetUpload
                        currentFileName={digitalFileName}
                        currentFileSizeBytes={digitalFileSizeBytes}
                        onUploaded={handleDigitalAssetUploaded}
                      />
                      {renderError("digitalAsset")}
                      <p className="m-0 text-sm leading-6 text-nude/60">
                        El archivo se guarda en un bucket privado. Tras confirmar
                        Stripe, cada comprador recibe un enlace temporal y
                        revocable; la URL real del archivo nunca se publica.
                      </p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-nude mb-2 font-radio-option">
                        {t.newGame.toolsLabel}
                      </label>
                      <textarea
                        className={INPUT_STYLE + " h-32"}
                        placeholder={t.newGame.toolsPlaceholder}
                        value={herramientas}
                        onChange={(e) => setHerramientas(e.target.value)}
                        maxLength={1000}
                      />
                      {renderError("herramientas")}
                    </div>

                    <div className="flex flex-col gap-8">
                      {/* Toggles */}
                      <div className="flex flex-col gap-3">
                        <span className="text-nude text-lg">
                          {t.newGame.xCardLabel}
                        </span>
                        <div className="flex gap-8">
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={usoTarjetaX} />
                            <input type="radio" checked={usoTarjetaX} onChange={() => setUsoTarjetaX(true)} className="hidden" />
                            {t.newGame.optionYes}
                          </label>
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={!usoTarjetaX} />
                            <input type="radio" checked={!usoTarjetaX} onChange={() => setUsoTarjetaX(false)} className="hidden" />
                            {t.newGame.optionNo}
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-nude text-lg">
                          {t.newGame.cameraLabel}
                        </span>
                        <div className="flex gap-8">
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={obligatorioCamara} />
                            <input type="radio" checked={obligatorioCamara} onChange={() => setObligatorioCamara(true)} className="hidden" />
                            {t.newGame.optionYes}
                          </label>
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={!obligatorioCamara} />
                            <input type="radio" checked={!obligatorioCamara} onChange={() => setObligatorioCamara(false)} className="hidden" />
                            {t.newGame.optionNo}
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-nude text-lg">
                          {t.newGame.micLabel}
                        </span>
                        <div className="flex gap-8">
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={obligatorioMicrofono} />
                            <input type="radio" checked={obligatorioMicrofono} onChange={() => setObligatorioMicrofono(true)} className="hidden" />
                            {t.newGame.optionYes}
                          </label>
                          <label className="flex items-center text-nude gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <CustomRadio checked={!obligatorioMicrofono} />
                            <input type="radio" checked={!obligatorioMicrofono} onChange={() => setObligatorioMicrofono(false)} className="hidden" />
                            {t.newGame.optionNo}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-row items-center justify-between gap-4 mt-8 w-full border-t border-white/10 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep > 1) handlePrev();
                    else navigate("/nextgames");
                  }}
                  className="px-6 py-2 border border-dark-gold text-dark-gold rounded-full hover:bg-dark-gold hover:text-black transition-all duration-300 font-radio-option"
                >
                  {currentStep === 1 ? t.newGame.btnCancel : t.newGame.btnPrev}
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-2 bg-dark-gold text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg font-radio-option"
                  >
                    {t.newGame.btnNext}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCrear}
                    disabled={loading}
                    className="px-8 py-2 bg-dark-gold text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center gap-2 font-radio-option"
                  >
                    {loading
                      ? t.common.saving
                      : isEditing
                      ? t.newGame.btnSave
                      : tipoPartida === "Digital"
                      ? "Publicar aventura"
                      : t.newGame.btnCreate}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewGame;
