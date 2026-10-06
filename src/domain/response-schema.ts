import { OutpostError, invariant } from "./errors.ts";
import { isStandardJsonSchema } from "./standard-schema.ts";
import { STANDARD_JSON_SCHEMA_TARGET } from "./standard-schema.constants.ts";
import type { JsonResponseOptions } from "./response.types.ts";
import type { JsonSchema } from "./tool.types.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";
import { inputObject } from "./workflow/input-validation.ts";

export function responseJsonSchema<T>(
  options: JsonResponseOptions<T>,
): JsonSchema {
  try {
    if (options.jsonSchema !== undefined)
      return snapshotResponseSchema(options.jsonSchema);
    invariant(
      isStandardJsonSchema(options.schema),
      "JSON responses require jsonSchema or a Standard JSON Schema converter",
    );
    return snapshotResponseSchema(
      options.schema["~standard"].jsonSchema.input({
        target: STANDARD_JSON_SCHEMA_TARGET,
      }),
    );
  } catch (cause) {
    throw new OutpostError(
      "configuration",
      "JSON responses require a lossless JSON Schema object; provide jsonSchema when automatic conversion is unavailable",
      {},
      cause,
    );
  }
}

export function snapshotResponseSchema(schema: unknown): JsonSchema {
  invariant(
    schema !== null && typeof schema === "object" && !Array.isArray(schema),
    "Response JSON Schema must be an object",
  );
  try {
    const descriptors = Object.getOwnPropertyDescriptors(schema);
    // Converters such as Zod attach protocol metadata outside the JSON Schema.
    if (descriptors["~standard"]?.enumerable === false)
      delete descriptors["~standard"];
    const portable: unknown = Object.create(
      Object.getPrototypeOf(schema),
      descriptors,
    );
    const snapshot = checkpointValue(portable);
    invariant(snapshot.kind === "json", "Response JSON Schema must be JSON");
    // Serialization produces ordinary objects after validating lossless JSON.
    const copy: unknown = JSON.parse(JSON.stringify(snapshot.value));
    invariant(inputObject(copy), "Response JSON Schema must be an object");
    freezeSchema(copy);
    return copy;
  } catch (cause) {
    throw new OutpostError(
      "configuration",
      "Response JSON Schema must contain only lossless JSON values",
      {},
      cause,
    );
  }
}

function freezeSchema(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  for (const child of Object.values(value)) freezeSchema(child);
  Object.freeze(value);
}
