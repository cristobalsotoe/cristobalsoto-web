import type { Lang } from "./config"

// Única fuente de los textos de interfaz. Cada idioma se declara como UIStrings,
// así que una clave faltante rompe `astro check`; ui.test.ts además exige que
// todo esté traducido salvo los nombres que se repiten a propósito.

export type UIStrings = {
  /** aria-label del botón de idioma que lleva A este idioma */
  switchTo: string
  meta: {
    siteDescription: string
    homeTitle: string
    workDescription: string
    blogDescription: string
    notCvDescription: string
    searchTitle: string
    searchDescription: string
    rssTitle: string
  }
  nav: { home: string; cv: string; blog: string; notCv: string; idf: string }
  chrome: {
    searchAria: string
    themeAria: string
    drawerAria: string
    rssAria: string
    backToTop: string
    backToTopAria: string
    rights: string
    logoAlt: string
    socialOn: string
  }
  home: {
    role: string
    tagline: string
    dioramaNote: string
    ctaCv: string
    ctaBlog: string
    emailTitle: string
    orcidTitle: string
    photoBadge: string
    latestKicker: string
    readArticle: string
    aboutKicker: string
    aboutTitle: string
    /** párrafos con <b>, se renderizan con set:html */
    aboutHtml: string[]
    contactKicker: string
    contactTitle: string
  }
  diorama: {
    canvasAria: string
    hint: string
    srText: string
    forward: string
    left: string
    back: string
    right: string
    fallback: string
  }
  work: {
    kicker: string
    subtitle: string
    base: string
    origin: string
    pdfLabel: string
    viewTimeline: string
    viewClassic: string
    education: string
    experience: string
    present: string
    current: string
  }
  blog: {
    mastheadKicker: string
    place: string
    byline: string
    postByline: string
    noteFallback: string
    prev: string
    next: string
  }
  notCv: { title: string; intro: string; photosTitle: string; photosSub: string; photosCta: string }
  /** resultsOne/resultsMany usan {n} y {q}; se eligen con searchSummary (format.ts) */
  search: { placeholder: string; resultsOne: string; resultsMany: string }
}

const en: UIStrings = {
  switchTo: "View in English",
  meta: {
    siteDescription: "Hydrologist working on extreme precipitation and IDF curves in Chile. PhD student at UC Irvine.",
    homeTitle: "Home",
    workDescription: "Academic and professional history.",
    blogDescription: "Writing on topics I am passionate about.",
    notCvDescription: "Coffee, photography and the places I've been.",
    searchTitle: "Search",
    searchDescription: "Search all posts by keyword.",
    rssTitle: "Cristóbal Soto-Escobar — blog (English)",
  },
  nav: { home: "Home", cv: "CV", blog: "Blog", notCv: "Not CV", idf: "IDF Curves" },
  chrome: {
    searchAria: "Search blog posts",
    themeAria: "Toggle light and dark theme",
    drawerAria: "Toggle drawer open and closed",
    rssAria: "RSS feed",
    backToTop: "Back to top",
    backToTopAria: "Back to top of page",
    rights: "All rights reserved",
    logoAlt: "Cristóbal's logo",
    socialOn: "on",
  },
  home: {
    role: "Hydrologist · Irvine, California",
    tagline: "I study extreme precipitation and intensity-duration-frequency curves in Chile.",
    dioramaNote: "This diorama is the trip I already made: drive the car from the houses of Temuco to the Irvine sign.",
    ctaCv: "View CV",
    ctaBlog: "Read the blog",
    emailTitle: "Send an email",
    orcidTitle: "ORCID profile",
    photoBadge: "that's me",
    latestKicker: "Latest",
    readArticle: "Read the article",
    aboutKicker: "Who's writing",
    aboutTitle: "About me",
    aboutHtml: [
      "I'm a <b>civil engineer</b> specializing in <b>water resources</b>, and a researcher. My work focuses on the analysis of extreme precipitation events in a changing climate, the use of gridded data in hydrological studies, and integrated modeling of surface water and groundwater.",
      "I've worked on projects ranging from Strategic Water Management Plans with Chile's Dirección General de Aguas to the development of interactive web platforms and high-spatial-resolution Intensity-Duration-Frequency curves.",
      "I started my PhD at UC Irvine in September 2026. Before that, I worked as a consulting engineer at ICASS SpA, leading integrated modeling efforts.",
    ],
    contactKicker: "Email, social and profiles",
    contactTitle: "Let's talk",
  },
  diorama: {
    canvasAria: "Interactive 3D diorama: drive a car across an island between Temuco and Irvine",
    hint: "arrows or WASD to drive",
    srText: "Diorama of the journey from Temuco, Chile, to Irvine, California, where I'm doing my PhD at UC Irvine.",
    forward: "Forward",
    left: "Left",
    back: "Back",
    right: "Right",
    fallback: "From Temuco to Irvine — doing my PhD at UC Irvine.",
  },
  work: {
    kicker: "Professional record · Rev. 2026",
    subtitle: "Civil engineer specializing in water resources",
    base: "Base",
    origin: "Origin",
    pdfLabel: "PDF",
    viewTimeline: "Timeline",
    viewClassic: "Classic view",
    education: "Education",
    experience: "Experience",
    present: "present",
    current: "current",
  },
  blog: {
    mastheadKicker: "Notes on hydrology, climate and data",
    place: "Temuco — Irvine",
    byline: "by Cristóbal Soto-Escobar",
    postByline: "By Cristóbal Soto-Escobar",
    noteFallback: "Note",
    prev: "Previous",
    next: "Next",
  },
  notCv: {
    title: "The other watersheds",
    intro: "Coffee, photography, and places I've been. Less rigor, more walking.",
    photosTitle: "Photographs",
    photosSub: "The whole archive, on Lightroom.",
    photosCta: "Open the gallery",
  },
  search: {
    placeholder: "What are you looking for?",
    resultsOne: "Found {n} result for '{q}'",
    resultsMany: "Found {n} results for '{q}'",
  },
}

const es: UIStrings = {
  switchTo: "Ver en español",
  meta: {
    siteDescription: "Hidrólogo trabajando en precipitaciones extremas y curvas IDF en Chile. Estudiante de doctorado en UC Irvine.",
    homeTitle: "Inicio",
    workDescription: "Trayectoria académica y profesional.",
    blogDescription: "Escritos sobre temas que me apasionan.",
    notCvDescription: "Café, fotografía y los lugares donde he estado.",
    searchTitle: "Buscar",
    searchDescription: "Busca en todas las publicaciones por palabra clave.",
    rssTitle: "Cristóbal Soto-Escobar — blog (español)",
  },
  nav: { home: "Inicio", cv: "CV", blog: "Blog", notCv: "Not CV", idf: "Curvas IDF" },
  chrome: {
    searchAria: "Buscar publicaciones del blog",
    themeAria: "Cambiar entre tema claro y oscuro",
    drawerAria: "Abrir o cerrar el menú",
    rssAria: "Feed RSS",
    backToTop: "Volver arriba",
    backToTopAria: "Volver al inicio de la página",
    rights: "Todos los derechos reservados",
    logoAlt: "Logo de Cristóbal",
    socialOn: "en",
  },
  home: {
    role: "Hidrólogo · Irvine, California",
    tagline: "Investigo precipitaciones extremas y curvas intensidad-duración-frecuencia en Chile.",
    dioramaNote: "Este diorama es el viaje que ya hice: maneja el auto desde las casas de Temuco hasta el letrero de Irvine.",
    ctaCv: "Ver CV",
    ctaBlog: "Leer el blog",
    emailTitle: "Enviar Email",
    orcidTitle: "Perfil ORCID",
    photoBadge: "ese soy yo",
    latestKicker: "Lo más reciente",
    readArticle: "Leer el artículo",
    aboutKicker: "Quién escribe",
    aboutTitle: "Acerca de mí",
    aboutHtml: [
      "Soy <b>ingeniero civil</b>, especialista en <b>recursos hídricos</b> e investigador. Mi trabajo se centra en el análisis de eventos de precipitación extrema en un clima cambiante, el uso de datos grillados en estudios hidrológicos, y el modelamiento integrado de aguas superficiales y subterráneas.",
      "He participado en proyectos que van desde Planes Estratégicos de Gestión Hídrica con la Dirección General de Aguas de Chile hasta el desarrollo de plataformas web interactivas y curvas de Intensidad-Duración-Frecuencia de alta resolución espacial.",
      "Comencé mi doctorado en UC Irvine en septiembre de 2026. Antes trabajé como ingeniero consultor en ICASS SpA, liderando esfuerzos de modelamiento integrado.",
    ],
    contactKicker: "Correo, redes y perfiles",
    contactTitle: "Conversemos",
  },
  diorama: {
    canvasAria: "Diorama 3D interactivo: maneja un auto por una isla entre Temuco e Irvine",
    hint: "flechas o WASD para manejar",
    srText: "Diorama del viaje de Temuco, Chile, a Irvine, California, donde curso mi doctorado en UC Irvine.",
    forward: "Adelante",
    left: "Izquierda",
    back: "Atrás",
    right: "Derecha",
    fallback: "De Temuco a Irvine — cursando mi PhD en UC Irvine.",
  },
  work: {
    kicker: "Expediente profesional · Rev. 2026",
    subtitle: "Ingeniero civil, especialista en recursos hídricos",
    base: "Base",
    origin: "Origen",
    pdfLabel: "PDF (EN)",
    viewTimeline: "Línea de tiempo",
    viewClassic: "Vista clásica",
    education: "Educación",
    experience: "Experiencia",
    present: "presente",
    current: "actual",
  },
  blog: {
    mastheadKicker: "Notas de hidrología, clima y datos",
    place: "Temuco — Irvine",
    byline: "por Cristóbal Soto-Escobar",
    postByline: "Por Cristóbal Soto-Escobar",
    noteFallback: "Nota",
    prev: "Anterior",
    next: "Siguiente",
  },
  notCv: {
    title: "Las otras cuencas",
    intro: "Café, fotografía, y lugares donde he estado. Menos rigor, más caminata.",
    photosTitle: "Fotografías",
    photosSub: "Todo el archivo, en Lightroom.",
    photosCta: "Abrir la galería",
  },
  search: {
    placeholder: "¿Qué estás buscando?",
    resultsOne: "{n} resultado para '{q}'",
    resultsMany: "{n} resultados para '{q}'",
  },
}

export const ui: Record<Lang, UIStrings> = { en, es }
