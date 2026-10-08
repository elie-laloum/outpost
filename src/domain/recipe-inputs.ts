import {
  recipeInputTypes,
  recipeKeys,
  recipeNamePattern,
} from "./recipe.constants.ts";
import type { RecipeInput, RecipeValue } from "./recipe.types.ts";

export function recipeValue(value: unknown): value is RecipeValue {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

export function recipeInputs(
  value: unknown,
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
        if (!recipeKeys.input.some((allowed) => allowed === key))
          throw new Error(`Unknown recipe field: inputs.${name}.${key}`);
      const type = fields.get("type");
      if (type !== "string" && type !== "number" && type !== "boolean")
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
          !choices.every(
            (value) => recipeValue(value) && typeof value === type,
          ))
      )
        throw new Error(
          `inputs.${name}.enum must contain values of type ${type}`,
        );
      const defaultValue = fields.get("default");
      if (
        fields.has("default") &&
        (!recipeValue(defaultValue) ||
          typeof defaultValue !== type ||
          (choices && !choices.includes(defaultValue)))
      )
        throw new Error(`inputs.${name}.default must match its type and enum`);
      return [
        name,
        {
          type,
          description,
          ...(recipeValue(defaultValue) ? { default: defaultValue } : {}),
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
        !recipeValue(value) ||
        typeof value !== definition.type ||
        (definition.enum && !definition.enum.includes(value))
      )
        throw new Error(
          `Invalid recipe input ${name}: expected ${definition.type}${definition.enum ? ` from ${JSON.stringify(definition.enum)}` : ""}`,
        );
      return [name, value];
    }),
  );
}
