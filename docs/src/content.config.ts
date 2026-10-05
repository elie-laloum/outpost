import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const link = z.object({ label: z.string(), href: z.string() });
const links = z.object({ title: z.string(), links: z.array(link) });
const landing = z.object({
  category: z.string(),
  headline: z.array(z.string()).min(1).max(3),
  lead: z.string(),
  primary: link,
  secondary: link,
  overview: z
    .array(z.object({ title: z.string(), text: z.string(), href: z.string() }))
    .length(3),
  install: z.object({
    managers: z.string(),
    commands: z
      .array(z.object({ label: z.string(), command: z.string() }))
      .min(2)
      .max(4),
    copy: z.string(),
    copied: z.string(),
    failed: z.string(),
    prerequisites: z.string(),
  }),
  next: z.object({
    title: z.string(),
    text: z.string(),
    guide: link,
    reference: link,
  }),
  footer: z.object({
    documentation: links,
    source: links,
    license: z.string(),
  }),
});

export const collections = {
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: z.object({ landing: landing.optional() }) }),
  }),
};
