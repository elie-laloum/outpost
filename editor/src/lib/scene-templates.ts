import type {
  RecipeEditorCompatibility,
  RecipeEditorFeature,
  RecipeEditorZone,
} from "./types.ts";

type Declaration = Readonly<Record<string, unknown>>;

/** Workspace kinds offered by the palette; a named Git zone gets its own branch. */
export const workspaceTemplates: Readonly<
  Record<string, (name: string) => Declaration>
> = {
  git: (name) => ({
    kind: "git",
    repository: ".",
    branch: { mode: "named", name },
  }),
  ephemeral: () => ({ kind: "ephemeral" }),
  directory: () => ({ kind: "directory", directory: ".", access: "copy" }),
};

const sandboxTemplates: Readonly<Record<string, Declaration>> = {
  docker: { provider: "docker", image: "outpost-codex:dev" },
  podman: { provider: "podman", image: "outpost-codex:dev" },
};

export function sandboxTemplate(provider: string): Declaration {
  return sandboxTemplates[provider] ?? { provider };
}

const featureTemplates: Readonly<Record<RecipeEditorFeature, unknown>> = {
  branch: { mode: "current" },
  inputs: [{ directory: "." }],
  outputs: [{ paths: ["out"], destination: "./out", policy: "create" }],
  retention: { policy: "local" },
  variables: {},
  egress: { mode: "deny-all" },
  caches: [],
  volumes: [],
};

/** First value of a feature dropped on a zone; the inspector edits it afterwards. */
export function featureTemplate(
  feature: RecipeEditorFeature,
  zone: RecipeEditorZone,
): unknown {
  // Git workspaces on one repository each need their own branch.
  if (feature === "branch" && zone.name)
    return { mode: "named", name: zone.name };
  return featureTemplates[feature];
}

const componentTemplates: Readonly<Record<string, Declaration>> = {
  agents: { harness: "codex", authentication: "account" },
  transports: { type: "local", directory: "./state" },
};

export function componentTemplate(
  family: string,
  compatibility: RecipeEditorCompatibility | undefined,
): Declaration {
  const type = compatibility?.families[family]?.types[0];
  return componentTemplates[family] ?? (type ? { type } : {});
}

/** Singular name proposed for a new entry of a configuration family. */
export function componentName(family: string): string {
  return family.endsWith("ies")
    ? `${family.slice(0, -3)}y`
    : family.replace(/s$/, "");
}
