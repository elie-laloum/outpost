import type { JsonSchema } from "../tool.types.ts";

export function recipeObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function recipeRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!recipeObject(value)) throw new Error(`${label} must be a mapping`);
  return value;
}

export function recipeString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be a nonempty string`);
  return value;
}

export function recipeSchema(
  properties: Record<string, unknown>,
  required: readonly string[] = [],
): JsonSchema {
  return { type: "object", properties, required, additionalProperties: false };
}

export function recipeReference(value: unknown): string | undefined {
  if (!recipeObject(value) || !Object.hasOwn(value, "$ref")) return;
  if (Object.keys(value).length !== 1)
    throw new Error("A component reference must contain only $ref");
  return recipeString(value.$ref, "$ref");
}
