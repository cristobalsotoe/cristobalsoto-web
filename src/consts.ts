import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Cristóbal Soto-Escobar",
  AUTHOR: "Cristóbal Soto-Escobar",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Links
export const LINKS: Links = [
  {
    KEY: "home",
    HREF: "/",
  },
  {
    KEY: "cv",
    HREF: "/work",
  },
  {
    KEY: "blog",
    HREF: "/blog",
  },
  {
    KEY: "notCv",
    HREF: "/not-cv",
  },
  {
    KEY: "idf",
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

