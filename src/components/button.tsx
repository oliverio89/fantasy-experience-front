import { FunctionComponent, memo } from "react";

export type ButtonType = {
  className?: string;
  label?: string;
  button1?: string;
  button1Padding?: string;
  button1Height?: string;
  button1Width?: string;
  button1Height1?: string;
  button1Width1?: string;
  button1FontSize?: string;
  button1BackgroundColor?: string;
  button1Border?: string;
  button1TextDecoration?: string;
  button1FontWeight?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const Button: FunctionComponent<ButtonType> = memo(
  ({
    className = "",
    label,
    button1,
    button1Padding = "0.625rem 4.843rem",
    button1Height = "2.625rem",
    button1Width = "15.625rem",
    button1FontSize = "1.125rem",
    button1BackgroundColor = "#cd9c20",
    onClick,
    type = "submit",
  }) => {
    return (
      <button
        type={type}
        className={`cursor-pointer [border:none] shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-31xl overflow-hidden shrink-0 flex flex-row items-start justify-start box-border z-[2] hover:opacity-90 transition-opacity ${className}`}
        onClick={onClick}
        style={{
          padding: button1Padding,
          height: button1Height,
          width: button1Width,
          backgroundColor: button1BackgroundColor,
        }}
      >
        <b
          className="relative flex font-radio-option text-black text-center items-center justify-center shrink-0"
          style={{ fontSize: button1FontSize }}
        >
          {button1 || label || "Crear partida"}
        </b>
      </button>
    );
  }
);

export default Button;
