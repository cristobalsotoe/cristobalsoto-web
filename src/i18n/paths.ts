import { otherLang, type Lang } from "./config"

// El español vive bajo /es; el inglés en las rutas sin prefijo.
// "es" solo cuenta como segmento completo: /estudios/ es una ruta en inglés.
const ES_PREFIX = /^\/es(?=\/|$)/
const EXTERNAL = /^(https?:|mailto:)/

export function langFromPath(pathname: string): Lang {
  return ES_PREFIX.test(pathname) ? "es" : "en"
}

export function pathWithoutLang(pathname: string): string {
  return pathname.replace(ES_PREFIX, "") || "/"
}

export function localizePath(path: string, lang: Lang): string {
  if (EXTERNAL.test(path)) return path
  const base = pathWithoutLang(path)
  return lang === "en" ? base : `/es${base}`
}

export function twinPath(pathname: string): string {
  return localizePath(pathname, otherLang(langFromPath(pathname)))
}
