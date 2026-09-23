import { join, posix } from "node:path";
import { OutpostError, invariant } from "../domain/errors.ts";
import type {
  AgentAdapter,
  BranchPolicy,
  Command,
  CommandResult,
  Commit,
  Disposal,
  LifecycleHooks,
  SandboxLease,
  SandboxProvider,
  StageLimits,
  WorkspaceRecord,
} from "../domain/ports.ts";
import type { Brief } from "../domain/prompts.ts";
import { validateBrief } from "../domain/prompts.ts";
import { ResponseError } from "../domain/response.ts";
import {
  acquireWorkspace,
  commits,
  git,
  type WorkspaceLease,
} from "../infrastructure/git.ts";
import {
  captureConversation,
  locateConversation,
  restoreConversation,
  type ConversationLocation,
} from "../infrastructure/conversations.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import {
  executeProcess,
  quote,
  requireSuccess,
} from "../infrastructure/process.ts";
import { journal, type Logging } from "../infrastructure/journal.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { docker } from "../providers/docker.ts";
import { agentVersions } from "../providers/versions.ts";
import {
  execute,
  notify,
  renderBrief,
  validateDispatch,
  type DispatchOptions,
  type Execution,
} from "./execution.ts";
import { seedRemote, type RemoteSync } from "./remote-workspace.ts";

export interface WorkspaceOptions {
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
}

export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<SandboxOptions, keyof WorkspaceOptions | "workspace"> &
      DispatchOptions<T> & { readonly agent: AgentAdapter },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<SandboxOptions, keyof WorkspaceOptions | "workspace">,
  ): Promise<Sandbox>;
  attach(
    options: Omit<SandboxOptions, keyof WorkspaceOptions | "workspace"> &
      AttachOptions & { readonly agent: AgentAdapter },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

const workspaces = new WeakMap<
  Workspace,
  { lease: WorkspaceLease; active: boolean; closed: boolean }
>();

export async function openWorkspace(
  options: WorkspaceOptions = {},
): Promise<Workspace> {
  const lease = await acquireWorkspace(options);
  const state = { lease, active: false, closed: false };
  const result: Workspace = {
    ...lease,
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
      return lease.dispose(settings.preserve);
    },
    async [Symbol.asyncDispose]() {
      await result.close();
    },
  };
  workspaces.set(result, state);
  return result;
}

export interface SandboxOptions extends WorkspaceOptions {
  readonly agent?: AgentAdapter;
  readonly provider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
}

export interface AttachOptions {
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly signal?: AbortSignal;
}

export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}

export interface DispatchResult<T> extends Execution<T> {
  readonly branch: string;
  readonly directory: string;
  readonly commits: readonly Commit[];
  readonly transcript?: string;
  readonly log?: string;
  readonly retainedDirectory?: string;
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(options: DispatchOptions<U>): Promise<DispatchResult<U>>;
}

export interface Sandbox {
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<DispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<DispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<DispatchResult<T>>;
  attach(options?: AttachOptions): Promise<AttachResult>;
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}

async function hooks(
  commands: readonly Command[],
  directory: string,
  invoke: SandboxLease["invoke"],
  signal?: AbortSignal,
): Promise<void> {
  for (const command of commands)
    await requireSuccess(
      {
        ...command,
        directory: command.directory ?? directory,
        ...(signal ? { signal } : {}),
      },
      invoke,
    );
}

async function prepareAdapter(
  agent: AgentAdapter,
  runtime: SandboxLease,
  signal: AbortSignal,
): Promise<AgentAdapter> {
  if (!agent.conversations) return agent;
  const executable = agent.conversations;
  const cli =
    executable === "claude"
      ? `@anthropic-ai/claude-code@${agentVersions.claude}`
      : `@openai/codex@${agentVersions.codex}`;
  const prefix = posix.join(runtime.home, ".outpost-tools"),
    target = posix.join(prefix, "bin", executable);
  const installed = await requireSuccess(
    {
      executable: "sh",
      arguments: [
        "-c",
        `if command -v ${executable} >/dev/null 2>&1; then command -v ${executable}; elif test -x ${quote(target)}; then printf '%s\\n' ${quote(target)}; else npm install --global --allow-scripts=@anthropic-ai/claude-code --prefix ${quote(prefix)} ${cli} >&2 && printf '%s\\n' ${quote(target)}; fi`,
      ],
      signal,
    },
    runtime.invoke.bind(runtime),
  );
  const binary = installed.stdout.trim();
  invariant(
    binary.startsWith("/") && !binary.includes("\n"),
    "Agent bootstrap returned an invalid executable path",
  );
  return {
    ...agent,
    request(input) {
      return { ...agent.request(input), executable: binary };
    },
  };
}

export async function createSandbox(
  options: SandboxOptions = {},
): Promise<Sandbox> {
  const provider = options.provider ?? docker();
  invariant(
    !options.workspace ||
      (!options.repository && !options.branch && !options.copies),
    "A supplied workspace owns its repository, branch and copied inputs",
  );
  const owned = !options.workspace;
  invariant(
    provider.placement !== "remote" ||
      ((options.workspace?.policy ?? options.branch)?.mode !== "current" &&
        (options.workspace || options.branch)),
    "Remote providers require a named or integration workspace",
  );
  const workspace = options.workspace ?? (await openWorkspace(options));
  const state = workspaces.get(workspace);
  invariant(
    state && !state.closed && !state.active,
    "Workspace must be open and cannot belong to another sandbox",
  );
  state.active = true;
  const stop = new AbortController();
  const setupSignal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  let lease: SandboxLease | undefined, sync: RemoteSync | undefined;
  const prepared = new Map<AgentAdapter, AgentAdapter>();
  const staging = join(
    workspace.repository,
    ".outpost",
    "recovery",
    "conversations",
  );
  try {
    const configured = await resolveVariables(
      workspace.repository,
      {},
      provider.variables,
    );
    const name = (
      await git(workspace.repository, ["config", "--get", "user.name"]).catch(
        () => "Outpost",
      )
    ).trim();
    const email = (
      await git(workspace.repository, ["config", "--get", "user.email"]).catch(
        () => "outpost@localhost",
      )
    ).trim();
    const variables = {
      GIT_AUTHOR_NAME: name,
      GIT_COMMITTER_NAME: name,
      GIT_AUTHOR_EMAIL: email,
      GIT_COMMITTER_EMAIL: email,
      ...configured,
    };
    await hooks(
      options.hooks?.workspaceReady ?? [],
      workspace.directory,
      executeProcess,
      setupSignal,
    );
    lease = await provider.acquire({
      repository: workspace.repository,
      directory: workspace.directory,
      gitDirectories: workspace.gitDirectories,
      variables,
      signal: setupSignal,
    });
    if (provider.placement === "remote") {
      sync = await seedRemote(workspace, lease);
      for (const path of options.copies ?? [])
        await lease.upload(
          join(workspace.directory, path),
          posix.join(lease.root, path.replaceAll("\\", "/")),
        );
      if (options.bootstrap !== false && options.agent)
        prepared.set(
          options.agent,
          await prepareAdapter(options.agent, lease, setupSignal),
        );
    }
    const initialized = await Promise.allSettled([
      hooks(
        options.hooks?.hostReady ?? [],
        workspace.directory,
        executeProcess,
        setupSignal,
      ),
      hooks(
        options.hooks?.sandboxReady ?? [],
        lease.root,
        lease.invoke.bind(lease),
        setupSignal,
      ),
    ]);
    const failure = initialized.find((item) => item.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  } catch (cause) {
    await lease?.release().catch(() => undefined);
    state.active = false;
    if (owned) await workspace.close({ preserve: true });
    throw cause;
  }
  const runtime = lease;
  let busy: Promise<unknown> | undefined,
    closing: Promise<Disposal> | undefined,
    closed = false;
  const known = new Set<string>();
  const exclusive = <T>(action: () => Promise<T>): Promise<T> => {
    invariant(!closed && !closing, "Sandbox is closed");
    invariant(
      !busy,
      "Sandbox already has an active operation; use another sandbox for parallel work",
    );
    const pending = Promise.resolve().then(action);
    busy = pending;
    void pending.then(
      () => {
        busy = undefined;
      },
      () => {
        busy = undefined;
      },
    );
    return pending;
  };
  const selectAgent = async (
    selected: AgentAdapter | undefined,
    signal: AbortSignal,
  ) => {
    invariant(selected, "Provide an agent on the sandbox or this operation");
    if (!prepared.has(selected))
      prepared.set(
        selected,
        provider.placement === "remote" && options.bootstrap !== false
          ? await prepareAdapter(selected, runtime, signal)
          : selected,
      );
    const variables = await resolveVariables(
      workspace.repository,
      selected.variables,
      provider.variables,
    );
    const adapter = prepared.get(selected)!;
    return {
      selected,
      adapter,
      executionLease: {
        ...runtime,
        invoke(command: Command) {
          return runtime.invoke({
            ...command,
            variables: { ...variables, ...command.variables },
          });
        },
      },
    };
  };
  const conversationKey = (agent: AgentAdapter, id: string) =>
    `${agent.conversations ?? agent.name}:${id}`;
  const restore = async (id: string, agent: AgentAdapter) => {
    if (known.has(conversationKey(agent, id))) return;
    invariant(
      agent.conversations,
      "This adapter does not support native conversations",
    );
    const found = await locateConversation(
      agent.conversations,
      id,
      workspace.repository,
      options.conversationHome,
    );
    if (
      provider.placement !== "host" ||
      workspace.directory !== workspace.repository
    )
      await restoreConversation(found, runtime, staging);
    known.add(conversationKey(agent, id));
  };
  const result: Sandbox = {
    workspace,
    root: runtime.root,
    dispatch<T>(dispatch: DispatchOptions<T>) {
      validateDispatch(dispatch);
      return exclusive(async () => {
        const signal = dispatch.signal
          ? AbortSignal.any([dispatch.signal, stop.signal])
          : stop.signal;
        const { selected, adapter, executionLease } = await selectAgent(
          dispatch.agent ?? options.agent,
          signal,
        );
        if (dispatch.continuation)
          await restore(dispatch.continuation.id, selected);
        const baseline = (
          await git(workspace.directory, ["rev-parse", "HEAD"])
        ).trim();
        const log = await journal(
          workspace.repository,
          dispatch.logging ?? options.logging,
          dispatch.label,
        );
        let execution: Execution<T> | undefined,
          transcript: ConversationLocation | undefined;
        let failure: unknown;
        let conversation = dispatch.continuation?.id;
        const conversations = new Set<string>(
          conversation ? [conversation] : [],
        );
        try {
          execution = await execute(
            workspace,
            executionLease,
            adapter,
            provider.placement === "host",
            {
              ...dispatch,
              signal,
              observe(event) {
                if (event.kind === "conversation") {
                  conversation = event.id;
                  conversations.add(event.id);
                  known.add(conversationKey(selected, event.id));
                }
                log.record(event);
                notify(dispatch.observe, event);
              },
            },
          );
        } catch (cause) {
          failure = cause;
        }
        try {
          await sync?.pull();
          if (selected.conversations && selected.capture !== false)
            for (const id of conversations)
              transcript = await captureConversation(
                selected.conversations,
                id,
                workspace.repository,
                runtime,
                staging,
                {
                  ...(options.conversationHome
                    ? { home: options.conversationHome }
                    : {}),
                  ...(dispatch.warn ? { warn: dispatch.warn } : {}),
                  local: provider.placement === "host",
                },
              );
        } catch (cause) {
          failure = failure
            ? new AggregateError(
                [failure, cause],
                "Execution and recovery both failed",
              )
            : cause;
        }
        try {
          await log.close();
        } catch (cause) {
          failure ??= cause;
        }
        const changes = await commits(
          workspace.directory,
          baseline,
          options.limits?.collectMs,
        );
        if (failure) {
          if (failure instanceof ResponseError)
            failure.recovery = {
              ...failure.recovery,
              commits: changes,
              transcript: transcript?.file,
              log: log.file,
            };
          throw failure;
        }
        invariant(execution, "Execution did not produce a result");
        return {
          ...execution,
          branch: workspace.branch,
          directory: workspace.directory,
          commits: changes,
          ...(transcript ? { transcript: transcript.file } : {}),
          ...(log.file ? { log: log.file } : {}),
          resume<U>(next: DispatchOptions<U>) {
            invariant(conversation, "No conversation was emitted");
            return result.resume(conversation, { agent: selected, ...next });
          },
          fork<U>(next: DispatchOptions<U>) {
            invariant(conversation, "No conversation was emitted");
            return result.fork(conversation, { agent: selected, ...next });
          },
        };
      });
    },
    resume(id, dispatch) {
      return result.dispatch({ ...dispatch, continuation: { id } });
    },
    fork(id, dispatch) {
      return result.dispatch({ ...dispatch, continuation: { id, fork: true } });
    },
    attach(settings = {}) {
      validateBrief(settings.brief, true);
      return exclusive(async () => {
        const signal = settings.signal
          ? AbortSignal.any([settings.signal, stop.signal])
          : stop.signal;
        const { selected, adapter, executionLease } = await selectAgent(
          settings.agent ?? options.agent,
          signal,
        );
        if (settings.continuation)
          await restore(settings.continuation.id, selected);
        const text = settings.brief
          ? await renderBrief(
              settings.brief,
              workspace,
              executionLease,
              provider.placement === "host",
              settings,
            )
          : undefined;
        const command = adapter.request({
          interactive: true,
          ...(text === undefined ? {} : { text }),
          ...(settings.continuation
            ? { continuation: settings.continuation }
            : {}),
        });
        const baseline = (
          await git(workspace.directory, ["rev-parse", "HEAD"])
        ).trim();
        let output: CommandResult;
        try {
          output = await executionLease.invoke({
            ...command,
            deadlineMs: 86_400_000,
            signal: settings.signal
              ? AbortSignal.any([settings.signal, stop.signal])
              : stop.signal,
          });
        } finally {
          await sync?.pull();
        }
        return {
          ...output,
          branch: workspace.branch,
          directory: workspace.directory,
          commits: await commits(
            workspace.directory,
            baseline,
            options.limits?.collectMs,
          ),
        };
      });
    },
    command(command) {
      return exclusive(async () => {
        try {
          return await runtime.invoke({
            ...command,
            signal: command.signal
              ? AbortSignal.any([command.signal, stop.signal])
              : stop.signal,
          });
        } finally {
          await sync?.pull();
        }
      });
    },
    close(settings = {}) {
      if (closing) return closing;
      closing = (async () => {
        stop.abort(new OutpostError("aborted", "Sandbox closed"));
        await busy?.catch(() => undefined);
        let failure: unknown;
        try {
          await runtime.release();
        } catch (cause) {
          failure = cause;
        }
        state.active = false;
        closed = true;
        unregister();
        const disposal = owned
          ? await workspace.close({ preserve: settings.preserve || !!failure })
          : {};
        if (failure) throw failure;
        return disposal;
      })();
      return closing;
    },
    async [Symbol.asyncDispose]() {
      await result.close();
    },
  };
  const unregister = registerCleanup(() => result.close({ preserve: true }));
  return result;
}

export async function dispatch<T = undefined>(
  options: SandboxOptions &
    DispatchOptions<T> & { readonly agent: AgentAdapter },
): Promise<DispatchResult<T>> {
  validateDispatch(options);
  if (options.continuation) {
    invariant(
      options.agent.conversations,
      "This adapter does not support native conversations",
    );
    await locateConversation(
      options.agent.conversations,
      options.continuation.id,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      options.conversationHome,
    );
  }
  const sandbox = await createSandbox(options);
  const {
    brief: _brief,
    response: _response,
    continuation: _continuation,
    passes: _passes,
    ...configuration
  } = options;
  let successful = false;
  try {
    const output = await sandbox.dispatch(options);
    await sandbox.workspace.integrate();
    successful = true;
    const disposed = await sandbox.close();
    const continuation = output.conversation;
    return {
      ...output,
      ...disposed,
      resume<U>(next: DispatchOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...configuration,
          ...next,
          continuation: { id: continuation },
        });
      },
      fork<U>(next: DispatchOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...configuration,
          ...next,
          continuation: { id: continuation, fork: true },
        });
      },
    };
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}

export async function attach(
  options: SandboxOptions & AttachOptions & { readonly agent: AgentAdapter },
): Promise<AttachResult> {
  validateBrief(options.brief, true);
  if (options.continuation) {
    invariant(
      options.agent.conversations,
      "This adapter does not support native conversations",
    );
    await locateConversation(
      options.agent.conversations,
      options.continuation.id,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      options.conversationHome,
    );
  }
  const sandbox = await createSandbox(options);
  let successful = false;
  try {
    const baseline = (
      await git(sandbox.workspace.directory, ["rev-parse", "HEAD"])
    ).trim();
    const result = await sandbox.attach(options);
    const changes = await commits(
      sandbox.workspace.directory,
      baseline,
      options.limits?.collectMs,
    );
    if (result.status === 0) await sandbox.workspace.integrate();
    const disposal = await sandbox.close({ preserve: result.status !== 0 });
    successful = true;
    return {
      ...result,
      ...disposal,
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
      commits: changes,
    };
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}
