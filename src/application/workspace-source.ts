import { invariant } from "../domain/errors.ts";
import type { GitWorkspaceSandboxOptions } from "./file-workspace.types.ts";

export function isGitWorkspaceSandboxOptions(
  value: unknown,
): value is GitWorkspaceSandboxOptions {
  return (
    !!value &&
    typeof value === "object" &&
    "workspaceSource" in value &&
    !!value.workspaceSource &&
    typeof value.workspaceSource === "object" &&
    "kind" in value.workspaceSource &&
    value.workspaceSource.kind === "git"
  );
}

export function gitWorkspaceSandboxOptions<
  T extends GitWorkspaceSandboxOptions,
>(options: T) {
  invariant(
    !options.workspace &&
      !["repository", "branch", "copies", "guard"].some(
        (key) => key in options,
      ),
    "A workspaceSource owns its Git configuration",
  );
  const { workspaceSource, ...settings } = options;
  const { kind: _kind, ...source } = workspaceSource;
  return { ...settings, ...source };
}
