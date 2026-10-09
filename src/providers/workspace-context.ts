import { invariant } from "../domain/errors.ts";
import type {
  FileSandboxContext,
  SandboxContext,
  SandboxProvider,
} from "../domain/sandbox.types.ts";

export function fileProviderContext(
  context: FileSandboxContext,
): SandboxContext {
  return {
    directory: context.workspace.directory,
    repository: context.runtime.directory,
    gitDirectories: [],
    workspaceIdentity: JSON.stringify([
      context.runtime.namespace,
      context.workspace.source,
    ]),
    variables: context.variables,
    ...(context.signal ? { signal: context.signal } : {}),
    ...(context.registerRecovery
      ? { registerRecovery: context.registerRecovery }
      : {}),
  };
}

export function withTransferredWorkspaces(
  provider: SandboxProvider,
): SandboxProvider {
  return {
    ...provider,
    workspaces: {
      bindings: ["copy", "ephemeral"],
      acquire(context) {
        invariant(
          context.workspace.source.kind !== "directory" ||
            context.workspace.source.access.mode === "copy",
          "This provider cannot mount workspace sources",
        );
        return provider.acquire(fileProviderContext(context));
      },
    },
  };
}
