import {
  recipeReferencePattern,
  recipeTemplatePattern,
  recipeResultFields,
} from "./recipe.constants.ts";
import {
  configurationInvariant,
  locateConfiguration,
} from "./configuration-diagnostic.ts";
import type {
  RecipeDocument,
  RecipeReference,
  RecipeStep,
  RecipeValue,
} from "./recipe.types.ts";
import type { Command } from "./command.types.ts";
import type { RecipeSourcePath } from "./recipes/expressions.types.ts";

export function recipeReferences(text: string): readonly RecipeReference[] {
  if (text.replace(recipeTemplatePattern, "").includes("{{"))
    throw new Error("Unclosed recipe reference");
  return [...text.matchAll(recipeTemplatePattern)].map((match) => {
    const source = match[0];
    const reference = recipeReferencePattern.exec(match[1]!.trim());
    if (!reference) throw new Error(`Invalid recipe reference: ${source}`);
    const [, kind, key, field] = reference;
    if (kind === "inputs" && !field) return { source, kind, key: key! };
    if (kind === "steps" && field) return { source, kind, key: key!, field };
    throw new Error(`Invalid recipe reference: ${source}`);
  });
}

/** Pairs each templated command string with its path under the task's `command` field. */
export function recipeCommandFields(
  command: Command,
): readonly (readonly [string, RecipeSourcePath])[] {
  return [
    [command.executable, ["executable"]],
    ...(command.arguments ?? []).map(
      (value, index) => [value, ["arguments", index]] as const,
    ),
    ...(command.stdin === undefined
      ? []
      : [[command.stdin, ["stdin"]] as const]),
    ...(command.directory === undefined
      ? []
      : [[command.directory, ["directory"]] as const]),
    ...Object.entries(command.variables ?? {}).map(
      ([name, value]) => [value, ["variables", name]] as const,
    ),
  ];
}

/** Checks format 2 references, locating each error at its task field through `sourcePath`. */
export function validateRecipeReferences(
  document: RecipeDocument,
  sourcePath: (task: RecipeStep) => RecipeSourcePath,
): void {
  if (document.version !== 2) return;
  const tasks = new Map(document.tasks.map((task) => [task.key, task]));
  for (const task of document.tasks) {
    const fields: readonly (readonly [string, RecipeSourcePath])[] = [
      ...(task.command
        ? recipeCommandFields(task.command).map(
            ([value, path]) => [value, ["command", ...path]] as const,
          )
        : []),
      ...(task.brief === undefined ? [] : [[task.brief, ["brief"]] as const]),
    ];
    for (const [text, field] of fields) {
      const path = [...sourcePath(task), ...field];
      const references = locateConfiguration(path, () =>
        recipeReferences(text),
      );
      for (const reference of references)
        validateReference(document, tasks, task, reference, path);
    }
  }
}

function validateReference(
  document: RecipeDocument,
  tasks: ReadonlyMap<string, RecipeStep>,
  task: RecipeStep,
  reference: RecipeReference,
  path: RecipeSourcePath,
): void {
  if (reference.kind === "inputs") {
    configurationInvariant(
      Object.hasOwn(document.inputs, reference.key),
      `Unknown recipe input in ${task.key}: ${reference.key}`,
      path,
      "unknown-input",
      `Declare inputs.${reference.key} in the recipe.`,
    );
    configurationInvariant(
      ["string", "number", "boolean"].includes(
        document.inputs[reference.key]!.type,
      ),
      `Text interpolation requires a scalar input: ${reference.key}`,
      path,
      "invalid-value",
    );
    return;
  }
  const dependency = tasks.get(reference.key);
  configurationInvariant(
    dependency && task.after.includes(reference.key),
    `Recipe step ${task.key} must declare ${reference.key} in after before referencing its output`,
    path,
    "missing-dependency",
    `Add ${reference.key} to after.`,
  );
  const fields: readonly string[] = dependency.command
    ? recipeResultFields.command
    : recipeResultFields.agent;
  configurationInvariant(
    fields.includes(reference.field!),
    `Unknown recipe output: ${reference.key}.${reference.field}`,
    path,
    "unknown-output",
    `Use one of: ${fields.join(", ")}.`,
  );
}

export function renderRecipeText(
  text: string,
  read: (reference: RecipeReference) => RecipeValue,
): string {
  const references = recipeReferences(text);
  let index = 0;
  return text.replace(recipeTemplatePattern, () => {
    const value = read(references[index++]!);
    if (value === null || typeof value === "object")
      throw new Error("Text interpolation requires a scalar value");
    return String(value);
  });
}

export function renderRecipeCommand(
  command: Command,
  render: (text: string) => string,
): Command {
  return {
    ...command,
    executable: render(command.executable),
    ...(command.arguments ? { arguments: command.arguments.map(render) } : {}),
    ...(command.stdin === undefined ? {} : { stdin: render(command.stdin) }),
    ...(command.directory === undefined
      ? {}
      : { directory: render(command.directory) }),
    ...(command.variables
      ? {
          variables: Object.fromEntries(
            Object.entries(command.variables).map(([key, value]) => [
              key,
              render(value),
            ]),
          ),
        }
      : {}),
  };
}
