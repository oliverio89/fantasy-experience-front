import {
  FunctionComponent,
  memo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "../i18n";

export type MasterSearchBarType = {
  className?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  initialValue?: string;
};

const MasterSearchBar: FunctionComponent<MasterSearchBarType> = memo(
  ({ className = "", onSearch, onClear, placeholder = "", initialValue = "" }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const resolvedPlaceholder = placeholder || t.masterSearch.placeholder;

    useEffect(() => setSearchQuery(initialValue), [initialValue]);

    const handleSearch = useCallback(
      () => onSearch?.(searchQuery.trim()),
      [searchQuery, onSearch]
    );

    const handleClear = useCallback(() => {
      setSearchQuery("");
      onClear?.();
    }, [onClear]);

    return (
      <div className={className}>
        <label
          htmlFor="master-search"
          className="mb-3 block text-xs font-semibold uppercase tracking-[0.16em] text-[#d8b16a]"
        >
          Busca por nombre o sistema de juego
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9e866a]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="master-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              placeholder={resolvedPlaceholder}
              className="h-12 w-full rounded-xl border border-[#6f5436]/60 bg-[#0e0a07]/70 pl-12 pr-4 text-sm text-[#f3e7d1] outline-none placeholder:text-[#806f5d] focus:border-[#d6a64c]"
            />
          </div>
          {searchQuery && (
            <button type="button" onClick={handleClear} className="fe-button-secondary">
              Limpiar
            </button>
          )}
          <button type="button" onClick={handleSearch} className="fe-button md:min-w-[132px]">
            Buscar
          </button>
        </div>
      </div>
    );
  }
);

MasterSearchBar.displayName = "MasterSearchBar";

export default MasterSearchBar;
