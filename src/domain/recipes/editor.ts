import { configurationError } from "../configuration-diagnostic.ts";
import { recipeTemplatePattern } from "../recipe.constants.ts";
import { recipeActions } from "./actions.constants.ts";
import { recipeEditorLimits } from "./editor.constants.ts";
import { recipeObject } from "./values.ts";
import type { RecipeSourcePath } from "./expressions.types.ts";
import type {
  DocumentMutation,
  RecipeEditorAction,
  RecipeEditorEdge,
  RecipeEditorGraph,
  RecipeEditorLayout,
  RecipeEditorLayoutNode,
  RecipeEditorNode,
  RecipeEditorOperation,
  RecipeEditorPlanner,
  RecipeEditorPlanners,
  RecipeTaskRename,
} from "./editor.types.ts";
import type {
  RecipeEditorSceneLayoutUpdates,
  RecipeEditorSceneOperation,
} from "./editor-scene.types.ts";

function tasksOf(document: unknown): readonly unknown[] {
  if (!recipeObject(document) || !Array.isArray(document.tasks)) return [];
  return document.tasks;
}

function taskKey(task: unknown): string | undefined {
  return recipeObject(task) && typeof task.key === "string" && task.key
    ? task.key
    : undefined;
}

function dependencies(task: unknown): readonly string[] {
  if (!recipeObject(task) || !Array.isArray(task.after)) return [];
  return task.after.filter((item): item is string => typeof item === "string");
}

/** Resolves `steps.<target>` with the engine's longest-key rule, since keys may contain dots. */
function referencedStep(
  target: string,
  keys: readonly string[],
): string | undefined {
  return [...keys]
    .sort((a, b) => b.length - a.length)
    .find((key) => target === key || target.startsWith(`${key}.`));
}

function textSteps(text: string, keys: readonly string[]): readonly string[] {
  return [...text.matchAll(recipeTemplatePattern)].flatMap((match) => {
    const expression = match[1]!.trim();
    if (!expression.startsWith("steps.")) return [];
    const step = referencedStep(expression.slice("steps.".length), keys);
    return step === undefined ? [] : [step];
  });
}

function collectReferences(
  value: unknown,
  keys: readonly string[],
  steps: Set<string>,
  components: Set<string>,
): void {
  if (typeof value === "string") {
    for (const step of textSteps(value, keys)) steps.add(step);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectReferences(item, keys, steps, components);
    return;
  }
  if (!recipeObject(value) || Object.hasOwn(value, "$literal")) return;
  if (typeof value.$step === "string") steps.add(value.$step);
  if (typeof value.$ref === "string") components.add(value.$ref);
  for (const [field, item] of Object.entries(value))
    if (field !== "$step" && field !== "$ref")
      collectReferences(item, keys, steps, components);
}

function summary(
  task: Readonly<Record<string, unknown>>,
  action: RecipeEditorAction | undefined,
): string {
  const command = task.command;
  if (action === "command" && recipeObject(command)) {
    const words = [
      command.executable,
      ...(Array.isArray(command.arguments) ? command.arguments : []),
    ];
    return words
      .filter((word) => typeof word === "string")
      .join(" ")
      .slice(0, recipeEditorLimits.summary);
  }
  if (action === "agent" && typeof task.agent === "string") return task.agent;
  return action ?? "";
}

function node(
  task: unknown,
  index: number,
  id: string,
  keys: readonly string[],
) {
  const fields: Readonly<Record<string, unknown>> = recipeObject(task)
    ? task
    : {};
  const actions = recipeActions.filter(
    (action) => fields[action] !== undefined,
  );
  const action = actions.length === 1 ? actions[0] : undefined;
  const steps = new Set<string>(),
    components = new Set<string>();
  for (const [field, value] of Object.entries(fields))
    if (field !== "key" && field !== "after")
      collectReferences(value, keys, steps, components);
  const key = taskKey(task);
  return {
    node: {
      id,
      ...(key === undefined ? {} : { key }),
      index,
      ...(action === undefined ? {} : { action }),
      actions,
      summary: summary(fields, action),
      conditional: fields.when !== undefined,
      components: [...components].sort(),
    } satisfies RecipeEditorNode,
    steps,
  };
}

/** Projects a draft recipe into canvas nodes and edges without validating it. */
export function recipeEditorGraph(document: unknown): RecipeEditorGraph {
  const tasks = tasksOf(document);
  const counts = new Map<string, number>();
  for (const task of tasks) {
    const key = taskKey(task);
    if (key !== undefined) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = [...counts.keys()];
  const ids = tasks.map((task, index) => {
    const key = taskKey(task);
    return key !== undefined && counts.get(key) === 1 ? key : `#${index}`;
  });
  const unique = new Set(ids.filter((id) => !id.startsWith("#")));
  const nodes: RecipeEditorNode[] = [];
  const edges: RecipeEditorEdge[] = [];
  for (const [index, task] of tasks.entries()) {
    const projected = node(task, index, ids[index]!, keys);
    nodes.push(projected.node);
    const after = dependencies(task);
    for (const source of after)
      if (unique.has(source))
        edges.push({ source, target: ids[index]!, kind: "after" });
    for (const source of projected.steps)
      if (unique.has(source) && !after.includes(source))
        edges.push({ source, target: ids[index]!, kind: "data" });
  }
  return { nodes, edges };
}

function locate(document: unknown, key: string): number {
  const index = tasksOf(document).findIndex((task) => taskKey(task) === key);
  if (index < 0)
    throw configurationError(
      `Unknown task ${key}`,
      ["tasks"],
      "unknown-reference",
    );
  return index;
}

function validKey(document: unknown, key: string, path: RecipeSourcePath) {
  if (!key.trim())
    throw configurationError(
      "Task key must not be empty",
      path,
      "invalid-value",
    );
  if (tasksOf(document).some((task) => taskKey(task) === key))
    throw configurationError(
      `Task ${key} already exists`,
      path,
      "duplicate-key",
      "Choose a key that no other task uses.",
    );
}

function dependsOn(document: unknown, start: string, target: string): boolean {
  const tasks = new Map(
    tasksOf(document).flatMap((task) => {
      const key = taskKey(task);
      return key === undefined ? [] : [[key, dependencies(task)] as const];
    }),
  );
  const seen = new Set<string>();
  const pending = [start];
  while (pending.length) {
    const current = pending.pop()!;
    if (current === target) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    pending.push(...(tasks.get(current) ?? []));
  }
  return false;
}

function renameText(
  text: string,
  from: string,
  to: string,
  keys: readonly string[],
): string {
  return text.replace(recipeTemplatePattern, (source, inner: string) => {
    const expression = inner.trim();
    if (!expression.startsWith("steps.")) return source;
    if (referencedStep(expression.slice("steps.".length), keys) !== from)
      return source;
    return source.replace(`steps.${from}`, `steps.${to}`);
  });
}

function renameReferences(
  value: unknown,
  path: RecipeSourcePath,
  rename: RecipeTaskRename,
  mutations: DocumentMutation[],
): void {
  if (typeof value === "string") {
    const text = renameText(value, rename.from, rename.to, rename.keys);
    if (text !== value) mutations.push({ op: "set", path, value: text });
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries())
      renameReferences(item, [...path, index], rename, mutations);
    return;
  }
  if (!recipeObject(value) || Object.hasOwn(value, "$literal")) return;
  if (value.$step === rename.from)
    mutations.push({ op: "set", path: [...path, "$step"], value: rename.to });
  for (const [field, item] of Object.entries(value))
    if (field !== "$step")
      renameReferences(item, [...path, field], rename, mutations);
}

function removeDependency(
  task: unknown,
  index: number,
  source: string,
): DocumentMutation[] {
  const after =
    recipeObject(task) && Array.isArray(task.after) ? task.after : [];
  const positions = after.flatMap((item, position) =>
    item === source ? [position] : [],
  );
  if (!positions.length) return [];
  if (positions.length === after.length)
    return [{ op: "delete", path: ["tasks", index, "after"] }];
  return positions.reverse().map((position) => ({
    op: "delete",
    path: ["tasks", index, "after", position],
  }));
}

const planners: RecipeEditorPlanners = {
  "add-task": (document, { task, index }) => {
    const key = taskKey(task);
    if (key === undefined)
      throw configurationError(
        "A new task requires a key",
        ["tasks"],
        "missing-field",
      );
    validKey(document, key, ["tasks"]);
    const tasks = tasksOf(document);
    if (tasks.length >= recipeEditorLimits.tasks)
      throw configurationError(
        `A recipe accepts at most ${recipeEditorLimits.tasks} tasks`,
        ["tasks"],
      );
    if (!recipeObject(document) || !Array.isArray(document.tasks))
      return [{ op: "set", path: ["tasks"], value: [task] }];
    const position = Math.max(0, Math.min(index ?? tasks.length, tasks.length));
    return [{ op: "insert", path: ["tasks"], index: position, value: task }];
  },
  "remove-task": (document, { key }) => {
    const index = locate(document, key);
    const tasks = tasksOf(document);
    return [
      ...tasks.flatMap((task, position) =>
        position === index ? [] : removeDependency(task, position, key),
      ),
      { op: "delete", path: ["tasks", index] },
    ];
  },
  "rename-task": (document, { key, to }) => {
    if (key === to) return [];
    const index = locate(document, key);
    validKey(document, to, ["tasks", index, "key"]);
    const keys = tasksOf(document).flatMap((task) => taskKey(task) ?? []);
    const mutations: DocumentMutation[] = [
      { op: "set", path: ["tasks", index, "key"], value: to },
    ];
    for (const [position, task] of tasksOf(document).entries()) {
      if (!recipeObject(task)) continue;
      for (const [entry, source] of dependencies(task).entries())
        if (source === key)
          mutations.push({
            op: "set",
            path: ["tasks", position, "after", entry],
            value: to,
          });
      for (const [field, value] of Object.entries(task))
        if (field !== "key" && field !== "after")
          renameReferences(
            value,
            ["tasks", position, field],
            { from: key, to, keys },
            mutations,
          );
    }
    return mutations;
  },
  "move-task": (document, { key, index }) => {
    const from = locate(document, key);
    const to = Math.max(0, Math.min(index, tasksOf(document).length - 1));
    return from === to ? [] : [{ op: "move", path: ["tasks"], from, to }];
  },
  connect: (document, { source, target }) => {
    locate(document, source);
    const index = locate(document, target);
    if (source === target)
      throw configurationError(
        `Task ${source} cannot depend on itself`,
        ["tasks", index, "after"],
        "dependency-cycle",
      );
    const task = tasksOf(document)[index];
    const after = dependencies(task);
    if (after.includes(source)) return [];
    if (dependsOn(document, source, target))
      throw configurationError(
        `Connecting ${source} to ${target} would create a dependency cycle`,
        ["tasks", index, "after"],
        "dependency-cycle",
        `${source} already runs after ${target}.`,
      );
    if (!recipeObject(task) || !Array.isArray(task.after))
      return [
        {
          op: "set",
          path: ["tasks", index, "after"],
          value: [source],
          flow: true,
        },
      ];
    return [
      {
        op: "insert",
        path: ["tasks", index, "after"],
        index: task.after.length,
        value: source,
      },
    ];
  },
  disconnect: (document, { source, target }) => {
    const index = locate(document, target);
    return removeDependency(tasksOf(document)[index], index, source);
  },
  set: (_document, { path, value }) => {
    if (!path.length)
      throw configurationError("A change requires a path", [], "invalid-value");
    return value === undefined
      ? [{ op: "delete", path }]
      : [{ op: "set", path, value }];
  },
};

/** Plans located YAML mutations for one canvas or form edit; the draft is never modified. */
export function planRecipeEdit(
  document: unknown,
  operation: RecipeEditorOperation,
): readonly DocumentMutation[] {
  const plan = planners[operation.type] as RecipeEditorPlanner;
  return plan(document, operation);
}

const emptyLayout: RecipeEditorLayout = { version: 2, nodes: {} };

function layoutNode(value: unknown): RecipeEditorLayoutNode | undefined {
  if (
    !recipeObject(value) ||
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y)
  )
    return undefined;
  const sized = [value.width, value.height].every(
    (size) => Number.isFinite(size) && Number(size) > 0,
  );
  return {
    x: Number(value.x),
    y: Number(value.y),
    ...(sized
      ? { width: Number(value.width), height: Number(value.height) }
      : {}),
    ...(value.collapsed === true ? { collapsed: true } : {}),
  };
}

/** Reads a saved layout, keeping only well-formed entries; version 1 keys become task ids. */
export function recipeEditorLayout(value: unknown): RecipeEditorLayout {
  if (!recipeObject(value) || !recipeObject(value.nodes)) return emptyLayout;
  const legacy = value.version === 1;
  if (!legacy && value.version !== 2) return emptyLayout;
  const nodes = Object.entries(value.nodes).flatMap(([key, entry]) => {
    const node = layoutNode(entry);
    return node ? [[legacy ? `task:${key}` : key, node] as const] : [];
  });
  return { version: 2, nodes: Object.fromEntries(nodes) };
}

function renameNode(
  layout: RecipeEditorLayout,
  from: string,
  to: string,
): RecipeEditorLayout {
  const node = layout.nodes[from];
  if (node === undefined) return layout;
  const { [from]: _renamed, ...nodes } = layout.nodes;
  return { version: 2, nodes: { ...nodes, [to]: node } };
}

function removeNode(
  layout: RecipeEditorLayout,
  id: string,
): RecipeEditorLayout {
  const { [id]: _removed, ...nodes } = layout.nodes;
  return { version: 2, nodes };
}

/** Keeps saved positions aligned with a rename or removal planned on the recipe. */
export function updateRecipeEditorLayout(
  layout: RecipeEditorLayout,
  operation: RecipeEditorOperation,
): RecipeEditorLayout {
  if (operation.type === "remove-task")
    return removeNode(layout, `task:${operation.key}`);
  if (operation.type !== "rename-task") return layout;
  return renameNode(layout, `task:${operation.key}`, `task:${operation.to}`);
}

function sibling(id: string, name: string): string {
  return `${id.slice(0, id.lastIndexOf(".") + 1)}${name}`;
}

const sceneLayoutUpdates: RecipeEditorSceneLayoutUpdates = {
  "remove-zone": (layout, { zone }) => removeNode(layout, `zone:${zone}`),
  "remove-entity": (layout, { entity }) =>
    removeNode(layout, `entity:${entity}`),
  "rename-zone": (layout, { zone, to }) =>
    renameNode(layout, `zone:${zone}`, `zone:${sibling(zone, to)}`),
  "rename-entity": (layout, { entity, to }) =>
    renameNode(layout, `entity:${entity}`, `entity:${sibling(entity, to)}`),
};

/** Keeps saved positions aligned with a zone or entity rename or removal. */
export function updateRecipeEditorSceneLayout(
  layout: RecipeEditorLayout,
  operation: RecipeEditorSceneOperation,
): RecipeEditorLayout {
  const update = sceneLayoutUpdates[operation.type] as
    RecipeEditorSceneLayoutUpdates["rename-zone"] | undefined;
  return update ? update(layout, operation as never) : layout;
}
