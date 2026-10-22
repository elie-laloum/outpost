import { configurationError } from "../configuration-diagnostic.ts";
import {
  recipeEditorFeaturePath,
  recipeEditorPlacement,
  recipeEditorScene,
} from "./editor-scene.ts";
import { recipeFamilies } from "./schema.constants.ts";
import { recipeObject } from "./values.ts";
import type { DocumentMutation } from "./editor.types.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";
import type {
  RecipeEditorCompatibility,
  RecipeEditorPlacement,
  RecipeEditorSceneDocuments,
  RecipeEditorSceneMutations,
  RecipeEditorSceneOperation,
  RecipeEditorScenePlanners,
  RecipeEditorZone,
} from "./editor-scene.types.ts";

const none: readonly DocumentMutation[] = [];

function fields(value: unknown): Readonly<Record<string, unknown>> {
  return recipeObject(value) ? value : {};
}

function tasks(recipe: unknown): readonly unknown[] {
  const list = fields(recipe).tasks;
  return Array.isArray(list) ? list : [];
}

function taskIndex(recipe: unknown, key: string): number {
  const index = tasks(recipe).findIndex((task) => fields(task).key === key);
  if (index < 0)
    throw configurationError(
      `Unknown task ${key}`,
      ["tasks"],
      "unknown-reference",
    );
  return index;
}

function zoneOf(
  documents: RecipeEditorSceneDocuments,
  id: string,
): RecipeEditorZone {
  const zone = recipeEditorScene(documents.recipe, documents.config).zones.find(
    (item) => item.id === id,
  );
  if (!zone)
    throw configurationError(
      `Unknown zone ${id}`,
      id.split("."),
      "unknown-reference",
    );
  return zone;
}

function permit(
  placement: RecipeEditorPlacement,
  path: RecipeSourcePath,
): void {
  if (!placement.allowed)
    throw configurationError(placement.reason, path, "invalid-placement");
}

function freeName(
  container: unknown,
  name: string,
  path: RecipeSourcePath,
): void {
  if (!/^[A-Za-z0-9_-]+$/.test(name))
    throw configurationError(
      `Invalid name ${name}`,
      [...path, name],
      "invalid-value",
      "Use letters, digits, hyphens and underscores.",
    );
  if (Object.hasOwn(fields(container), name))
    throw configurationError(
      `${[...path, name].join(".")} already exists`,
      [...path, name],
      "duplicate-key",
      "Choose a name that no other entry of this family uses.",
    );
}

function family(name: string): void {
  if (name !== "extensions" && !Object.hasOwn(recipeFamilies, name))
    throw configurationError(
      `Unknown configuration family ${name}`,
      [name],
      "unknown-reference",
    );
}

/** Deletes an entry and, when it was the last one, the family map holding it. */
function removal(
  document: unknown,
  path: RecipeSourcePath,
): readonly DocumentMutation[] {
  const parent = path.slice(0, -1);
  const siblings = Object.keys(
    fields(
      parent.reduce<unknown>((value, part) => fields(value)[part], document),
    ),
  );
  return siblings.length === 1 && parent.length
    ? [{ op: "delete", path: parent }]
    : [{ op: "delete", path }];
}

/** Paths of every `$ref` equal to `target`, outside `$literal` data. */
function referencePaths(
  value: unknown,
  path: RecipeSourcePath,
  target: string,
  found: RecipeSourcePath[],
): void {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      referencePaths(item, [...path, index], target, found);
    return;
  }
  if (!recipeObject(value) || Object.hasOwn(value, "$literal")) return;
  if (value.$ref === target) found.push([...path, "$ref"]);
  for (const [field, item] of Object.entries(value))
    if (field !== "$ref") referencePaths(item, [...path, field], target, found);
}

function retarget(
  document: unknown,
  from: string,
  to: string,
): DocumentMutation[] {
  const found: RecipeSourcePath[] = [];
  referencePaths(document, [], from, found);
  return found.map((path) => ({ op: "set", path, value: to }));
}

function sandboxTasks(recipe: unknown, name: string): number[] {
  return tasks(recipe).flatMap((task, index) =>
    fields(task).sandbox === name ? [index] : [],
  );
}

function workspaceSandboxes(config: unknown, workspace: string): string[] {
  return Object.entries(fields(fields(config).sandboxes)).flatMap(
    ([name, sandbox]) =>
      fields(fields(sandbox).workspace).$ref === workspace ? [name] : [],
  );
}

const planners: RecipeEditorScenePlanners = {
  "place-task": (documents, { key, zone }, compatibility) => {
    const index = taskIndex(documents.recipe, key);
    const scene = recipeEditorScene(documents.recipe, documents.config);
    permit(
      recipeEditorPlacement(
        scene,
        compatibility,
        { type: "task", id: key },
        { type: "zone", id: zone },
      ),
      ["tasks", index, "sandbox"],
    );
    const path = ["tasks", index, "sandbox"];
    if (zone !== "sandbox")
      return {
        recipe: [{ op: "set", path, value: zone.slice("sandboxes.".length) }],
        config: none,
      };
    return {
      recipe:
        fields(tasks(documents.recipe)[index]).sandbox === undefined
          ? none
          : [{ op: "delete", path }],
      config: none,
    };
  },
  "place-sandbox": (documents, { sandbox, workspace }, compatibility) => {
    const zone = zoneOf(documents, sandbox);
    const scene = recipeEditorScene(documents.recipe, documents.config);
    permit(
      recipeEditorPlacement(
        scene,
        compatibility,
        { type: "zone", id: sandbox },
        { type: "zone", id: workspace },
      ),
      [...zone.path, "workspace"],
    );
    if (zone.parent === workspace || !zone.name)
      return { recipe: none, config: none };
    const path = [...zone.path, "workspace"];
    return {
      recipe: none,
      config:
        workspace === "workspace"
          ? [{ op: "delete", path }]
          : [{ op: "set", path, value: { $ref: workspace }, flow: true }],
    };
  },
  "add-zone": (documents, { kind, name, declaration, workspace }) => {
    const root = kind === "workspace" ? "workspaces" : "sandboxes";
    const config = fields(documents.config);
    if (!name) {
      if (Object.hasOwn(config, kind))
        throw configurationError(
          `The configuration already declares ${kind}`,
          [kind],
          "duplicate-key",
        );
      return {
        recipe: none,
        config: [{ op: "set", path: [kind], value: declaration }],
      };
    }
    freeName(config[root], name, [root]);
    const opens =
      kind === "sandbox" && workspace && workspace !== "workspace"
        ? { workspace: { $ref: zoneOf(documents, workspace).id } }
        : {};
    return {
      recipe: none,
      config: [
        { op: "set", path: [root, name], value: { ...opens, ...declaration } },
      ],
    };
  },
  "remove-zone": (documents, { zone: id }) => {
    const zone = zoneOf(documents, id);
    if (!zone.declared) return { recipe: none, config: none };
    // Contents fall back to the configuration zone instead of disappearing.
    const recipe: DocumentMutation[] =
      zone.kind === "sandbox" && zone.name
        ? sandboxTasks(documents.recipe, zone.name).map((index) => ({
            op: "delete",
            path: ["tasks", index, "sandbox"],
          }))
        : [];
    const config: DocumentMutation[] =
      zone.kind === "workspace" && zone.name
        ? workspaceSandboxes(documents.config, zone.id).map((name) => ({
            op: "delete",
            path: ["sandboxes", name, "workspace"],
          }))
        : [];
    return {
      recipe,
      config: [...config, ...removal(documents.config, zone.path)],
    };
  },
  "rename-zone": (documents, { zone: id, to }) => {
    const zone = zoneOf(documents, id);
    if (!zone.name)
      throw configurationError(
        `The configuration ${zone.kind} has no name to change`,
        zone.path,
        "invalid-value",
      );
    if (zone.name === to) return { recipe: none, config: none };
    const root = zone.path[0]!;
    freeName(fields(documents.config)[root], to, [root]);
    const rename: DocumentMutation = { op: "rename", path: zone.path, to };
    if (zone.kind === "sandbox")
      return {
        recipe: sandboxTasks(documents.recipe, zone.name).map((index) => ({
          op: "set",
          path: ["tasks", index, "sandbox"],
          value: to,
        })),
        config: [rename],
      };
    return {
      recipe: none,
      config: [
        ...retarget(documents.config, zone.id, `workspaces.${to}`),
        rename,
      ],
    };
  },
  "set-feature": (documents, { zone: id, feature, value }, compatibility) => {
    const zone = zoneOf(documents, id);
    const path = recipeEditorFeaturePath(zone, feature);
    if (value === undefined)
      return {
        recipe: none,
        config: zone.features.includes(feature)
          ? [{ op: "delete", path }]
          : none,
      };
    if (!zone.features.includes(feature))
      permit(
        recipeEditorPlacement(
          recipeEditorScene(documents.recipe, documents.config),
          compatibility,
          { type: "feature", feature },
          { type: "zone", id },
        ),
        path,
      );
    return { recipe: none, config: [{ op: "set", path, value }] };
  },
  "add-entity": (documents, { family: name, name: entry, declaration }) => {
    family(name);
    freeName(fields(documents.config)[name], entry, [name]);
    return {
      recipe: none,
      config: [{ op: "set", path: [name, entry], value: declaration }],
    };
  },
  "remove-entity": (documents, { entity }) => {
    const scene = recipeEditorScene(documents.recipe, documents.config);
    const item = scene.entities.find((candidate) => candidate.id === entity);
    if (!item)
      throw configurationError(
        `Unknown entity ${entity}`,
        entity.split("."),
        "unknown-reference",
      );
    const users = scene.references.filter(
      (reference) => reference.target === entity,
    );
    if (users.length)
      throw configurationError(
        `${entity} is still referenced by ${users.map((user) => user.source).join(", ")}`,
        [item.family, item.name],
        "referenced-entity",
        "Remove or change those references first.",
      );
    return {
      recipe: none,
      config: removal(documents.config, [item.family, item.name]),
    };
  },
  "rename-entity": (documents, { entity, to }) => {
    const scene = recipeEditorScene(documents.recipe, documents.config);
    const item = scene.entities.find((candidate) => candidate.id === entity);
    if (!item)
      throw configurationError(
        `Unknown entity ${entity}`,
        entity.split("."),
        "unknown-reference",
      );
    if (item.name === to) return { recipe: none, config: none };
    freeName(fields(documents.config)[item.family], to, [item.family]);
    const target = `${item.family}.${to}`;
    const roles: DocumentMutation[] =
      item.family === "agents"
        ? tasks(documents.recipe).flatMap((task, index) =>
            fields(task).agent === item.name
              ? [{ op: "set", path: ["tasks", index, "agent"], value: to }]
              : [],
          )
        : [];
    return {
      recipe: [...retarget(documents.recipe, entity, target), ...roles],
      config: [
        ...retarget(documents.config, entity, target),
        { op: "rename", path: [item.family, item.name], to },
      ],
    };
  },
  extract: (documents, { role, path, family: name, name: entry }) => {
    family(name);
    freeName(fields(documents.config)[name], entry, [name]);
    const source = role === "recipe" ? documents.recipe : documents.config;
    const value = path.reduce<unknown>(
      (current, part) =>
        Array.isArray(current)
          ? current[Number(part)]
          : fields(current)[String(part)],
      source,
    );
    if (!recipeObject(value) || typeof value.$ref === "string")
      throw configurationError(
        "Only an inline component can become a named entity",
        path,
        "invalid-value",
      );
    const replace: DocumentMutation = {
      op: "set",
      path,
      value: { $ref: `${name}.${entry}` },
      flow: true,
    };
    const declare: DocumentMutation = {
      op: "set",
      path: [name, entry],
      value,
    };
    return role === "recipe"
      ? { recipe: [replace], config: [declare] }
      : { recipe: none, config: [declare, replace] };
  },
};

/** Plans the located mutations of one scene edit across the recipe and its configuration. */
export function planRecipeSceneEdit(
  documents: RecipeEditorSceneDocuments,
  operation: RecipeEditorSceneOperation,
  compatibility: RecipeEditorCompatibility,
): RecipeEditorSceneMutations {
  const plan = planners[operation.type] as RecipeEditorScenePlanners["extract"];
  return plan(documents, operation as never, compatibility);
}
