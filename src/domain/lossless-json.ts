import type { JsonValue, LosslessJsonOptions } from "./json.types.ts";

export function losslessJson(
  value: unknown,
  options: LosslessJsonOptions = {},
): JsonValue {
  return jsonValue(value, new Set(), options.label ?? "JSON value");
}

function jsonValue(
  value: unknown,
  ancestors: Set<object>,
  label: string,
): JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return value;
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Object.is(value, -0)
  )
    return value;
  if (typeof value !== "object" || value === null || ancestors.has(value))
    throw new Error(`${label} must be lossless JSON values`);
  const prototype: unknown = Object.getPrototypeOf(value);
  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  )
    throw new Error(`${label} must contain plain JSON objects`);
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype)
        throw new Error(`${label} arrays must have the standard prototype`);
      if (Reflect.ownKeys(value).length !== value.length + 1)
        throw new Error(
          `${label} arrays must be dense and have no extra properties`,
        );
      return Array.from({ length: value.length }, (_, index) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          value,
          String(index),
        );
        if (!descriptor || !("value" in descriptor) || !descriptor.enumerable)
          throw new Error(
            `${label} arrays must have enumerable data properties`,
          );
        return jsonValue(descriptor.value, ancestors, label);
      });
    }
    const result: Record<string, JsonValue> = Object.create(null);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (
        typeof key !== "string" ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      )
        throw new Error(
          `${label} objects must have enumerable string data properties`,
        );
      result[key] = jsonValue(descriptor.value, ancestors, label);
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}
