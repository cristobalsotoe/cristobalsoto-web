import type { APIContext } from "astro"
import { blogFeed } from "@lib/rss"

export async function GET(context: APIContext) {
  return blogFeed("en", context.site!)
}
