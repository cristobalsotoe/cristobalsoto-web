import { describe, expect, it } from "vitest"
import { assertTwins, baseSlug, langOfSlug, postPath } from "./slugs"

describe("langOfSlug / baseSlug", () => {
  it("reads the language from the first folder of the slug", () => {
    expect(langOfSlug("es/curvasidf2")).toBe("es")
    expect(langOfSlug("en/curvas_idf")).toBe("en")
  })

  it("rejects slugs outside a language folder", () => {
    expect(() => langOfSlug("curvasidf2")).toThrow()
  })

  it("strips the language folder", () => {
    expect(baseSlug("en/curvas_idf")).toBe("curvas_idf")
  })
})

describe("postPath", () => {
  it("builds the public URL of a post in its own language", () => {
    expect(postPath("en/curvasidf2")).toBe("/blog/curvasidf2/")
    expect(postPath("es/curvasidf2")).toBe("/es/blog/curvasidf2/")
  })
})

describe("assertTwins", () => {
  it("accepts a collection where every entry has its twin", () => {
    expect(() => assertTwins("blog", [{ slug: "en/a" }, { slug: "es/a" }])).not.toThrow()
  })

  it("names the collection, slug and missing language", () => {
    expect(() =>
      assertTwins("blog", [{ slug: "en/a" }, { slug: "es/a" }, { slug: "en/b" }]),
    ).toThrow(/blog.*"b".*es/)
  })

  it("rejects twins whose draft flag differs", () => {
    expect(() =>
      assertTwins("blog", [{ slug: "en/a", draft: true }, { slug: "es/a", draft: false }]),
    ).toThrow(/draft/)
  })

  it("rejects entries outside a language folder", () => {
    expect(() => assertTwins("work", [{ slug: "classic" }])).toThrow()
  })
})
