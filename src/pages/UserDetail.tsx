import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import PartidaCard, { Partida } from "../components/PartidaCard";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

export type UserDetailType = {
  className?: string;
};

// Datos de ejemplo de partidas del usuario (mantener hardcodeado por ahora)
const partidasUsuario: Partida[] = [
  {
    id: 1,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "presencial",
    rating: 4,
  },
  {
    id: 2,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "online",
    rating: 5,
  },
  {
    id: 3,
    titulo: "Partida Título",
    masterName: "Master name",
    sistemaJuego: "Sistema de partida",
    fecha: "Fecha",
    imagenUrl: "/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png",
    tipoPartida: "digital",
    rating: 3,
  },
];

const UserDetail: FunctionComponent<UserDetailType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const { user, refreshProfile, loading: authLoading } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [correoElectronico, setCorreoElectronico] = useState("");
    // Password is only for display simulation or change request
    const [contrasena, setContrasena] = useState("*************");
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state with real user data
    useEffect(() => {
      if (user) {
        setNombreUsuario(user.user_metadata?.full_name || "");
        setCorreoElectronico(user.email || "");
      } else if (!authLoading) {
        // Redirect if not logged in
        navigate("/login");
      }
    }, [user, authLoading, navigate]);

    // Safety timeout: If loading takes too long (>3s), assume verify failed or user not logged in
    useEffect(() => {
      if (authLoading) {
        const timer = setTimeout(() => {
          if (!user) {
            console.warn("Auth loading timed out, redirecting to login");
            navigate("/login");
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [authLoading, user, navigate]);

    const handleCancelar = useCallback(() => {
      if (user) {
        setNombreUsuario(user.user_metadata?.full_name || "");
        setCorreoElectronico(user.email || "");
      }
      setIsEditing(false);
    }, [user]);

    const handleEditarPerfil = useCallback(async () => {
      if (isEditing) {
        // Guardar cambios
        if (!user) return;
        setIsSaving(true);
        console.log("Iniciando guardado de perfil...");

        // Helper for timeouts
        const timeoutPromise = (ms: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)
          );

        try {
          const updates: { data: { full_name: string } } = {
            data: { full_name: nombreUsuario },
          };

          // Email updates disabled for stability
          // if (correoElectronico !== user.email) { ... }

          // 1. Update Auth Metadata (Supabase Auth)
          console.log("Actualizando Auth Metadata..."); // Debug log
          const { error: authError } = (await Promise.race([
            supabase.auth.updateUser(updates),
            timeoutPromise(5000),
          ])) as any;
          if (authError) throw authError;
          console.log("Auth Metadata actualizado."); // Debug log

          // 2. Update Public Profile Table (Database)
          console.log("Actualizando Tabla Profiles...", {
            id: user.id,
            nombre: nombreUsuario,
          }); // Debug log

          // Use upsert instead of update to handle case where profile row missing
          const { error: profileError } = (await Promise.race([
            supabase
              .from("profiles")
              .upsert({ id: user.id, full_name: nombreUsuario })
              .select(),
            timeoutPromise(5000),
          ])) as any;

          if (profileError) {
            console.error("Profile table update failed:", profileError);
            showToast(
              "Error update perfil publico: " + profileError.message,
              "info"
            );
          } else {
            console.log("Tabla Profiles actualizada."); // Debug log
          }

          // 3. Reload Page as requested
          console.log("Recargando página..."); // Debug log
          window.location.reload();
        } catch (error: any) {
          console.error("Error updating profile:", error);
          showToast(error.message || "Error al actualizar perfil", "error");
          setIsSaving(false);
        }
      } else {
        setIsEditing(true);
      }
    }, [isEditing, user, nombreUsuario, correoElectronico, showToast]);

    const handleCambiarContrasena = useCallback(async () => {
      if (!user?.email) return;
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          user.email,
          {
            redirectTo: "http://localhost:3000/user", // Redirect back here after password reset flow
          }
        );
        if (error) throw error;
        showToast(
          "Se ha enviado un correo para restablecer tu contraseña.",
          "success"
        );
      } catch (error: any) {
        console.error("Error sending reset password email:", error);
        showToast("Error al solicitar cambio de contraseña", "error");
      }
    }, [user, showToast]);

    if (authLoading) {
      return (
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-nude font-titulo-2 text-xl">
          Cargando perfil...
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect in useEffect
    }

    return (
      <div
        className={`w-full min-h-screen bg-black flex flex-col items-center justify-start py-10 px-5 leading-[normal] tracking-[normal] ${className}`}
      >
        <div className="w-full max-w-[1120px] flex flex-col items-start justify-start gap-[41px] mq700:gap-5">
          {/* Sección del perfil */}
          <section className="self-stretch rounded-xl bg-darkslategray flex flex-col items-end justify-start pt-[50px] px-[94px] pb-[39px] box-border gap-[79px] max-w-full text-left text-xl text-white font-titulo-2 mq450:gap-5 mq450:pl-5 mq450:pr-5 mq450:box-border mq700:gap-[39px] mq700:pl-[47px] mq700:pr-[47px] mq700:box-border mq925:pt-8 mq925:pb-[25px] mq925:box-border">
            <div className="w-[1120px] h-[754px] relative rounded-xl bg-darkslategray hidden max-w-full" />

            <div className="self-stretch flex flex-row items-start justify-end py-0 px-[3px] box-border max-w-full">
              <div className="flex-1 flex flex-col items-end justify-start gap-[85px] max-w-full mq450:gap-[21px] mq925:gap-[42px]">
                {/* Avatar con botón de editar */}
                <div className="self-stretch flex flex-row items-start justify-center py-0 mq450:px-5">
                  <div className="relative">
                    <div className="w-[250px] h-[250px] rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden z-[1] border-4 border-dark-gold/30">
                      <div className="text-[120px] font-bold text-nude">
                        {nombreUsuario
                          ? nombreUsuario.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    </div>
                    {/* Botón de editar avatar (por ahora solo visual o futuro) */}
                    <button className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-full bg-dark-gold flex items-center justify-center z-[2] cursor-pointer hover:bg-darkgoldenrod transition-colors shadow-[0px_4px_8px_rgba(0,_0,_0,_0.3)]">
                      <svg
                        className="w-7 h-7 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Campos del perfil en 2 columnas */}
                <div className="self-stretch flex flex-row items-start justify-start gap-10 max-w-full mq450:gap-5 mq925:flex-wrap">
                  {/* Columna izquierda */}
                  <div className="flex-1 flex flex-col items-start justify-start gap-[85px] min-w-[288px] max-w-full mq450:gap-[42px]">
                    {/* Nombre de usuario */}
                    <div className="self-stretch flex flex-col items-start justify-start gap-[15px] z-[1]">
                      <div className="relative font-medium mq450:text-base">
                        Nombre de usuario
                      </div>
                      <div className="self-stretch rounded-xl border-dark-gold border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] px-[0.687rem]">
                        <div className="h-[2.5rem] w-full relative rounded-xl border-dark-gold border-[1px] border-solid box-border hidden" />
                        {isEditing ? (
                          <input
                            className="w-full [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[1]"
                            type="text"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                          />
                        ) : (
                          <div className="w-full [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[1]">
                            {nombreUsuario}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="self-stretch flex flex-col items-start justify-start gap-[15px] z-[1]">
                      <div className="relative font-medium mq450:text-base">
                        Contraseña
                      </div>
                      <div className="self-stretch rounded-xl border-dark-gold border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] px-[0.687rem]">
                        <div className="h-[2.5rem] w-full relative rounded-xl border-dark-gold border-[1px] border-solid box-border hidden" />
                        <div className="w-full [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[1]">
                          {contrasena}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="flex-1 flex flex-col items-start justify-start gap-28 min-w-[288px] max-w-full mq450:gap-14">
                    {/* Correo Electrónico */}
                    <div className="self-stretch flex flex-col items-start justify-start gap-[15px] z-[1]">
                      <div className="relative font-medium mq450:text-base">
                        Correo Electrónico
                      </div>
                      <div className="self-stretch rounded-xl border-dark-gold border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] px-[0.687rem]">
                        <div className="h-[2.5rem] w-full relative rounded-xl border-dark-gold border-[1px] border-solid box-border hidden" />
                        <div className="w-full [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude/50 text-left flex items-center p-0 z-[1] cursor-not-allowed">
                          {correoElectronico}
                          <span className="ml-2 text-xs text-dark-gold/70">
                            (No editable)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Link Cambiar contraseña */}
                    <div
                      className="self-stretch relative [text-decoration:underline] font-medium z-[1] mq450:text-base cursor-pointer hover:text-dark-gold transition-colors"
                      onClick={handleCambiarContrasena}
                    >
                      Cambiar contraseña
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-row items-start justify-start gap-[42px] max-w-full mq450:gap-[21px] mq700:flex-wrap">
              <button
                onClick={handleEditarPerfil}
                disabled={isSaving}
                className={`cursor-pointer [border:none] py-[10px] px-[81.5px] bg-dark-gold h-[42px] w-[250px] shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden shrink-0 flex flex-row items-start justify-start box-border z-[1] hover:bg-darkgoldenrod transition-colors ${
                  isSaving ? "opacity-70 cursor-wait" : ""
                }`}
              >
                <b className="h-[22px] w-[88px] relative text-lg flex font-titulo-2 text-black text-center items-center justify-center shrink-0">
                  {isSaving
                    ? "Guardando..."
                    : isEditing
                    ? "Guardar perfil"
                    : "Editar perfil"}
                </b>
              </button>
              {isEditing && (
                <button
                  onClick={handleCancelar}
                  disabled={isSaving}
                  className="cursor-pointer border-dark-gold border-[1px] border-solid py-2 px-11 bg-[transparent] h-[42px] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[1] hover:bg-darkgoldenrod-200 hover:border-darkgoldenrod-100 hover:border-[1px] hover:border-solid hover:box-border"
                >
                  <b className="flex-1 relative text-lg inline-block font-titulo-2 text-dark-gold text-center min-w-[64px]">
                    Cancelar
                  </b>
                </button>
              )}
            </div>
          </section>

          {/* Sección de Próximas partidas */}
          <section className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-6 px-9 pb-12 box-border gap-10 max-w-full text-center text-15xl text-nude font-titulo-2 mq450:pl-5 mq450:pr-5 mq450:box-border mq450:gap-5">
            <div className="w-full relative rounded-xl bg-darkslategray hidden max-w-full" />

            <h2 className="m-0 self-stretch text-inherit font-bold font-[inherit] flex items-center justify-center z-[1] mq450:text-xl mq925:text-8xl">
              Próximas partidas
            </h2>

            {/* Grid de 3 partidas */}
            <div className="self-stretch flex flex-row items-start justify-center gap-[18px] z-[1] mq925:flex-wrap">
              {partidasUsuario.map((partida) => (
                <div
                  key={partida.id}
                  className="scale-[0.75] origin-top flex-shrink-0"
                >
                  <PartidaCard
                    partida={partida}
                    mostrarDescripcion={false}
                    backgroundColor="#DAB16A"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }
);

export default UserDetail;
