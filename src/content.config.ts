import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One folder per project in content/projects/, one file per language: en.md, es.md, it.md.
// en.md carries every field; es.md / it.md only need what they translate (title, summary,
// kind, imageAlt / imageAlts, linkLabel, body) and inherit the rest. Defaults are applied in
// src/lib/projects.ts after merging, so a translation never resets an English value.
const projects = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      kind: z.string().optional(),
      year: z.number().int().optional(),
      tags: z.array(z.string()).optional(),
      // One image...
      image: image().optional(),
      imageAlt: z.string().optional(),
      // ...or several, shown as a carousel on the project page (the first one is the thumbnail).
      images: z.array(z.object({ src: image(), alt: z.string().optional() })).optional(),
      // Translations of the `images` alt texts, in the same order.
      imageAlts: z.array(z.string()).optional(),
      // Website or live app of the project.
      link: z.url().optional(),
      linkLabel: z.string().optional(),
      // Source code repository (GitHub, GitLab, ...).
      repo: z.url().optional(),
      external: z.boolean().optional(),
      glyph: z.string().optional(),
      color: z.enum(["blue", "orange", "teal", "amber", "violet", "slate"]).optional(),
      order: z.number().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = { projects };
