import families from "../reference-content/navigation.json" with { type: "json" };

const sections = [
  [
    "Environment",
    [
      ["workspaces", "Workspaces"],
      ["sandboxes", "Sandboxes"],
      ["providers", "Providers"],
      ["commands", "Commands"],
    ],
  ],
  [
    "Agents & models",
    [
      ["agents", "Agents"],
      ["harness", "Harness"],
      ["dispatch", "Dispatch"],
      ["prompts-responses", "Prompts"],
      ["conversations", "Conversations"],
      ["model-providers", "Models"],
    ],
  ],
  [
    "Orchestration",
    [
      ["workflows", "Workflows"],
      ["checkpoints", "Checkpoints"],
      ["approvals", "Gates"],
      ["artifacts", "Artifacts"],
      ["distributed-execution", "Queues"],
      ["triggers", "Triggers"],
      ["speculation", "Speculation"],
    ],
  ],
  [
    "Storage",
    [
      ["storage-transports", "Transports"],
      ["storage-reservations", "Reservations"],
    ],
  ],
  [
    "Operations",
    [
      ["diagnostics", "Diagnostics"],
      ["observability", "Observability"],
      ["resource-activity", "Activity"],
      ["errors", "Errors"],
      ["recovery-retention", "Retention"],
      ["recovery-restoration", "Recovery"],
    ],
  ],
];

const remaining = new Map(
  families.map((family) => [family.items[0].slug, family]),
);

// Reference map on the reference home: sections of families, each opened by its overview.
export const referenceFamilies = sections.map(([label, entries]) => ({
  label,
  families: entries.map(([id, label]) => {
    const slug = `reference/overview/${id}`;
    const family = remaining.get(slug);
    if (!family) throw new Error(`Unknown or repeated reference family: ${id}`);
    remaining.delete(slug);
    const [overview, ...symbols] = family.items;
    return { label, overview: overview.slug, symbols };
  }),
}));

if (remaining.size)
  throw new Error(
    `Reference families missing a section: ${[...remaining.keys()].join(", ")}`,
  );

export const referenceSidebar = referenceFamilies
  .flatMap((section) => section.families.flatMap((family) => family.symbols))
  .sort(
    (a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base" }) ||
      a.label.localeCompare(b.label, "en"),
  );
