import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/ui/Modal";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../i18n";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "error" | "success";
  }>({ show: false, title: "", message: "", type: "error" });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      setModal({
        show: true,
        title: t.resetPassword.invalidTitle,
        message: t.resetPassword.invalidLength,
        type: "error",
      });
      return;
    }

    if (password !== confirmation) {
      setModal({
        show: true,
        title: t.resetPassword.invalidTitle,
        message: t.resetPassword.mismatch,
        type: "error",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setModal({
        show: true,
        title: t.resetPassword.errorTitle,
        message: t.resetPassword.errorMessage,
        type: "error",
      });
      return;
    }

    setModal({
      show: true,
      title: t.resetPassword.successTitle,
      message: t.resetPassword.successMessage,
      type: "success",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-nude flex flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className="text-3xl font-titulo-2">
          {t.resetPassword.invalidLinkTitle}
        </h1>
        <p>{t.resetPassword.invalidLinkDescription}</p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-full bg-dark-gold px-6 py-3 text-black font-bold"
        >
          {t.emailConfirmation.loginButton}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <Modal
        isOpen={modal.show}
        onClose={() => {
          setModal((current) => ({ ...current, show: false }));
          if (modal.type === "success") {
            void supabase.auth
              .signOut({ scope: "local" })
              .finally(() => navigate("/login"));
          }
        }}
        title={modal.title}
        type={modal.type}
      >
        {modal.message}
      </Modal>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-nude rounded-xl p-8 flex flex-col gap-6"
      >
        <h1 className="text-3xl text-black font-bold font-titulo-2 text-center">
          {t.resetPassword.title}
        </h1>
        <p className="text-black font-titulo-2 text-center">
          {t.resetPassword.description}
        </p>
        <label className="flex flex-col gap-2 text-black font-titulo-2">
          {t.resetPassword.passwordLabel}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            className="rounded-lg border border-gray-500 px-4 py-3"
          />
        </label>
        <label className="flex flex-col gap-2 text-black font-titulo-2">
          {t.resetPassword.confirmLabel}
          <input
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            className="rounded-lg border border-gray-500 px-4 py-3"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-dark-gold px-6 py-3 text-black font-bold disabled:opacity-50"
        >
          {loading ? t.resetPassword.submitting : t.resetPassword.submit}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
