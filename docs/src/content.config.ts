import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const link = z.object({ label: z.string(), href: z.string() });
const links = z.object({ title: z.string(), links: z.array(link) });
const runtime = z.object({
  name: z.string(),
  href: z.string(),
  experimental: z.boolean().optional(),
});
const entry = z.object({
  title: z.string(),
  text: z.string(),
  href: z.string(),
});
const four = z.array(z.string()).length(4);
const lane = z.object({
  title: z.string(),
  context: z.string(),
  captions: four,
});

const landing = z.object({
  headline: z.array(z.string()).min(1).max(3),
  tagline: z.string(),
  lead: z.string(),
  hero: z.object({ caption: z.string() }),
  install: z.object({
    command: z.string(),
    copy: z.string(),
    copied: z.string(),
    prerequisites: z.string(),
    outcome: z.string(),
    next: z.string(),
  }),
  primary: link,
  secondary: link,
  facts: z.string(),
  evidence: z.array(z.string()).min(3).max(5),
  reference: link,
  useCases: z.object({
    title: z.string(),
    text: z.string(),
    link,
    entries: z.array(entry).min(3).max(4),
  }),
  demo: z.object({
    title: z.string(),
    pause: z.string(),
    replay: z.string(),
    beatsLabel: z.string(),
    beats: four,
    steps: four,
    owners: z.object({
      model: z.string(),
      code: z.string(),
      agent: z.string(),
    }),
    notes: z.object({
      early: z.string(),
      reread: z.string(),
      restored: z.string(),
    }),
    interrupted: z.string(),
    model: lane,
    code: lane,
  }),
  problem: z.object({
    title: z.string(),
    text: z.string(),
    link,
    answerLabel: z.string(),
    groups: z.array(
      z.object({
        title: z.string(),
        rows: z.array(
          z.object({
            pain: z.string(),
            detail: z.string(),
            answer: z.string(),
          }),
        ),
      }),
    ),
  }),
  determinism: z.object({
    title: z.string(),
    text: z.string(),
    link,
    replayLink: link,
    check: z.string(),
    demo: z.object({
      title: z.string(),
      run: z.string(),
      rerun: z.string(),
      replay: z.string(),
      calls: z.string(),
      columns: four,
      owners: z.object({ code: z.string(), agent: z.string() }),
      same: z.string(),
      varies: z.string(),
      replayed: z.string(),
      captions: z.object({ live: z.string(), replay: z.string() }),
      file: z.string(),
      files: z.string(),
      retry: z.string(),
      replayedNote: z.string(),
      failed: z.string(),
      merged: z.string(),
      announce: z.string(),
    }),
  }),
  runtimes: z.object({
    title: z.string(),
    text: z.string(),
    agentsLabel: z.string(),
    sandboxesLabel: z.string(),
    experimental: z.string(),
    agents: z.array(runtime),
    sandboxes: z.array(runtime),
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
