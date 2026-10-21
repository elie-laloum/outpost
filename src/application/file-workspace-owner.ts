import { invariant } from "../domain/errors.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";

export async function workspaceOwner(path: string) {
  const value: unknown = JSON.parse(
    (await readInspectionFile(path, 4096)).toString("utf8"),
  );
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "id" in value &&
      typeof value.id === "string" &&
      "namespace" in value &&
      typeof value.namespace === "string",
    "Invalid workspace ownership marker",
  );
  return value;
}
