import type { FileWorkspaceSource } from "./file-workspace.types.ts";
import type { FileWorkspaceBinding } from "./sandbox.types.ts";

/** The binding a source requires from its sandbox provider. */
export function fileWorkspaceBinding(
  source: FileWorkspaceSource,
): FileWorkspaceBinding {
  if (source.kind === "ephemeral") return "ephemeral";
  if (source.access.mode === "copy") return "copy";
  return source.access.readOnly ? "mount-readonly" : "mount-write";
}
