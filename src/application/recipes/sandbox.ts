import { createSandbox } from "../sandbox.ts";
import { openWorkspace } from "../workspace.ts";
import type { SandboxOptions } from "../outpost.types.ts";
import type { ObservationHub } from "../../domain/observation.types.ts";

export async function openRecipeSandbox(
  options: SandboxOptions,
  signal: AbortSignal,
  observation?: ObservationHub,
) {
  const observed = observation ? { observation } : {};
  const ownedWorkspace = options.workspace
    ? undefined
    : await openWorkspace({ ...options, signal, ...observed });
  const workspace = options.workspace ?? ownedWorkspace;
  if (!workspace) throw new Error("Missing recipe workspace");
  const {
    repository: _repository,
    branch: _branch,
    guard: _guard,
    copies: _copies,
    storageQuota: _storageQuota,
    ...settings
  } = options;
  try {
    const sandbox = await createSandbox({
      ...settings,
      workspace,
      signal,
      ...observed,
    });
    return { sandbox, ownedWorkspace };
  } catch (error) {
    try {
      await ownedWorkspace?.close({ preserve: true });
    } catch (cleanup) {
      throw new AggregateError(
        [error, cleanup],
        "Recipe allocation and cleanup failed",
        { cause: error },
      );
    }
    throw error;
  }
}
