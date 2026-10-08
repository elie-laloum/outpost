import { defineTask } from "./workflow.ts";
import type { RecipeDocument, RecipeStep } from "./recipe.types.ts";
import { recipeKeys, recipeLimits } from "./recipe.constants.ts";
import { recipeInputs } from "./recipe-inputs.ts";
import { validateRecipeReferences } from "./recipe-templates.ts";
import { SECRET_VARIABLE_NAME } from "./secrets.constants.ts";

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${path} must be a mapping`);
  return Object.fromEntries(Object.entries(value));
}

function fields(
  value: unknown,
  path: string,
  keys: readonly string[],
): Record<string, unknown> {
  const record = object(value, path);
  for (const key of Object.keys(record))
    if (!keys.includes(key))
      throw new Error(`Unknown recipe field: ${path}.${key}`);
  return record;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${path} must be a nonempty string`);
  return value;
}

function strings(value: unknown, path: string): string[] {
  if (!Array.isArray(value))
    throw new Error(`${path} must be a list of strings`);
  return value.map((item, index) => {
    if (typeof item !== "string")
      throw new Error(`${path}[${index}] must be a string`);
    return item;
  });
}

function integer(value: unknown, path: string, minimum = 1): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum
  )
    throw new Error(`${path} must be an integer >= ${minimum}`);
  return value;
}

function step(value: unknown, index: number): RecipeStep {
  const path = `tasks[${index}]`;
  const item = fields(value, path, recipeKeys.task);
  const key = text(item.key, `${path}.key`);
  const after =
    item.after === undefined ? [] : strings(item.after, `${path}.after`);
  if (new Set(after).size !== after.length)
    throw new Error(`${path}.after contains duplicate dependencies`);
  const timeoutMs =
    item.timeoutMs === undefined
      ? undefined
      : integer(item.timeoutMs, `${path}.timeoutMs`);
  const retry =
    item.retry === undefined
      ? undefined
      : fields(item.retry, `${path}.retry`, recipeKeys.retry);
  const common = {
    key,
    after,
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
    ...(retry === undefined
      ? {}
      : {
          retry: {
            attempts: integer(retry.attempts, `${path}.retry.attempts`),
            ...(retry.delayMs === undefined
              ? {}
              : {
                  delayMs: integer(retry.delayMs, `${path}.retry.delayMs`, 0),
                }),
          },
        }),
  };
  defineTask({ ...common, after: [], perform() {} });
  if (item.command !== undefined) {
    if (item.agent !== undefined || item.brief !== undefined)
      throw new Error(`${path} must select either command or agent with brief`);
    const command = fields(item.command, `${path}.command`, recipeKeys.command);
    const variables =
      command.variables === undefined
        ? undefined
        : object(command.variables, `${path}.command.variables`);
    const environment =
      variables === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries(variables).map(([name, value]) => {
              if (!SECRET_VARIABLE_NAME.test(name) || typeof value !== "string")
                throw new Error(
                  `${path}.command.variables requires variable names and string values`,
                );
              return [name, value];
            }),
          );
    if (command.stdin !== undefined && typeof command.stdin !== "string")
      throw new Error(`${path}.command.stdin must be a string`);
    return {
      ...common,
      command: {
        executable: text(command.executable, `${path}.command.executable`),
        ...(command.arguments === undefined
          ? {}
          : {
              arguments: strings(
                command.arguments,
                `${path}.command.arguments`,
              ),
            }),
        ...(command.stdin === undefined ? {} : { stdin: command.stdin }),
        ...(command.directory === undefined
          ? {}
          : {
              directory: text(command.directory, `${path}.command.directory`),
            }),
        ...(environment === undefined ? {} : { variables: environment }),
        ...(command.deadlineMs === undefined
          ? {}
          : {
              deadlineMs: integer(
                command.deadlineMs,
                `${path}.command.deadlineMs`,
              ),
            }),
      },
    };
  }
  return {
    ...common,
    agent: text(item.agent, `${path}.agent`),
    brief: text(item.brief, `${path}.brief`),
  };
}

export function validateRecipe(value: unknown): RecipeDocument {
  const mapping = object(value, "recipe");
  const record = fields(
    mapping,
    "recipe",
    mapping.version !== 1 ? recipeKeys.documentV2 : recipeKeys.document,
  );
  if (record.version !== 1 && record.version !== 2 && record.version !== 3)
    throw new Error("Recipe version must be 1, 2 or 3");
  const name = text(record.name, "recipe.name");
  if (
    !Array.isArray(record.tasks) ||
    !record.tasks.length ||
    record.tasks.length > recipeLimits.tasks
  )
    throw new Error("Recipe tasks must contain between 1 and 1000 entries");
  const tasks = record.tasks.map(step);
  const keys = new Set(tasks.map((task) => task.key));
  if (keys.size !== tasks.length)
    throw new Error("Recipe contains duplicate task keys");
  for (const task of tasks)
    for (const dependency of task.after)
      if (!keys.has(dependency))
        throw new Error(`Unknown recipe dependency: ${dependency}`);
  const ordered: RecipeStep[] = [];
  const remaining = new Set(tasks);
  const ready = new Set<string>();
  while (remaining.size) {
    const size = remaining.size;
    for (const task of remaining) {
      if (!task.after.every((key) => ready.has(key))) continue;
      ordered.push(task);
      ready.add(task.key);
      remaining.delete(task);
    }
    if (size === remaining.size)
      throw new Error("Recipe dependencies contain a cycle");
  }
  if (record.$schema !== undefined) text(record.$schema, "recipe.$schema");
  const document: RecipeDocument = {
    version: record.version,
    name,
    tasks: ordered,
    inputs: recipeInputs(record.inputs),
    ...(record.description === undefined
      ? {}
      : { description: text(record.description, "recipe.description") }),
    ...(record.recipeVersion === undefined
      ? {}
      : { recipeVersion: text(record.recipeVersion, "recipe.recipeVersion") }),
  };
  validateRecipeReferences(document);
  return document;
}
