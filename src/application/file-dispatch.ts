import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import { prepareWorkspaceOutputs } from "./workspace-output-baseline.ts";
import { publishWorkspaceOutputs } from "./workspace-publication.ts";
import { createFileRunReport } from "./file-run-report.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { validateFileAgent } from "./file-agent-validation.ts";
import type { FileDispatchRuntime } from "./file-dispatch.types.ts";
import type { FileWorkspaceRegistration } from "./file-workspace.types.ts";
import type {
  FileDispatchRequest,
  FileDispatchResult,
  FileSandbox,
} from "./file-sandbox.types.ts";
import type { DispatchOptions } from "./execution.types.ts";

export async function dispatchFiles<T>(
  options: FileDispatchRequest<T>,
  factories: FileDispatchRuntime,
  onSettled?: (
    record: import("../domain/file-workspace.types.ts").FileWorkspaceRecord,
  ) => Promise<void>,
): Promise<FileDispatchResult<T>> {
  options.signal?.throwIfAborted();
  const runtime =
    options.workspace?.runtime.directory ??
    resolve(
      ("runtime" in options ? options.runtime?.directory : undefined) ??
        ".outpost",
    );
  await mkdir(runtime, { recursive: true });
  const logging =
    options.logging === false || options.logging === "stdout"
      ? options.logging
      : {
          ...options.logging,
          transporter:
            options.logging?.transporter ??
            createLocalTransport({ directory: join(runtime, "storage") }),
        };
  return observeDispatch(
    { ...options, logging },
    (observed) =>
      dispatchFileOperation(
        { ...options, ...observed },
        onSettled,
        options.observation,
        factories,
      ),
    runtime,
  );
}

async function dispatchFileOperation<T>(
  options: FileDispatchRequest<T>,
  onSettled: FileWorkspaceRegistration | undefined,
  continuationObservation:
    import("../domain/observation.types.ts").ObservationHub | undefined,
  factories: FileDispatchRuntime,
): Promise<FileDispatchResult<T>> {
  for (const agent of dispatchCandidates(options.agent))
    await validateFileAgent(agent, options);
  const owned = !options.workspace;
  const workspace =
    options.workspace ??
    (await factories.createWorkspace({
      ...options,
      source: options.workspaceSource,
    }));
  const { workspaceSource: _source, ...settings } = options;
  let sandbox: FileSandbox | undefined;
  try {
    if (options.outputs)
      await prepareWorkspaceOutputs(workspace, options.outputs);
    sandbox = await factories.createSandbox(
      { ...settings, workspace },
      onSettled,
    );
    const execution = await sandbox.dispatch(options);
    await sandbox.close({ preserve: true });
    const publications = [];
    for (const output of options.outputs ?? [])
      publications.push(
        await publishWorkspaceOutputs(sandbox.workspace, output),
      );
    if (owned) await workspace.close();
    const continueExecution = async <U>(
      next: DispatchOptions<U>,
      fork: boolean,
    ) => {
      invariant(
        execution.conversation,
        "Dispatch has no captured conversation",
      );
      const state = fileWorkspaces.get(workspace)!;
      const reopened = state.closed
        ? await factories.restoreWorkspace(state.record, {
            ...(state.options.retention
              ? { retention: state.options.retention }
              : {}),
          })
        : workspace;
      try {
        return await dispatchFiles(
          {
            sandboxProvider: settings.sandboxProvider,
            agent: settings.agent,
            workspace: reopened,
            ...(continuationObservation
              ? { observation: continuationObservation }
              : {}),
            ...(settings.variables ? { variables: settings.variables } : {}),
            ...next,
            continuation: {
              id: execution.conversation,
              ...(fork ? { fork: true } : {}),
            },
          },
          factories,
        );
      } finally {
        if (state.closed) await reopened.close({ preserve: true });
      }
    };
    const workspaceInfo = fileWorkspaces.get(workspace)!.record;
    const outcome: FileDispatchResult<T> = {
      ...execution,
      workspaceInfo,
      fileOutputs: publications,
      ...createFileRunReport({
        ...execution.reportData,
        workspaceInfo,
        fileOutputs: publications,
      }),
      resume(next) {
        return continueExecution(next, false);
      },
      fork(next) {
        return continueExecution(next, true);
      },
    };
    return outcome;
  } catch (error) {
    recordRecovery(error, {
      workspaceId: workspace.id,
      directory: workspace.directory,
    });
    await sandbox?.close({ preserve: true });
    if (owned && !fileWorkspaces.get(workspace)?.active)
      await workspace.close({ preserve: true });
    throw error;
  }
}
