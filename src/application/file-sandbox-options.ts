import type { FileSandboxOptions } from "./file-sandbox.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";

export function isFileSandboxOptions(
  options: SandboxOptions | FileSandboxOptions,
): options is FileSandboxOptions {
  return (
    "workspaceSource" in options ||
    !!(
      options.workspace &&
      "kind" in options.workspace &&
      String(options.workspace.kind) !== "git"
    )
  );
}
