import { invariant } from "../domain/errors.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { fileWorkspaceBinding } from "../domain/file-workspace-binding.ts";
import { validateFileAgent } from "./file-agent-validation.ts";
import type { FileSandboxOptions } from "./file-sandbox.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";
export { validateFileAgent } from "./file-agent-validation.ts";

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

export async function validateFileSandbox(
  options: FileSandboxOptions,
): Promise<void> {
  options.signal?.throwIfAborted();
  invariant(
    !(options.workspace && options.workspaceSource),
    "Provide either a workspace or a workspaceSource",
  );
  invariant(
    !["repository", "branch", "guard", "copies", "includeUncommitted"].some(
      (key) => key in options,
    ),
    "Git options are not supported by file sandboxes",
  );
  if (options.limits) {
    invariant(
      Object.keys(options.limits).every(
        (key) => key === "copyMs" || key === "collectMs",
      ),
      "Git stage limits are unavailable for file workspaces",
    );
    invariant(
      Object.values(options.limits).every(
        (value) => Number.isFinite(value) && value > 0,
      ),
      "File stage limits must be positive",
    );
  }
  invariant(
    !options.logging ||
      typeof options.logging !== "object" ||
      !options.logging.replayable,
    "Replayable file effects are not supported",
  );
  const capability = options.sandboxProvider.workspaces;
  invariant(capability, "Sandbox provider does not support file workspaces");
  const source = options.workspace?.source ?? options.workspaceSource;
  invariant(source, "Provide a file workspace source");
  const binding = fileWorkspaceBinding(source);
  invariant(
    capability.bindings.includes(binding),
    `Sandbox provider does not support ${binding} workspaces`,
  );
  if (options.agent)
    for (const agent of dispatchCandidates(options.agent))
      await validateFileAgent(agent);
}
