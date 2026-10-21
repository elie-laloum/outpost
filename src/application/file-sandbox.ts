import { join } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { FileWorkspaceRecord } from "../domain/file-workspace.types.ts";
import type { Disposal } from "../domain/workspace.types.ts";
import { createAgentSessions } from "./agent-sessions.ts";
import { diagnoseSandbox } from "./doctor-sandbox.ts";
import { dispatchFiles as dispatchFileWorkspace } from "./file-dispatch.ts";
import { createFileSandboxAttachment } from "./file-sandbox-attach.ts";
import { createFileSandboxDispatch } from "./file-sandbox-dispatch.ts";
import { provisionFileSandbox } from "./file-sandbox-provision.ts";
import { createFileSettlement } from "./file-sandbox-settlement.ts";
import { validateFileSandbox } from "./file-sandbox-validation.ts";
import type {
  FileDispatchRequest,
  FileDispatchResult,
  FileSandbox,
  FileSandboxOptions,
} from "./file-sandbox.types.ts";
import {
  createFileWorkspace as allocateFileWorkspace,
  restoreFileWorkspace as reopenFileWorkspace,
} from "./file-workspace-lifecycle.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceRegistration,
  RestoreFileWorkspaceOptions,
} from "./file-workspace.types.ts";
import { operationGate } from "./operation-gate.ts";
export { validateFileAgent } from "./file-agent-validation.ts";
export {
  isFileSandboxOptions,
  validateFileSandbox,
} from "./file-sandbox-validation.ts";

export async function createFileSandbox(
  options: FileSandboxOptions,
  onSettled?: FileWorkspaceRegistration,
): Promise<FileSandbox> {
  await validateFileSandbox(options);
  const source = options.workspace?.source ?? options.workspaceSource!;
  const owned = !options.workspace;
  const workspace =
    options.workspace ?? (await createFileWorkspace({ ...options, source }));
  const provisioned = await provisionFileSandbox({
    options,
    workspace,
    owned,
    ...(onSettled ? { onSettled } : {}),
  });
  const { lease, staging, signal, state } = provisioned;
  const gate = operationGate();
  const settlement = createFileSettlement(provisioned, onSettled);
  const agents = createAgentSessions({
    lease,
    placement: options.sandboxProvider.placement,
    authentication: "per-dispatch",
    conversation: {
      repository: workspace.runtime.directory,
      runtimeDirectory: workspace.runtime.directory,
      home: join(workspace.runtime.directory, "conversations"),
      staging,
      local: options.sandboxProvider.placement === "host",
    },
    variables: (agent) => ({
      ...options.sandboxProvider.variables,
      ...options.variables,
      ...agent.variables,
    }),
  });
  const operations = {
    options,
    workspace,
    state,
    lease,
    staging,
    signal,
    gate,
    agents,
    settlement,
  };
  let closing: Promise<Disposal> | undefined;
  const result: FileSandbox = {
    workspace,
    root: lease.root,
    diagnose(settings = {}) {
      return gate.run(() =>
        diagnoseSandbox(lease, {
          ...settings,
          workspaceKind: workspace.kind,
          sandboxProvider: options.sandboxProvider,
        }),
      );
    },
    command(command) {
      return gate.run(() =>
        settlement.settled(
          () =>
            lease.invoke({
              ...command,
              signal: command.signal
                ? AbortSignal.any([command.signal, signal])
                : signal,
            }),
          command.signal,
        ),
      );
    },
    dispatch: createFileSandboxDispatch({
      ...operations,
      sandbox: () => result,
    }),
    resume(id, settings) {
      return result.dispatch({ ...settings, continuation: { id } });
    },
    fork(id, settings) {
      return result.dispatch({ ...settings, continuation: { id, fork: true } });
    },
    attach: createFileSandboxAttachment(operations),
    close(settings = {}) {
      closing ??= (async () => {
        provisioned.abort(new OutpostError("aborted", "Sandbox disposed"));
        await gate.close();
        return provisioned.release({
          ...settings,
          ...(settlement.failed() ? { preserve: true } : {}),
        });
      })();
      return closing;
    },
    async [Symbol.asyncDispose]() {
      await result.close();
    },
  };
  return result;
}

export function dispatchFiles<T = undefined>(
  options: FileDispatchRequest<T>,
  onSettled?: FileWorkspaceRegistration,
): Promise<FileDispatchResult<T>> {
  return dispatchFileWorkspace(
    options,
    {
      createWorkspace: createFileWorkspace,
      restoreWorkspace: restoreFileWorkspace,
      createSandbox: createFileSandbox,
    },
    onSettled,
  );
}

export function createFileWorkspace(
  options: FileWorkspaceOptions,
  register?: FileWorkspaceRegistration,
): Promise<FileWorkspace> {
  return allocateFileWorkspace(
    options,
    { sandbox: createFileSandbox, dispatch: dispatchFiles },
    register,
  );
}

export function restoreFileWorkspace(
  record: FileWorkspaceRecord,
  options: RestoreFileWorkspaceOptions = {},
): Promise<FileWorkspace> {
  return reopenFileWorkspace(
    record,
    { sandbox: createFileSandbox, dispatch: dispatchFiles },
    options,
  );
}
