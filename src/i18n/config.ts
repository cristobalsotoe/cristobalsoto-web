export const LOCALES = ["en", "es"] as const

export type Lang = (typeof LOCALES)[number]

export const DEFAULT_LANG: Lang = "en"

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "es" : "en"
}

/** locale de Intl para fechas */
export const DATE_LOCALE: Record<Lang, string> = { en: "en-US", es: "es-CL" }

/** valor de og:locale */
export const OG_LOCALE: Record<Lang, string> = { en: "en_US", es: "es_CL" }
