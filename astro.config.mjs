import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"

// https://astro.build/config
export default defineConfig({
  site: 'https://cristobalsoto.com',
  redirects: {
    '/hobbies': '/not-cv',
  },
  integrations: [
    mdx(),
    sitemap({ i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } } }),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
  ],
})

