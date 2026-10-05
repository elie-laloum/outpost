import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const link = z.object({ label: z.string(), href: z.string() });
const links = z.object({ title: z.string(), links: z.array(link) });
const capability = z.object({
  title: z.string(),
  text: z.string(),
  href: z.string(),
});
const landing = z.object({
  category: z.string(),
  headline: z.array(z.string()).min(1).max(3),
  lead: z.string(),
  primary: link,
  secondary: link,
  story: z.object({
    label: z.string(),
    title: z.string(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          text: z.string(),
          role: z.string(),
          icon: z.enum(["approve", "agent", "ci", "branch"]),
          href: z.string(),
        }),
      )
      .length(4),
    result: z.object({
      label: z.string(),
      branch: z.string(),
      text: z.string(),
      href: z.string(),
    }),
    link,
  }),
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
