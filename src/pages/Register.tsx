import { FunctionComponent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputFieldsContainer from "../components/input-fields-container";
import Button from "../components/button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { CustomRadio } from "../components/ui/CustomRadio";
import { useToast } from "../context/ToastContext";

const Registerv: FunctionComponent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "player", // default
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onRegisterClick = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showToast("Por favor, completa todos los campos requeridos.", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role,
            city: formData.city,
            // Note: 'city' isn't explicitly in the trigger insert, but 'role' and 'full_name' are.
            // We can update the SQL trigger later if we want city in profile automatically,
            // or let the user update it in profile page.
          },
        },
      });

      if (error) {
        throw error;
      }

      showToast(
        "¡Cuenta creada! Revisa tu email para confirmar (si está habilitado) o inicia sesión.",
        "success"
      );
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Error al registrarse", "error");
    } finally {
      setLoading(false);
    }
  };

  const onBackHomeClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const onAcountClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-row items-stretch justify-start leading-[normal] tracking-[normal] [row-gap:20px] text-center text-[6.25rem] text-dark-gold font-milonga mq1025:flex-wrap">
      <div className="bg-black flex flex-col items-start justify-start pt-[20.375rem] px-[0rem] pb-[10.687rem] box-border gap-[6rem] min-w-[38.75rem] max-w-full z-[1] mq725:gap-[3rem] mq725:pt-[13.25rem] mq725:pb-[6.938rem] mq725:box-border mq725:min-w-full mq450:gap-[1.5rem] mq1025:flex-1">
        <div className="self-stretch h-[52rem] relative bg-black hidden" />
        <h1 className="m-0 self-stretch h-[11.313rem] relative text-inherit leading-[76.6%] font-normal font-[inherit] flex items-center shrink-0 z-[2] mq450:text-[1.875rem] mq450:leading-[1.938rem] mq975:text-[3.125rem] mq975:leading-[2.875rem]">
          <span>
            <p className="m-0">{`Fantasy `}</p>
            <p className="m-0">Experience</p>
          </span>
        </h1>
        <b
          className="self-stretch h-[3.625rem] relative text-[1.5rem] [text-decoration:underline] flex font-titulo-2 text-nude items-center justify-center shrink-0 cursor-pointer z-[2] mq450:text-[1.188rem]"
          onClick={onBackHomeClick}
        >
          volver a home
        </b>
      </div>
      <form
        className="m-0 flex-1 bg-nude flex flex-col items-start justify-start pt-[5.437rem] px-[0rem] pb-[2.625rem] box-border gap-[1.875rem] min-w-[26.813rem] max-w-full mq725:pt-[3.563rem] mq725:pb-[1.688rem] mq725:box-border mq725:min-w-full"
        onSubmit={(e) => {
          e.preventDefault();
          onRegisterClick();
        }}
      >
        <div className="self-stretch h-[52rem] relative bg-nude hidden" />
        <div className="self-stretch flex flex-row items-start justify-start pt-[0rem] px-[0rem] pb-[0.625rem] box-border max-w-full">
          <h2 className="m-0 h-[3.625rem] flex-1 relative text-[2.25rem] font-bold font-titulo-2 text-black text-center flex items-center justify-center max-w-full z-[2] mq450:text-[1.375rem] mq975:text-[1.813rem]">
            Crea tu cuenta
          </h2>
        </div>

        {/* Name Input */}
        <div className="self-stretch flex flex-row items-start justify-center py-[0rem] px-[1.25rem] box-border max-w-full">
          <div className="w-[21.625rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
            <div className="self-stretch relative text-[1.25rem] font-medium font-titulo-2 text-black text-left z-[1] mq450:text-[1rem]">
              Nombre
            </div>
            <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.875rem] pr-[0.5rem] box-border relative max-w-full">
              <div className="h-full w-full absolute !m-[0] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem] [filter:blur(1px)] rounded-xl bg-whitesmoke border-light-gold border-[1px] border-solid box-border mix-blend-normal z-[1]" />
              <input
                className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12.125rem] p-0 max-w-full z-[2]"
                placeholder="Ingresa tu nombre"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="self-stretch flex flex-row items-start justify-center py-[0rem] px-[1.25rem] box-border max-w-full">
          <div className="w-[21.625rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
            <div className="self-stretch relative text-[1.25rem] font-medium font-titulo-2 text-black text-left z-[1] mq450:text-[1rem]">
              ¿Cómo quieres empezar a participar?
            </div>
            <div className="flex gap-8 mt-2 z-[2] w-full justify-center">
              <label
                className={`text-lg flex items-center gap-2 cursor-pointer hover:opacity-80 font-titulo-2 transition-colors duration-200 ${
                  formData.role === "player"
                    ? "text-dark-gold font-bold"
                    : "text-black"
                }`}
              >
                <CustomRadio checked={formData.role === "player"} />
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={formData.role === "player"}
                  onChange={() => setFormData({ ...formData, role: "player" })}
                  className="hidden"
                />
                Como Jugador
              </label>
              <label
                className={`text-lg flex items-center gap-2 cursor-pointer hover:opacity-80 font-titulo-2 transition-colors duration-200 ${
                  formData.role === "master"
                    ? "text-dark-gold font-bold"
                    : "text-black"
                }`}
              >
                <CustomRadio checked={formData.role === "master"} />
                <input
                  type="radio"
                  name="role"
                  value="master"
                  checked={formData.role === "master"}
                  onChange={() => setFormData({ ...formData, role: "master" })}
                  className="hidden"
                />
                Como Master
              </label>
            </div>
            <div className="text-[0.875rem] font-light text-black/70 font-titulo-2 text-left mt-2 z-[1]">
              * Tu cuenta te permitirá unirte a partidas y crearlas igualmente.
            </div>
          </div>
        </div>

        <InputFieldsContainer
          correoElectrnico="Correo electrónico"
          ingresaTuEmailPlaceholder="Ingresa tu email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputFieldsContainer
          correoElectrnico="Ciudad"
          ingresaTuEmailPlaceholder="Ingresa tu ciudad"
          name="city"
          value={formData.city}
          onChange={handleChange}
          propPadding="0rem 1.25rem"
          propGap="0.375rem"
          propPadding1="0rem 0.437rem 0rem 0.812rem"
          propMinWidth="12.125rem"
        />
        <InputFieldsContainer
          correoElectrnico="Contraseña"
          ingresaTuEmailPlaceholder="Elige tu contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          propPadding="0rem 1.25rem"
          propGap="0.375rem"
          propPadding1="0rem 0rem 0rem 0.75rem"
          propMinWidth="12.438rem"
        />
        <InputFieldsContainer
          correoElectrnico="Repetir contraseña"
          ingresaTuEmailPlaceholder="Repite tu contraseña"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          propPadding="0rem 1.25rem 0.625rem"
          propGap="0.312rem"
          propPadding1="0rem 0rem 0rem 0.75rem"
          propMinWidth="12.438rem"
        />
        <div className="flex flex-row items-start justify-start pt-[0rem] px-[9.812rem] pb-[1.25rem] box-border max-w-full mq725:pl-[4.875rem] mq725:pr-[4.875rem] mq725:box-border mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border">
          <Button
            button1={loading ? "Creando..." : "Crear cuenta"}
            button1Padding="0.562rem 7.968rem"
            button1Height="2.5rem"
            button1Width="21.625rem"
            button1Height1="1.375rem"
            button1Width1="5.75rem"
            button1FontSize="1.125rem"
            type="submit"
          />
        </div>
        <div
          className="self-stretch relative text-[1.25rem] text-black text-center cursor-pointer z-[2] mq450:text-[1rem]"
          onClick={onAcountClick}
        >
          <span className="font-titulo-2">{`Si tienes cuenta, `}</span>
          <span className="[text-decoration:underline] font-medium font-titulo-2">
            Ingresa aquí.
          </span>
        </div>
      </form>
    </div>
  );
};

export default Registerv;
