# cristobalsoto.com

Sitio personal de Cristóbal Soto (hidrólogo; PhD entrante en UC Irvine, sept. 2026). Construido con **Astro** + **Markdown/MDX** para el blog, desplegado en **GitHub Pages** con dominio custom.

## Stack

- Astro 4.4 (API legacy de content collections — no v5; migrar es una decisión deliberada, no automática)
- Tailwind CSS 3.4 + `@tailwindcss/typography`
- Islas interactivas en **SolidJS** (no React) — cualquier librería nueva de UI debe ser compatible con Solid o justificar sumar un segundo framework
- Contenido: `src/content/` con colecciones `blog`, `work`, `projects`, `legal` (schema en `src/content/config.ts`)
- Búsqueda: fuse.js (`src/components/Search.tsx`, `SearchCollection.tsx`)
- Build: `npm run build` corre `astro check && astro build` — un error de tipos o de contenido rompe el deploy completo
- Deploy: push a `master` → `.github/workflows/deploy.yml` → GitHub Pages. Dominio principal `cristobalsoto.com` (en `public/CNAME`, `site` de `astro.config.mjs` y la config de Pages del repo). DNS de ambos dominios en Namecheap; nic.cl solo delega nameservers.
- `cristobalsoto.cl` es un espejo: lo sirve el repo aparte `cristobalsotoe/cristobalsoto-cl` (páginas estáticas generadas por su `generate.mjs` que redirigen a la misma ruta en español del .com, `/es/<ruta>`; legal y projects van a la ruta en inglés). Si se agregan rutas nuevas importantes, sumarlas a `ROUTES` allí; el `404.html` cubre el resto vía JS.

## Estructura

```
src/
├── consts.ts        # metadata global, links de nav (incluye link externo a curvasidf.cl)
├── content/          # colecciones markdown (blog, work, projects, legal)
├── components/        # .astro estáticos + .tsx SolidJS interactivos
├── layouts/           # PageLayout, Top/BottomLayout, Article*Layout
├── pages/             # rutas: index, work (=CV), blog, projects, search, legal
└── styles/global.css
public/
├── doc/                # CV en PDF
├── img/                # imágenes (sin pasar por astro:assets/sharp todavía)
└── js/                 # scripts vanilla del template (theme, scroll, animate, copy, bg)
```

## Convenciones

- Posts de blog en `src/content/blog/{en,es}/*.md` (mismo nombre de archivo en ambos idiomas), frontmatter: `title`, `summary`, `date`, `tags: string[]`, `draft?`. Nunca usar rutas de filesystem absolutas en referencias a imágenes — siempre `/img/...`.
- El link a CurvasIDF.cl vive en `src/consts.ts` (`LINKS`) y se renderiza igual que los links internos de nav — es intencional, es la plataforma hermana del autor.
- No hay design tokens todavía (color/tipografía hardcodeados por Tailwind inline) — ver estado del rediseño abajo antes de tocar estilos.

## Rediseño "3DHome" — implementado

El rediseño está **implementado** (jul. 2026). Sistema: **"3DHome"** — una paleta base, cinco identidades de sección. Reglas clave:

- **Fondo claro por defecto** (decisión explícita del autor): `public/js/theme.js` fuerza `light` salvo que el usuario use el toggle. Nunca reintroducir dark-por-sistema.
- Tokens en `src/styles/global.css` (`--paper`, `--ink`, `--river`, `--clay`, `--gold`, etc.) + mapeo en `tailwind.config.mjs`. Tipografías self-hosted en `public/fonts/`: Instrument Serif (landmarks), Work Sans (cuerpo), IBM Plex Mono (etiquetas `.label`).
- **Home**: diorama-isla 3D (Three.js vanilla, `src/components/Landscape3D.tsx`) encapsulado en un marco redondeado; el 3D ocupa 100%, texto en capa izquierda (48%), foto de perfil como capa superior derecha. Referencia visual: diorama compacto donde todo se ve de una vez (luz cálida, sombras largas, araucarias, casitas Temuco → torre Irvine, cascada, nubes, pájaros). Auto manejable con flechas/WASD; mensaje del PhD al acercarse al letrero de Irvine.
- **CV** (`/work`): identidad "plano de ingeniería" (rótulo con borde grueso); timeline (`CvTimeline.tsx`) con línea de progreso al scroll, reveal animado, años como hitos, chips Educación (gold)/Experiencia (river), duración calculada; toggle a vista clásica (`work/{en,es}/classic.md`); PDF estático aparte en `public/doc/`.
- **Blog**: identidad "periódico" — masthead **"El Pluviómetro"**, fondo papel-de-diario fijo en ambos temas (`.ident-blog` en global.css), titulares Instrument Serif romana (no itálica), kickers rojos (`--news-accent`), capitular en el primer párrafo. Frontmatter: `source` (kicker) e `image` (portada) opcionales.
- **Hobbies**: identidad "estío" — polaroids rotados (`.ident-hobbies .polaroid`), acento gold, colección `hobbies` (caption/tag/date/image).

Pendiente no bloqueante: destino de `/projects` (vacío, fuera de la nav), migración a Astro 5, y el aviso cosmético "collection projects does not exist" en el build.

## Bilingüe EN/ES

El sitio es idéntico en inglés y español: **EN es el default** en las rutas de siempre y **ES vive bajo `/es/`** con el mismo slug. Sin i18n de Astro ni librerías: helpers propios.

- `src/i18n/`: `config.ts` (idiomas), `paths.ts` (`localizePath`, `twinPath`), `slugs.ts` (`postPath`, `assertTwins`), `content.ts` (`getLocalized`), `format.ts` (fechas, tiempo de lectura, duraciones) y **`ui.ts`, única fuente de los textos de interfaz** (tipado: EN y ES tienen las mismas claves; `ui.test.ts` lo verifica). Nunca escribir texto de interfaz directo en un componente.
- `src/views/*View.astro` reciben `lang`; las rutas de `src/pages/` (EN) y `src/pages/es/` (ES) son envoltorios de una línea. Las islas Solid reciben `lang` por props y no leen la URL.
- Contenido en `src/content/{blog,work}/{en,es}/`. **Todo post o entrada nueva se crea en ambos idiomas con el mismo nombre de archivo** (y el mismo `draft`): si falta la gemela, el build falla.
- Solo en inglés y sin botón de idioma: `legal/*`, `projects` y `hobbies` (`hasTwin={false}` en `PageLayout`).
- `npm run build` termina con `scripts/check-i18n.mjs` (gemelas, `<html lang>`, hreflang, botón de idioma, links que no cambian de idioma). `npm test` corre los tests de `src/i18n/`.
- `node scripts/translation-review.mjs` genera `.review/translation-review.html`: EN | ES lado a lado, con lo idéntico en amarillo, para revisar traducciones.
- Nombres que no se traducen: "El Pluviómetro", "Not CV", "Cristóbal Soto-Escobar", "University of California, Irvine" e instituciones y proyectos.
- El espejo `cristobalsoto.cl` lleva a la versión en español (`/es/<ruta>`) en el .com.

## Known issues / deuda pendiente

- `/projects` incluye proyectos "lorem ipsum" del template — no son contenido real (la búsqueda ya no los indexa).
- CV: `public/doc/2025_CV_Cristobal_Soto_EN.pdf` (mayo 2025) y el contenido de `src/content/work/{en,es}/` (feb 2026) están desalineados en fecha — es intencional (PDF es descarga estática, las entradas son la fuente de lo que se muestra en la página), pero conviene actualizar el PDF cuando el contenido cambie de forma relevante.
- Imágenes en `public/img/` sin optimizar (varias de 3–6 MB), aunque `sharp` ya está instalado y `astro:assets` no se usa.
- `ViewTransitions` importado pero comentado en `BaseHead.astro`, con listeners de `astro:after-swap`/`astro:before-swap` huérfanos — código a limpiar o completar, no dejar a medias.
- `_trash/` en `src/content/blog/` son posts demo del template excluidos por el prefijo `_` — peso muerto, se pueden eliminar.
