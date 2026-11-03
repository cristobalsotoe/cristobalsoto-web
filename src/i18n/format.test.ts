import { describe, expect, it } from "vitest"
import { duration, formatDate, longDate, monthYear, readingTime, searchSummary } from "./format"

// fechas construidas en hora local para no depender de la zona horaria
const d = new Date(2026, 6, 12)

describe("formatDate / longDate", () => {
  it("formats short dates per locale", () => {
    expect(formatDate(d, "en")).toBe("Jul 12, 2026")
    expect(formatDate(d, "es")).toBe("12 jul 2026")
  })

  it("formats the masthead date per locale", () => {
    expect(longDate(d, "es")).toBe("domingo, 12 de julio de 2026")
    expect(longDate(d, "en")).toBe("Sunday, July 12, 2026")
  })
})

describe("readingTime", () => {
  const html = "<p>" + "palabra ".repeat(400) + "</p>"

  it("labels the estimate in each language", () => {
    expect(readingTime(html, "en")).toBe("3 min read")
    expect(readingTime(html, "es")).toBe("3 min de lectura")
  })
})

describe("monthYear", () => {
  it("abbreviates the month without a trailing period", () => {
    expect(monthYear(d.toISOString(), "es")).toBe("jul 2026")
    expect(monthYear(d.toISOString(), "en")).toBe("Jul 2026")
    expect(monthYear(new Date(2020, 8, 1).toISOString(), "es")).toBe("sept 2020")
  })
})

describe("duration", () => {
  it("counts months below a year, with singular and plural", () => {
    expect(duration("2020-01-01", "2020-04-01", "en")).toBe("3 months")
    expect(duration("2020-01-01", "2020-02-01", "es")).toBe("1 mes")
  })

  it("rounds to years from twelve months on", () => {
    expect(duration("2018-01-01", "2020-12-31", "es")).toBe("3 años")
  })

  it("measures 'Present' against the given date", () => {
    expect(duration("2020-01-01", "Present", "en", new Date("2021-01-01"))).toBe("1 year")
  })
})

describe("searchSummary", () => {
  it("uses the singular for exactly one result", () => {
    expect(searchSummary(1, "storm", "en")).toBe("Found 1 result for 'storm'")
    expect(searchSummary(1, "temporal", "es")).toBe("1 resultado para 'temporal'")
  })
  it("uses the plural otherwise", () => {
    expect(searchSummary(3, "storm", "en")).toBe("Found 3 results for 'storm'")
    expect(searchSummary(2, "temporal", "es")).toBe("2 resultados para 'temporal'")
  })
  it("shows the query literally, even with $ replacement patterns", () => {
    expect(searchSummary(2, "a$&b$1", "en")).toBe("Found 2 results for 'a$&b$1'")
  })
})
