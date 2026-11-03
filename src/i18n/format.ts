import { DATE_LOCALE, type Lang } from "./config"

const UNITS: Record<Lang, { month: [string, string]; year: [string, string]; read: string }> = {
  en: { month: ["month", "months"], year: ["year", "years"], read: "min read" },
  es: { month: ["mes", "meses"], year: ["año", "años"], read: "min de lectura" },
}

const plural = (n: number, [one, many]: [string, string]) => `${n} ${n === 1 ? one : many}`

export function formatDate(date: Date, lang: Lang = "en"): string {
  return Intl.DateTimeFormat(DATE_LOCALE[lang], { month: "short", day: "2-digit", year: "numeric" }).format(date)
}

/** fecha larga del masthead del blog */
export function longDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(DATE_LOCALE[lang], { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

export function readingTime(html: string, lang: Lang = "en"): string {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).length
  return `${(words / 200 + 1).toFixed()} ${UNITS[lang].read}`
}

/** mes abreviado + año, para el timeline del CV */
export function monthYear(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[lang], { month: "short", year: "numeric" }).replace(".", "")
}

export function duration(startIso: string, endIso: string | "Present", lang: Lang, now: Date = new Date()): string {
  const start = new Date(startIso)
  const end = endIso === "Present" ? now : new Date(endIso)
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4)))
  if (months < 12) return plural(months, UNITS[lang].month)
  return plural(Math.round(months / 12), UNITS[lang].year)
}
