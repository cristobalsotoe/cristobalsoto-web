# Sitio bilingüe EN/ES — diseño

Fecha: 2026-11-03 · Estado: borrador para aprobación del autor

## Intención

El autor empezó su doctorado en UC Irvine (sept. 2026). Desde ahora, el público principal del sitio habla inglés: profesores, colegas y comités en EE.UU. Pero el público chileno (DGA, consultoras, colegas de la UFRO/UACh/UChile) sigue siendo importante, y hoy el sitio es una mezcla: el menú está en inglés, mientras que el home, el CV y Not CV están en español, y hay un post del blog en cada idioma.

Lo que pidió el autor, en sus palabras: **"el sitio idéntico en inglés y español, el mismo contenido, solo cambia el lenguaje"**, con **el inglés por defecto**, y **"un botón en la parte superior para cambiar entre idiomas"**.

El éxito se ve así: un profesor de Irvine entra a `cristobalsoto.com` y todo está en inglés, sin restos de español. Un colega chileno aprieta `ES` y ve exactamente lo mismo en español, en la misma página donde estaba.

## Contexto que ya existe (no rehacer)

- El dominio principal es `cristobalsoto.com` desde el commit `7e4a4f6`. `cristobalsoto.cl` lo sirve el repo aparte `cristobalsotoe/cristobalsoto-cl`: son páginas estáticas que redirigen, con `<meta refresh>` y JS, a la misma ruta en el .com. Ese repo tiene un stub `index.html` por cada ruta actual y un `404.html` que, vía JS, conserva la ruta para todo lo demás.
- Astro **4.16.18** instalado (el `package.json` pide `^4.4.13`); `@astrojs/sitemap` 3.3.0. El routing i18n nativo de Astro (`i18n` en `astro.config.mjs` y el módulo `astro:i18n`) está disponible en esta versión.
- Ver `CLAUDE.md` para el stack, la identidad visual "3DHome" y las convenciones.

## Decisiones del autor

1. **Mismo contenido en ambos idiomas.** Todo lo que se ve en un idioma existe en el otro, incluidos los posts del blog: el post en inglés se traduce al español y el post en español al inglés.
2. **Inglés por defecto.** Todos los visitantes entran en inglés.
3. **Botón de idioma en la barra superior** para cambiar entre EN y ES.
4. Aprobó en el chat (respondió "está bien, sigue así") el siguiente comportamiento, que yo propuse:
   - El botón lleva a **la misma página en el otro idioma**, no al home.
   - **Sin detección automática** del idioma del navegador.
   - **URLs:** el inglés usa las rutas actuales (`/work/`, `/blog/curvasidf2/`) y el español las mismas con prefijo `/es/` (`/es/work/`, `/es/blog/curvasidf2/`).
   - El post del temporal de julio, que hoy está en español en `/blog/curvasidf2/`, pasa a mostrarse en inglés en esa URL. El autor lo aceptó sabiendo que los links compartidos llevarán a la versión en inglés.
   - **Las traducciones las escribe el builder y el autor las revisa antes de publicar.**
   - **"El Pluviómetro"** conserva su nombre en ambos idiomas.
   - **`cristobalsoto.cl`** redirige a la versión **en español** (`.cl/<ruta>` → `.com/es/<ruta>`).
   - **Google:** cada página declara su gemela en el otro idioma (hreflang).

## Metas

- Cada página pública existe en inglés (en su URL actual) y en español (bajo `/es/`), con el mismo contenido.
- Un botón `EN | ES` en la barra superior (desktop) y en el menú desplegable (móvil) que lleva a la página gemela.
- `<html lang>` correcto en cada página. `hreflang` alternos `en`, `es` y `x-default` (que apunta al inglés). Sitemap con las dos versiones.
- Todos los textos de interfaz traducidos en ambos idiomas, incluidos los de las islas SolidJS: etiquetas, fechas, "min read", duraciones del CV, controles del diorama, texto para lectores de pantalla y `aria-label`.
- `cristobalsoto.cl/<ruta>` → `cristobalsoto.com/es/<ruta>`.

## No-metas

- Detección del idioma del navegador o redirección automática.
- Recordar la elección de idioma entre visitas. *(decisión mía: quien vuelve a `/` ve inglés. Es lo más simple y coherente con "inglés por defecto". Dentro de `/es/`, todos los links internos quedan en español, así que la navegación se mantiene en el idioma elegido.)*
- Cambiar contenido. Solo se traduce. Si el builder ve contenido desactualizado, lo anota y no lo corrige. Ejemplo: el CV tiene ICASS como "Present" y no incluye el doctorado en UC Irvine, mientras que el home dice que el doctorado empezó en sept. 2026.
- Traducir el relleno del template, que no es contenido real: las páginas `legal/*` (placeholders "[Your Company Name]"), los proyectos lorem ipsum de `/projects` y la colección `hobbies` (sin uso en ninguna página). *(decisión mía)* Se quedan como están, solo en inglés, y **sin versión `/es/`**. Por lo tanto, el botón de idioma no aparece en esas páginas.
- Rediseño visual, migración a Astro 5, optimización de imágenes y las otras deudas de `CLAUDE.md`.
- Un PDF del CV en español. La versión ES del CV enlaza el mismo PDF en inglés, con una etiqueta que lo indique, por ejemplo `PDF (EN) ↓`. *(decisión mía)*

## Anti-metas (fallaría aunque "funcione")

- **Romper URLs existentes.** Toda URL que hoy responde en `cristobalsoto.com` debe seguir respondiendo, ahora en inglés.
- **Que los idiomas se desalineen.** Un post o entrada del CV que exista en un idioma y no en el otro. El build debe fallar si a una entrada de contenido le falta su gemela; es la garantía de "idéntico" a futuro.
- **Publicar traducciones sin revisión del autor.** Nada llega a `master` (que despliega a producción) antes de que el autor lea las traducciones.
- **Traducciones que suenan a máquina** o que cambian el sentido técnico. El registro debe ser el del autor: cercano y directo en el home y el blog, sobrio en el CV. La terminología hidrológica es estándar: "periodo de retorno" ↔ "return period", "curvas IDF" ↔ "IDF curves", "datos grillados" ↔ "gridded data", "modelamiento integrado" ↔ "integrated modeling", PEGH sin traducir como sigla.
- **Que el botón te mande al home** en vez de a la página gemela.
- **Sumar un framework o librería de i18n** pesada. Bastan el i18n nativo de Astro y un diccionario propio.
- **Que quede español "colado" en la versión inglesa o viceversa.** Incluye `aria-label`, `alt`, `title` de los links y el texto `sr-only`.

## Restricciones

- **Astro 4 con la API legacy de content collections.** Nada de content layer v5.
- **Islas en SolidJS** (`CvTimeline.tsx`, `Landscape3D.tsx`, `Search*.tsx`). Reciben el idioma o los textos ya traducidos por props; no leen la URL por su cuenta.
- **GitHub Pages es 100% estático.** No hay negociación de idioma en el servidor ni redirecciones 301 propias. Todo se resuelve con rutas generadas.
- **`npm run build` (`astro check && astro build`) debe pasar.** Un error de tipos rompe el deploy.
- **El tema claro sigue por defecto** (`public/js/theme.js`). No tocarlo.
- **Rutas de imágenes siempre `/img/...`.** Las imágenes se comparten entre idiomas, no se duplican.
- **Push a `master` = producción.** El trabajo va en una rama (`bilingual`) y se mergea solo con la aprobación del autor.

## Inventario de lo que se traduce

Páginas con versión EN + ES:

| Ruta EN | Ruta ES | Fuente del texto |
|---|---|---|
| `/` | `/es/` | `src/pages/index.astro` (hero, "Lo más reciente", Acerca de mí, Conversemos) + `Landscape3D.tsx` |
| `/work/` | `/es/work/` | `src/pages/work/index.astro` (rótulo, toggle) + `CvTimeline.tsx` + `src/content/work/*.md` (incl. `classic.md`) |
| `/blog/` | `/es/blog/` | `src/pages/blog/index.astro` (masthead, fecha del día, kicker) |
| `/blog/<slug>/` | `/es/blog/<slug>/` | `src/pages/blog/[...slug].astro` + `src/content/blog/*.md` |
| `/not-cv/` | `/es/not-cv/` | `src/pages/not-cv/index.astro` |
| `/search/` | `/es/search/` | `src/pages/search/index.astro` + `Search.tsx` (placeholder). Cada idioma busca solo en sus propios posts. |
| `/rss.xml` | `/es/rss.xml` | `src/pages/rss.xml.ts`. Un feed por idioma, cada uno con sus posts. *(decisión mía)* |

Texto compartido por todas las páginas: `Header.astro`, `Drawer.astro`, `Footer.astro` ("Back to top", "All rights reserved"), `src/consts.ts` (`SITE.DESCRIPTION`, los `TITLE`/`DESCRIPTION` de cada página y las etiquetas de `LINKS`), `BaseHead.astro` (título del RSS) y `src/lib/utils.ts` (`formatDate` hoy fijo en `en-US`, `readingTime` hoy fijo en "min read").

Nombres que **no** se traducen: "El Pluviómetro" (aprobado), "Not CV" *(decisión mía: funciona como nombre de sección, igual que El Pluviómetro. El H1 "Las otras cuencas" sí se traduce)*, nombres propios de instituciones y proyectos, y el letrero del diorama "University of California, Irvine".

El link externo a CurvasIDF.cl se mantiene en ambos idiomas, con la etiqueta traducida ("IDF Curves" / "Curvas IDF").

## Contenido del blog y del CV

- Cada post existe en ambos idiomas con **el mismo slug**, para que el botón solo tenga que agregar o quitar `/es`.
- Cada entrada de `work` (incluida `classic.md`) existe en ambos idiomas.
- Los campos del frontmatter que son texto visible se traducen: `title`, `summary`, `source` (kicker: "Nota de campo" ↔ "Field note"), `tags`, `role`, `highlights`, las `label` de `links` y `location` cuando aplique. Las fechas, `image`, `href` y `category` son idénticas en ambas versiones.
- El campo `lang` del frontmatter del blog se vuelve redundante si el idioma sale de la estructura de carpetas. Que lo elimine o lo derive queda a criterio del builder, siempre que `astro check` pase.
- `dateEnd: "Present"` se muestra como "Present" o "Actualidad" según el idioma.

## Comportamiento del botón

- Se ve como `EN | ES`, con el idioma actual marcado. Va en el grupo de botones a la derecha de la barra superior (junto a búsqueda y tema) y, en móvil, dentro del drawer. Usa el estilo existente de esos botones: borde `mist`, `label`, hover `paper-raised`.
- Es un **link `<a>` real** a la URL gemela, no JS, con `hreflang` y `lang` en el destino y un `aria-label` en el idioma de destino ("View in English" / "Ver en español").
- En páginas sin gemela (legal, projects) no se muestra.

## SEO

- `<link rel="alternate" hreflang="en|es|x-default">` en cada página que tiene gemela. `x-default` apunta al inglés.
- El `canonical` de cada página apunta a sí misma, no a la versión inglesa.
- `og:locale` es `en_US` o `es_CL`.
- El sitemap incluye ambas versiones con sus alternos (`@astrojs/sitemap` tiene la opción `i18n`).

## Cambio en `cristobalsoto-cl` (repo aparte)

- Los stubs pasan a apuntar a `/es/<ruta>`: por ejemplo, `.cl/work/` → `.com/es/work/` y `.cl/` → `.com/es/`.
- El `404.html` antepone `/es` a la ruta (`.cl/x/y` → `.com/es/x/y`).
- Rutas sin versión ES (`legal/*`, `projects`) siguen yendo a su ruta en inglés.
- Hay que agregar los stubs de rutas que no estén cubiertas.
- Este cambio se publica **al mismo tiempo** que el sitio bilingüe, no antes: si `/es/` aún no existe, la redirección cae en 404.

## Revisión de las traducciones por el autor

- **Todo en la rama `bilingual`.** El autor revisa con `npm run dev` en local.
- Además, el builder le entrega una **lista de todos los textos traducidos**, agrupados por página, con el original al lado. Así puede revisar sin navegar todo el sitio.
- Se mergea a `master` solo cuando el autor da el OK. *(decisión mía sobre el formato de la revisión)*

## Lo que queda a criterio del builder

- **La arquitectura interna.** Por ejemplo:
  - cómo se organizan los archivos de contenido por idioma (subcarpetas `en/` y `es/` dentro de cada colección es lo natural);
  - si las páginas ES son archivos espejo delgados en `src/pages/es/` que reutilizan vistas compartidas, o rutas dinámicas;
  - la forma del diccionario de textos de interfaz (`src/i18n/` o similar).
- Cómo implementar la verificación "a toda entrada le corresponde su gemela", siempre que haga fallar el build.
- El formato exacto de fechas por locale (`en-US` / `es-CL`) y la pluralización.
- Si el título de `<head>` lleva el nombre del sitio igual en ambos idiomas.
- El orden de trabajo, siempre que nada llegue a `master` sin la revisión del autor.

## Criterios de aceptación

1. `npm run build` pasa.
2. Todas las URLs del sitemap actual responden 200 en inglés, y su gemela `/es/...` responde 200 en español (salvo legal/projects).
3. En ninguna página EN aparece texto visible en español, ni en ES texto en inglés. Se revisa también `aria-label`, `alt`, `title` y `sr-only`. Las excepciones son los nombres propios listados arriba.
4. El botón lleva desde cada página a su gemela exacta, ida y vuelta, en desktop y en móvil.
5. Si se borra la versión ES de un post, el build falla.
6. Cada página tiene `hreflang` correctos y `<html lang>` correcto.
7. `cristobalsoto.cl/work/` termina en `cristobalsoto.com/es/work/`.
8. El autor aprobó las traducciones.
