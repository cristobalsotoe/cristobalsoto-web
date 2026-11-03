import { getCollection, type CollectionEntry } from "astro:content"
import type { Lang } from "./config"
import { assertTwins, langOfSlug } from "./slugs"

type Bilingual = "blog" | "work"

/**
 * Entradas de una colección bilingüe en un idioma. Antes de filtrar verifica
 * que toda entrada tenga su gemela: si falta una, el build falla.
 */
export async function getLocalized<C extends Bilingual>(collection: C, lang: Lang): Promise<CollectionEntry<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[]
  assertTwins(
    collection,
    entries.map((entry) => ({ slug: entry.slug, draft: "draft" in entry.data ? entry.data.draft : undefined })),
  )
  return entries.filter((entry) => langOfSlug(entry.slug) === lang)
}
