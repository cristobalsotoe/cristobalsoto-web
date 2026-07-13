# cristobalsoto.cl

Sitio personal de Cristóbal Soto (hidrólogo; PhD entrante en UC Irvine, sept. 2026). Construido con **Astro** + **Markdown/MDX** para el blog, desplegado en **GitHub Pages** con dominio custom.

## Stack

- Astro 4.4 (API legacy de content collections — no v5; migrar es una decisión deliberada, no automática)
- Tailwind CSS 3.4 + `@tailwindcss/typography`
- Islas interactivas en **SolidJS** (no React) — cualquier librería nueva de UI debe ser compatible con Solid o justificar sumar un segundo framework
- Contenido: `src/content/` con colecciones `blog`, `work`, `projects`, `legal` (schema en `src/content/config.ts`)
- Búsqueda: fuse.js (`src/components/Search.tsx`, `SearchCollection.tsx`)
- Build: `npm run build` corre `astro check && astro build` — un error de tipos o de contenido rompe el deploy completo
- Deploy: push a `master` → `.github/workflows/deploy.yml` → GitHub Pages. Dominio en `public/CNAME`.

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

- Posts de blog en `src/content/blog/*.md`, frontmatter: `title`, `summary`, `date`, `tags: string[]`, `draft?`. Nunca usar rutas de filesystem absolutas en referencias a imágenes — siempre `/img/...`.
- El link a CurvasIDF.cl vive en `src/consts.ts` (`LINKS`) y se renderiza igual que los links internos de nav — es intencional, es la plataforma hermana del autor.
- No hay design tokens todavía (color/tipografía hardcodeados por Tailwind inline) — ver estado del rediseño abajo antes de tocar estilos.

## Rediseño "3DHome" — implementado

El rediseño está **implementado** (jul. 2026). Sistema: **"3DHome"** — una paleta base, cinco identidades de sección. Reglas clave:

- **Fondo claro por defecto** (decisión explícita del autor): `public/js/theme.js` fuerza `light` salvo que el usuario use el toggle. Nunca reintroducir dark-por-sistema.
- Tokens en `src/styles/global.css` (`--paper`, `--ink`, `--river`, `--clay`, `--gold`, etc.) + mapeo en `tailwind.config.mjs`. Tipografías self-hosted en `public/fonts/`: Instrument Serif (landmarks), Work Sans (cuerpo), IBM Plex Mono (etiquetas `.label`).
- **Home**: diorama-isla 3D (Three.js vanilla, `src/components/Landscape3D.tsx`) encapsulado en un marco redondeado; el 3D ocupa 100%, texto en capa izquierda (48%), foto de perfil como capa superior derecha. Referencia visual: diorama compacto donde todo se ve de una vez (luz cálida, sombras largas, araucarias, casitas Temuco → torre Irvine, cascada, nubes, pájaros). Auto manejable con flechas/WASD; mensaje del PhD al acercarse al letrero de Irvine.
- **CV** (`/work`): identidad "plano de ingeniería" (rótulo con borde grueso); timeline (`CvTimeline.tsx`) con línea de progreso al scroll, reveal animado, años como hitos, chips Educación (gold)/Experiencia (river), duración calculada; toggle a vista clásica (`work/classic.md`); PDF estático aparte en `public/doc/`.
- **Blog**: identidad "periódico" — masthead **"El Pluviómetro"**, fondo papel-de-diario fijo en ambos temas (`.ident-blog` en global.css), titulares Instrument Serif romana (no itálica), kickers rojos (`--news-accent`), capitular en el primer párrafo. Frontmatter: `lang`, `source` (kicker), `image` (portada) opcionales.
- **Hobbies**: identidad "estío" — polaroids rotados (`.ident-hobbies .polaroid`), acento gold, colección `hobbies` (caption/tag/date/image).

Pendiente no bloqueante: destino de `/projects` (vacío, fuera de la nav), migración a Astro 5, y el aviso cosmético "collection projects does not exist" en el build.

## Known issues / deuda pendiente

- Metadata de plantilla sin reemplazar en `src/consts.ts` (`AUTHOR`, `DESCRIPTION` siguen siendo los del theme original "Astro Sphere").
- `/projects` y el índice de búsqueda incluyen proyectos "lorem ipsum" del template — no son contenido real.
- Inconsistencia `www` vs apex entre `public/CNAME` y `site` en `astro.config.mjs`.
- CV: `public/doc/2025_CV_Cristobal_Soto_EN.pdf` (mayo 2025) y `src/content/work/cv.md` (feb 2026) están desalineados en fecha — es intencional (PDF es descarga estática, `cv.md` es la fuente de lo que se muestra en la página), pero conviene actualizar el PDF cuando el contenido cambie de forma relevante.
- Imágenes en `public/img/` sin optimizar (varias de 3–6 MB), aunque `sharp` ya está instalado y `astro:assets` no se usa.
- `ViewTransitions` importado pero comentado en `BaseHead.astro`, con listeners de `astro:after-swap`/`astro:before-swap` huérfanos — código a limpiar o completar, no dejar a medias.
- `_trash/` en `src/content/blog/` son posts demo del template excluidos por el prefijo `_` — peso muerto, se pueden eliminar.
