import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Cristóbal Soto-Escobar",
  DESCRIPTION: "Hidrólogo trabajando en precipitaciones extremas y curvas IDF en Chile. PhD entrante en UC Irvine, septiembre 2026.",
  AUTHOR: "Cristóbal Soto-Escobar",
}

// Work Page
export const WORK: Page = {
  TITLE: "CV",
  DESCRIPTION: "Academic and professional history.",
}

// Hobbies Page
export const HOBBIES: Page = {
  TITLE: "Hobbies",
  DESCRIPTION: "Coffee, photography, and places I've been.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "CV",
    HREF: "/work",
  },
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  {
    TEXT: "Hobbies",
    HREF: "/hobbies",
  },
  {
    TEXT: "IDF Curves",
    HREF: "https://curvasidf.cl/",
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "cristobal.soto.9@gmail.com",
    HREF: "mailto:cristobal.soto.9@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "cristobalsotoe",
    HREF: "https://github.com/cristobalsotoe"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "Cristóbal Soto-Escobar",
    HREF: "https://www.linkedin.com/in/csoto24/",
  },
]

