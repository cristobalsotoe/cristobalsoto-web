import { LOCALES, type Lang } from "./config"
import { localizePath } from "./paths"

// Las colecciones bilingües guardan cada entrada en <lang>/<archivo>,
// así que el slug de Astro es "en/curvasidf2" o "es/curvasidf2".

export function langOfSlug(slug: string): Lang {
  const lang = slug.split("/")[0]
  if (!(LOCALES as readonly string[]).includes(lang)) {
    throw new Error(`[i18n] "${slug}" no está dentro de una carpeta de idioma (${LOCALES.join(", ")})`)
  }
  return lang as Lang
}

export function baseSlug(slug: string): string {
  langOfSlug(slug)
  return slug.slice(slug.indexOf("/") + 1)
}

export function postPath(slug: string): string {
  return localizePath(`/blog/${baseSlug(slug)}/`, langOfSlug(slug))
}

/** Hace fallar el build si una entrada no tiene su gemela en el otro idioma, o si difieren en draft. */
export function assertTwins(collection: string, entries: { slug: string; draft?: boolean }[]): void {
  const byBase = new Map<string, Map<Lang, boolean>>()
  for (const entry of entries) {
    const base = baseSlug(entry.slug)
    const langs = byBase.get(base) ?? new Map<Lang, boolean>()
    langs.set(langOfSlug(entry.slug), entry.draft ?? false)
    byBase.set(base, langs)
  }
  for (const [base, langs] of byBase) {
    for (const lang of LOCALES) {
      if (!langs.has(lang)) throw new Error(`[i18n] ${collection}: "${base}" no tiene versión ${lang}`)
    }
    if (new Set(langs.values()).size > 1) {
      throw new Error(`[i18n] ${collection}: "${base}" difiere en draft entre ${LOCALES.join(" y ")}`)
    }
  }
}
