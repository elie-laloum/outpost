import { configurationError } from "../configuration-diagnostic.ts";
import { recipeKeys } from "../recipe.constants.ts";
import { SECRET_VARIABLE_NAME } from "../secrets.constants.ts";
import type { Command } from "../command.types.ts";

export function recipeMapping(
  value: unknown,
  path: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw configurationError(`${path} must be a mapping`, path);
  return Object.fromEntries(Object.entries(value));
}

export function recipeFields(
  value: unknown,
  path: string,
  keys: readonly string[],
): Record<string, unknown> {
  const record = recipeMapping(value, path);
  for (const key of Object.keys(record))
    if (!keys.includes(key))
      throw configurationError(
        `Unknown recipe field: ${path}.${key}`,
        `${path}.${key}`,
        "unknown-field",
      );
  return record;
}

export function recipeText(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim())
    throw configurationError(`${path} must be a nonempty string`, path);
  return value;
}

export function recipeStrings(value: unknown, path: string): string[] {
  if (!Array.isArray(value))
    throw configurationError(`${path} must be a list of strings`, path);
  return value.map((item, index) => {
    if (typeof item !== "string")
      throw configurationError(`${path}[${index}] must be a string`, path);
    return item;
  });
}

export function recipeInteger(
  value: unknown,
  path: string,
  minimum = 1,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum
  )
    throw configurationError(`${path} must be an integer >= ${minimum}`, path);
  return value;
}

/** Reads a recipe command; its strings stay unrendered until execution. */
export function recipeCommand(value: unknown, path: string): Command {
  const command = recipeFields(value, path, recipeKeys.command);
  const variables =
    command.variables === undefined
      ? undefined
      : recipeMapping(command.variables, `${path}.variables`);
  const environment =
    variables === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(variables).map(([name, value]) => {
            if (!SECRET_VARIABLE_NAME.test(name) || typeof value !== "string")
              throw configurationError(
                `${path}.variables requires variable names and string values`,
                path,
              );
            return [name, value];
          }),
        );
  if (command.stdin !== undefined && typeof command.stdin !== "string")
    throw configurationError(`${path}.stdin must be a string`, path);
  return {
    executable: recipeText(command.executable, `${path}.executable`),
    ...(command.arguments === undefined
      ? {}
      : { arguments: recipeStrings(command.arguments, `${path}.arguments`) }),
    ...(command.stdin === undefined ? {} : { stdin: command.stdin }),
    ...(command.directory === undefined
      ? {}
      : { directory: recipeText(command.directory, `${path}.directory`) }),
    ...(environment === undefined ? {} : { variables: environment }),
    ...(command.deadlineMs === undefined
      ? {}
      : {
          deadlineMs: recipeInteger(command.deadlineMs, `${path}.deadlineMs`),
        }),
  };
}
