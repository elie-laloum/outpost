import type { DispatchExecutionContext } from "./dispatch-context.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { invariant, OutpostError, recordRecovery } from "../domain/errors.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import type {
  FileWorkspaceRecord,
  WorkspaceAllocationRecord,
} from "../domain/file-workspace.types.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import type { TransportReference } from "../domain/transport.types.ts";
import { addUsage } from "../domain/usage.ts";
import { inside } from "../infrastructure/files.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { registerResourceActivity } from "../infrastructure/resource-activity.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";
import { archiveFiles } from "../infrastructure/transport-archive.ts";
import { jsonBytes } from "../infrastructure/transport-json.ts";
import {
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import { createAgentConversations } from "./agent-conversations.ts";
import { runWithFallback } from "./agent-fallback.ts";
import { createAgentSessions } from "./agent-sessions.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { diagnoseSandbox } from "./doctor-sandbox.ts";
import { execute } from "./execution.ts";
import { validateFileAgent } from "./file-agent-validation.ts";
import { dispatchFiles as dispatchFileWorkspace } from "./file-dispatch.ts";
import { createFileRunReport, fileRunReportData } from "./file-run-report.ts";
import type {
  FileDispatchRequest,
  FileDispatchResult,
  FileSandbox,
  FileSandboxOptions,
} from "./file-sandbox.types.ts";
import {
  createFileWorkspace as allocateFileWorkspace,
  checkpointFileWorkspace,
  recordFileWorkspace,
  restoreFileWorkspace as reopenFileWorkspace,
} from "./file-workspace-lifecycle.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type {
  FileWorkspace,
  FileWorkspaceOptions,
  FileWorkspaceRegistration,
  RestoreFileWorkspaceOptions,
} from "./file-workspace.types.ts";
import { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import { observedLease } from "./observed-lease.ts";
import { operationGate } from "./operation-gate.ts";
import { trackedSandboxLease } from "./sandbox-activity.ts";
import { steeringScope } from "./steering-scope.ts";
export { validateFileAgent } from "./file-agent-validation.ts";
export {
  isFileSandboxOptions,
  validateFileSandbox,
} from "./file-sandbox-validation.ts";

import { createFileSandboxAttachment } from "./file-sandbox-attach.ts";
import { synchronizeFileWorkspace } from "./file-sandbox-synchronization.ts";
import { validateFileSandbox } from "./file-sandbox-validation.ts";

export async function createFileSandbox(
  options: FileSandboxOptions,
  onSettled?: (
    record: import("../domain/file-workspace.types.ts").FileWorkspaceRecord,
  ) => Promise<void>,
): Promise<FileSandbox> {
  await validateFileSandbox(options);
  const capability = options.sandboxProvider.workspaces!;
  const source = options.workspace?.source ?? options.workspaceSource!;
  const owned = !options.workspace;
  const workspace =
    options.workspace ?? (await createFileWorkspace({ ...options, source }));
  const state = fileWorkspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Workspace is closed or already acquired",
  );
  state.active = true;
  const lifecycle = options.hooks ?? state.options.hooks;
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  const staging = join(workspace.runtime.directory, "staging", workspace.id);
  let runtime;
  let activity: ResourceActivity | undefined;
  const recoveryTransport =
    options.recoveryTransport ??
    (state.options.retention?.policy === "portable"
      ? state.options.retention.transporter
      : createLocalTransport({
          directory: join(workspace.runtime.directory, "storage"),
        }));
  const allocationKey = `allocations/${workspace.runtime.namespace}/${workspace.id}/${randomUUID()}`;
  let allocationReference: TransportReference | undefined;
  let resourceId: string | undefined;
  let acquisitionStarted = false;
  const hostHooks = createLifecycleHookRunner(
    lifecycle?.hostReady ?? [],
    workspace.directory,
    executeProcess,
  );
  let sandboxHooks: ReturnType<typeof createLifecycleHookRunner> | undefined;
  const allocation = async (phase: WorkspaceAllocationRecord["state"]) => {
    const reference = await recoveryTransport.write(
      allocationKey,
      jsonBytes({
        format: 1,
        workspaceId: workspace.id,
        provider: options.sandboxProvider.name,
        state: phase,
        ...(resourceId ? { resourceId } : {}),
      }),
      { ifRevision: allocationReference?.revision ?? null },
    );
    allocationReference = { key: reference.key, revision: reference.revision };
    state.record = {
      ...state.record,
      allocation: {
        provider: options.sandboxProvider.name,
        state: phase,
        ...(resourceId ? { resourceId } : {}),
        reference: allocationReference,
      },
    };
    await recordFileWorkspace(workspace);
    await onSettled?.(state.record);
  };
  try {
    await hostHooks(signal, false, options.observation);
    const prepared = await checkpointFileWorkspace(workspace, true);
    await onSettled?.(prepared);
    await mkdir(staging, { recursive: true, mode: 0o700 });
    activity = await registerResourceActivity({
      repository: workspace.runtime.directory,
      transporter:
        options.activityTransport ??
        createLocalTransport({
          directory: join(workspace.runtime.directory, "storage"),
        }),
      workspace: workspace.directory,
      sandboxProvider: options.sandboxProvider.name,
      placement: options.sandboxProvider.placement,
    });
    await allocation("allocating");
    acquisitionStarted = true;
    runtime = await observedOperation(
      options.observation,
      "sandbox",
      "sandbox.acquire",
      () =>
        capability.acquire({
          workspace: state.record,
          runtime: workspace.runtime,
          variables: {
            ...options.sandboxProvider.variables,
            ...options.variables,
          },
          signal,
          async registerRecovery(id) {
            resourceId = id;
            await allocation("allocating");
          },
        }),
    );
    await allocation("active");
    runtime = observedLease(
      boundedTransfers(trackedSandboxLease(runtime, activity), {
        ...(options.limits?.copyMs
          ? { deadlineMs: options.limits.copyMs }
          : {}),
      }),
      options.observation,
    );
    if (options.sandboxProvider.placement === "remote")
      await runtime.upload(`${workspace.directory}/.`, runtime.root, {
        signal,
      });
    sandboxHooks = createLifecycleHookRunner(
      lifecycle?.sandboxReady ?? [],
      runtime.root,
      runtime.invoke.bind(runtime),
      true,
    );
    await sandboxHooks(signal, false, options.observation);
    await activity.phase("ready");
  } catch (error) {
    if (runtime && options.sandboxProvider.placement === "remote") {
      const incoming = join(staging, `startup-${randomUUID()}`);
      try {
        await runtime.download(`${runtime.root}/.`, incoming);
        await workspaceManifest(incoming);
        recordRecovery(error, { incomingDirectory: incoming });
      } catch (collection) {
        recordRecovery(error, {
          incomingDirectory: incoming,
          collectionError: collection,
        });
      }
    }
    let released = !acquisitionStarted;
    try {
      await runtime?.release();
      released ||= !!runtime;
      await allocation(released ? "released" : "uncertain");
    } catch (cleanup) {
      recordRecovery(error, {
        allocationReference,
        resourceId,
        cleanupError: cleanup,
      });
    }
    state.active = !released;
    try {
      if (released) await activity?.remove();
      if (!released) await activity?.phase("allocation-uncertain");
      if (owned && released) await workspace.close({ preserve: true });
    } catch (cleanup) {
      recordRecovery(error, { cleanupError: cleanup });
    }
    recordRecovery(error, {
      workspaceInfo: state.record,
      allocationReference,
      resourceId,
      directory: workspace.directory,
    });
    throw error;
  }
  const lease = runtime;
  const gate = operationGate();
  let closing:
    Promise<import("../domain/workspace.types.ts").Disposal> | undefined;
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
  let failed = false;
  const synchronize = () =>
    synchronizeFileWorkspace({ options, workspace, state, lease, staging });
  const checkpoint = async () => {
    const record = await checkpointFileWorkspace(workspace, true);
    await onSettled?.(record);
    return record;
  };
  const settled = async <T>(
    action: () => Promise<T>,
    operationSignal?: AbortSignal,
  ): Promise<T> => {
    let failure: unknown;
    try {
      const preparationSignal = operationSignal
        ? AbortSignal.any([signal, operationSignal])
        : signal;
      await hostHooks(preparationSignal, true, options.observation);
      if (options.sandboxProvider.placement === "remote")
        invariant(
          workspaceManifestFingerprint(
            await workspaceManifest(workspace.directory),
          ) === state.record.fingerprint,
          "Host files changed before remote execution; prepare file changes through sandboxReady",
        );
      await sandboxHooks?.(preparationSignal, true, options.observation);
      return await action();
    } catch (error) {
      failed = true;
      failure = error;
      throw error;
    } finally {
      try {
        await synchronize();
        await checkpoint();
      } catch (error) {
        failed = true;
        throw new OutpostError(
          "workspace",
          "File workspace could not settle; preserve it for explicit recovery",
          { workspaceId: workspace.id, directory: workspace.directory },
          failure === undefined
            ? error
            : new AggregateError(
                [failure, error],
                "Execution and settlement failed",
              ),
        );
      }
    }
  };
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
        settled(
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
    dispatch<T>(
      settings: DispatchOptions<T>,
      executionContext?: DispatchExecutionContext,
    ) {
      const logging = settings.logging ?? options.logging;
      const log =
        logging === false || logging === "stdout"
          ? logging
          : {
              ...logging,
              transporter:
                logging?.transporter ??
                createLocalTransport({
                  directory: join(workspace.runtime.directory, "storage"),
                }),
            };
      return steeringScope(settings.steering, () =>
        gate.run(() =>
          observeDispatch(
            {
              ...settings,
              logging: log,
              ...((settings.observation ?? options.observation)
                ? { observation: settings.observation ?? options.observation }
                : {}),
            },
            async (settings) => {
              const requested = settings.agent ?? options.agent;
              invariant(requested, "Provide an agent");
              invariant(
                requested.kind !== "fallback" || !settings.continuation,
                "Fallback agents cannot continue a conversation",
              );
              for (const agent of dispatchCandidates(requested))
                await validateFileAgent(agent, settings);
              const executed = await settled(async () =>
                runWithFallback(
                  requested,
                  settings.observe,
                  signal,
                  async (agent, observe) => {
                    const { executionLease } = await agents.prepare(
                      agent,
                      signal,
                    );
                    const conversations = createAgentConversations({
                      agent,
                      context: agents.conversationContext(executionLease),
                    });
                    if (settings.continuation)
                      await agents.restore(
                        settings.continuation.id,
                        agent,
                        executionLease,
                      );
                    const execution = await execute(
                      {
                        directory: workspace.directory,
                        projectDirectory: workspace.runtime.directory,
                        runtimeDirectory: workspace.runtime.directory,
                      },
                      executionLease,
                      agent,
                      options.sandboxProvider.placement === "host",
                      {
                        ...settings,
                        signal: settings.signal
                          ? AbortSignal.any([settings.signal, signal])
                          : signal,
                        observe,
                      },
                      async (turn) => {
                        await synchronize();
                        if (turn.conversation)
                          agents.remember(agent, turn.conversation);
                        const capturedTurn =
                          await conversations.captureTurn(turn);
                        const captured = turn.conversation
                          ? conversations.captured.get(turn.conversation)
                          : undefined;
                        if (captured && turn.conversation) {
                          if (state.options.retention?.policy === "portable") {
                            invariant(
                              inside(
                                workspace.runtime.directory,
                                captured.file,
                              ),
                              "Portable conversations must be captured inside the runtime directory",
                            );
                            const reference = await archiveFiles(
                              state.options.retention.transporter,
                              dirname(captured.file),
                              [basename(captured.file)],
                              `conversations/${workspace.runtime.namespace}/${workspace.id}/${randomUUID()}`,
                            );
                            state.record = {
                              ...state.record,
                              conversations: [
                                ...(state.record.conversations ?? []).filter(
                                  (record) => record.id !== captured.id,
                                ),
                                {
                                  id: captured.id,
                                  format: captured.format,
                                  path: relative(
                                    workspace.runtime.directory,
                                    captured.file,
                                  )
                                    .split("\\")
                                    .join("/"),
                                  archive: {
                                    key: reference.key,
                                    revision: reference.revision,
                                  },
                                },
                              ],
                            };
                          }
                          agents.remember(agent, turn.conversation);
                          await checkpoint();
                          return capturedTurn;
                        }
                        await checkpoint();
                        return turn;
                      },
                    );
                    return { execution, agent };
                  },
                ),
              );
              const { execution, agent } = executed.value;
              const captured = execution.turns.findLast(
                (turn) => turn.transcript,
              );
              const outcome: FileDispatchResult<typeof execution.value> = {
                ...execution,
                usage: addUsage(execution.usage, executed.failedUsage),
                workspaceInfo: state.record,
                directory: workspace.directory,
                fileOutputs: [],
                ...(captured?.transcript
                  ? { transcript: captured.transcript }
                  : {}),
                ...(captured?.transcriptReference
                  ? { transcriptReference: captured.transcriptReference }
                  : {}),
                ...(executed.fallback ? { fallback: executed.fallback } : {}),
                ...createFileRunReport(
                  fileRunReportData({
                    ...execution,
                    usage: addUsage(execution.usage, executed.failedUsage),
                    workspaceInfo: state.record,
                    fileOutputs: [],
                  }),
                ),
                resume(next) {
                  invariant(
                    execution.conversation,
                    "No conversation was emitted",
                  );
                  return result.resume(execution.conversation, {
                    ...next,
                    agent,
                  });
                },
                fork(next) {
                  invariant(
                    execution.conversation,
                    "No conversation was emitted",
                  );
                  return result.fork(execution.conversation, {
                    ...next,
                    agent,
                  });
                },
              };
              return outcome;
            },
            workspace.runtime.directory,
            executionContext,
          ),
        ),
      );
    },
    resume(id, settings) {
      return result.dispatch({ ...settings, continuation: { id } });
    },
    fork(id, settings) {
      return result.dispatch({ ...settings, continuation: { id, fork: true } });
    },
    attach: createFileSandboxAttachment({
      options,
      workspace,
      state,
      lease,
      staging,
      signal,
      gate,
      settled,
      agents,
    }),
    close(settings = {}) {
      closing ??= (async () => {
        stop.abort(new OutpostError("aborted", "Sandbox disposed"));
        await gate.close();
        await activity?.phase("closing");
        try {
          await lease.release();
        } catch (error) {
          recordRecovery(error, {
            workspaceId: workspace.id,
            directory: workspace.directory,
            allocation: "uncertain",
          });
          throw error;
        }
        await allocation("released");
        await activity?.remove();
        state.active = false;
        return owned
          ? workspace.close({
              ...settings,
              ...(failed ? { preserve: true } : {}),
            })
          : {};
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
