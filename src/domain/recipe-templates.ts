import {
  recipeReferencePattern,
  recipeTemplatePattern,
  recipeResultFields,
} from "./recipe.constants.ts";
import type {
  RecipeDocument,
  RecipeReference,
  RecipeValue,
} from "./recipe.types.ts";
import type { Command } from "./command.types.ts";

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

export function recipeCommandStrings(command: Command): readonly string[] {
  return [
    command.executable,
    ...(command.arguments ?? []),
    ...(command.stdin === undefined ? [] : [command.stdin]),
    ...(command.directory === undefined ? [] : [command.directory]),
    ...Object.values(command.variables ?? {}),
  ];
}

export function validateRecipeReferences(document: RecipeDocument): void {
  if (document.version !== 2) return;
  const tasks = new Map(document.tasks.map((task) => [task.key, task]));
  for (const task of document.tasks) {
    const strings = task.command
      ? recipeCommandStrings(task.command)
      : task.brief === undefined
        ? []
        : [task.brief];
    for (const reference of strings.flatMap(recipeReferences)) {
      if (reference.kind === "inputs") {
        if (!Object.hasOwn(document.inputs, reference.key))
          throw new Error(
            `Unknown recipe input in ${task.key}: ${reference.key}`,
          );
        if (
          !["string", "number", "boolean"].includes(
            document.inputs[reference.key]!.type,
          )
        )
          throw new Error(
            `Text interpolation requires a scalar input: ${reference.key}`,
          );
        continue;
      }
      const dependency = tasks.get(reference.key);
      if (!dependency || !task.after.includes(reference.key))
        throw new Error(
          `Recipe step ${task.key} must declare ${reference.key} in after before referencing its output`,
        );
      const fields: readonly string[] = dependency.command
        ? recipeResultFields.command
        : recipeResultFields.agent;
      if (!fields.includes(reference.field!))
        throw new Error(
          `Unknown recipe output: ${reference.key}.${reference.field}`,
        );
    }
  }
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
