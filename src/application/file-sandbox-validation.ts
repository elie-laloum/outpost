import { invariant } from "../domain/errors.ts";
import { inspectExecution } from "./execution-inspection.ts";
import type { FileSandboxOptions } from "./file-sandbox.types.ts";
export { validateFileAgent } from "./file-agent-validation.ts";
export { isFileSandboxOptions } from "./file-sandbox-options.ts";

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
  const [diagnostic] = inspectExecution(options).diagnostics;
  invariant(diagnostic === undefined, diagnostic?.message ?? "");
}
