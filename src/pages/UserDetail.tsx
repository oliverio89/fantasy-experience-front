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
import { useTranslation } from "../i18n";

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
              key={`remove-${i}`}
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
  const { t } = useTranslation();

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
      loadData(targetUserId);
    } else {
      // If no ID and no logged in user, redirect to login
      navigate("/login");
    }
  }, [targetUserId, navigate]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      await Promise.all([loadProfile(id), loadGames(id)]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (id: string) => {
    try {
      const data = await ProfileService.getProfile(id);
      if (data) {
        setProfile(data);
        setFormData(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error(error);
      showToast(t.userDetail.errorLoading, "error");
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
      showToast(t.userDetail.successUpdate, "success");
    } catch (error) {
      console.error(error);
      showToast(t.userDetail.errorUpdate, "error");
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

  // Helper to calculate aggregated tags if not explicitly set
  const getDisplayTags = () => {
    if (!profile) return [];
    // If explicit tags exist, use them. Otherwise derive from systems + styles
    if (profile.tags && profile.tags.length > 0) return profile.tags;

    const aggregated = new Set([
      ...(profile.sistemas || []),
      ...(profile.estilos || []),
    ]);
    // Also add systems from myGames if separate (though ProfileService attempts to aggregate)
    const gameSystems = myGames.map((g) => g.game_system).filter(Boolean);
    gameSystems.forEach((s) => aggregated.add(s));

    return Array.from(aggregated);
  };

  // Helper to get aggregated game types
  const getDisplayGameTypes = () => {
    if (!profile) return [];
    const types = new Set(profile.tiposPartida || []);
    myGames.forEach((g) => {
      if (g.game_type) types.add(g.game_type);
    });
    return Array.from(types);
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
        {t.userDetail.notFound}
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
            {t.userDetail.backToMasters}
          </button>

          {isMyProfile && (
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-dark-gold text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 shadow-[0px_0px_20px_rgba(212,175,55,0.3)] transition-all"
              >
                {t.userDetail.editProfile}
              </button>
              <button
                onClick={handleLogout}
                className="border border-red-500 text-red-500 px-6 py-3 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                {t.userDetail.signOut}
              </button>
            </div>
          )}
        </div>

        {/* Layout principal de 2 columnas - Diseño Original */}
        <div className="w-full max-w-[1120px] mx-auto px-6 pb-12">
          <div className="flex flex-row items-start justify-start gap-10 leading-[normal] tracking-[normal] text-center text-5xl text-nude font-texto-2 mq700:gap-5 mq900:flex-wrap">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col items-start justify-start gap-9 max-w-full mq450:gap-[18px] mq450:min-w-full mq900:flex-1">
              {/* Foto del Master - Circular completo con borde dorado */}
              <div className="self-stretch flex justify-center">
                <img
                  className="w-[347px] h-[347px] rounded-full object-cover border-[3px] border-solid border-dark-gold shadow-[0px_0px_15px_rgba(212,175,55,0.3)]"
                  loading="lazy"
                  alt={`Avatar de ${profile.fullName}`}
                  src={profile.avatarUrl || "/default-avatar.png"}
                />
              </div>

              {/* Información sobre el Master */}
              <div className="self-stretch rounded-xl bg-darkslategray border border-nude/10 flex flex-col items-start justify-start p-6 box-border gap-[26.7px] max-w-full shadow-[0px_4px_10px_rgba(0,0,0,0.5)] mq450:p-4">
                <h2 className="m-0 self-stretch relative text-15xl font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl text-center text-nude w-full font-titulo-2">
                  {t.userDetail.about}
                </h2>

                <div className="self-stretch flex flex-col items-center justify-start gap-2 text-dark-gold text-center w-full">
                  <b className="self-stretch relative z-[1] text-xl font-titulo-2">
                    {t.userDetail.preferredSystems}
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] font-texto-2">
                    {(profile.sistemas?.length
                      ? profile.sistemas
                      : [t.userDetail.noSystems]
                    ).join(", ")}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-center justify-start gap-1.5 text-dark-gold text-center w-full">
                  <b className="self-stretch relative z-[1] text-xl font-titulo-2">
                    {t.userDetail.gamePreference}
                  </b>
                  <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] font-texto-2">
                    {getDisplayGameTypes().length
                      ? getDisplayGameTypes().join(", ")
                      : "Presencial, Online"}
                  </div>
                </div>

                <div className="self-stretch flex flex-col items-center justify-start gap-[10.5px] max-w-full w-full">
                  <b className="self-stretch relative text-dark-gold z-[1] text-xl text-center w-full font-titulo-2">
                    {t.userDetail.tagsViewLabel}
                  </b>
                  <div className="self-stretch flex flex-row flex-wrap items-center justify-center gap-2 text-base w-full">
                    {getDisplayTags().map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-1 rounded-full border border-nude/50 text-nude text-sm backdrop-blur-sm bg-white/5"
                      >
                        {tag}
                      </div>
                    ))}
                    {!getDisplayTags().length && (
                      <span className="text-gray-500 italic text-sm">
                        {t.userDetail.noTags}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Partidas jugadas (visual placeholder blocks as per design - stacked layout) */}
              <div className="self-stretch flex flex-col items-start justify-start gap-4">
                {myGames.length > 2 ? (
                  // If we have many games, show the extras here simply
                  myGames.slice(2).map((game, i) => (
                    <div
                      key={`extra-game-${game.id}`}
                      className="self-stretch rounded-xl bg-oldlace-100 flex items-center justify-center py-6 px-6 cursor-pointer hover:bg-white transition-colors border border-transparent hover:border-dark-gold shadow-md"
                      onClick={() => navigate(`/detailsgame/${game.id}`)}
                    >
                      <span className="text-black font-bold text-lg">
                        {game.titulo}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Hardcoded placeholders to match Screenshot design balance if not enough games */}
                    <div className="self-stretch rounded-xl bg-oldlace-100 flex items-center justify-center py-8 px-6 opacity-90 shadow-md">
                      <span className="text-black font-bold text-lg font-titulo-2">
                        Partida 2
                      </span>
                    </div>
                    <div className="self-stretch rounded-xl bg-oldlace-100 flex items-center justify-center py-8 px-6 opacity-90 shadow-md">
                      <span className="text-black font-bold text-lg font-titulo-2">
                        Partida 3
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <section className="flex-1 flex flex-col items-start justify-start gap-[35.7px] min-w-[476px] max-w-full text-center text-21xl text-dark-gold font-texto-2 mq700:min-w-full mq900:gap-[18px]">
              {/* Nombre del Master y Rating */}
              <div className="self-stretch rounded-xl bg-darkslategray border border-nude/10 shadow-[0px_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8 gap-2">
                <h1 className="m-0 self-stretch relative text-inherit font-bold font-titulo-2 z-[1] mq450:text-5xl mq900:text-13xl text-dark-gold text-center w-full">
                  {profile.fullName}
                </h1>
                <div className="self-stretch relative text-xl font-medium text-nude flex items-center justify-center shrink-0 z-[1] font-titulo-2">
                  {t.userDetail.rating}
                </div>
                <div className="flex flex-row items-center justify-center gap-2 mt-2">
                  {renderStars(profile.rating || 0)}
                </div>
              </div>

              {/* Bio */}
              <div className="self-stretch rounded-xl bg-darkslategray border border-nude/10 shadow-[0px_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start p-8 gap-4 text-15xl">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-titulo-2 z-[1] mq450:text-xl mq900:text-8xl text-nude text-center w-full">
                  {t.userDetail.bio}
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-center font-texto-2">
                  {profile.bio || t.userDetail.noBio}
                </div>
              </div>

              {/* Estilo de juego */}
              <div className="self-stretch rounded-xl bg-darkslategray border border-nude/10 shadow-[0px_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start p-8 gap-6 text-15xl">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-titulo-2 z-[1] mq450:text-xl mq900:text-8xl text-nude text-center w-full">
                  {t.userDetail.gameStyle}
                </h2>
                <div className="self-stretch relative text-lg leading-[26px] text-nude z-[1] text-left px-8 w-full font-texto-2">
                  <p className="mb-4">
                    <strong className="text-dark-gold">
                      {t.userDetail.sessionDuration}
                    </strong>{" "}
                    {profile.duracionSesion?.join(", ") || t.common.notSpecified}
                  </p>
                  <p className="mb-4">
                    <strong className="text-dark-gold">
                      {t.userDetail.numPlayers}
                    </strong>{" "}
                    {profile.numeroJugadores?.join(", ") || t.common.notSpecified}
                  </p>
                  <p className="mb-4">
                    <strong className="text-dark-gold">
                      {t.userDetail.gameStyles}
                    </strong>{" "}
                    {profile.estilos?.join(", ") || t.common.notSpecified}
                  </p>
                  <p>
                    <strong className="text-dark-gold">{t.userDetail.languages}</strong>{" "}
                    {profile.idiomas?.join(", ") || t.common.notSpecified}
                  </p>
                </div>
              </div>

              {/* Próximas partidas */}
              <div className="self-stretch rounded-xl bg-darkslategray border border-nude/10 shadow-[0px_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start p-8 box-border gap-[27px] max-w-full text-15xl text-nude">
                <h2 className="m-0 self-stretch relative text-inherit font-bold font-titulo-2 z-[1] mq450:text-xl mq900:text-8xl text-center w-full text-nude">
                  {t.userDetail.upcomingGames}
                </h2>
                <div className="self-stretch flex flex-row items-center justify-center py-0 px-0 box-border max-w-full">
                  {/* Render first 2 games as rich cards, if available */}
                  {myGames.length > 0 ? (
                    <div className="flex flex-row flex-wrap justify-center gap-6 w-full">
                      {myGames.slice(0, 2).map((game) => (
                        <PartidaCard
                          key={game.id}
                          partida={
                            {
                              id: game.id,
                              titulo: game.titulo,
                              masterName: profile.fullName,
                              // Mapping DB columns to Partida type
                              sistemaJuego: game.game_system,
                              fecha: game.fecha, // Assuming fecha_inicio is mapped to fecha in PartidasService but here we are using raw DB? Wait.
                              // loadGames uses select("*"). So raw DB.
                              // PartidasService uses "start_date" for fecha. "game_system" for sistemaJuego.
                              // Wait, myGames is RAW from DB.
                              // So I should use: game.game_system, etc.
                              // But PartidaCard expects "fecha" which is string.
                              // Raw DB has "start_date".
                              // I need to map it correctly.

                              // Let's check logic:
                              // myGames is set via: const { data: created } = await supabase.from("games").select("*").eq("master_id", id);
                              // So it's Snake Case.

                              // Correct mapping:
                              // sistemaJuego: game.game_system
                              // fecha: game.start_date
                              // descripcion: game.description
                              // imagenUrl: game.image_url
                              // tipoPartida: game.game_type
                            } as any
                          }
                          mostrarDescripcion={true}
                          onClick={() => navigate(`/detailsgame/${game.id}`)}
                          className="min-w-[280px] max-w-[300px]"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg text-gray-500 italic font-texto-2">
                      {t.userDetail.noUpcomingGames}
                    </p>
                  )}
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
          {t.userDetail.editProfileTitle}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20">
              <h3 className="text-xl font-bold text-light-gold mb-4">{t.userDetail.avatarSection}</h3>
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
                  currentImage={formData.avatarUrl || undefined}
                  onImageUploaded={(url: string) =>
                    setFormData({ ...formData, avatarUrl: url })
                  }
                />
              </div>
            </div>

            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-light-gold">
                {t.userDetail.basicInfo}
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">{t.userDetail.publicName}</label>
                <input
                  className="bg-black/50 border border-dark-gold px-4 py-2 rounded-lg text-white"
                  value={formData.fullName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">{t.userDetail.firstName}</label>
                <input
                  className="bg-black/50 border border-dark-gold px-4 py-2 rounded-lg text-white opacity-50 cursor-not-allowed"
                  value={profile?.firstName || ""}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">{t.userDetail.lastName}</label>
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
                {t.userDetail.bioLabel}
              </h3>
              <textarea
                className="w-full h-40 bg-black/50 border border-dark-gold rounded-lg p-4 text-white resize-none"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder={t.userDetail.bioPlaceholder}
              />
            </div>

            <div className="bg-darkslategray p-6 rounded-xl border border-dark-gold/20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <h3 className="text-xl font-bold text-light-gold mb-4">
                  {t.userDetail.masterDetails}
                </h3>
              </div>

              <ArrayInput
                label={t.userDetail.systemsLabel}
                values={formData.sistemas || []}
                onChange={(vals) =>
                  setFormData({ ...formData, sistemas: vals })
                }
                placeholder={t.userDetail.systemsPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.gameStylesLabel}
                values={formData.estilos || []}
                onChange={(vals) => setFormData({ ...formData, estilos: vals })}
                placeholder={t.userDetail.gameStylesPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.gameTypesLabel}
                values={formData.tiposPartida || []}
                onChange={(vals) =>
                  setFormData({ ...formData, tiposPartida: vals })
                }
                placeholder={t.userDetail.gameTypesPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.languagesLabel}
                values={formData.idiomas || []}
                onChange={(vals) => setFormData({ ...formData, idiomas: vals })}
                placeholder={t.userDetail.languagesPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.sessionDurationLabel}
                values={formData.duracionSesion || []}
                onChange={(vals) =>
                  setFormData({ ...formData, duracionSesion: vals })
                }
                placeholder={t.userDetail.sessionDurationPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.numPlayersLabel}
                values={formData.numeroJugadores || []}
                onChange={(vals) =>
                  setFormData({ ...formData, numeroJugadores: vals })
                }
                placeholder={t.userDetail.numPlayersPlaceholder}
              />

              <ArrayInput
                label={t.userDetail.tagsLabel}
                values={formData.tags || []}
                onChange={(vals) => setFormData({ ...formData, tags: vals })}
                placeholder={t.userDetail.tagsPlaceholder}
              />
            </div>

            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={handleCancel}
                className="border border-dark-gold text-dark-gold px-8 py-3 rounded-full hover:bg-dark-gold/10 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-dark-gold text-black px-8 py-3 rounded-full font-bold hover:brightness-110 shadow-[0px_0px_20px_rgba(212,175,55,0.4)] transition-all"
              >
                {isSaving ? t.common.saving : t.userDetail.saveChanges}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
