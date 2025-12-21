import {
  FunctionComponent,
  memo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Profile, ProfileService } from "../services/profileService";
import { ImageUpload } from "../components/ImageUpload";
import { useToast } from "../context/ToastContext";
import PartidaCard, { Partida } from "../components/PartidaCard";

// Helper for Array inputs (Systems, Tags, etc.)
const ArrayInput: FunctionComponent<{
  label: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
}> = ({ label, values, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-light-gold font-bold">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="bg-darkslategray text-nude px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-dark-gold"
          >
            {v}
            <button
              onClick={() => handleRemove(i)}
              className="text-red-400 hover:text-red-300 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder || "Añadir item..."}
          className="flex-1 bg-black/50 border border-dark-gold text-nude px-4 py-2 rounded-lg"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          type="button"
          className="bg-dark-gold text-black px-4 py-2 rounded-lg hover:brightness-110"
        >
          +
        </button>
      </div>
    </div>
  );
};

const UserDetail: FunctionComponent = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Games state
  const [myGames, setMyGames] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Profile>>({});

  // Determined ID: URL param OR Auth User ID
  const targetUserId = userId || user?.id;
  const isMyProfile = user && targetUserId === user.id;

  useEffect(() => {
    if (targetUserId) {
      loadProfile(targetUserId);
    } else {
      // If no ID and no logged in user, redirect to login
      navigate("/login");
    }
  }, [targetUserId, navigate]);

  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const data = await ProfileService.getProfile(id);
      if (data) {
        setProfile(data);
        setFormData(data); // Init form data
        loadGames(id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error(error);
      showToast("Error al cargar perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async (id: string) => {
    // 1. Games Created
    const { data: created } = await supabase
      .from("games")
      .select("*")
      .eq("master_id", id);

    if (created) setMyGames(created);
  };

  const handleSave = async () => {
    if (!targetUserId) return;
    setIsSaving(true);
    try {
      await ProfileService.updateProfile(targetUserId, formData);
      setProfile((prev) => ({ ...prev!, ...formData } as Profile));
      setIsEditing(false);
      showToast("Perfil actualizado correctamente", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al actualizar perfil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/login");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <img
          key={i}
          className="h-[40.7px] w-10"
          alt="Estrella llena"
          src="/rating-star.svg"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative h-[40.7px] w-10">
          <img
            className="absolute h-[40.7px] w-10"
            alt="Estrella vacía"
            src="/rating-star-empty.svg"
          />
          <img
            className="absolute h-[40.7px] w-10"
            alt="Media estrella"
            src="/rating-star.svg"
            style={{
              clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
            }}
          />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <img
          key={`empty-${i}`}
          className="h-[40.7px] w-10"
          alt="Estrella vacía"
          src="/rating-star-empty.svg"
        />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center text-nude">
        Perfil no encontrado
      </div>
    );
  }

  // --- VIEW MODE (Pixel Perfect to MasterDetailOld) ---
  if (!isEditing) {
    return (
      <div className="w-full bg-black min-h-screen pt-[7.75rem]">
        {/* Botón de regreso / Controles Usuario */}
        <div className="w-full max-w-[1120px] mx-auto px-6 py-8 flex justify-between items-center">
          <button
            onClick={() => navigate("/ourmasters")}
            className="px-6 py-3 bg-transparent border border-nude text-nude rounded-xl hover:bg-nude hover:text-black transition-all duration-200 flex items-center gap-3 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Masters
          </button>

          {isMyProfile && (
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-dark-gold text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 shadow-[0px_0px_20px_rgba(212,175,55,0.3)]"
              >
                Editar Mi Perfil
              </button>
              <button
                onClick={handleLogout}
                className="border border-red-500 text-red-500 px-6 py-3 rounded-xl hover:bg-red-500/10"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Layout principal de 2 columnas - Diseño Original */}
        <div className="w-full max-w-[1120px] mx-auto px-6 pb-12">
          <div className="flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-center text-5xl text-nude font-texto-2 mq700:gap-5 mq900:flex-wrap">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col items-start justify-start gap-9 max-w-full mq450:gap-[18px] mq450:min-w-full mq900:flex-1">
              {/* Foto del Master - Circular completo */}
              <div className="self-stretch flex justify-center">
                <img
                  className="w-[347px] h-[347px] rounded-full object-cover border-4 border-light-gold"
                  loading="lazy"
                  alt={`Avatar de ${profile.fullName}`}
                  src={profile.avatarUrl || "/default-avatar.png"}
                />
              </div>

              {/* Información sobre el Master */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 box-border gap-[26.7px] max-w-full mq450:p-4 mq450:box-border">
                <h2 className="m-0 self-stretch relative text-15xl font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-left w-full">
                  Sobre el Máster
                </h2>

                <div className="self-stretch flex flex-col items-start justify-start gap-2 text-light-gold text-left w-full">
                  <b className="self-stretch relative z-[1] mq450:text-lgi">
                    Sistemas preferidos
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {profile.sistemas?.length
                      ? profile.sistemas.join(", ")
                      : "No especificado"}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-start justify-start gap-1.5 text-light-gold text-left w-full">
                  <b className="self-stretch relative z-[1] mq450:text-lgi mq450:leading-[18px]">
                    Preferencia de partidas
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1]">
                    {profile.tiposPartida?.length
                      ? profile.tiposPartida.join(", ")
                      : "No especificado"}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-end justify-start gap-[10.5px] max-w-full w-full">
                  <b className="self-stretch relative text-light-gold z-[1] mq450:text-lgi text-left w-full">
                    Tags:
                  </b>
                  <div className="self-stretch flex flex-row flex-wrap items-start justify-start gap-2 text-base w-full">
                    {profile.tags?.map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid text-nude leading-[20px]"
                      >
                        {tag}
                      </div>
                    ))}
                    {!profile.tags?.length && (
                      <span className="text-gray-500 italic text-sm">
                        Sin tags
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Partidas jugadas (visual placeholder using logic similar to old component) */}
              <div className="self-stretch flex flex-col items-start justify-start gap-4">
                {/*  Show recent created games just as text blocks like original "Partida 2" */}
                {myGames.length > 0 ? (
                  myGames.slice(0, 3).map((game) => (
                    <div
                      key={game.id}
                      className="self-stretch rounded-xl bg-nude border border-darkslategray flex flex-col items-center justify-center py-12 px-6 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/detailsgame/${game.id}`)}
                    >
                      <div className="text-black text-lg font-semibold">
                        {game.titulo}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="self-stretch rounded-xl bg-nude/5 border-dashed border border-nude/30 py-8 flex items-center justify-center">
                    <span className="text-nude/50">Sin partidas creadas</span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <section className="flex-1 flex flex-col items-start justify-start gap-[35.7px] min-w-[476px] max-w-full text-center text-21xl text-dark-gold font-texto-2 mq700:min-w-full mq900:gap-[18px]">
              {/* Nombre del Master y Rating */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-end justify-start p-6 gap-0.5">
                <h1 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-5xl mq900:text-13xl text-light-gold text-right w-full">
                  {profile.fullName}
                </h1>
                <div className="self-stretch h-10 relative text-xl font-medium text-nude flex items-center justify-end shrink-0 z-[1] mq450:text-base">
                  Valoración
                </div>
                <div className="self-stretch flex flex-row items-start justify-end py-0 pl-[21px] pr-0">
                  <div className="flex flex-row items-start justify-start gap-[18px]">
                    {renderStars(4.8)} {/* Placeholder rating */}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude text-left w-full">
                  Bio
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  {profile.bio || "Sin biografía disponible."}
                </div>
              </div>

              {/* Estilo de juego */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 gap-[27px] text-15xl mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-nude text-left w-full">
                  Estilo de juego
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left">
                  <p className="mb-4">
                    <strong>Duración de sesión:</strong>{" "}
                    {profile.duracionSesion?.join(", ") || "No especificado"}
                  </p>
                  <p className="mb-4">
                    <strong>Número de jugadores:</strong>{" "}
                    {profile.numeroJugadores?.join(", ") || "No especificado"}
                  </p>
                  <p className="mb-4">
                    <strong>Estilos de juego:</strong>{" "}
                    {profile.estilos?.join(", ") || "No especificado"}
                  </p>
                  <p>
                    <strong>Idiomas:</strong>{" "}
                    {profile.idiomas?.join(", ") || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Próximas partidas */}
              <div className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start p-6 box-border gap-[27px] max-w-full text-15xl text-nude mq700:p-4 mq700:box-border">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-left w-full">
                  Próximas partidas
                </h2>
                <div className="self-stretch flex flex-row items-start justify-start py-0 px-0 box-border max-w-full">
                  <div className="flex-1 flex flex-row items-start justify-center gap-[37px] max-w-full mq700:gap-[18px] mq700:flex-wrap">
                    {myGames.length > 0 ? (
                      myGames.map((game) => (
                        <PartidaCard
                          key={game.id}
                          // Manually mapping game to Partida type expected by card
                          partida={
                            {
                              id: game.id,
                              titulo: game.titulo,
                              masterName: profile.fullName,
                              sistemaJuego: game.sistema_juego,
                              fecha: game.fecha_inicio,
                              descripcion: game.descripcion,
                              imagenUrl:
                                game.imagen_fondo || "/default-game-bg.png",
                              tipoPartida: game.tipo_partida,
                              rating: 5.0,
                            } as any
                          }
                          mostrarDescripcion={true}
                          onClick={() => navigate(`/detailsgame/${game.id}`)}
                          className="flex-1 min-w-[211px] max-w-full"
                        />
                      ))
                    ) : (
                      <p className="text-lg text-gray-500 italic">
                        No tienes próximas partidas programadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // --- EDIT MODE (Original Form Implementation) ---
  return (
    <div className="w-full bg-black min-h-screen pt-[7.75rem] text-nude px-4">
      <div className="max-w-[1120px] mx-auto pb-20">
        <h1 className="text-4xl text-light-gold mb-8 font-titulo-2">
          Editar Perfil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20">
              <h3 className="text-xl font-bold text-light-gold mb-4">Avatar</h3>
              <div className="flex flex-col items-center">
                <img
                  src={
                    formData.avatarUrl ||
                    profile?.avatarUrl ||
                    "/default-avatar.png"
                  }
                  className="w-40 h-40 rounded-full object-cover border-4 border-dark-gold mb-4"
                />
                <ImageUpload
                  userId={targetUserId!}
                  currentAvatarUrl={formData.avatarUrl || null}
                  onUploadComplete={(url) =>
                    setFormData({ ...formData, avatarUrl: url })
                  }
                />
              </div>
            </div>

            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-light-gold">
                Información Básica
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Nombre Público</label>
                <input
                  className="bg-black/50 border border-dark-gold px-4 py-2 rounded-lg text-white"
                  value={formData.fullName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Nombre</label>
                <input
                  className="bg-black/50 border border-dark-gold px-4 py-2 rounded-lg text-white opacity-50 cursor-not-allowed"
                  value={profile?.firstName || ""}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Apellidos</label>
                <input
                  className="bg-black/50 border border-dark-gold px-4 py-2 rounded-lg text-white opacity-50 cursor-not-allowed"
                  value={profile?.lastName || ""}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20">
              <h3 className="text-xl font-bold text-light-gold mb-4">
                Biografía
              </h3>
              <textarea
                className="w-full h-40 bg-black/50 border border-dark-gold rounded-lg p-4 text-white resize-none"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Cuéntanos sobre ti, tu experiencia en rol, etc..."
              />
            </div>

            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h3 className="text-xl font-bold text-light-gold mb-4">
                  Detalles de Master
                </h3>
              </div>

              <ArrayInput
                label="Sistemas que diriges"
                values={formData.sistemas || []}
                onChange={(vals) =>
                  setFormData({ ...formData, sistemas: vals })
                }
                placeholder="D&D 5e, Pathfinder..."
              />

              <ArrayInput
                label="Estilos de juego"
                values={formData.estilos || []}
                onChange={(vals) => setFormData({ ...formData, estilos: vals })}
                placeholder="Narrativo, Combate tactico..."
              />

              <ArrayInput
                label="Tipos de partida"
                values={formData.tiposPartida || []}
                onChange={(vals) =>
                  setFormData({ ...formData, tiposPartida: vals })
                }
                placeholder="Online, Presencial, One-shot..."
              />

              <ArrayInput
                label="Idiomas"
                values={formData.idiomas || []}
                onChange={(vals) => setFormData({ ...formData, idiomas: vals })}
                placeholder="Español, Inglés..."
              />

              <ArrayInput
                label="Duración de sesión habitual"
                values={formData.duracionSesion || []}
                onChange={(vals) =>
                  setFormData({ ...formData, duracionSesion: vals })
                }
                placeholder="3-4 horas..."
              />

              <ArrayInput
                label="Número de jugadores"
                values={formData.numeroJugadores || []}
                onChange={(vals) =>
                  setFormData({ ...formData, numeroJugadores: vals })
                }
                placeholder="4-5 jugadores..."
              />

              <ArrayInput
                label="Tags / Etiquetas"
                values={formData.tags || []}
                onChange={(vals) => setFormData({ ...formData, tags: vals })}
                placeholder="Terror, Fantasía..."
              />
            </div>

            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={handleCancel}
                className="border border-dark-gold text-dark-gold px-8 py-3 rounded-full hover:bg-dark-gold/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-dark-gold text-black px-8 py-3 rounded-full font-bold hover:brightness-110 shadow-[0px_0px_20px_rgba(212,175,55,0.4)] transition-all"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
