/**
 * Sistema de internacionalización (i18n).
 *
 * Uso en componentes:
 *   const { t } = useTranslation();
 *   <h1>{t.navbar.home}</h1>
 *
 * Para añadir un nuevo idioma:
 *   1. Crea `en.ts` con la misma forma que `es.ts`
 *   2. Añádelo al mapa `translations` aquí abajo
 *   3. Añade el tipo: type Language = "es" | "en"
 */
import { createContext, useContext, useState, createElement } from "react";
import type { ReactNode } from "react";
import { es } from "./es";
import type { Translations } from "./es";

export type Language = "es";

const translations: Record<Language, Translations> = { es };

interface I18nContextType {
  t: Translations;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  t: es,
  lang: "es",
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("es");
  return createElement(
    I18nContext.Provider,
    { value: { t: translations[lang], lang, setLang } },
    children
  );
}

/** Hook para acceder a las traducciones en cualquier componente */
export const useTranslation = () => useContext(I18nContext);
