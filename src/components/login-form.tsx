import { FunctionComponent, memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";
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
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
    const [loading, setLoading] = useState(false);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    // Modal state
    const [errorModal, setErrorModal] = useState<{
      show: boolean;
      title: string;
      message: string;
      isUnconfirmed: boolean;
    }>({ show: false, title: "", message: "", isUnconfirmed: false });

    const showModal = (title: string, message: string, isUnconfirmed = false) => {
      setErrorModal({ show: true, title, message, isUnconfirmed });
    };

    const closeModal = () => {
      setErrorModal({ ...errorModal, show: false });
      setResendStatus("idle");
    };

    const handleResend = async () => {
      if (!unconfirmedEmail || resendStatus === "sending" || resendStatus === "sent") return;
      setResendStatus("sending");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
      });
      setResendStatus(error ? "error" : "sent");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onLoginClick = async () => {
      if (!formData.email || !formData.password) {
        showModal(t.login.errors.incompleteTitle, t.login.errors.incompleteMsg);
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
          setUnconfirmedEmail(formData.email);
          setResendStatus("idle");
          showModal(t.login.errors.unconfirmedTitle, t.login.errors.unconfirmedMsg, true);
        } else if (errorMessage.includes("Invalid login credentials")) {
          // This error is generic for security (wrong password OR user not found)
          showModal(t.login.errors.invalidTitle, t.login.errors.invalidMsg);
        } else {
          showModal(t.login.errors.genericTitle, t.login.errors.genericMsg);
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
          actions={
            errorModal.isUnconfirmed ? (
              <div className="flex flex-col items-center gap-2 w-full">
                {resendStatus === "sent" ? (
                  <p className="text-green-400 font-titulo-2 text-sm">{t.login.resendSent}</p>
                ) : resendStatus === "error" ? (
                  <p className="text-red-400 font-titulo-2 text-sm">{t.login.resendError}</p>
                ) : null}
                <button
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="w-full px-8 py-2 bg-dark-gold text-black font-bold font-titulo-2 rounded-full hover:bg-darkgoldenrod transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendStatus === "sending" ? t.login.resendSending : t.login.resendButton}
                </button>
              </div>
            ) : undefined
          }
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
            {t.login.title}
          </h1>
          <EmailField
            correoElectrnico={t.login.emailLabel}
            ingresaTuEmailPlaceholder={t.login.emailPlaceholder}
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <EmailField
            correoElectrnico={t.login.passwordLabel}
            ingresaTuEmailPlaceholder={t.login.passwordPlaceholder}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            propPadding="0rem 1.25rem 0.875rem"
          />
          <div className="flex flex-row items-start justify-start pt-[0rem] px-[9.812rem] pb-[2.625rem] box-border max-w-full mq725:pl-[4.875rem] mq725:pr-[4.875rem] mq725:box-border mq450:pl-[1.25rem] mq450:pr-[1.25rem] mq450:box-border">
            <Button
              button1={loading ? t.login.submitting : t.login.submit}
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
            <span className="font-titulo-2">{t.login.noAccount} </span>
            <span
              className="[text-decoration:underline] font-medium font-titulo-2 cursor-pointer hover:opacity-70"
              onClick={() => navigate("/register")}
            >
              {t.login.registerLink}
            </span>
          </div>
        </form>
      </>
    );
  }
);

export default LoginForm;
