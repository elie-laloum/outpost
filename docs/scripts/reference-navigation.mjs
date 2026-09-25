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

export const referenceSidebar = sections.map(([label, entries]) => ({
  label,
  items: entries.map(([id, label]) => {
    const slug = `reference/overview/${id}`;
    const family = remaining.get(slug);
    if (!family) throw new Error(`Unknown or repeated reference family: ${id}`);
    remaining.delete(slug);
    return {
      label,
      collapsed: true,
      items: family.items,
    };
  }),
}));

if (remaining.size)
  throw new Error(
    `Reference families missing a section: ${[...remaining.keys()].join(", ")}`,
  );
