import { invariant, OutpostError } from "./errors.ts";
import { SECRET_MAX_BYTES, SECRET_VARIABLE_NAME } from "./secrets.constants.ts";

export function secretNames(names: readonly string[]): readonly string[] {
  invariant(Array.isArray(names), "Secret names must be an array");
  const selected = [...names];
  invariant(
    selected.every(
      (name) => typeof name === "string" && SECRET_VARIABLE_NAME.test(name),
    ),
    "Secret names must be environment variable identifiers",
  );
  invariant(
    new Set(selected).size === selected.length,
    "Secret names must be unique",
  );
  return Object.freeze(selected);
}

export function secretValue(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.length ||
    value.includes("\0") ||
    new TextEncoder().encode(value).byteLength > SECRET_MAX_BYTES
  )
    throw new OutpostError(
      "provider",
      "Secret value must be nonempty text without NUL, at most 1 MiB",
    );
  return value;
}
