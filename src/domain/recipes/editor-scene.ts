import { recipeEditorGraph } from "./editor.ts";
import {
  recipeEditorFeatures,
  recipeEditorSandboxActions,
  recipeEditorWorkspaceModes,
} from "./editor-scene.constants.ts";
import { recipeFamilies } from "./schema.constants.ts";
import { recipeObject } from "./values.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";
import type {
  RecipeEditorCompatibility,
  RecipeEditorEntity,
  RecipeEditorFeature,
  RecipeEditorFeatureDeclaration,
  RecipeEditorPlacement,
  RecipeEditorPlacementItem,
  RecipeEditorPlacementTarget,
  RecipeEditorPlacers,
  RecipeEditorReference,
  RecipeEditorScene,
  RecipeEditorSceneId,
  RecipeEditorSceneTask,
  RecipeEditorZone,
} from "./editor-scene.types.ts";

function fields(value: unknown): Readonly<Record<string, unknown>> {
  return recipeObject(value) ? value : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function at(document: unknown, path: RecipeSourcePath): unknown {
  return path.reduce<unknown>(
    (value, part) => (recipeObject(value) ? value[String(part)] : undefined),
    document,
  );
}

/** Visits every `$ref` below a value, skipping `$literal` data. */
function visitReferences(
  value: unknown,
  path: readonly string[],
  visit: (field: string, target: string) => void,
): void {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      visitReferences(item, [...path, String(index)], visit);
    return;
  }
  if (!recipeObject(value) || Object.hasOwn(value, "$literal")) return;
  if (typeof value.$ref === "string") {
    visit(path.join("."), value.$ref);
    return;
  }
  for (const [field, item] of Object.entries(value))
    visitReferences(item, [...path, field], visit);
}

/** Path of a zone feature; the configuration workspace keeps its outputs at the root. */
export function recipeEditorFeaturePath(
  zone: Pick<RecipeEditorZone, "kind" | "name" | "path">,
  feature: RecipeEditorFeature,
): RecipeSourcePath {
  if (feature === "outputs" && zone.kind === "workspace" && !zone.name)
    return ["outputs"];
  return [...zone.path, feature];
}

function zoneFeatures(
  configuration: unknown,
  zone: Pick<RecipeEditorZone, "kind" | "name" | "path">,
): RecipeEditorFeature[] {
  return Object.entries(recipeEditorFeatures).flatMap(([name, declaration]) => {
    const feature = name as RecipeEditorFeature;
    return declaration.zone === zone.kind &&
      at(configuration, recipeEditorFeaturePath(zone, feature)) !== undefined
      ? [feature]
      : [];
  });
}

/** Workspace zone a sandbox declaration opens. */
function openedWorkspace(sandbox: unknown): string {
  const reference = fields(fields(sandbox).workspace).$ref;
  return typeof reference === "string" && reference.startsWith("workspaces.")
    ? reference
    : "workspace";
}

function workspaceZone(
  configuration: Readonly<Record<string, unknown>>,
  name: string | undefined,
  declared: boolean,
): RecipeEditorZone {
  const path = name ? ["workspaces", name] : ["workspace"];
  const declaration = fields(at(configuration, path));
  const legacy = configuration.version !== 3 && !name ? "git" : undefined;
  const type = text(declaration.kind) ?? legacy;
  const mode = type ? recipeEditorWorkspaceModes[type] : undefined;
  const zone = {
    id: name ? `workspaces.${name}` : "workspace",
    kind: "workspace" as const,
    ...(name ? { name } : {}),
    path,
  };
  return {
    ...zone,
    ...(type ? { type } : {}),
    ...(mode ? { mode } : {}),
    features: zoneFeatures(configuration, zone),
    declared,
  };
}

function sandboxZone(
  configuration: Readonly<Record<string, unknown>>,
  name: string | undefined,
  declared: boolean,
): RecipeEditorZone {
  const path = name ? ["sandboxes", name] : ["sandbox"];
  const declaration = fields(at(configuration, path));
  const type = text(declaration.provider) ?? text(declaration.type);
  const zone = {
    id: name ? `sandboxes.${name}` : "sandbox",
    kind: "sandbox" as const,
    ...(name ? { name } : {}),
    path,
  };
  return {
    ...zone,
    parent: name ? openedWorkspace(declaration) : "workspace",
    ...(type ? { type } : {}),
    features: zoneFeatures(configuration, zone),
    declared,
  };
}

function sandboxTask(task: RecipeEditorSceneTask): boolean {
  return recipeEditorSandboxActions.some((action) => action === task.action);
}

function entity(family: string, name: string, value: unknown) {
  const declaration = fields(value);
  const kind =
    family === "extensions"
      ? (text(declaration.kind) ?? "extension")
      : (recipeFamilies[family] ?? family);
  const type = [declaration.type, declaration.harness].find(
    (item) => typeof item === "string",
  );
  return {
    id: `${family}.${name}`,
    family,
    name,
    kind,
    ...(typeof type === "string" ? { type } : {}),
  } satisfies RecipeEditorEntity;
}

/** Projects a draft recipe and its configuration into zones, tasks and entities, without validating them. */
export function recipeEditorScene(
  recipe: unknown,
  configuration: unknown,
): RecipeEditorScene {
  const config = fields(configuration);
  const steps = Array.isArray(fields(recipe).tasks)
    ? (fields(recipe).tasks as readonly unknown[])
    : [];
  const graph = recipeEditorGraph(recipe);
  const tasks = graph.nodes.map((node): RecipeEditorSceneTask => {
    const step = fields(steps[node.index]);
    if (!recipeEditorSandboxActions.some((action) => action === node.action))
      return node;
    const sandbox = text(step.sandbox);
    return { ...node, zone: sandbox ? `sandboxes.${sandbox}` : "sandbox" };
  });
  const named = {
    workspaces: Object.keys(fields(config.workspaces)),
    sandboxes: Object.entries(fields(config.sandboxes)),
  };
  const defaultSandbox =
    Object.hasOwn(config, "sandbox") ||
    tasks.some((task) => sandboxTask(task) && task.zone === "sandbox");
  const defaultWorkspace =
    defaultSandbox ||
    ["workspace", "repository"].some((key) => Object.hasOwn(config, key)) ||
    named.sandboxes.some(([, value]) => openedWorkspace(value) === "workspace");
  const zones = [
    ...(defaultWorkspace
      ? [workspaceZone(config, undefined, Object.hasOwn(config, "workspace"))]
      : []),
    ...named.workspaces.map((name) => workspaceZone(config, name, true)),
    ...(defaultSandbox
      ? [sandboxZone(config, undefined, Object.hasOwn(config, "sandbox"))]
      : []),
    ...named.sandboxes.map(([name]) => sandboxZone(config, name, true)),
  ];
  const entities = [...Object.keys(recipeFamilies), "extensions"].flatMap(
    (family) =>
      Object.entries(fields(config[family])).map(([name, value]) =>
        entity(family, name, value),
      ),
  );
  const known = new Set(entities.map((item) => item.id));
  const references: RecipeEditorReference[] = [];
  const reference =
    (source: RecipeEditorSceneId) => (field: string, target: string) => {
      if (known.has(target)) references.push({ source, target, field });
    };
  for (const task of tasks) {
    const step = fields(steps[task.index]);
    const visit = reference(`task:${task.id}`);
    for (const [field, value] of Object.entries(step))
      if (!["key", "after", "sandbox"].includes(field))
        visitReferences(value, [field], visit);
    if (task.action === "agent" && text(step.agent))
      visit("agent", `agents.${text(step.agent)}`);
  }
  for (const zone of zones) {
    const { workspace: _opened, ...declaration } = fields(
      at(config, zone.path),
    );
    visitReferences(
      zone.kind === "sandbox" && zone.name
        ? declaration
        : at(config, zone.path),
      [],
      reference(`zone:${zone.id}`),
    );
  }
  for (const item of entities)
    visitReferences(
      at(config, [item.family, item.name]),
      [],
      reference(`entity:${item.id}`),
    );
  const workflow = fields(recipe).workflow;
  visitReferences(workflow, [], reference("run"));
  return {
    tasks,
    edges: graph.edges,
    zones,
    entities,
    references,
    run: {
      options: Object.keys(fields(workflow)),
      environment: Object.keys(fields(config.environment)),
    },
  };
}

const allowed: RecipeEditorPlacement = { allowed: true };

function refused(reason: string): RecipeEditorPlacement {
  return { allowed: false, reason };
}

const placers: RecipeEditorPlacers = {
  task: (scene, _compatibility, { id }, target) => {
    const task = scene.tasks.find((item) => item.id === id);
    if (!task) return refused(`Unknown task ${id}`);
    if (sandboxTask(task))
      return target?.kind === "sandbox"
        ? allowed
        : refused("Command and agent tasks run in a sandbox zone");
    if (!target) return allowed;
    return refused(
      task.action === "isolated"
        ? "Isolated tasks open their own workspace and sandbox"
        : "Only command and agent tasks run in a sandbox; keep this task outside zones",
    );
  },
  zone: (scene, _compatibility, { id }, target) => {
    const zone = scene.zones.find((item) => item.id === id);
    if (!zone) return refused(`Unknown zone ${id}`);
    if (zone.kind === "workspace")
      return target ? refused("Workspaces stay at the top level") : allowed;
    if (target?.kind !== "workspace")
      return refused(
        "A sandbox opens a workspace; drop it in a workspace zone",
      );
    if (!zone.name && target.name)
      return refused(
        "The configuration sandbox always opens the configuration workspace",
      );
    return allowed;
  },
  feature: (_scene, compatibility, { feature }, target) => {
    const declaration: RecipeEditorFeatureDeclaration =
      recipeEditorFeatures[feature];
    if (target?.kind !== declaration.zone)
      return refused(`${feature} belongs to a ${declaration.zone} zone`);
    if (target.features.includes(feature))
      return refused(`${target.id} already declares ${feature}`);
    if (target.kind === "workspace") {
      const modes = declaration.modes ?? [];
      return target.mode && modes.includes(target.mode)
        ? allowed
        : refused(`${feature} requires a ${modes.join(" or ")} workspace`);
    }
    const accepted = target.type
      ? compatibility.providers[target.type]
      : undefined;
    return accepted?.includes(feature)
      ? allowed
      : refused(
          `Sandbox provider ${target.type ?? "reference"} does not accept ${feature}`,
        );
  },
};

/** Tells whether an item can be dropped on the canvas root or in a zone, and why not. */
export function recipeEditorPlacement(
  scene: RecipeEditorScene,
  compatibility: RecipeEditorCompatibility,
  item: RecipeEditorPlacementItem,
  target: RecipeEditorPlacementTarget,
): RecipeEditorPlacement {
  const zone =
    target.type === "zone"
      ? scene.zones.find((candidate) => candidate.id === target.id)
      : undefined;
  if (target.type === "zone" && !zone)
    return refused(`Unknown zone ${target.id}`);
  const place = placers[item.type] as RecipeEditorPlacers["task"];
  return place(scene, compatibility, item as never, zone);
}
