import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const link = z.object({ label: z.string(), href: z.string() });
const links = z.object({ title: z.string(), links: z.array(link) });
const capability = z.object({
  title: z.string(),
  text: z.string(),
  icon: z.string(),
});
const landing = z.object({
  category: z.string(),
  headline: z.array(z.string()).min(1).max(3),
  lead: z.string(),
  primary: link,
  secondary: link,
  scenarios: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    requestLabel: z.string(),
    resultLabel: z.string(),
    note: z.string(),
    items: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z][a-z-]*$/),
          label: z.string(),
          icon: z.string(),
          title: z.string(),
          request: z.string(),
          steps: z
            .array(
              z.object({
                title: z.string(),
                text: z.string(),
                role: z.string(),
                icon: z.string(),
                mechanisms: z.array(link).min(1).max(2),
              }),
            )
            .length(4),
          result: z.string(),
          boundary: z.string(),
        }),
      )
      .min(2),
  }),
  overview: z.array(capability).length(3),
  closing: z.object({ title: z.string(), text: z.string(), link }),
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
  capabilities: z.object({
    title: z.string(),
    text: z.string(),
    items: z.array(capability).min(3).max(12),
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
