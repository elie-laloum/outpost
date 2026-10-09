import { lstat, mkdir, readFile, rename, rm } from "node:fs/promises";
import { dirname, basename, join, relative } from "node:path";
import { randomUUID } from "node:crypto";
import {
  createFileRunReport,
  fileRunReportData,
  fileRunReportSnapshot,
} from "./file-run-report.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { addUsage } from "../domain/usage.ts";
import { invariant, OutpostError, recordRecovery } from "../domain/errors.ts";
import type { Agent } from "../domain/agent.types.ts";
import {
  copyWorkspaceManifest,
  workspaceManifest,
  workspaceManifestFingerprint,
} from "../infrastructure/workspace-files.ts";
import { authenticateAgent } from "./agent-authentication.ts";
import { configureAgent } from "./agent-configuration.ts";
import { storageFor } from "./agent-storage.ts";
import { execute } from "./execution.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { runWithFallback } from "./agent-fallback.ts";
import { operationGate } from "./operation-gate.ts";
import {
  createFileWorkspace,
  checkpointFileWorkspace,
  restoreFileWorkspace,
  recordFileWorkspace,
} from "./file-workspace.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import { prepareWorkspaceOutputs } from "./workspace-output-baseline.ts";
import { publishWorkspaceOutputs } from "./workspace-publication.ts";
import type {
  FileDispatchRequest,
  FileDispatchResult,
  FileSandbox,
  FileSandboxOptions,
} from "./file-sandbox.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { SandboxOptions } from "./outpost.types.ts";
import { diagnoseSandbox } from "./doctor-sandbox.ts";
import { agentRequest } from "./agent-request.ts";
import { renderBrief } from "./brief-renderer.ts";
import { completeBrief } from "./interactive-brief.ts";
import { restoreTerminal } from "../infrastructure/terminal.ts";
import { executionDefaults } from "./execution.constants.ts";
import { archiveFiles } from "../infrastructure/transport-archive.ts";
import { inside } from "../infrastructure/files.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { registerResourceActivity } from "../infrastructure/resource-activity.ts";
import type { ResourceActivity } from "../infrastructure/resource-activity.types.ts";
import { trackedSandboxLease } from "./sandbox-activity.ts";
import { observedLease } from "./observed-lease.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { jsonBytes } from "../infrastructure/transport-json.ts";
import type { WorkspaceAllocationRecord } from "../domain/file-workspace.types.ts";
import type { TransportReference } from "../domain/transport.types.ts";
import { steeringScope } from "./steering-scope.ts";
import { createLifecycleHookRunner } from "./lifecycle-hooks.ts";
import { executeProcess } from "../infrastructure/process.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";

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

export async function validateFileAgent(
  agent: Agent,
  settings?: DispatchOptions<unknown>,
): Promise<void> {
  if (agent.kind === "custom")
    invariant(
      !agent.harness.tools.some((tool) => tool.workspace === "git"),
      "Git harness tools cannot run in file workspaces; select filesystem tools explicitly",
    );
  invariant(
    agent.kind !== "cli" || agent.fileWorkspaces?.dispatch,
    `${agent.name} has not declared validated support for file workspaces`,
  );
  invariant(
    agent.kind !== "replay" || agent.turns.every((turn) => !turn.changes),
    "Git replay effects cannot run in file workspaces",
  );
  if (!settings) return;
  if (agent.kind === "cli") {
    invariant(
      !settings.continuation || agent.fileWorkspaces?.continuation,
      "Agent continuation is not validated for file workspaces",
    );
    invariant(
      !settings.response?.repairs || agent.fileWorkspaces?.repairs,
      "Agent repairs are not validated for file workspaces",
    );
    invariant(
      !settings.steering || !agent.liveInput || agent.fileWorkspaces?.liveInput,
      "Agent live input is not validated for file workspaces",
    );
  }
  await preflightDispatch(settings, "", agent);
  const source =
    settings.brief.text ?? (await readFile(settings.brief.file, "utf8"));
  invariant(
    !/\{\{\s*(WORK_BRANCH|BASE_BRANCH)\s*\}\}/.test(source),
    "Git branch variables are unavailable in file workspaces",
  );
  invariant(
    !settings.logging ||
      typeof settings.logging !== "object" ||
      !("replayable" in settings.logging) ||
      !settings.logging.replayable,
    "Replayable file effects are not supported",
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
  let binding: "copy" | "ephemeral" | "mount-readonly" | "mount-write" =
    "ephemeral";
  if (source.kind === "directory") {
    binding = "copy";
    if (source.access.mode === "mount")
      binding = source.access.readOnly ? "mount-readonly" : "mount-write";
  }
  invariant(
    capability.bindings.includes(binding),
    `Sandbox provider does not support ${binding} workspaces`,
  );
  if (options.agent)
    for (const agent of dispatchCandidates(options.agent))
      await validateFileAgent(agent);
}

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
  const known = new Set<string>();
  let failed = false;
  const synchronize = async () => {
    if (options.sandboxProvider.placement !== "remote") return;
    const incoming = join(staging, randomUUID());
    await lease.download(`${lease.root}/.`, incoming, {
      ...(options.limits?.collectMs
        ? { deadlineMs: options.limits.collectMs }
        : {}),
    });
    const collected = await workspaceManifest(incoming);
    invariant(
      workspaceManifestFingerprint(
        await workspaceManifest(workspace.directory),
      ) === state.record.fingerprint,
      "Host workspace changed during remote execution",
    );
    const old = `${workspace.directory}.previous-${randomUUID()}`;
    await rename(workspace.directory, old);
    try {
      invariant(
        workspaceManifestFingerprint(await workspaceManifest(old)) ===
          state.record.fingerprint,
        "Host workspace changed before remote synchronization",
      );
      await mkdir(workspace.directory, { mode: 0o700 });
      await copyWorkspaceManifest(incoming, workspace.directory, collected);
      invariant(
        workspaceManifestFingerprint(
          await workspaceManifest(workspace.directory),
        ) === workspaceManifestFingerprint(collected),
        "Host workspace changed during remote synchronization",
      );
    } catch (error) {
      recordRecovery(error, {
        previousDirectory: old,
        incomingDirectory: incoming,
        directory: workspace.directory,
      });
      throw error;
    }
    await rm(old, { recursive: true });
    await rm(incoming, { recursive: true });
    const info = await lstat(workspace.directory);
    state.record = {
      ...state.record,
      fingerprint: workspaceManifestFingerprint(collected),
      materialization: { device: info.dev, inode: info.ino },
    };
  };
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
    dispatch(settings) {
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
                    const variables = {
                      ...options.sandboxProvider.variables,
                      ...options.variables,
                      ...agent.variables,
                    };
                    const credentials =
                      agent.kind === "cli"
                        ? await authenticateAgent(
                            agent,
                            variables,
                            lease,
                            options.sandboxProvider.placement,
                            signal,
                          )
                        : {};
                    const executionLease = {
                      ...lease,
                      invoke: (
                        command: import("../domain/command.types.ts").Command,
                      ) =>
                        lease.invoke({
                          ...command,
                          variables: {
                            ...variables,
                            ...credentials,
                            ...command.variables,
                          },
                        }),
                    };
                    if (agent.kind === "cli") {
                      await configureAgent(
                        agent,
                        variables,
                        executionLease,
                        options.sandboxProvider.placement,
                        signal,
                      );
                    }
                    const storage = storageFor(agent);
                    if (
                      settings.continuation &&
                      !known.has(settings.continuation.id)
                    ) {
                      invariant(
                        storage,
                        "Agent does not support conversation restoration",
                      );
                      await storage.restore(
                        await storage.locate(
                          settings.continuation.id,
                          workspace.runtime.directory,
                          undefined,
                          workspace.runtime.directory,
                        ),
                        {
                          repository: workspace.runtime.directory,
                          runtimeDirectory: workspace.runtime.directory,
                          staging,
                          sandbox: executionLease,
                          local: options.sandboxProvider.placement === "host",
                        },
                      );
                    }
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
                        if (turn.conversation) known.add(turn.conversation);
                        if (
                          turn.conversation &&
                          storage &&
                          agent.capture !== false
                        ) {
                          const captured = await storage.capture(
                            turn.conversation,
                            {
                              repository: workspace.runtime.directory,
                              runtimeDirectory: workspace.runtime.directory,
                              staging,
                              sandbox: executionLease,
                              local:
                                options.sandboxProvider.placement === "host",
                            },
                          );
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
                          known.add(turn.conversation);
                          await checkpoint();
                          return {
                            ...turn,
                            transcript: captured.file,
                            ...(captured.reference
                              ? { transcriptReference: captured.reference }
                              : {}),
                          };
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
                report: createFileRunReport(
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
    attach(settings = {}) {
      return gate.run(async () => {
        const agent = settings.agent ?? options.agent;
        invariant(
          agent?.kind === "cli" && agent.fileWorkspaces?.interactive,
          "Interactive CLI support for file workspaces has not been validated",
        );
        const brief = await completeBrief(
          settings.brief,
          settings.signal,
          settings.ask,
        );
        if (brief)
          await validateFileAgent(agent, {
            brief,
            ...(settings.continuation
              ? { continuation: settings.continuation }
              : {}),
          });
        const variables = {
          ...options.sandboxProvider.variables,
          ...options.variables,
          ...agent.variables,
        };
        const credentials = await authenticateAgent(
          agent,
          variables,
          lease,
          options.sandboxProvider.placement,
          signal,
        );
        await configureAgent(
          agent,
          variables,
          lease,
          options.sandboxProvider.placement,
          signal,
        );
        if (settings.continuation && !known.has(settings.continuation.id)) {
          const storage = storageFor(agent);
          invariant(storage, "Agent does not support conversation restoration");
          await storage.restore(
            await storage.locate(
              settings.continuation.id,
              workspace.runtime.directory,
              undefined,
              workspace.runtime.directory,
            ),
            {
              repository: workspace.runtime.directory,
              runtimeDirectory: workspace.runtime.directory,
              staging,
              sandbox: lease,
              local: options.sandboxProvider.placement === "host",
            },
          );
        }
        const prompt = brief
          ? await renderBrief(
              brief,
              {
                directory: workspace.directory,
                projectDirectory: workspace.runtime.directory,
              },
              lease,
              options.sandboxProvider.placement === "host",
              settings,
            )
          : undefined;
        const command = await agentRequest(
          agent,
          {
            interactive: true,
            ...(prompt === undefined ? {} : { text: prompt }),
            ...(settings.continuation
              ? { continuation: settings.continuation }
              : {}),
          },
          lease.invoke,
        );
        try {
          const output = await settled(
            () =>
              lease.invoke({
                ...command,
                variables: {
                  ...variables,
                  ...credentials,
                  ...command.variables,
                },
                signal: settings.signal
                  ? AbortSignal.any([settings.signal, signal])
                  : signal,
                deadlineMs: executionDefaults.attachMs,
                ...(settings.terminal ? { terminal: settings.terminal } : {}),
              }),
            settings.signal,
          );
          return {
            ...output,
            workspaceInfo: state.record,
            directory: workspace.directory,
          };
        } finally {
          restoreTerminal();
        }
      });
    },
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

export async function dispatchFiles<T>(
  options: FileDispatchRequest<T>,
  onSettled?: (
    record: import("../domain/file-workspace.types.ts").FileWorkspaceRecord,
  ) => Promise<void>,
): Promise<FileDispatchResult<T>> {
  for (const agent of dispatchCandidates(options.agent))
    await validateFileAgent(agent, options);
  const owned = !options.workspace;
  const workspace =
    options.workspace ??
    (await createFileWorkspace({
      ...options,
      source: options.workspaceSource,
    }));
  const { workspaceSource: _source, ...settings } = options;
  let sandbox: FileSandbox | undefined;
  try {
    if (options.outputs)
      await prepareWorkspaceOutputs(workspace, options.outputs);
    sandbox = await createFileSandbox({ ...settings, workspace }, onSettled);
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
        ? await restoreFileWorkspace(state.record, {
            ...(state.options.retention
              ? { retention: state.options.retention }
              : {}),
          })
        : workspace;
      try {
        return await dispatchFiles({
          sandboxProvider: settings.sandboxProvider,
          agent: settings.agent,
          workspace: reopened,
          ...(settings.variables ? { variables: settings.variables } : {}),
          ...next,
          continuation: {
            id: execution.conversation,
            ...(fork ? { fork: true } : {}),
          },
        });
      } finally {
        if (state.closed) await reopened.close({ preserve: true });
      }
    };
    const workspaceInfo = fileWorkspaces.get(workspace)!.record;
    const outcome: FileDispatchResult<T> = {
      ...execution,
      workspaceInfo,
      fileOutputs: publications,
      report: createFileRunReport({
        ...(fileRunReportSnapshot(execution.report) ??
          fileRunReportData(execution)),
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
