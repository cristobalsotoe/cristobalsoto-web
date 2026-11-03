import { describe, expect, it } from "vitest"
import { ui } from "./ui"

// Textos que legítimamente son iguales en ambos idiomas (nombres de sección, lugares).
const ALLOWED_SAME = ["nav.cv", "nav.blog", "nav.notCv", "blog.place", "work.base"]

type Leaf = { path: string; value: unknown }

function leaves(node: unknown, prefix = ""): Leaf[] {
  if (node !== null && typeof node === "object" && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, value]) => leaves(value, prefix ? `${prefix}.${key}` : key))
  }
  return [{ path: prefix, value: node }]
}

const en = leaves(ui.en)
const es = new Map(leaves(ui.es).map((leaf) => [leaf.path, leaf.value]))

describe("ui dictionary", () => {
  it("has exactly the same keys in both languages", () => {
    expect([...es.keys()].sort()).toEqual(en.map((leaf) => leaf.path).sort())
  })

  it("keeps arrays the same length in both languages", () => {
    for (const { path, value } of en) {
      if (Array.isArray(value)) expect((es.get(path) as unknown[]).length, path).toBe(value.length)
    }
  })

  it("has no empty strings", () => {
    for (const { path, value } of [...en, ...[...es].map(([path, value]) => ({ path, value }))]) {
      const strings = Array.isArray(value) ? value : [value]
      for (const s of strings) expect(typeof s === "string" && s.trim().length > 0, path).toBe(true)
    }
  })

  it("translates every string except the allowed names", () => {
    for (const { path, value } of en) {
      if (ALLOWED_SAME.includes(path)) continue
      const other = es.get(path)
      if (Array.isArray(value)) {
        value.forEach((s, i) => expect((other as string[])[i], `${path}[${i}]`).not.toBe(s))
      } else {
        expect(other, path).not.toBe(value)
      }
    }
  })
})
