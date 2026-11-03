#!/usr/bin/env node
// Chequeo post-build del sitio bilingüe: recorre dist/ y verifica que cada página
// tenga su gemela, el lang y los hreflang correctos, un botón de idioma que lleve
// a la gemela, y que ningún link interno saque al visitante de su idioma.
//
// Uso: node scripts/check-i18n.mjs [distDir=dist]

import { readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

const SITE = "https://cristobalsoto.com"
const EN_ONLY = ["/legal/", "/projects/"]
const ASSET = /^\/(img|fonts|js|doc|_astro)\/|\.svg$|^\/sitemap/
const ES = /^\/es(\/|$)/

const dist = process.argv[2] ?? "dist"

const isEs = (path) => ES.test(path)
const isEnOnly = (path) => EN_ONLY.some((prefix) => path.startsWith(prefix))
const twinOf = (route) => (isEs(route) ? route.replace(ES, "/") : `/es${route}`)

function collectPages(dir, pages = new Map()) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectPages(full, pages)
    else if (entry.name === "index.html") {
      const html = readFileSync(full, "utf8")
      if (html.includes('http-equiv="refresh"')) continue // páginas de redirección
      const rel = relative(dist, dir).split(sep).join("/")
      pages.set(rel ? `/${rel}/` : "/", html)
    }
  }
  return pages
}

const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((m) => m[0])
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2] ?? ""]))
const internal = (href) => {
  const path = (href.startsWith(SITE) ? href.slice(SITE.length) || "/" : href).split(/[?#]/)[0]
  return path.startsWith("/") && !path.startsWith("//") && !ASSET.test(path) ? path : null
}

const pages = collectPages(dist)
const errors = []
const fail = (route, problem) => errors.push(`✗ ${route}: ${problem}`)
let pairs = 0

for (const [route, html] of pages) {
  const lang = isEs(route) ? "es" : "en"
  const htmlLang = html.match(/<html\b[^>]*\blang="([^"]*)"/)?.[1]
  if (htmlLang !== lang) fail(route, `<html lang="${htmlLang}"> (esperado "${lang}")`)

  const anchors = tags(html, "a").map(attrs)
  const toggles = anchors.filter((a) => "data-lang-toggle" in a)

  if (lang === "en" && isEnOnly(route)) {
    if (toggles.length) fail(route, "página solo-EN con botón de idioma")
  } else {
    const twin = twinOf(route)
    if (!pages.has(twin)) fail(route, `falta la gemela ${twin}`)
    else if (lang === "en") pairs++

    const enRoute = lang === "en" ? route : twin
    const esRoute = lang === "es" ? route : twin
    const alternates = Object.fromEntries(
      tags(html, "link")
        .map(attrs)
        .filter((l) => l.rel === "alternate" && l.hreflang)
        .map((l) => [l.hreflang, l.href]),
    )
    for (const [hreflang, path] of [["en", enRoute], ["es", esRoute], ["x-default", enRoute]]) {
      if (alternates[hreflang] !== SITE + path) {
        fail(route, `hreflang="${hreflang}" = ${alternates[hreflang] ?? "(falta)"} (esperado ${SITE + path})`)
      }
    }

    if (!toggles.length) fail(route, "falta el botón de idioma")
    for (const t of toggles) if (t.href !== twin) fail(route, `botón de idioma apunta a ${t.href} (esperado ${twin})`)
  }

  // cross-link: los links internos se quedan en el idioma de la página
  const feeds = tags(html, "link").map(attrs).filter((l) => l.type === "application/rss+xml")
  const hrefs = [...anchors.filter((a) => !("data-lang-toggle" in a)), ...feeds].map((a) => a.href).filter(Boolean)
  for (const href of hrefs) {
    const path = internal(href)
    if (!path) continue
    if (lang === "es" && !isEs(path) && !isEnOnly(path)) fail(route, `link a página en inglés: ${href}`)
    if (lang === "en" && isEs(path)) fail(route, `link a página en español: ${href}`)
  }
}

if (errors.length) {
  console.error(errors.join("\n"))
  console.error(`\n${errors.length} problemas de i18n`)
  process.exit(1)
}
console.log(`i18n OK — ${pairs} pares`)
