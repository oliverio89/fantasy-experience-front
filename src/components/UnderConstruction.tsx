import { FunctionComponent, memo } from "react";

export type UnderConstructionType = {
  className?: string;
};

const UnderConstruction: FunctionComponent<UnderConstructionType> = memo(
  ({ className = "" }) => {
    return (
      <div
        className={`w-full bg-dark-gold flex flex-row items-center justify-center py-3 px-5 box-border top-[90px] z-[98] sticky ${className}`}
      >
        <div className="flex flex-row items-center justify-center gap-3 max-w-full">
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="m-0 text-lg font-bold font-titulo-2 text-black text-center">
            🚧 Sitio web en construcción - Algunas funcionalidades pueden estar
            limitadas 🚧
          </p>
        </div>
      </div>
    );
  }
);

export default UnderConstruction;

