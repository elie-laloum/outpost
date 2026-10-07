import { observedOperation } from "../domain/observed-operation.ts";
import { invariant } from "../domain/errors.ts";
import { validateDiffGuard } from "../domain/diff-guard.ts";
import { allocateWorkspace } from "./workspace-allocation.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { attach } from "./attach.ts";
import { dispatch } from "./dispatch.ts";
import { hooks } from "./lifecycle-hooks.ts";
import type { Workspace, WorkspaceOptions } from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import { startupFailure } from "./startup-recovery.ts";
import { workspaces } from "./workspace-registry.ts";

export async function openWorkspace(
  options: WorkspaceOptions = {},
): Promise<Workspace> {
  options.signal?.throwIfAborted();
  validateDiffGuard(options.guard, options.branch ?? { mode: "current" });
  const lease = await observedOperation(
    options.observation,
    "git",
    "workspace.allocate",
    async () => allocateWorkspace(options),
  );
  try {
    await observedOperation(
      options.observation,
      "hooks",
      "workspace.ready",
      async () =>
        hooks(
          options.hooks?.workspaceReady ?? [],
          lease.directory,
          executeProcess,
          options.signal,
        ),
    );
  } catch (cause) {
    await observedOperation(
      options.observation,
      "recovery",
      "workspace.startup-failure",
      async () => startupFailure(lease, cause, options),
    );
    await lease.dispose();
    throw cause;
  }
  const state = {
    lease,
    active: false,
    closed: false,
    ...(options.hooks ? { hooks: options.hooks } : {}),
  };
  const result: Workspace = {
    ...lease,
    integrate: () =>
      observedOperation(options.observation, "git", "branch.integrate", () =>
        lease.integrate(),
      ),
    dispatch(options) {
      return dispatch({ ...options, workspace: result });
    },
    sandbox(options = {}) {
      return createSandbox({ ...options, workspace: result });
    },
    attach(options) {
      return attach({ ...options, workspace: result });
    },
    async close(settings = {}) {
      invariant(
        !state.active,
        "Close the sandbox before closing its workspace",
      );
      state.closed = true;
      return observedOperation(
        options.observation,
        "recovery",
        "workspace.cleanup",
        () => lease.dispose(settings.preserve),
      );
    },
    async [Symbol.asyncDispose]() {
      await result.close();
    },
  };
  workspaces.set(result, state);
  return result;
}
