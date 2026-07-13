import { defineCollection, z } from "astro:content"

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string().optional(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
    category: z.enum(["education", "experience", "classic"]),
    highlights: z.array(z.string()).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  }),
})

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    lang: z.enum(["es", "en"]).default("es"),
    source: z.string().optional(),
    image: z.string().optional(),
  }),
})

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
  }),
})

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
})

const hobbies = defineCollection({
  type: "content",
  schema: z.object({
    caption: z.string(),
    tag: z.string(),
    date: z.coerce.date(),
    image: z.string(),
  }),
})

export const collections = { work, blog, projects, legal, hobbies }
