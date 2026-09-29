import type { WorkflowJson } from "./checkpoint.types.ts";

/** JSON with sorted object keys, so equal values serialize identically. */
export function canonicalJson(value: WorkflowJson): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value))
    return `[${value.map((item: WorkflowJson) => canonicalJson(item)).join(",")}]`;
  const fields = Object.entries(value as Record<string, WorkflowJson>);
  return `{${fields
    .sort(([left], [right]) => (left < right ? -1 : 1))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}
