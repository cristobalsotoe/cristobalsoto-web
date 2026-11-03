#!/usr/bin/env node
// Documento de revisión de traducciones: pone lado a lado los textos de cada página
// EN y de su gemela ES (incluidos alt, aria-label, title, placeholder, el <title> y la
// meta description), y marca en amarillo lo que quedó idéntico en ambos idiomas.
//
// Uso: node scripts/translation-review.mjs [distDir=dist] [out=.review/translation-review.html]

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"

const dist = process.argv[2] ?? "dist"
const out = process.argv[3] ?? ".review/translation-review.html"

const EN_ONLY = ["/legal/", "/projects/"]
const ES = /^\/es(\/|$)/
const ORDER = ["/", "/work/", "/blog/", "/not-cv/", "/search/"]

// Idénticos a propósito: los nombres que no se traducen (Global Constraints del plan)
// y las etiquetas de interfaz iguales en ambos idiomas (ALLOWED_SAME de ui.test.ts).
const SAME_OK = new Set([
  "El Pluviómetro",
  "Not CV",
  "University of California, Irvine",
  "Cristóbal Soto-Escobar",
  "CV",
  "Blog",
  "Base",
  "Temuco — Irvine",
  "EN",
  "ES",
])
const NUMERIC = /^[\d\s.,:;/–—+()%°×#-]+$/
const LINKISH = /^(https?:\/\/\S+|[\w.+-]+@[\w-]+(\.[\w-]+)+|[\w-]+(\.[\w-]+)+(\/\S*)?)$/i

const RAW_TEXT = new Set(["script", "style"])
const SKIP = new Set(["svg", "noscript", "template"])
const INLINE = new Set(["b", "strong", "i", "em", "code", "sup", "sub", "small", "abbr", "mark", "u", "s", "br", "wbr"])
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"])
const ATTRS = ["aria-label", "alt", "title", "placeholder"]

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", larr: "←", darr: "↓", uarr: "↑", middot: "·", mdash: "—", ndash: "–", hellip: "…", copy: "©" }
const decode = (s) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) =>
    e[0] !== "#" ? (NAMED[e] ?? m) : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)),
  )
const clean = (s) => decode(s).replace(/\s+/g, " ").trim()
const meaningful = (s) => /[\p{L}\d]/u.test(s)
const attrsOf = (raw) =>
  Object.fromEntries(
    [...raw.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map((m) => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? ""]),
  )

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

// Devuelve los textos de la página (<title>, meta description y todo lo que está dentro
// de <main>) y, aparte, los del menú y el pie (lo que está en <body> fuera de <main>).
// Las etiquetas en línea (b, em, code…) no cortan el texto; cualquier otra sí.
function extract(html) {
  const page = []
  const chrome = []
  const stack = []
  let skip = 0
  let buffer = ""
  let inBody = false
  let inMain = false
  let inTitle = false

  const target = () => (inMain || !inBody ? page : chrome)
  const parent = () => stack.findLast((tag) => !INLINE.has(tag)) ?? "body"
  const push = (list, kind, value, where) => {
    const text = clean(value)
    if (meaningful(text)) list.push({ kind, where, text })
  }
  const flush = () => {
    if (buffer) push(target(), "texto", buffer, parent())
    buffer = ""
  }

  const TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g
  let m
  while ((m = TOKEN.exec(html))) {
    const [token, closing, rawName, rawAttrs = ""] = m
    if (!rawName) {
      if (token.startsWith("<!")) continue
      if (!skip && (inBody || inTitle)) buffer += token
      continue
    }
    const name = rawName.toLowerCase()
    const selfClosing = rawAttrs.trim().endsWith("/")

    if (RAW_TEXT.has(name)) {
      if (!closing) {
        const end = html.indexOf(`</${name}`, TOKEN.lastIndex)
        TOKEN.lastIndex = end === -1 ? html.length : html.indexOf(">", end) + 1
      }
      continue
    }
    if (SKIP.has(name)) {
      if (closing) skip = Math.max(0, skip - 1)
      else {
        if (!skip) for (const key of ATTRS) if (key in attrsOf(rawAttrs)) push(target(), key, attrsOf(rawAttrs)[key], name)
        if (!selfClosing) skip++
      }
      continue
    }
    if (skip) continue

    if (name === "br") buffer += " "
    else if (!INLINE.has(name)) flush()

    if (closing) {
      const i = stack.lastIndexOf(name)
      if (i !== -1) stack.length = i
      if (name === "main") inMain = false
      if (name === "title") inTitle = false
      continue
    }

    const attrs = attrsOf(rawAttrs)
    if (name === "body") inBody = true
    if (name === "main") inMain = true
    if (name === "title" && !inBody) inTitle = true
    if (name === "meta" && attrs.name === "description") push(page, "meta description", attrs.content ?? "", "meta")
    for (const key of ATTRS) if (key in attrs) push(target(), key, attrs[key], name)
    if (!VOID.has(name) && !selfClosing) stack.push(name)
  }
  flush()
  return { page, chrome }
}

// Empareja las dos listas por estructura (tipo de texto + etiqueta que lo contiene),
// con LCS, para que un párrafo de más en un idioma no corra todas las filas siguientes.
function align(en, es) {
  const sig = (item) => `${item.kind}|${item.where}`
  const n = en.length
  const k = es.length
  const lcs = Array.from({ length: n + 1 }, () => new Uint16Array(k + 1))
  for (let i = n - 1; i >= 0; i--)
    for (let j = k - 1; j >= 0; j--)
      lcs[i][j] = sig(en[i]) === sig(es[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
  const rows = []
  let i = 0
  let j = 0
  while (i < n || j < k) {
    if (i < n && j < k && sig(en[i]) === sig(es[j])) rows.push({ en: en[i++], es: es[j++] })
    else if (j >= k || (i < n && lcs[i + 1][j] >= lcs[i][j + 1])) rows.push({ en: en[i++], es: null })
    else rows.push({ en: null, es: es[j++] })
  }
  return rows.map((row) => ({ ...row, status: statusOf(row) }))
}

function statusOf({ en, es }) {
  if (!en || !es) return "orphan"
  return en.text === es.text && !intentionallySame(en.text) ? "same" : "ok"
}

// Un texto idéntico es aceptable si es un número, un link, o si cada parte (separadas por
// " | ", como en "CV | Cristóbal Soto-Escobar") es un nombre de SAME_OK, ignorando flechas
// y signos en los bordes ("← El Pluviómetro").
function intentionallySame(text) {
  if (NUMERIC.test(text) || LINKISH.test(text)) return true
  return text.split(" | ").every((part) => SAME_OK.has(part.replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, "")))
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const anchor = (route) => `p-${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}`
const label = (item) => (item.kind === "texto" ? item.where : `${item.kind} · ${item.where}`)

function cell(item, lang) {
  if (!item) return `<div class="cell empty" lang="${lang}"><span class="lang">${lang.toUpperCase()}</span><span class="none">sin pareja</span></div>`
  return `<div class="cell" lang="${lang}"><span class="lang">${lang.toUpperCase()}</span>${esc(item.text)}</div>`
}

function section({ id, heading, routes, rows, enCount, esCount }) {
  const flagged = rows.filter((row) => row.status !== "ok").length
  const mismatch =
    enCount === esCount ? "" : `<p class="warn">Las páginas no tienen la misma cantidad de textos: EN ${enCount}, ES ${esCount}. Revisa las filas sin pareja.</p>`
  const body = rows
    .map(
      (row) =>
        `<div class="row ${row.status}"><div class="el">${esc(label(row.en ?? row.es))}</div>${cell(row.en, "en")}${cell(row.es, "es")}</div>`,
    )
    .join("\n")
  return `<section id="${id}" class="pair">
  <header class="pair-head">
    <h2>${esc(heading)}</h2>
    <p class="routes">${routes}</p>
    <p class="count">${rows.length} filas · ${flagged ? `${flagged} para revisar` : "nada para revisar"}</p>
  </header>
  ${mismatch}
  <div class="table">
    <div class="row head" aria-hidden="true"><div class="el">Elemento</div><div class="cell">English</div><div class="cell">Español</div></div>
${body}
  </div>
</section>`
}

if (!existsSync(dist)) {
  console.error(`No existe ${dist}/. Corre primero npm run build.`)
  process.exit(1)
}

const pages = collectPages(dist)
const enRoutes = [...pages.keys()]
  .filter((route) => !ES.test(route) && !EN_ONLY.some((prefix) => route.startsWith(prefix)))
  .sort((a, b) => {
    const rank = (route) => {
      const i = ORDER.findIndex((prefix) => (prefix === "/" ? route === "/" : route.startsWith(prefix)))
      return i === -1 ? ORDER.length : i
    }
    return rank(a) - rank(b) || a.localeCompare(b)
  })

const sections = []
for (const route of enRoutes) {
  const twin = `/es${route}`
  if (!pages.has(twin)) {
    console.error(`✗ ${route}: falta la gemela ${twin}`)
    continue
  }
  const en = extract(pages.get(route))
  const es = extract(pages.get(twin))
  if (route === "/") {
    sections.push({
      id: "p-comun",
      heading: "Menú y pie de página",
      routes: "Común a todas las páginas (tomado de / y /es/)",
      rows: align(en.chrome, es.chrome),
      enCount: en.chrome.length,
      esCount: es.chrome.length,
    })
  }
  const title = en.page.find((item) => item.where === "title")?.text.split(" | ")[0] ?? route
  sections.push({
    id: anchor(route),
    heading: title,
    routes: `<a href="https://cristobalsoto.com${route}">${route}</a> ↔ <a href="https://cristobalsoto.com${twin}">${twin}</a>`,
    rows: align(en.page, es.page),
    enCount: en.page.length,
    esCount: es.page.length,
  })
}

let totalRows = 0
let totalSame = 0
let totalOrphan = 0
for (const s of sections) {
  const same = s.rows.filter((row) => row.status === "same").length
  const orphan = s.rows.filter((row) => row.status === "orphan").length
  totalRows += s.rows.length
  totalSame += same
  totalOrphan += orphan
  const note = s.enCount === s.esCount ? "" : `  ⚠ EN ${s.enCount} textos, ES ${s.esCount}`
  console.log(`${s.heading.padEnd(60)} ${String(s.rows.length).padStart(4)} filas · ${same} idénticas · ${orphan} sin pareja${note}`)
  for (const row of s.rows.filter((r) => r.status !== "ok"))
    console.log(`    ${row.status === "same" ? "=" : "≠"} [${label(row.en ?? row.es)}] ${(row.en ?? row.es).text.slice(0, 110)}`)
}

const generated = new Date().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })
const toc = sections
  .map((s) => {
    const same = s.rows.filter((row) => row.status === "same").length
    const orphan = s.rows.filter((row) => row.status === "orphan").length
    return `<li><a href="#${s.id}">${esc(s.heading)}</a><span class="nums"><span>${s.rows.length}</span><span class="${same ? "n-same" : ""}">${same}</span><span class="${orphan ? "n-orphan" : ""}">${orphan}</span></span></li>`
  })
  .join("\n")

const html = `<meta charset="utf-8">
<title>Traducción de cristobalsoto.com</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&family=Work+Sans:wght@400;500;600&display=swap">
<style>
/* Layout: una columna de lectura; cada página es una tabla de tres columnas (elemento | EN | ES) que se apila en el teléfono. Paleta y tipografías del sitio. */
:root {
  --paper: #fbfcfd;
  --paper-raised: #f0f5f8;
  --line: #d9e4ea;
  --ink: #112435;
  --ink-soft: #587083;
  --river: #20517f;
  --clay: #b5432d;
  --flag: #fbefc8;
  --flag-line: #d9b75a;
  --orphan: #f7e2dc;
  --serif: "Instrument Serif", Georgia, "Times New Roman", serif;
  --sans: "Work Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #0d1a26; --paper-raised: #132436; --line: #263c50; --ink: #e6eef4; --ink-soft: #a3b6c4;
    --river: #79adbb; --clay: #e07a62; --flag: #3a3016; --flag-line: #a88a3c; --orphan: #3b211b; color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --paper: #0d1a26; --paper-raised: #132436; --line: #263c50; --ink: #e6eef4; --ink-soft: #a3b6c4;
  --river: #79adbb; --clay: #e07a62; --flag: #3a3016; --flag-line: #a88a3c; --orphan: #3b211b; color-scheme: dark;
}
body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 15px; line-height: 1.55; }
.wrap { max-width: 76rem; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 2.5rem 5rem; display: grid; gap: 3rem; }
a { color: var(--river); text-underline-offset: 3px; }
a:focus-visible, input:focus-visible { outline: 2px solid var(--river); outline-offset: 2px; }
.label, .el, .lang, .count, .routes, .nums, .row.head { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.06em; }
.intro { display: grid; gap: 1rem; max-width: 46rem; }
.intro .label { text-transform: uppercase; color: var(--ink-soft); margin: 0; }
h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(2.2rem, 6vw, 3.4rem); line-height: 1.05; margin: 0; text-wrap: balance; }
.intro p { margin: 0; }
.legend { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; padding: 0; margin: 0; list-style: none; }
.legend li { display: flex; align-items: center; gap: 0.5rem; }
.swatch { width: 1.1rem; height: 1.1rem; border-radius: 3px; border: 1px solid var(--line); flex: none; }
.swatch.same { background: var(--flag); border-color: var(--flag-line); }
.swatch.orphan { background: var(--orphan); border-color: var(--clay); }
.summary { display: grid; gap: 0.75rem; }
.toc { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.toc li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.45rem 0; border-bottom: 1px solid var(--line); }
.toc li.head { color: var(--ink-soft); }
.nums { display: grid; grid-template-columns: repeat(3, 4.5rem); text-align: right; font-variant-numeric: tabular-nums; flex: none; }
.n-same { background: var(--flag); border-radius: 3px; padding-inline: 0.3rem; justify-self: end; }
.n-orphan { background: var(--orphan); border-radius: 3px; padding-inline: 0.3rem; justify-self: end; }
.filter { display: flex; align-items: center; gap: 0.5rem; }
.pair { display: grid; gap: 1rem; scroll-margin-top: 1rem; }
.pair-head { display: grid; gap: 0.25rem; border-bottom: 2px solid var(--ink); padding-bottom: 0.75rem; }
.pair-head h2 { font-family: var(--serif); font-weight: 400; font-size: 1.9rem; line-height: 1.1; margin: 0; text-wrap: balance; }
.routes, .count { margin: 0; color: var(--ink-soft); }
.warn { margin: 0; padding: 0.6rem 0.8rem; background: var(--orphan); border-left: 3px solid var(--clay); }
.table { display: grid; }
.row { display: grid; grid-template-columns: 9rem minmax(0, 1fr) minmax(0, 1fr); border-bottom: 1px solid var(--line); }
.row > div { padding: 0.55rem 0.75rem; min-width: 0; overflow-wrap: anywhere; }
.row.head { color: var(--ink-soft); text-transform: uppercase; border-bottom-color: var(--ink-soft); }
.el { color: var(--ink-soft); }
.cell + .cell { border-left: 1px solid var(--line); }
.row.same { background: var(--flag); }
.row.same .el { box-shadow: inset 3px 0 0 var(--flag-line); }
.row.orphan { background: var(--orphan); }
.row.orphan .el { box-shadow: inset 3px 0 0 var(--clay); }
.none { color: var(--clay); font-family: var(--mono); font-size: 0.72rem; }
.lang { display: none; color: var(--ink-soft); margin-right: 0.5rem; }
.only-flagged .row.ok { display: none; }
@media (max-width: 640px) {
  .row { grid-template-columns: minmax(0, 1fr); }
  .row.head { display: none; }
  .row > div { padding-block: 0.35rem; }
  .row > .el { padding-top: 0.6rem; }
  .cell + .cell { border-left: 0; border-top: 1px dashed var(--line); }
  .lang { display: inline; }
  .nums { grid-template-columns: repeat(3, 3rem); }
}
</style>
<div class="wrap" lang="es" id="review">
  <header class="intro">
    <p class="label">cristobalsoto.com · rama bilingual · ${esc(generated)}</p>
    <h1>Traducción de cristobalsoto.com</h1>
    <p>Cada fila pone lado a lado un texto de la página en inglés y su par en español, en el orden en que aparecen. También están los textos que no se ven en pantalla pero sí leen Google y los lectores de pantalla: el título de la pestaña, la descripción, el texto alternativo de las imágenes (alt) y las etiquetas de los botones (aria-label).</p>
    <ul class="legend">
      <li><span class="swatch same"></span>Idéntico en ambos idiomas: es un nombre propio o falta traducirlo</li>
      <li><span class="swatch orphan"></span>Sin pareja: el texto está en un idioma y no en el otro</li>
    </ul>
  </header>
  <section class="summary" aria-label="Resumen">
    <ul class="toc">
      <li class="head"><span class="label">Página</span><span class="nums"><span>filas</span><span>iguales</span><span>solas</span></span></li>
${toc}
    </ul>
    <label class="filter" for="only-flagged"><input type="checkbox" id="only-flagged"> Mostrar solo las filas para revisar (${totalSame + totalOrphan} de ${totalRows})</label>
  </section>
${sections.map(section).join("\n")}
</div>
<script>
  document.getElementById("only-flagged").addEventListener("change", (event) => {
    document.getElementById("review").classList.toggle("only-flagged", event.target.checked)
  })
</script>
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, html)
console.log(`\n${totalRows} filas · ${totalSame} idénticas · ${totalOrphan} sin pareja → ${out}`)
