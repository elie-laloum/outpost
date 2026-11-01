import { invariant } from "../domain/errors.ts";
import { containerLabels } from "./container-labels.constants.ts";
import type { ContainerLabels } from "./container.types.ts";

/** Returns a frozen copy of caller labels that is safe to pass as engine arguments. */
export function validateContainerLabels(labels: unknown): ContainerLabels {
  invariant(
    typeof labels === "object" && labels !== null && !Array.isArray(labels),
    "labels must be an object of string values",
  );
  const entries: [string, unknown][] = Object.entries(labels);
  const copy: Record<string, string> = {};
  for (const [key, value] of entries) {
    invariant(
      key.length <= containerLabels.maximumKeyLength &&
        containerLabels.keyPattern.test(key),
      `Invalid container label key: ${JSON.stringify(key)}`,
    );
    invariant(
      !key.toLowerCase().startsWith(containerLabels.reservedPrefix),
      `Container label ${key} uses the reserved ${containerLabels.reservedPrefix} prefix`,
    );
    invariant(
      typeof value === "string" &&
        value.length > 0 &&
        value.length <= containerLabels.maximumValueLength &&
        !containerLabels.controlCharacters.test(value),
      `Invalid value for container label ${key}`,
    );
    copy[key] = value;
  }
  return Object.freeze(copy);
}

export function labelArguments(labels: ContainerLabels = {}): string[] {
  return Object.entries(labels).flatMap(([key, value]) => [
    "--label",
    `${key}=${value}`,
  ]);
}
