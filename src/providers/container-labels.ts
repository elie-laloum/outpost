import { configurationInvariant } from "../domain/configuration-diagnostic.ts";
import { containerLabels } from "./container-labels.constants.ts";
import type { ContainerLabels } from "./container.types.ts";

const plainObject = (value: unknown): value is object => {
  if (typeof value !== "object" || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/** Returns a frozen copy of caller labels that is safe to pass as engine arguments. */
export function validateContainerLabels(labels: unknown): ContainerLabels {
  configurationInvariant(
    plainObject(labels),
    "labels must be a plain object of string values",
    ["labels"],
    "invalid-container-label",
  );
  const entries: [string, unknown][] = Object.entries(labels);
  const copy: Record<string, string> = {};
  for (const [key, value] of entries) {
    const path = ["labels", key];
    configurationInvariant(
      key.length <= containerLabels.maximumKeyLength &&
        containerLabels.keyPattern.test(key),
      `Invalid container label key: ${JSON.stringify(key)}`,
      path,
      "invalid-container-label",
    );
    configurationInvariant(
      !key.toLowerCase().startsWith(containerLabels.reservedPrefix),
      `Container label ${key} uses the reserved ${containerLabels.reservedPrefix} prefix`,
      path,
      "reserved-container-label",
      `Use a key in your own namespace, such as com.example.${key.slice(containerLabels.reservedPrefix.length)}`,
    );
    // Docker trims filter values, so surrounding whitespace could never be listed.
    configurationInvariant(
      typeof value === "string" &&
        value.length > 0 &&
        value.trim() === value &&
        value.length <= containerLabels.maximumValueLength &&
        !containerLabels.controlCharacters.test(value),
      `Invalid value for container label ${key}`,
      path,
      "invalid-container-label",
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
