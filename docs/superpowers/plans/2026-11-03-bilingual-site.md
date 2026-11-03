# Sitio bilingüe EN/ES — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que cada página pública exista en inglés (URL actual) y en español (`/es/...`) con el mismo contenido, y un botón `EN | ES` que lleve a la página gemela.

**Architecture:**
- **Páginas:** cada una vive en `src/views/*View.astro` con prop `lang`. Las rutas EN (`src/pages/...`) y ES (`src/pages/es/...`) son archivos delgados que renderizan esa vista.
- **Contenido:** el de `blog` y `work` se separa en subcarpetas `en/` y `es/`, con el mismo nombre de archivo. `getLocalized()` filtra por idioma y hace fallar el build si a una entrada le falta su gemela.
- **Textos de interfaz:** en un diccionario tipado (`src/i18n/ui.ts`).
- **Helpers:** los de rutas y fechas son puros y tienen tests vitest.
- **Chequeo post-build:** `scripts/check-i18n.mjs` valida sobre `dist/` las gemelas, `lang`, hreflang, el botón y que no haya links que crucen de idioma.
- **Sin routing i18n de Astro:** con `/es/` como carpeta y helpers propios no hace falta, y así se evita su middleware.

**Tech Stack:** Astro 4.16 (content collections legacy), SolidJS, Tailwind 3, vitest 2.1.9 (nuevo, solo dev), Node ≥ 20.

**Spec:** `docs/superpowers/specs/2026-11-03-bilingual-site-design.md`. Leerlo antes de empezar, en especial las secciones "Anti-metas", "Inventario" y "Contenido del blog y del CV".

## Global Constraints

- **Rama:** todo el trabajo va en `bilingual`. Nada llega a `master` (= producción) sin el OK del autor a las traducciones (Task 9).
- **Astro 4** con la API legacy de content collections. Nada de content layer v5. No agregar el bloque `i18n` de Astro ni librerías de i18n.
- **Islas SolidJS:** reciben `lang` por props y no leen la URL.
- **`npm run build` pasa al final de cada task.**
- **URLs:** EN en las rutas actuales, ES con prefijo `/es/`, con **el mismo slug** en ambos idiomas.
- **Solo en inglés y sin gemela:** `legal/*`, `projects` (index y `[...slug]`) y la colección `hobbies`. En ellas no se muestra el botón.
- **Nombres que no se traducen:** "El Pluviómetro", "Not CV", nombres propios de instituciones y proyectos, "University of California, Irvine" y "Cristóbal Soto-Escobar".
- **Glosario:** periodo de retorno ↔ return period · curvas IDF ↔ IDF curves · datos grillados ↔ gridded data · modelamiento integrado ↔ integrated modeling · PEGH queda como sigla. El registro es cercano y directo en el home y el blog, y sobrio en el CV.
- **Solo se traduce, no se cambia contenido.** Si se ve algo desactualizado, se anota para el autor y no se toca.
- **Botón de idioma:**
  - es un `<a>` real con atributo `data-lang-toggle`;
  - muestra `EN | ES` con el idioma actual marcado;
  - tiene `hreflang` y `lang` del destino, y `aria-label` en el idioma de destino ("View in English" / "Ver en español").
- **SEO:**
  - `x-default` apunta al inglés y el `canonical` a la propia página;
  - `og:locale` es `en_US` o `es_CL`;
  - `<html lang>` es `en` o `es`.
- **Imágenes:** siempre `/img/...`, compartidas entre idiomas. No tocar `public/js/theme.js`.

## Review Focus

1. **Rutas cuyo primer segmento solo empieza con "es"** (`/estudios/`, `/es-cl/`): deben tratarse como inglés y no perder letras al cambiar de idioma. → test en Task 1.
2. **Raíz y rutas sin slash final** (`/`, `/es`, `/es/`, `/work`): el botón debe llevar a la gemela exacta y conservar el estilo de slash. → test en Task 1.
3. **Links dentro de una página ES que llevan a páginas EN**: menú, CTAs, anterior/siguiente, tarjeta "lo más reciente", feed RSS. El visitante debe quedarse en su idioma. → regla "cross-link" de `check-i18n.mjs` (Task 3), ejercida por cada task de página.
4. **Un post en borrador o borrado en un solo idioma**: el build debe fallar con un mensaje que nombre el slug. → test en Task 1 (`assertTwins`).
5. **URLs del .cl que ya traen `/es/` o apuntan a páginas solo-EN** (`/legal/terms/`): no deben terminar en `/es/es/...` ni en un 404. → test en Task 9.

---

### Task 1: Núcleo i18n — config, rutas, slugs y formatos

**Files:**
- Create: `src/i18n/config.ts`, `src/i18n/paths.ts`, `src/i18n/slugs.ts`, `src/i18n/format.ts`, `vitest.config.ts`
- Test: `src/i18n/paths.test.ts`, `src/i18n/slugs.test.ts`, `src/i18n/format.test.ts`
- Modify: `package.json` (devDependency `vitest@2.1.9`, script `"test": "vitest run"`), `src/lib/utils.ts` (quitar `formatDate` y `readingTime`), y sus llamadores, que pasan a importar de `@i18n/format`: `src/components/ArrowCard.tsx`, `src/layouts/ArticleTopLayout.astro`, `src/pages/legal/[...slug].astro`, `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`

**Interfaces — Produces:**
- `config.ts`:
  - `LOCALES = ["en","es"] as const`
  - `type Lang = "en" | "es"`
  - `DEFAULT_LANG: Lang = "en"`
  - `otherLang(lang: Lang): Lang`
  - `DATE_LOCALE = { en: "en-US", es: "es-CL" }`
  - `OG_LOCALE = { en: "en_US", es: "es_CL" }`
- `paths.ts`:
  - `langFromPath(pathname: string): Lang`
  - `pathWithoutLang(pathname: string): string`
  - `localizePath(path: string, lang: Lang): string` (las URLs externas `http(s)://` y `mailto:` pasan intactas)
  - `twinPath(pathname: string): string`
- `slugs.ts`:
  - `langOfSlug(slug: string): Lang` (lanza error si el primer segmento no es `en` ni `es`)
  - `baseSlug(slug: string): string`
  - `postPath(slug: string): string`
  - `assertTwins(collection: string, entries: { slug: string; draft?: boolean }[]): void`
- `format.ts`:
  - `formatDate(date: Date, lang: Lang = "en"): string`
  - `longDate(date: Date, lang: Lang): string`
  - `readingTime(html: string, lang: Lang = "en"): string`
  - `monthYear(iso: string, lang: Lang): string`
  - `duration(startIso: string, endIso: string | "Present", lang: Lang, now: Date = new Date()): string`

- [ ] **Step 1: Instalar vitest y configurarlo**

`npm i -D vitest@2.1.9`. Crear `vitest.config.ts` con `getViteConfig({ test: {} })` de `astro/config`. En los tests, usar imports relativos (`./paths`).

- [ ] **Step 2: Escribir los tests que fallan**

```ts
// paths.test.ts
expect(langFromPath("/")).toBe("en"); expect(langFromPath("/es")).toBe("es")
expect(langFromPath("/es/work/")).toBe("es"); expect(langFromPath("/estudios/")).toBe("en")
expect(pathWithoutLang("/es/")).toBe("/"); expect(pathWithoutLang("/es")).toBe("/")
expect(pathWithoutLang("/es/blog/x/")).toBe("/blog/x/"); expect(pathWithoutLang("/estudios/")).toBe("/estudios/")
expect(localizePath("/", "es")).toBe("/es/"); expect(localizePath("/work", "es")).toBe("/es/work")
expect(localizePath("/work/", "es")).toBe("/es/work/"); expect(localizePath("/es/work/", "es")).toBe("/es/work/")
expect(localizePath("/es/work/", "en")).toBe("/work/"); expect(localizePath("/rss.xml", "es")).toBe("/es/rss.xml")
expect(localizePath("https://curvasidf.cl/", "es")).toBe("https://curvasidf.cl/")
expect(twinPath("/")).toBe("/es/"); expect(twinPath("/es/")).toBe("/"); expect(twinPath("/es")).toBe("/")
expect(twinPath("/blog/curvasidf2/")).toBe("/es/blog/curvasidf2/")
expect(twinPath("/es/blog/curvasidf2/")).toBe("/blog/curvasidf2/")
expect(twinPath("/estudios/")).toBe("/es/estudios/")

// slugs.test.ts
expect(langOfSlug("es/curvasidf2")).toBe("es"); expect(() => langOfSlug("curvasidf2")).toThrow()
expect(baseSlug("en/curvas_idf")).toBe("curvas_idf")
expect(postPath("en/curvasidf2")).toBe("/blog/curvasidf2/"); expect(postPath("es/curvasidf2")).toBe("/es/blog/curvasidf2/")
expect(() => assertTwins("blog", [{ slug: "en/a" }, { slug: "es/a" }])).not.toThrow()
expect(() => assertTwins("blog", [{ slug: "en/a" }, { slug: "es/a" }, { slug: "en/b" }])).toThrow(/blog.*"b".*es/)
expect(() => assertTwins("blog", [{ slug: "en/a", draft: true }, { slug: "es/a", draft: false }])).toThrow(/draft/)
expect(() => assertTwins("work", [{ slug: "classic" }])).toThrow()

// format.test.ts  (fechas construidas en hora local para no depender de la zona horaria)
const d = new Date(2026, 6, 12)
expect(formatDate(d, "en")).toBe("Jul 12, 2026"); expect(formatDate(d, "es")).toBe("12 jul 2026")
expect(longDate(d, "es")).toBe("domingo, 12 de julio de 2026"); expect(longDate(d, "en")).toBe("Sunday, July 12, 2026")
const html = "<p>" + "palabra ".repeat(400) + "</p>"
expect(readingTime(html, "en")).toBe("3 min read"); expect(readingTime(html, "es")).toBe("3 min de lectura")
expect(monthYear(d.toISOString(), "es")).toBe("jul 2026"); expect(monthYear(d.toISOString(), "en")).toBe("Jul 2026")
expect(monthYear(new Date(2020, 8, 1).toISOString(), "es")).toBe("sept 2020")
expect(duration("2020-01-01", "2020-04-01", "en")).toBe("3 months")
expect(duration("2020-01-01", "2020-02-01", "es")).toBe("1 mes")
expect(duration("2018-01-01", "2020-12-31", "es")).toBe("3 años")
expect(duration("2020-01-01", "Present", "en", new Date("2021-01-01"))).toBe("1 year")
```

- [ ] **Step 3: Correr y confirmar que fallan**

Run: `npx vitest run src/i18n`. Expected: FAIL, porque los módulos todavía no existen.

- [ ] **Step 4: Implementar los cuatro módulos**

- **`formatDate` y `readingTime`:** misma fórmula que hoy (`src/lib/utils.ts`), ahora parametrizada por idioma.
- **`monthYear` y `duration`:** misma lógica que hoy en `src/components/CvTimeline.tsx:24-36`: meses = días / 30.4 redondeado; con menos de 12 se muestran meses, si no años redondeados; se quita el "." del mes abreviado.
- **Palabras de unidad:** los nombres de unidades ("month"/"mes", "year"/"año" y sus plurales) y el sufijo de lectura viven en `format.ts`, no en el diccionario.
- **Prefijo de idioma:** el prefijo `es` solo cuenta como **segmento completo** de la ruta.
- **Mensaje de `assertTwins`:** `[i18n] blog: "b" no tiene versión es` / `[i18n] blog: "a" difiere en draft entre en y es`.

- [ ] **Step 5: Correr los tests**

Run: `npx vitest run src/i18n`. Expected: todos pasan.

- [ ] **Step 6: Mover los imports de los llamadores a `@i18n/format` y verificar**

Run: `npm run build`. Expected: pasa; el sitio se ve igual que antes.

- [ ] **Step 7: Commit** — `git commit -m "i18n: helpers de rutas, slugs y formatos con tests"`

---

### Task 2: Diccionario de interfaz

**Files:**
- Create: `src/i18n/ui.ts`
- Test: `src/i18n/ui.test.ts`

**Interfaces — Produces:**
- `ui: Record<Lang, UIStrings>`
- `type UIStrings`, con exactamente esta forma:

```ts
type UIStrings = {
  switchTo: string                       // aria-label del botón que lleva A este idioma
  meta: { siteDescription: string; homeTitle: string; workDescription: string; blogDescription: string
          notCvDescription: string; searchTitle: string; searchDescription: string; rssTitle: string }
  nav: { home: string; cv: string; blog: string; notCv: string; idf: string }
  chrome: { searchAria: string; themeAria: string; drawerAria: string; rssAria: string
            backToTop: string; backToTopAria: string; rights: string; logoAlt: string; socialOn: string }
  home: { role: string; tagline: string; dioramaNote: string; ctaCv: string; ctaBlog: string
          emailTitle: string; orcidTitle: string; photoBadge: string; latestKicker: string; readArticle: string
          aboutKicker: string; aboutTitle: string; aboutHtml: string[]; contactKicker: string; contactTitle: string }
  diorama: { canvasAria: string; hint: string; srText: string; forward: string; left: string
             back: string; right: string; fallback: string }
  work: { kicker: string; subtitle: string; base: string; origin: string; pdfLabel: string
          viewTimeline: string; viewClassic: string; education: string; experience: string
          present: string; current: string }
  blog: { mastheadKicker: string; place: string; byline: string; postByline: string
          noteFallback: string; prev: string; next: string }
  notCv: { title: string; intro: string; photosTitle: string; photosSub: string; photosCta: string }
  search: { placeholder: string; results: string }   // results usa {n} y {q}
}
```

**De dónde salen los valores:**
- **Español:** se copia literal de los archivos actuales: `src/pages/index.astro`, `work/index.astro`, `blog/index.astro`, `blog/[...slug].astro`, `not-cv/index.astro`, `CvTimeline.tsx`, `Landscape3D.tsx:554-579` y `src/consts.ts`.
- **Inglés:** se reusa el inglés que ya existe (Header, Footer, Search, consts) y se traduce el resto.
- **Valores fijados por la spec:**
  - `switchTo`: "View in English" / "Ver en español";
  - `work.pdfLabel`: "PDF" / "PDF (EN)";
  - `nav.idf`: "IDF Curves" / "Curvas IDF".
- **`aboutHtml`:** cada párrafo es HTML con `<b>` (se renderiza con `set:html`).

- [ ] **Step 1: Escribir el test que falla** — `ui.test.ts`:
  - recorre `ui.en` y exige que `ui.es` tenga las mismas claves, con el mismo tipo y el mismo largo en los arrays;
  - ninguna hoja puede ser string vacío;
  - para cada hoja string, `ui.es` debe diferir de `ui.en`, salvo en `ALLOWED_SAME = ["nav.cv", "nav.blog", "nav.notCv", "blog.place", "work.base"]`.

- [ ] **Step 2: Correr y confirmar que falla.** Run: `npx vitest run src/i18n/ui.test.ts`. Expected: FAIL, porque `ui.ts` no existe.
- [ ] **Step 3: Escribir `ui.ts`.** Declarar `en` y `es` como `UIStrings`, de modo que `astro check` también detecte claves faltantes.
- [ ] **Step 4: Correr `npx vitest run` y `npm run build`.** Expected: ambos pasan.
- [ ] **Step 5: Commit** — `git commit -m "i18n: diccionario de textos de interfaz EN/ES"`

---

### Task 3: Layout compartido, botón de idioma y chequeo post-build

**Files:**
- Create: `src/components/LangToggle.astro`, `scripts/check-i18n.mjs`
- Modify:
  - `src/layouts/PageLayout.astro`, `src/components/BaseHead.astro`, `Header.astro`, `Drawer.astro`, `Footer.astro`;
  - `src/types.ts` (`Links` pasa a `{ KEY: keyof UIStrings["nav"]; HREF: string }[]`) y `src/consts.ts` (`LINKS` usa `KEY`);
  - `package.json` (script `"check:i18n": "node scripts/check-i18n.mjs"`);
  - todos los llamadores de `PageLayout`: las páginas actuales pasan `lang="en"`; las de `legal` y `projects` además pasan `hasTwin={false}`.

**Interfaces:**
- Consumes: `localizePath`, `twinPath`, `pathWithoutLang`, `otherLang`, `OG_LOCALE` (Task 1); `ui` (Task 2).
- Produces:
  - `PageLayout` con props `{ title: string; description: string; lang: Lang; hasTwin?: boolean /* default true */ }`. `lang` es **obligatorio**, así `astro check` marca cualquier página que lo olvide.
  - `<LangToggle lang={lang} />`.
  - CLI `node scripts/check-i18n.mjs [distDir=dist]`: si todo está bien, termina con código 0 e imprime `i18n OK — <N> pares`; si no, termina con código 1 y una línea `✗ <ruta>: <problema>` por error.

**Reglas de `check-i18n.mjs`** (sobre cada `index.html` de `dist/`, ignorando las páginas de redirección, las que contienen `http-equiv="refresh"`):
1. Solo-EN = rutas que empiezan con `/legal/` o `/projects/`. Toda otra ruta EN debe tener `/es/<ruta>`, y toda ruta ES su EN.
2. Páginas con gemela:
   - `<html lang>` correcto;
   - `<link rel="alternate" hreflang="en|es|x-default">` con URL absoluta `https://cristobalsoto.com/...` correcta (`x-default` = EN);
   - exactamente un `a[data-lang-toggle]` con `href` igual a la gemela.
3. Páginas solo-EN: `lang="en"` y ningún `data-lang-toggle`.
4. **Cross-link:** en páginas ES, todo `href` interno de `<a>` y del `<link type="application/rss+xml">` debe empezar con `/es/` o ser una ruta solo-EN. En páginas EN, ninguno debe empezar con `/es/`.
   - Antes de comparar, se quita el origen `https://cristobalsoto.com`.
   - Se exceptúan el toggle y los assets: `/img/`, `/fonts/`, `/js/`, `/doc/`, `/_astro/`, `*.svg`, `/sitemap`.

- [ ] **Step 1: Escribir `scripts/check-i18n.mjs`**, usando solo Node y regex, sin dependencias.
- [ ] **Step 2: Correrlo contra el build actual y confirmar que falla.** Run: `npm run build && npm run check:i18n`. Expected: código 1, con errores solo sobre las 7 rutas EN que deben tener gemela (`/`, `/work/`, `/blog/`, `/blog/curvas_idf/`, `/blog/curvasidf2/`, `/not-cv/`, `/search/`): gemela faltante, hreflang y toggle. **Nada** sobre `/legal/` ni `/projects/`.
- [ ] **Step 3: Implementar layout, head, header, drawer, footer y `LangToggle`.**
  - **`LangToggle`:** va en el grupo derecho del header (visible en desktop) y en la fila de botones del drawer, con el estilo de los botones existentes (`border-mist`, `label`, hover `paper-raised`). Se renderiza solo si `hasTwin`.
  - **Nav:** los links internos usan `localizePath(HREF, lang)`; el activo se calcula sobre `pathWithoutLang(pathname)`.
  - **RSS:** el link de BaseHead y el del drawer usan `localizePath("/rss.xml", lang)`.
  - **Head:** BaseHead emite `og:locale` (`OG_LOCALE[lang]`) y, si `hasTwin`, los tres `hreflang`. El `canonical` sigue apuntando a la propia página, como hoy.
  - **Textos:** footer, `aria-label` y alt del logo salen de `ui[lang].chrome`.
- [ ] **Step 4: Verificar.** Run: `npm run build && npm run check:i18n`. Expected: solo quedan errores de "gemela faltante" para las 7 rutas. No hay errores de hreflang, lang ni toggle, ni errores cross-link.
- [ ] **Step 5: Commit** — `git commit -m "i18n: layout bilingüe, botón EN|ES y chequeo post-build"`

---

### Task 4: Blog bilingüe (contenido, índice, posts, RSS)

**Files:**
- Create:
  - `src/i18n/content.ts`, `src/views/BlogIndexView.astro`, `src/views/BlogPostView.astro`, `src/lib/rss.ts`;
  - rutas `src/pages/es/blog/index.astro`, `src/pages/es/blog/[...slug].astro`, `src/pages/es/rss.xml.ts`;
  - traducciones `src/content/blog/es/curvas_idf.md` (del inglés) y `src/content/blog/en/curvasidf2.md` (del español).
- Move:
  - `src/content/blog/curvas_idf.md` → `src/content/blog/en/curvas_idf.md`;
  - `src/content/blog/curvasidf2.md` → `src/content/blog/es/curvasidf2.md`.
  - `_trash/` no se toca.
- Modify:
  - `src/content/config.ts` (sacar `lang` del schema de `blog`) y los dos posts (sacar `lang:` del frontmatter);
  - `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro` y `src/pages/rss.xml.ts`: quedan delgados;
  - `src/pages/index.astro` y `src/pages/search/index.astro`: cambiar provisoriamente `getCollection("blog")` por `getLocalized("blog", "en")`. En el home, el link al último post pasa a `postPath(latest.slug)`. Se reescriben en las Tasks 5 y 7.

**Interfaces:**
- Consumes: `assertTwins`, `langOfSlug`, `baseSlug`, `postPath`, `formatDate`, `longDate`, `readingTime` (Task 1); `ui` (Task 2); `PageLayout` (Task 3).
- Produces:
  - `getLocalized<C extends "blog" | "work">(collection: C, lang: Lang): Promise<CollectionEntry<C>[]>`: llama `assertTwins` sobre la colección completa y devuelve solo las entradas de `lang`;
  - `BlogIndexView` y `BlogPostView`, con props `{ lang: Lang }` y `{ lang: Lang; post: CollectionEntry<"blog"> }`;
  - `blogFeed(lang: Lang, site: URL | string): Promise<Response>`: solo posts no-draft del idioma, con link `postPath(slug)`, título `ui[lang].meta.rssTitle` y descripción `ui[lang].meta.siteDescription`. Ya no incluye los proyectos lorem.

**Reglas de traducción de los posts:**
- `date`, `image`, `draft` y el nombre de archivo son idénticos en ambas versiones.
- Se traducen `title`, `summary`, `source` ("Nota de campo" ↔ "Field note"), `tags`, el cuerpo y el texto alternativo de las imágenes.

- [ ] **Step 1: Crear `content.ts`, mover los posts y escribir las dos traducciones.**
- [ ] **Step 2: Comprobar que el build falla si falta una gemela.** Borrar temporalmente `src/content/blog/es/curvasidf2.md` y correr `npm run build`. Expected: FAIL con `[i18n] blog: "curvasidf2" no tiene versión es`. Restaurar el archivo con `git checkout`.
- [ ] **Step 3: Escribir las vistas, las rutas EN y ES y los feeds.**
  - En `getStaticPaths`, el param `slug` es `baseSlug(post.slug)`.
  - Anterior y siguiente se calculan dentro del mismo idioma y enlazan con `postPath`.
  - El "← El Pluviómetro" y la tarjeta de cada nota usan `localizePath`.
  - El masthead muestra `longDate(new Date(), lang)`.
- [ ] **Step 4: Verificar.** Run: `npm run build && npm run check:i18n`. Expected: ya no aparecen errores de `/blog/`, `/blog/curvas_idf/` ni `/blog/curvasidf2/`. Siguen los de `/`, `/work/`, `/not-cv/` y `/search/`. Además, `dist/es/rss.xml` existe y sus `<link>` apuntan a `/es/blog/...`.
- [ ] **Step 5: Commit** — `git commit -m "i18n: blog bilingüe con posts traducidos y feed por idioma"`

---

### Task 5: Home bilingüe

**Files:**
- Create: `src/views/HomeView.astro`, `src/pages/es/index.astro`
- Modify: `src/pages/index.astro` (queda delgado), `src/components/Landscape3D.tsx` (prop `lang`)

**Interfaces:**
- Consumes: `getLocalized`, `postPath` y `formatDate` (Tasks 1 y 4), `ui` (Task 2).
- Produces: `HomeView` con props `{ lang: Lang }`; `Landscape3D` con props `{ lang: Lang }`.

**Requisitos:**
- **`Landscape3D`:** importa `ui` y usa `ui[props.lang].diorama` para todo texto visible, `aria-label` y `sr-only`. Los letreros que el diorama dibuja en canvas (p. ej. "University of California, Irvine") no cambian.
- **"Lo más reciente":** toma el último post de `getLocalized("blog", lang)`.
- **CTAs:** `localizePath("/work", lang)` y `localizePath("/blog", lang)`.
- **"Acerca de mí":** renderiza `ui[lang].home.aboutHtml`, con un estilo scoped `b { color: var(--ink) }` que reemplaza los `style` inline actuales.

- [ ] **Step 1: Extraer la vista y crear las dos rutas.**
- [ ] **Step 2: Verificar.** Run: `npm run build && npm run check:i18n`. Expected: ya no aparecen errores de `/`.
- [ ] **Step 3: Verificar a ojo.** Run: `npm run dev`. En `/` y `/es/` el diorama carga, el hint y los botones móviles salen en el idioma correcto, y el botón de idioma alterna entre las dos versiones.
- [ ] **Step 4: Commit** — `git commit -m "i18n: home bilingüe"`

---

### Task 6: CV bilingüe (contenido, vista, timeline)

**Files:**
- Create:
  - `src/views/WorkView.astro`, `src/pages/es/work/index.astro`;
  - traducciones `src/content/work/en/*.md` para los 10 archivos: `classic`, `edu-civil-engineer`, `edu-diploma`, `exp-anid`, `exp-doh`, `exp-icass`, `exp-sernageomin`, `exp-uach`, `exp-uchile` y `exp-webdev-ufro`.
- Move: `src/content/work/*.md` → `src/content/work/es/*.md`
- Modify: `src/pages/work/index.astro` (queda delgado), `src/components/CvTimeline.tsx` (prop `lang`)

**Interfaces:**
- Consumes: `getLocalized` (Task 4), `monthYear` y `duration` (Task 1), `ui` (Task 2).
- Produces: `WorkView` con props `{ lang: Lang }`; `CvTimeline` con props `{ milestones: Milestone[]; lang: Lang }`.

**Requisitos:**
- **Timeline:** los hitos salen de `getLocalized("work", lang)` sin `classic`. La vista clásica sale de `getEntry("work", \`${lang}/classic\`)`; si no existe, lanzar un error.
- **`CvTimeline`:** borra sus funciones locales `monthYear` y `duration` y usa las de `@i18n/format`. Las etiquetas (educación, experiencia, "presente", "actual") salen de `ui[lang].work`.
- **Traducción de cada entrada:**
  - se traducen `role`, `highlights`, las `label` de `links`, `location` (p. ej. "Chile" no cambia) y todo `classic.md`;
  - `company` solo si es un nombre genérico, nunca un nombre propio;
  - `dateStart`, `dateEnd`, `category` y `href` quedan idénticos.
- **PDF:** el link es el mismo en ambos idiomas, con `ui[lang].work.pdfLabel`.

- [ ] **Step 1: Mover los archivos y escribir las 10 traducciones.**
- [ ] **Step 2: Extraer la vista, actualizar `CvTimeline` y crear las rutas.**
- [ ] **Step 3: Verificar.** Run: `npx vitest run && npm run build && npm run check:i18n`. Expected: ya no aparecen errores de `/work/`.
- [ ] **Step 4: Verificar a ojo.** Run: `npm run dev`. En `/work/` y `/es/work/` coinciden fechas, duraciones y chips; el toggle de vista clásica funciona en ambas.
- [ ] **Step 5: Commit** — `git commit -m "i18n: CV bilingüe"`

---

### Task 7: Not CV y búsqueda bilingües

**Files:**
- Create: `src/views/NotCvView.astro`, `src/views/SearchView.astro`, `src/pages/es/not-cv/index.astro`, `src/pages/es/search/index.astro`
- Modify: `src/pages/not-cv/index.astro` y `src/pages/search/index.astro` (quedan delgados), `src/components/Search.tsx`, `src/components/ArrowCard.tsx`

**Interfaces:**
- Consumes: `getLocalized` y `postPath` (Tasks 1 y 4), `ui` (Task 2).
- Produces: `NotCvView` y `SearchView` con props `{ lang: Lang }`; `Search` con props `{ data: CollectionEntry<"blog">[]; lang: Lang }`; `ArrowCard` con prop opcional `lang?: Lang`.

**Requisitos:**
- **`NotCvView`:** se lleva todo el `<style>` de la página actual.
- **Búsqueda:** indexa solo `getLocalized("blog", lang)`, sin proyectos y sin la clave `"slug"` en las `keys` de Fuse (evita que "es" coincida con todo).
- **`Search`:** usa `ui[lang].search` y quita `pill`.
- **`ArrowCard`:** para entradas de `blog` enlaza a `postPath(entry.slug)` con `formatDate(..., lang)`; para `projects` mantiene el comportamiento actual.

- [ ] **Step 1: Extraer las vistas, crear las rutas y actualizar las islas.**
- [ ] **Step 2: Verificar.** Run: `npm run build && npm run check:i18n`. Expected: código 0, `i18n OK — 7 pares`.
- [ ] **Step 3: Verificar a ojo.** Run: `npm run dev`. En `/es/search/`, buscar "temporal" devuelve el post en español y su link va a `/es/blog/curvasidf2/`. En `/search/`, buscar "storm" o "return period" devuelve el post en inglés.
- [ ] **Step 4: Commit** — `git commit -m "i18n: Not CV y búsqueda bilingües"`

---

### Task 8: Cierre — build con chequeo, sitemap, limpieza, documentación y material de revisión

**Files:**
- Create: `scripts/translation-review.mjs`
- Modify:
  - `package.json`: `"build": "astro check && astro build && node scripts/check-i18n.mjs"`;
  - `astro.config.mjs`: `sitemap({ i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } } })`;
  - `src/consts.ts` y `src/types.ts`: quitar las constantes que ya no se usan (`WORK`, `NOT_CV`, `BLOG`, `SEARCH`, `SITE.DESCRIPTION`) y ajustar `Site`;
  - `.gitignore`: agregar `.review/`;
  - `CLAUDE.md`.

**Interfaces — Produces:** `node scripts/translation-review.mjs [distDir=dist] [out=.review/translation-review.html]`. Por cada par de páginas EN/ES:
- extrae en orden de documento los textos visibles (sin `script`, `style` ni `svg`), además de los atributos `aria-label`, `alt`, `title` y `placeholder`;
- arma una tabla de dos columnas EN | ES;
- marca en amarillo las filas donde EN === ES (salvo números, URLs y los nombres de las Global Constraints) y avisa si el número de filas no coincide.

- [ ] **Step 1: Hacer los cambios de build, sitemap y consts, y verificar.** Run: `npm run build`. Expected: pasa e imprime `i18n OK — 7 pares`. Además, `dist/sitemap-0.xml` contiene `xhtml:link` con `hreflang="es"`.
- [ ] **Step 2: Escribir `translation-review.mjs` y generar el documento.** Run: `node scripts/translation-review.mjs`. Revisar cada fila amarilla:
  - si es texto sin traducir (incluidos `aria-label` y `alt`), corregirlo en `ui.ts` o en el contenido;
  - si es un nombre propio legítimo, dejarlo.
  Repetir hasta que no queden filas amarillas que sean texto sin traducir.
- [ ] **Step 3: Recorrer los criterios de aceptación 1–6 de la spec.** Correr `npm run preview` y abrir cada par en el navegador, en desktop y en ancho móvil, probando el botón de ida y vuelta.
- [ ] **Step 4: Actualizar `CLAUDE.md`.** Agregar una sección "Bilingüe EN/ES" con:
  - dónde vive cada cosa (`src/i18n/`, `src/views/`, `src/content/{blog,work}/{en,es}/`);
  - la regla de que todo post o entrada nueva se crea en ambos idiomas con el mismo nombre de archivo (el build falla si no);
  - que `ui.ts` es la única fuente de los textos de interfaz;
  - que el espejo `.cl` lleva a `/es/`.
  Además, quitar la mención a `lang` del frontmatter del blog.
- [ ] **Step 5: Commit** — `git commit -m "i18n: build con chequeo, sitemap con hreflang y documentación"`
- [ ] **Step 6: Entregar al autor para revisión y detenerse.**
  - Publicar `.review/translation-review.html` como Artifact privado y pasarle el link.
  - Explicarle que puede verlo en vivo con `git switch bilingual && npm run dev` (en `/` y `/es/`).
  - Listarle cualquier contenido desactualizado que se haya anotado.
  - **No seguir con la Task 9 hasta que el autor apruebe.** Si pide cambios, aplicarlos en `bilingual`, regenerar el documento y volver a entregarlo.

---

### Task 9: Publicación y espejo .cl → español (solo con el OK del autor)

**Files:**
- Repo principal: merge de `bilingual` en `master`.
- Repo `cristobalsotoe/cristobalsoto-cl` (clonar en un directorio temporal):
  - Create: `generate.mjs`, `generate.test.mjs`
  - Regenerate: `index.html`, `404.html` y los stubs `<ruta>/index.html`

**Interfaces — Produces:** en `generate.mjs`:
- `export function target(pathname: string): string`;
- `export const ROUTES` = `/`, `/blog/`, `/blog/curvas_idf/`, `/blog/curvasidf2/`, `/work/`, `/not-cv/`, `/search/`, `/hobbies/`, `/legal/privacy/`, `/legal/terms/` y `/projects/`;
- ejecutado como script, escribe los stubs (`<link rel="canonical">`, `meta refresh` y `location.replace` hacia `https://cristobalsoto.com` + `target(ruta)`) y el `404.html`. El `404.html` incrusta `target.toString()` para calcular el destino en el navegador, y le agrega `location.search` y `location.hash`.

- [ ] **Step 1: Mergear y publicar** (con la aprobación explícita del autor ya dada en el chat).
  - `git switch master && git merge --ff-only bilingual && git push origin master`
  - Seguir el deploy con `gh run watch`. Expected: success.
- [ ] **Step 2: Verificar producción.** Las 10 URLs del sitemap anterior (las 7 rutas EN más `/legal/privacy/`, `/legal/terms/` y `/projects/`) y las 7 gemelas `/es/` deben dar `200` con `curl -s -o /dev/null -w "%{http_code}"`. Además, `curl -s https://cristobalsoto.com/es/work/ | grep 'hreflang="en"'` debe encontrar el link.
- [ ] **Step 3: Escribir el test que falla en el repo .cl** (`generate.test.mjs`, con `node:test`):

```js
assert.equal(target("/"), "/es/"); assert.equal(target("/work/"), "/es/work/")
assert.equal(target("/blog/curvasidf2/"), "/es/blog/curvasidf2/"); assert.equal(target("/estudios/"), "/es/estudios/")
assert.equal(target("/es/work/"), "/es/work/"); assert.equal(target("/es"), "/es/")
assert.equal(target("/legal/terms/"), "/legal/terms/"); assert.equal(target("/projects/"), "/projects/")
assert.equal(target("/hobbies/"), "/es/not-cv/")
```

  Run: `node --test`. Expected: FAIL, porque `generate.mjs` no existe.
- [ ] **Step 4: Implementar `generate.mjs`, correr los tests y generar.**
  - Run: `node --test`. Expected: pasan.
  - Run: `node generate.mjs`. Expected: los stubs regenerados apuntan a `/es/...`.
- [ ] **Step 5: Commit y push del repo .cl; verificar.**
  - Esperar a que Pages construya (`gh api repos/cristobalsotoe/cristobalsoto-cl/pages --jq .status` debe dar `built`).
  - `curl -sL https://cristobalsoto.cl/work/` debe contener `url=https://cristobalsoto.com/es/work/`.
  - `curl -sL https://cristobalsoto.cl/legal/terms/` debe contener `url=https://cristobalsoto.com/legal/terms/`.
- [ ] **Step 6: Reportar al autor** qué quedó publicado, con los links de prueba.
