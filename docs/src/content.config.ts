import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const link = z.object({ label: z.string(), href: z.string() });
const links = z.object({ title: z.string(), links: z.array(link) });
const runtime = z.object({
  name: z.string(),
  href: z.string(),
  note: z.string(),
  experimental: z.boolean().optional(),
});
const pillar = z.object({ title: z.string(), text: z.string(), link });

const landing = z.object({
  headline: z.array(z.string()).length(3),
  lead: z.string(),
  install: z.object({
    command: z.string(),
    copy: z.string(),
    copied: z.string(),
  }),
  primary: link,
  secondary: link,
  facts: z.string(),
  reference: link,
  window: z.object({
    label: z.string(),
    copy: z.string(),
    example: z.string(),
    notes: z.object({
      run: z.string(),
      brief: z.string(),
      workflow: z.string(),
    }),
  }),
  run: pillar.extend({ caption: z.string() }),
  own: pillar.extend({
    ledger: z.array(z.object({ term: z.string(), detail: z.string() })),
  }),
  compose: pillar.extend({
    primitives: z.array(
      z.object({ name: z.string(), href: z.string(), detail: z.string() }),
    ),
  }),
  runtimes: z.object({
    title: z.string(),
    text: z.string(),
    agentsLabel: z.string(),
    sandboxesLabel: z.string(),
    experimental: z.string(),
    agents: z.array(runtime),
    sandboxes: z.array(runtime),
  }),
  workflow: z.object({
    title: z.string(),
    text: z.string(),
    stepsLabel: z.string(),
    steps: z.array(
      z.object({ title: z.string(), text: z.string(), lines: z.string() }),
    ),
    link,
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
