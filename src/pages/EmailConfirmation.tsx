import { FunctionComponent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/button";
import { useTranslation } from "../i18n";
import { useAuth } from "../context/AuthContext";

const EmailConfirmation: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const isPending = searchParams.get("pending") === "1";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  const title = isPending
    ? t.emailConfirmation.pendingTitle
    : user
    ? t.emailConfirmation.title
    : t.emailConfirmation.errorTitle;
  const description = isPending
    ? t.emailConfirmation.pendingDescription
    : user
    ? t.emailConfirmation.description
    : t.emailConfirmation.errorDescription;

  return (
    <div className="w-full relative bg-black overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center text-dark-gold font-milonga p-5 box-border">
      <div className="flex flex-col items-center justify-center gap-8 max-w-[600px] w-full animate-fade-in">
        <div className="text-[4rem] text-dark-gold">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="m-0 text-[3rem] font-normal leading-[1.2] mq450:text-[2rem]">
          {title}
        </h1>

        <p className="m-0 text-[1.25rem] font-titulo-2 text-nude leading-[1.6]">
          {description}
        </p>

        <div className="flex flex-row items-start justify-start pt-4 px-0 pb-0 box-border">
          <Button
            button1={t.emailConfirmation.loginButton}
            button1Padding="1rem 3rem"
            button1Height="auto"
            button1Width="100%"
            button1Height1="auto"
            button1Width1="auto"
            button1FontSize="1.25rem"
            onClick={() => navigate("/login")}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
