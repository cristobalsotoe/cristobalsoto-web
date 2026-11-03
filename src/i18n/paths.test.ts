import { describe, expect, it } from "vitest"
import { langFromPath, localizePath, pathWithoutLang, twinPath } from "./paths"

describe("langFromPath", () => {
  it("treats the root and unprefixed paths as English", () => {
    expect(langFromPath("/")).toBe("en")
    expect(langFromPath("/work/")).toBe("en")
  })

  it("detects the /es segment with or without trailing slash", () => {
    expect(langFromPath("/es")).toBe("es")
    expect(langFromPath("/es/work/")).toBe("es")
  })

  it("does not mistake a segment that merely starts with 'es' for Spanish", () => {
    expect(langFromPath("/estudios/")).toBe("en")
  })
})

describe("pathWithoutLang", () => {
  it("maps the Spanish root to the English root", () => {
    expect(pathWithoutLang("/es/")).toBe("/")
    expect(pathWithoutLang("/es")).toBe("/")
  })

  it("strips the /es prefix and keeps the rest of the path", () => {
    expect(pathWithoutLang("/es/blog/x/")).toBe("/blog/x/")
  })

  it("leaves English paths untouched", () => {
    expect(pathWithoutLang("/estudios/")).toBe("/estudios/")
  })
})

describe("localizePath", () => {
  it("prefixes Spanish paths and keeps the trailing-slash style", () => {
    expect(localizePath("/", "es")).toBe("/es/")
    expect(localizePath("/work", "es")).toBe("/es/work")
    expect(localizePath("/work/", "es")).toBe("/es/work/")
    expect(localizePath("/rss.xml", "es")).toBe("/es/rss.xml")
  })

  it("is idempotent and reversible", () => {
    expect(localizePath("/es/work/", "es")).toBe("/es/work/")
    expect(localizePath("/es/work/", "en")).toBe("/work/")
  })

  it("leaves external URLs alone", () => {
    expect(localizePath("https://curvasidf.cl/", "es")).toBe("https://curvasidf.cl/")
    expect(localizePath("mailto:a@b.cl", "es")).toBe("mailto:a@b.cl")
  })
})

describe("twinPath", () => {
  it("switches between the two roots", () => {
    expect(twinPath("/")).toBe("/es/")
    expect(twinPath("/es/")).toBe("/")
    expect(twinPath("/es")).toBe("/")
  })

  it("switches a post to its translation and back", () => {
    expect(twinPath("/blog/curvasidf2/")).toBe("/es/blog/curvasidf2/")
    expect(twinPath("/es/blog/curvasidf2/")).toBe("/blog/curvasidf2/")
  })

  it("treats /estudios/ as an English path", () => {
    expect(twinPath("/estudios/")).toBe("/es/estudios/")
  })
})
