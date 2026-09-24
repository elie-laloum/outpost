import type {
  WorkflowCheckpointValue,
  WorkflowJson,
} from "./checkpoint.types.ts";

export function checkpointValue(value: unknown): WorkflowCheckpointValue {
  if (value === undefined) return { kind: "undefined" };
  return { kind: "json", value: jsonValue(value, new Set()) };
}

function jsonValue(value: unknown, ancestors: Set<object>): WorkflowJson {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return value;
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    !Object.is(value, -0)
  )
    return value;
  if (typeof value !== "object" || value === null || ancestors.has(value))
    throw new Error(
      "Checkpoint outputs must be lossless JSON values or top-level undefined",
    );
  const prototype: unknown = Object.getPrototypeOf(value);
  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  )
    throw new Error("Checkpoint outputs must contain plain JSON objects");
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype)
        throw new Error("Checkpoint arrays must have the standard prototype");
      if (Reflect.ownKeys(value).length !== value.length + 1)
        throw new Error(
          "Checkpoint arrays must be dense and have no extra properties",
        );
      return Array.from({ length: value.length }, (_, index) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          value,
          String(index),
        );
        if (!descriptor || !("value" in descriptor) || !descriptor.enumerable)
          throw new Error(
            "Checkpoint arrays must have enumerable data properties",
          );
        return jsonValue(descriptor.value, ancestors);
      });
    }
    const result: Record<string, WorkflowJson> = Object.create(null);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (
        typeof key !== "string" ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      )
        throw new Error(
          "Checkpoint objects must have enumerable string data properties",
        );
      result[key] = jsonValue(descriptor.value, ancestors);
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}
