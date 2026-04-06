import { FunctionComponent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputFieldsContainer from "../components/input-fields-container";
import Button from "../components/button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { CustomRadio } from "../components/ui/CustomRadio";
import Modal from "../components/ui/Modal";
import { useTranslation } from "../i18n";

const Registerv: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "player", // default
  });

  const [loading, setLoading] = useState(false);

  // Custom error state for the Modal
  const [errorState, setErrorState] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });

  const showError = (title: string, message: string) => {
    setErrorState({ show: true, title, message });
  };

  const closeError = () => {
    setErrorState({ ...errorState, show: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onRegisterClick = async () => {
    // 1. Validation Logic
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      showError(t.register.errors.incompleteTitle, t.register.errors.incompleteMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError(t.register.errors.passwordMismatchTitle, t.register.errors.passwordMismatchMsg);
      return;
    }

    if (formData.password.length < 6) {
      showError(t.register.errors.passwordWeakTitle, t.register.errors.passwordWeakMsg);
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting Supabase SignUp with:", {
        email: formData.email,
      });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
          data: {
            full_name: formData.name,
            role: formData.role,
            city: formData.city,
          },
        },
      });

      if (error) throw error;

      console.log("Supabase SignUp Success:", data);

      // Navigate to login on success
      navigate("/login");
    } catch (error: any) {
      console.error("Registration Error:", error);
      const errorMessage = error.message || "";

      // 2. Map Supabase Errors to User-Friendly Messages
      if (
        errorMessage.includes("User already registered") ||
        errorMessage.includes("already registered")
      ) {
        showError(t.register.errors.userExistsTitle, t.register.errors.userExistsMsg);
      } else if (errorMessage.includes("valid email")) {
        showError(t.register.errors.invalidEmailTitle, t.register.errors.invalidEmailMsg);
      } else if (errorMessage.includes("password")) {
        showError(t.register.errors.passwordIssueTitle, t.register.errors.passwordIssueMsg);
      } else {
        showError(t.register.errors.genericTitle, t.register.errors.genericMsg);
      }
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
    <div className="w-full min-h-screen relative bg-black overflow-hidden flex flex-row items-stretch justify-start leading-[normal] tracking-[normal] text-center text-[6.25rem] text-dark-gold font-milonga mq1025:flex-wrap">
      {/* Error Modal */}
      <Modal
        isOpen={errorState.show}
        onClose={closeError}
        title={errorState.title}
        type="error"
      >
        {errorState.message}
      </Modal>

      <div className="w-1/2 bg-black flex flex-col items-center justify-center px-8 box-border gap-[4rem] mq1025:w-full mq1025:py-20">
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
          {t.common.backHome}
        </b>
      </div>
      <form
        className="m-0 flex-1 bg-nude flex flex-col items-center justify-center px-8 py-16 box-border gap-[1.875rem] min-w-[26.813rem] max-w-full mq725:min-w-full"
        onSubmit={(e) => {
          e.preventDefault();
          onRegisterClick();
        }}
      >
        <div className="self-stretch h-[52rem] relative bg-nude hidden" />
        <div className="self-stretch flex flex-row items-start justify-start pt-[0rem] px-[0rem] pb-[0.625rem] box-border max-w-full">
          <h2 className="m-0 h-[3.625rem] flex-1 relative text-[2.25rem] font-bold font-titulo-2 text-black text-center flex items-center justify-center max-w-full z-[2] mq450:text-[1.375rem] mq975:text-[1.813rem]">
            {t.register.title}
          </h2>
        </div>

        {/* Name Input */}
        <div className="self-stretch flex flex-row items-start justify-center py-[0rem] px-[1.25rem] box-border max-w-full">
          <div className="w-[21.625rem] flex flex-col items-start justify-start gap-[0.375rem] max-w-full">
            <div className="self-stretch relative text-[1.25rem] font-medium font-titulo-2 text-black text-left z-[1] mq450:text-[1rem]">
              {t.register.nameLabel}
            </div>
            <div className="self-stretch flex flex-row items-start justify-start py-[0rem] pl-[0.875rem] pr-[0.5rem] box-border relative max-w-full">
              <div className="h-full w-full absolute !m-[0] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem] [filter:blur(1px)] rounded-xl bg-whitesmoke border-light-gold border-[1px] border-solid box-border mix-blend-normal z-[1]" />
              <input
                className="w-full [border:none] [outline:none] font-light font-titulo-2 text-[1rem] bg-[transparent] h-[2.5rem] flex-1 relative text-black text-left flex items-center min-w-[12.125rem] p-0 max-w-full z-[2]"
                placeholder={t.register.namePlaceholder}
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
              {t.register.roleQuestion}
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
                {t.register.asPlayer}
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
                {t.register.asMaster}
              </label>
            </div>
            <div className="text-[0.875rem] font-light text-black/70 font-titulo-2 text-left mt-2 z-[1]">
              {t.register.roleNote}
            </div>
          </div>
        </div>

        <InputFieldsContainer
          correoElectrnico={t.register.emailLabel}
          ingresaTuEmailPlaceholder={t.register.emailPlaceholder}
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputFieldsContainer
          correoElectrnico={t.register.cityLabel}
          ingresaTuEmailPlaceholder={t.register.cityPlaceholder}
          name="city"
          value={formData.city}
          onChange={handleChange}
          propPadding="0rem 1.25rem"
          propGap="0.375rem"
          propPadding1="0rem 0.437rem 0rem 0.812rem"
          propMinWidth="12.125rem"
        />
        <InputFieldsContainer
          correoElectrnico={t.register.passwordLabel}
          ingresaTuEmailPlaceholder={t.register.passwordPlaceholder}
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
          correoElectrnico={t.register.confirmPasswordLabel}
          ingresaTuEmailPlaceholder={t.register.confirmPasswordPlaceholder}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          propPadding="0rem 1.25rem 0.625rem"
          propGap="0.312rem"
          propPadding1="0rem 0rem 0rem 0.75rem"
          propMinWidth="12.438rem"
        />

        <div className="flex flex-row items-center justify-center pb-[1.25rem] box-border max-w-full w-full">
          <Button
            button1={loading ? t.register.submitting : t.register.submit}
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
          <span className="font-titulo-2">{t.register.hasAccount} </span>
          <span className="[text-decoration:underline] font-medium font-titulo-2">
            {t.register.loginLink}
          </span>
        </div>
      </form>
    </div>
  );
};

export default Registerv;
