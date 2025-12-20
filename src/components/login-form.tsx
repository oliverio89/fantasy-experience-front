import { FunctionComponent, memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EmailField from "./email-field";
import Button from "./button";
import { supabase } from "../lib/supabase";
import Modal from "../components/ui/Modal";

export type LoginFormType = {
  className?: string;
};

const LoginForm: FunctionComponent<LoginFormType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
    const [loading, setLoading] = useState(false);

    // Modal state
    const [errorModal, setErrorModal] = useState<{
      show: boolean;
      title: string;
      message: string;
    }>({ show: false, title: "", message: "" });

    const showModal = (title: string, message: string) => {
      setErrorModal({ show: true, title, message });
    };

    const closeModal = () => {
      setErrorModal({ ...errorModal, show: false });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onLoginClick = async () => {
      if (!formData.email || !formData.password) {
        showModal(
          "Datos Incompletos",
          "Por favor, ingresa tu correo y contraseña."
        );
        return;
      }

      setLoading(true);

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        navigate("/");
        // We could show a success toast here if we wanted, or just redirect
      } catch (error: any) {
        console.error("Login Error:", error);
        const errorMessage = error.message || "";

        // Handle specific Supabase errors
        if (errorMessage.includes("Email not confirmed")) {
          showModal(
            "Correo no confirmado",
            "Debes confirmar tu correo electrónico antes de entrar. Por favor revisa tu bandeja de entrada o spam."
          );
        } else if (errorMessage.includes("Invalid login credentials")) {
          // This error is generic for security (wrong password OR user not found)
          showModal(
            "Error de Acceso",
            "No pudimos iniciar sesión. Verifica que:\n1. Tu correo esté registrado.\n2. Hayas confirmado tu cuenta.\n3. La contraseña sea correcta."
          );
        } else {
          showModal(
            "Error",
            "Ha ocurrido un problema al iniciar sesión. Inténtalo de nuevo más tarde."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Modal
          isOpen={errorModal.show}
          onClose={closeModal}
          title={errorModal.title}
          type="error"
        >
          {errorModal.message}
        </Modal>

        <form
          className={`m-0 flex-1 bg-nude flex flex-col items-start justify-start pt-[11.375rem] px-[0rem] pb-[10.25rem] box-border gap-[3rem] min-w-[26.813rem] max-w-full mq725:gap-[1.5rem] mq725:pt-[7.375rem] mq725:pb-[6.688rem] mq725:box-border mq725:min-w-full ${className}`}
          onSubmit={(e) => {
            e.preventDefault();
            onLoginClick();
          }}
        >
          <div className="self-stretch h-[52rem] relative bg-nude hidden" />
          <h1 className="m-0 self-stretch relative text-[2.25rem] font-bold font-titulo-2 text-black text-center z-[1] mq450:text-[1.375rem] mq975:text-[1.813rem]">
            Entra a tu cuenta
          </h1>
          <EmailField
            correoElectrnico="Correo electrónico"
            ingresaTuEmailPlaceholder="Ingresa tu email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <EmailField
            correoElectrnico="Contraseña"
            ingresaTuEmailPlaceholder="Ingresa tu contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            propPadding="0rem 1.25rem 0.875rem"
          />
          <div className="flex flex-row items-start justify-start pt-[0rem] px-[9.812rem] pb-[2.625rem] box-border max-w-full mq725:pl-[4.875rem] mq725:pr-[4.875rem] mq725:box-border mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border">
            <Button
              button1={loading ? "Entrando..." : "Ingresar"}
              button1Padding="0.312rem 8.906rem"
              button1Height="2rem"
              button1Width="21.625rem"
              button1Height1="1.375rem"
              button1Width1="3.875rem"
              button1FontSize="1.125rem"
              onClick={onLoginClick}
            />
          </div>
          <div className="self-stretch relative text-[1.25rem] text-black text-center z-[1] mq450:text-[1rem]">
            <span className="font-titulo-2">{`Si no tienes cuenta, `}</span>
            <span
              className="[text-decoration:underline] font-medium font-titulo-2 cursor-pointer hover:opacity-70"
              onClick={() => navigate("/register")}
            >
              Regístrate aquí.
            </span>
          </div>
        </form>
      </>
    );
  }
);

export default LoginForm;
