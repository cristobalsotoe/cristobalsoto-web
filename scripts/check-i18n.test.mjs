// Corre scripts/check-i18n.mjs contra un dist/ mínimo armado en un directorio temporal.
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, describe, expect, it } from "vitest"

const SCRIPT = fileURLToPath(new URL("./check-i18n.mjs", import.meta.url))
const SITE = "https://cristobalsoto.com"
const dirs = []

function page(lang, { ogLocale = lang === "en" ? "en_US" : "es_CL" } = {}) {
  const [self, twin] = lang === "en" ? ["/", "/es/"] : ["/es/", "/"]
  const en = lang === "en" ? self : twin
  const es = lang === "es" ? self : twin
  return `<!doctype html><html lang="${lang}"><head>
<meta property="og:locale" content="${ogLocale}">
<link rel="alternate" hreflang="en" href="${SITE}${en}">
<link rel="alternate" hreflang="es" href="${SITE}${es}">
<link rel="alternate" hreflang="x-default" href="${SITE}${en}">
</head><body><a href="${twin}" data-lang-toggle>EN | ES</a></body></html>`
}

function dist(files) {
  const dir = mkdtempSync(join(tmpdir(), "check-i18n-"))
  dirs.push(dir)
  for (const [path, html] of Object.entries(files)) {
    mkdirSync(join(dir, path), { recursive: true })
    writeFileSync(join(dir, path, "index.html"), html)
  }
  return dir
}

const run = (dir) => spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8" })

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe("check-i18n", () => {
  it("passes a well-formed EN/ES pair", () => {
    const result = run(dist({ "": page("en"), es: page("es") }))
    expect(result.stdout).toContain("i18n OK — 1 pares")
    expect(result.status).toBe(0)
  })

  it("fails when a page's og:locale does not match its language", () => {
    const result = run(dist({ "": page("en"), es: page("es", { ogLocale: "en_US" }) }))
    expect(result.stderr).toContain('/es/: og:locale="en_US" (esperado "es_CL")')
    expect(result.status).toBe(1)
  })

  it("fails when dist has no bilingual pages", () => {
    const result = run(dist({}))
    expect(result.stderr).toContain("no hay pares EN/ES")
    expect(result.status).toBe(1)
  })
})
