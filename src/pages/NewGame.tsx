import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PRESET_TAGS } from "../constants";
import PartidasService from "../services/partidasService";
import { useToast } from "../context/ToastContext";
import { CustomRadio } from "../components/ui/CustomRadio";
import { useAuth } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";
import { useTranslation } from "../i18n";

const NewGame: FunctionComponent = () => {
  const navigate = useNavigate();
  const { partidaId } = useParams<{ partidaId: string }>();
  const isEditing = !!partidaId;
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form Fields State
  const INPUT_STYLE =
    "w-full bg-transparent border border-nude rounded-lg p-3 text-nude placeholder:text-nude/50 focus:border-white transition-colors outline-none font-radio-option";

  const [titulo, setTitulo] = useState("");
  const [tipoPartida, setTipoPartida] = useState("");
  const [idioma, setIdioma] = useState("");
  const [edadMinima, setEdadMinima] = useState("");
  const [jugadores, setJugadores] = useState("");
  const [temporalidad, setTemporalidad] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
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

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const currentTags = Array.isArray(prev) ? prev : [];
      return currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
    });
  };

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(" ")) {
      const newTag = val.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => {
          const currentTags = Array.isArray(prev) ? prev : [];
          return [...currentTags, newTag];
        });
      }
      setCustomTagInput("");
    } else {
      setCustomTagInput(val);
    }
  };

  // Load Data
  useEffect(() => {
    const fetchPartida = async () => {
      if (partidaId) {
        setLoading(true);
        try {
          const data: any = await PartidasService.obtenerPartidaPorId(
            partidaId
          );
          setTitulo(data.titulo || "");
          setTipoPartida(data.tipoPartida || "");
          setDescripcion(data.descripcion || "");
          setImagenUrl(data.imagenUrl || "");
          setIdioma(data.idioma || "");
          setEdadMinima(data.edadMinima || "");
          setJugadores(data.jugadores || "");
          setTemporalidad(data.temporalidad || "");

          let loadedTags = data.tags || [];
          if (typeof loadedTags === "string") {
            if (loadedTags.startsWith("[")) {
              try {
                loadedTags = JSON.parse(loadedTags);
              } catch {
                loadedTags = [];
              }
            } else {
              loadedTags = loadedTags
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => t);
            }
          }
          setTags(loadedTags);

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

          setHerramientas(data.herramientas || "");
          setUsoTarjetaX(!!data.usoTarjetaX);
          setObligatorioCamara(!!data.obligatorioCamara);
          setObligatorioMicrofono(!!data.obligatorioMicrofono);
          setSistemaJuego(data.sistemaJuego || "");
          setFechaPartida(data.fecha ? data.fecha.split("T")[0] : "");
        } catch (err) {
          console.error("Error cargando partida:", err);
          showToast("Error al cargar la partida", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPartida();
  }, [partidaId, showToast]);

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
      if (!descripcion.trim())
        newErrors.descripcion = "La descripción es obligatoria";
      if (!tipoPartida.trim())
        newErrors.tipoPartida = "El tipo de partida es obligatorio";
    }

    if (step === 2) {
      if (!idioma.trim()) newErrors.idioma = "El idioma es obligatorio";
      if (!jugadores.trim())
        newErrors.jugadores = "El número de jugadores es obligatorio";
      if (tipoPartida.toLowerCase() === "presencial" && !ciudad.trim()) {
        newErrors.ciudad =
          "La ciudad es obligatoria para partidas presenciales";
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

      const datosPartida: any = {
        titulo,
        sistemaJuego: sistemaJuego || "Sin especificar",
        fecha: fechaPartida || new Date().toISOString().split("T")[0],
        descripcion,
        imagenUrl:
          imagenUrl ||
          "https://images.unsplash.com/photo-1642132652859-3ef5a92e6f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        tipoPartida: tipoPartida,
        rating: 0,
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
      };

      console.log("Payload:", datosPartida);

      if (isEditing && partidaId) {
        await PartidasService.actualizarPartida(partidaId, datosPartida);
        showToast("Partida actualizada con éxito", "success");
      } else {
        await PartidasService.crearPartida(datosPartida);
        showToast("¡Partida creada con éxito!", "success");
      }

      navigate("/nextgames");
    } catch (error: any) {
      console.error("Error al guardar partida:", error);
      showToast(`Error: ${error.message}`, "error");
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
    isEditing,
    partidaId,
    navigate,
    showToast,
    currentStep,
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
              {isEditing ? t.newGame.titleEdit : t.newGame.titleCreate}
            </h1>
            <div className="self-stretch h-[2.688rem] relative text-[1.125rem] leading-[1.625rem] flex items-center shrink-0 z-[2] mt-[-0.625rem]">
              {isEditing ? t.newGame.subtitleEdit : t.newGame.subtitleCreate}
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
                        onImageUploaded={(url) => setImagenUrl(url)}
                      />
                    </div>
                  </div>

                  {/* Sistema de Juego */}
                  <div>
                    <label className="block text-nude mb-2 font-radio-option">
                      {t.newGame.systemLabel}
                    </label>
                    <input
                      className={INPUT_STYLE}
                      value={sistemaJuego}
                      onChange={(e) => setSistemaJuego(e.target.value)}
                      placeholder={t.newGame.systemPlaceholder}
                    />
                  </div>

                  {/* Tipo Partida */}
                  <div>
                    <label className="block text-nude mb-4 font-radio-option">
                      {t.newGame.typeLabel}
                    </label>
                    <div className="flex gap-4">
                      {["Presencial", "Digital", "Online"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer font-radio-option hover:opacity-80"
                        >
                          <CustomRadio checked={tipoPartida === type} />
                          <input
                            type="radio"
                            className="hidden"
                            checked={tipoPartida === type}
                            onChange={() => setTipoPartida(type)}
                          />
                          {type}
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
                        placeholder="Otro... (escribe y pulsa espacio)"
                        value={customTagInput}
                        onChange={handleCustomTagChange}
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
                      {t.newGame.step2Header}
                    </b>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="flex flex-col gap-6">
                      {/* Grupos de inputs en 2 columnas para ahorrar espacio */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.playersLabel}
                          </label>
                          <input
                            type="number"
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

                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.ageLabel}
                          </label>
                          <input
                            className={INPUT_STYLE.replace("w-full", "w-32")}
                            placeholder="+18"
                            value={edadMinima}
                            onChange={(e) => setEdadMinima(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.sessionsLabel}
                          </label>
                          <input
                            type="number"
                            className={INPUT_STYLE.replace("w-full", "w-32")}
                            placeholder="Ej: 4"
                            value={temporalidad}
                            onChange={(e) => setTemporalidad(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-nude mb-2 font-radio-option">
                            {t.newGame.priceLabel}
                          </label>
                          <input
                            type="number"
                            className={INPUT_STYLE.replace("w-full", "w-32")}
                            placeholder="0"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.dateLabel}
                        </label>
                        <input
                          type="date"
                          className={INPUT_STYLE}
                          value={fechaPartida}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFechaPartida(e.target.value)}
                          style={{ colorScheme: "dark" }}
                        />
                      </div>

                      <div>
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
                        />
                        {renderError("ciudad")}
                      </div>
                    </div>

                    {/* Right Column: Schedule */}
                    <div className="flex flex-col gap-6">
                      <div>
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
                      </div>

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

                      <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.contactLabel}
                        </label>
                        <input
                          className={INPUT_STYLE}
                          placeholder={t.newGame.contactPlaceholder}
                          value={contactoMaster}
                          onChange={(e) => setContactoMaster(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-nude mb-2 font-radio-option">
                          {t.newGame.recommendationsLabel}
                        </label>
                        <textarea
                          className={`${INPUT_STYLE} h-24`}
                          placeholder={t.newGame.recommendationsPlaceholder}
                          value={recomendaciones}
                          onChange={(e) => setRecomendaciones(e.target.value)}
                        />
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
                      {t.newGame.step3Header}
                    </b>
                  </div>

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
                      />
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
