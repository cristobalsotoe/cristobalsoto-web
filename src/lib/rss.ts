import rss from "@astrojs/rss"
import type { Lang } from "@i18n/config"
import { getLocalized } from "@i18n/content"
import { localizePath } from "@i18n/paths"
import { postPath } from "@i18n/slugs"
import { ui } from "@i18n/ui"

/** Feed RSS de un idioma: solo sus posts publicados. */
export async function blogFeed(lang: Lang, site: URL | string): Promise<Response> {
  const posts = (await getLocalized("blog", lang))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  return rss({
    title: ui[lang].meta.rssTitle,
    description: ui[lang].meta.siteDescription,
    site: new URL(localizePath("/", lang), site),
    customData: `<language>${lang}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: postPath(post.slug),
    })),
  })
}
