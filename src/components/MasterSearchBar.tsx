import { FunctionComponent, memo, useState, useCallback } from "react";

export type MasterSearchBarType = {
  className?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  initialValue?: string;
};

const MasterSearchBar: FunctionComponent<MasterSearchBarType> = memo(
  ({
    className = "",
    onSearch,
    onClear,
    placeholder = "Escribe el nombre del Master o sistema de juego",
    initialValue = "",
  }) => {
    const [searchQuery, setSearchQuery] = useState(initialValue);

    const handleSearch = useCallback(() => {
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }, [searchQuery, onSearch]);

    const handleClear = useCallback(() => {
      setSearchQuery("");
      if (onClear) {
        onClear();
      }
    }, [onClear]);

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      },
      [handleSearch]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      []
    );

    return (
      <section
        className={`self-stretch flex flex-row items-start justify-start pt-[0rem] pb-[4rem] pl-[0.062rem] pr-[0.5rem] box-border max-w-full text-left text-[1.125rem] text-white font-titulo-2 mq450:px-[0.5rem] mq450:pb-[2rem] mq450:text-[1rem] ${className}`}
      >
        <div className="flex-1 flex flex-col items-start justify-start gap-[0.312rem] max-w-full">
          <div className="w-[33.813rem] relative leading-[1.625rem] flex items-center max-w-full z-[1] mq450:w-full mq450:text-[0.9rem] mq450:leading-[1.4rem]">
            Busca un Master por nombre o sistema de juego:
          </div>
          <div className="self-stretch flex flex-row items-start justify-start gap-[2.531rem] max-w-full text-[0.875rem] text-nude mq750:gap-[1.25rem] mq1225:flex-wrap mq450:flex-col mq450:gap-[1rem]">
            <div className="w-[45.813rem] rounded-xl border-nude border-[1px] border-solid box-border flex flex-row items-start justify-start py-[0rem] px-[0.812rem] max-w-full z-[1] mq450:w-full mq450:px-[0.5rem]">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="h-[3.125rem] w-[32.938rem] relative font-light bg-transparent border-none outline-none text-white placeholder-nude shrink-0 max-w-full z-[2] mq450:h-[2.5rem] mq450:w-full mq450:text-[0.9rem]"
                aria-label="Buscar Master"
              />
            </div>
            <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem] mq450:w-full mq450:pt-[0rem]">
              <button
                onClick={handleClear}
                className="cursor-pointer border-[1px] border-solid py-[0.5rem] pl-[2rem] pr-[1.937rem] bg-transparent h-[2.625rem] rounded-31xl box-border flex flex-row items-start justify-start z-[1] border-nude text-nude hover:bg-nude hover:text-black hover:border-light-gold transition-colors duration-200 mq450:h-[2.5rem] mq450:pl-[1.5rem] mq450:pr-[1.5rem] mq450:w-full mq450:justify-center"
                aria-label="Limpiar búsqueda"
              >
                <div className="flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem]">
                  <svg
                    className="w-[1.25rem] h-[1.25rem] relative overflow-hidden shrink-0 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                </div>
                <div className="flex flex-col items-start justify-start py-[0rem] px-[0rem]">
                  <b className="ml-[-0.188rem] w-[4.5rem] relative text-[1.125rem] flex font-titulo-2 text-nude text-center items-center justify-center">
                    Limpiar
                  </b>
                </div>
              </button>
            </div>
            <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem] mq450:w-full mq450:pt-[0rem]">
              <button
                onClick={handleSearch}
                className="cursor-pointer [border:none] py-[0.625rem] pl-[2.5rem] pr-[2.25rem] bg-nude self-stretch rounded-31xl flex flex-row items-start justify-start gap-[0.187rem] z-[1] hover:bg-light-gold hover:text-black transition-colors duration-200 mq450:h-[2.5rem] mq450:pl-[1.5rem] mq450:pr-[1.5rem] mq450:w-full mq450:justify-center"
                aria-label="Buscar"
              >
                <div className="flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem]">
                  <svg
                    className="w-[1.25rem] h-[1.25rem] relative overflow-hidden shrink-0 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <b className="flex-1 relative text-[1.125rem] inline-block font-titulo-2 text-black text-center min-w-[3.375rem]">
                  Buscar
                </b>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default MasterSearchBar;
