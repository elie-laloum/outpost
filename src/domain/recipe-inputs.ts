import { checkpointValue } from "./workflow/checkpoint-value.ts";
import { canonicalJson } from "./workflow/canonical-json.ts";
import { recipeObject } from "./recipes/values.ts";

import {
  recipeInputTypes,
  recipeKeys,
  recipeNamePattern,
} from "./recipe.constants.ts";
import type { RecipeInput, RecipeValue } from "./recipe.types.ts";

export function recipeValue(
  value: unknown,
): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function recipeInputs(
  value: unknown,
  version = 2,
): Readonly<Record<string, RecipeInput>> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("recipe.inputs must be a mapping");
  return Object.fromEntries(
    Object.entries(value).map(([name, item]) => {
      if (!recipeNamePattern.test(name))
        throw new Error(`Invalid recipe input name: ${name}`);
      if (!item || typeof item !== "object" || Array.isArray(item))
        throw new Error(`inputs.${name} must be a mapping`);
      const fields = new Map(Object.entries(item));
      for (const key of fields.keys())
        if (
          !recipeKeys.input.some((allowed) => allowed === key) &&
          !(version === 3 && key === "schema")
        )
          throw new Error(`Unknown recipe field: inputs.${name}.${key}`);
      const type = fields.get("type");
      if (
        type !== "string" &&
        type !== "number" &&
        type !== "boolean" &&
        !(
          version === 3 &&
          (type === "object" || type === "array" || type === "null")
        )
      )
        throw new Error(
          `inputs.${name}.type must be ${recipeInputTypes.join(", ")}`,
        );
      const description = fields.get("description");
      if (typeof description !== "string" || !description.trim())
        throw new Error(`inputs.${name}.description must be a nonempty string`);
      const choices = fields.get("enum");
      if (
        choices !== undefined &&
        (!Array.isArray(choices) ||
          !choices.length ||
          !choices.every((value) => matchesRecipeInput(value, type)))
      )
        throw new Error(
          `inputs.${name}.enum must contain values of type ${type}`,
        );
      const defaultValue = fields.get("default");
      if (
        fields.has("default") &&
        (!matchesRecipeInput(defaultValue, type) ||
          (choices && !choices.some((value) => sameValue(value, defaultValue))))
      )
        throw new Error(`inputs.${name}.default must match its type and enum`);
      return [
        name,
        {
          type,
          description,
          ...(fields.has("default")
            ? { default: jsonInput(defaultValue) }
            : {}),
          ...(fields.has("schema")
            ? { schema: inputSchema(fields.get("schema")) }
            : {}),
          ...(choices ? { enum: choices } : {}),
        },
      ];
    }),
  );
}

export function resolveRecipeInputs(
  definitions: Readonly<Record<string, RecipeInput>>,
  supplied: Readonly<Record<string, RecipeValue>> = {},
): Readonly<Record<string, RecipeValue>> {
  for (const key of Object.keys(supplied))
    if (!Object.hasOwn(definitions, key))
      throw new Error(`Unknown recipe input: ${key}`);
  return Object.fromEntries(
    Object.entries(definitions).map(([name, definition]) => {
      const value = Object.hasOwn(supplied, name)
        ? supplied[name]
        : definition.default;
      if (value === undefined) throw new Error(`Missing recipe input: ${name}`);
      if (
        !matchesRecipeInput(value, definition.type) ||
        (definition.enum &&
          !definition.enum.some((choice) => sameValue(choice, value)))
      )
        throw new Error(
          `Invalid recipe input ${name}: expected ${definition.type}${definition.enum ? ` from ${JSON.stringify(definition.enum)}` : ""}`,
        );
      return [name, jsonInput(value)];
    }),
  );
}

function jsonInput(value: unknown): RecipeValue {
  if (recipeValue(value)) return value;
  const result = checkpointValue(value);
  if (result.kind !== "json")
    throw new Error("Recipe inputs require JSON values");
  return result.value;
}
function sameValue(left: unknown, right: unknown): boolean {
  return canonicalJson(jsonInput(left)) === canonicalJson(jsonInput(right));
}
function inputSchema(value: unknown): Readonly<Record<string, unknown>> {
  if (!recipeObject(value))
    throw new Error("Recipe input schema must be an object");
  return value;
}
export function matchesRecipeInput(value: unknown, type: string): boolean {
  try {
    jsonInput(value);
  } catch {
    return false;
  }
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return recipeObject(value);
  return typeof value === type;
}
