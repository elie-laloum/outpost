import { invariant } from "./errors.ts";
import type { ChangedCondition } from "./lifecycle.types.ts";

export function changed(files: readonly string[]): ChangedCondition {
  invariant(
    Array.isArray(files) && files.length > 0,
    "changed requires at least one file",
  );
  for (const file of files)
    invariant(
      typeof file === "string" &&
        file.trim().length > 0 &&
        !file.includes("\\") &&
        !file.includes("\0") &&
        !file.startsWith("/") &&
        !/^[a-z]:/i.test(file) &&
        !file
          .split("/")
          .some((part) => part === ".." || part === "." || part === ""),
      "Changed files must be relative file paths without traversal",
    );
  invariant(
    new Set(files).size === files.length,
    "Changed files must be unique",
  );
  return Object.freeze({ kind: "changed", files: Object.freeze([...files]) });
}
