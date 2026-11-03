import type { UIStrings } from "./i18n/ui"

export type Page = {
  TITLE: string
  DESCRIPTION: string
}

export type Site = {
  TITLE: string
  AUTHOR: string
}

export type Links = {
  KEY: keyof UIStrings["nav"]
  HREF: string
}[]

export type Socials = {
  NAME: string
  ICON: string
  TEXT: string
  HREF: string
}[]