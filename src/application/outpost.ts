import { join, posix } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { OutpostError, invariant, recordRecovery } from "../domain/errors.ts";
import type {
  AgentAdapter,
  BranchPolicy,
  Command,
  CommandResult,
  Commit,
  ConversationRecord,
  Disposal,
  LifecycleHooks,
  SandboxLease,
  SandboxProvider,
  StageLimits,
  WorkspaceRecord,
} from "../domain/ports.ts";
import type { Brief } from "../domain/prompts.ts";
import { validateBrief } from "../domain/prompts.ts";
import {
  acquireWorkspace,
  commits,
  git,
  type WorkspaceLease,
} from "../infrastructure/git.ts";
import { nativeConversations } from "../infrastructure/conversations.ts";
import { resolveVariables } from "../infrastructure/settings.ts";
import {
  executeProcess,
  quote,
  requireSuccess,
} from "../infrastructure/process.ts";
import { journal, type Logging } from "../infrastructure/journal.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { restoreTerminal } from "../infrastructure/terminal.ts";
import { boundedTransfers } from "../infrastructure/transfer.ts";
import { docker } from "../providers/docker.ts";
import { agentVersions } from "../providers/versions.ts";
import {
  execute,
  notify,
  renderBrief,
  validateDispatch,
  preflightDispatch,
  type DispatchOptions,
  type Execution,
} from "./execution.ts";
import { seedRemote, type RemoteSync } from "./remote-workspace.ts";
import { completeBrief, type VariableQuestion } from "./interactive-brief.ts";

export interface WorkspaceOptions {
  readonly signal?: AbortSignal;
  readonly repository?: string;
  readonly branch?: BranchPolicy;
  readonly copies?: readonly string[];
  readonly limits?: StageLimits;
  readonly label?: string;
  readonly hooks?: LifecycleHooks;
}

export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      DispatchOptions<T> & { readonly agent: AgentAdapter },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    >,
  ): Promise<Sandbox>;
  attach(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      AttachOptions & { readonly agent: AgentAdapter },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

const workspaces = new WeakMap<
  Workspace,
  {
    lease: WorkspaceLease;
    active: boolean;
    closed: boolean;
    hooks?: LifecycleHooks;
  }
>();

const storageFor = (agent: AgentAdapter) =>
  agent.storage ??
  (agent.conversations ? nativeConversations(agent.conversations) : undefined);

async function startupFailure(
  workspace: WorkspaceRecord,
  cause: unknown,
  options: { logging?: Logging; label?: string },
): Promise<void> {
  try {
    const log = await journal(
      workspace.repository,
      options.logging,
      options.label,
    );
    log.record({
      kind: "phase",
      name: "preparation failed",
      branch: workspace.branch,
      directory: workspace.directory,
    });
    log.record({
      kind: "failure",
      message: cause instanceof Error ? cause.message : String(cause),
    });
    await log.close();
    recordRecovery(cause, {
      branch: workspace.branch,
      directory: workspace.directory,
      log: log.file,
    });
  } catch {
    /* Logging must preserve the preparation error. */
  }
}

export async function openWorkspace(
  options: WorkspaceOptions = {},
): Promise<Workspace> {
  options.signal?.throwIfAborted();
  const lease = await acquireWorkspace(options);
  try {
    await hooks(
      options.hooks?.workspaceReady ?? [],
      lease.directory,
      executeProcess,
      options.signal,
    );
  } catch (cause) {
    await startupFailure(lease, cause, options);
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
  readonly includeUncommitted?: boolean;
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
  readonly ask?: VariableQuestion;
  readonly agent?: AgentAdapter;
  readonly brief?: Brief;
  readonly continuation?: { readonly id: string; readonly fork?: boolean };
  readonly signal?: AbortSignal;
  readonly terminal?: Command["terminal"];
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
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
  fork<U = undefined>(
    options: ContinuationOptions<U>,
  ): Promise<DispatchResult<U>>;
}

export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;

function continuationConfiguration<T extends SandboxOptions>(
  configuration: T,
  next: SandboxOptions,
): T {
  if (next.repository || next.branch || next.copies) {
    const { workspace, ...rest } = configuration;
    return {
      ...(workspace ? { repository: workspace.repository } : {}),
      ...rest,
    } as T;
  }
  return configuration;
}

export interface WarmDispatchResult<T> extends Omit<
  DispatchResult<T>,
  "resume" | "fork"
> {
  resume<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
  fork<U = undefined>(
    options: DispatchOptions<U>,
  ): Promise<WarmDispatchResult<U>>;
}

function warmContinuation(options: object): void {
  invariant(
    ![
      "repository",
      "branch",
      "provider",
      "workspace",
      "copies",
      "hooks",
      "limits",
      "bootstrap",
      "conversationHome",
      "includeUncommitted",
    ].some((key) => key in options),
    "Warm continuation uses its existing sandbox; use dispatch() to change sandbox settings",
  );
}

export interface Sandbox {
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
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
  parallel = false,
): Promise<void> {
  if (parallel) {
    const controller = new AbortController();
    const combined = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;
    const outcomes = await Promise.allSettled(
      commands.map((command) =>
        hooks([command], directory, invoke, combined).catch((cause) => {
          controller.abort(cause);
          throw cause;
        }),
      ),
    );
    const failure = outcomes.find((outcome) => outcome.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
    return;
  }
  for (const command of commands)
    await requireSuccess(
      {
        ...command,
        directory: command.directory ?? directory,
        deadlineMs: command.deadlineMs ?? 600_000,
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
  options.signal?.throwIfAborted();
  const provider = options.provider ?? docker();
  if (provider.placement === "remote" && !options.workspace && !options.branch)
    options = { ...options, branch: { mode: "integrate" } };
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
  const lifecycle = options.hooks ?? state.hooks;
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
    lease = boundedTransfers(
      await provider.acquire({
        repository: workspace.repository,
        directory: workspace.directory,
        gitDirectories: workspace.gitDirectories,
        variables,
        signal: setupSignal,
      }),
      {
        ...(options.limits?.copyMs
          ? { deadlineMs: options.limits.copyMs }
          : {}),
      },
    );
    if (provider.placement === "remote") {
      sync = await seedRemote(workspace, lease, {
        ...(options.includeUncommitted ? { includeUncommitted: true } : {}),
        ...(options.limits ? { limits: options.limits } : {}),
        signal: setupSignal,
      });
      for (const path of options.copies ?? [])
        if (
          await stat(join(workspace.directory, path)).catch((error) => {
            if ((error as NodeJS.ErrnoException).code === "ENOENT")
              return undefined;
            throw error;
          })
        )
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
    const initialized = await Promise.allSettled(
      [
        hooks(
          lifecycle?.hostReady ?? [],
          workspace.directory,
          executeProcess,
          setupSignal,
        ),
        hooks(
          lifecycle?.sandboxReady ?? [],
          lease.root,
          lease.invoke.bind(lease),
          setupSignal,
          true,
        ),
      ].map((pending) =>
        pending.catch((cause) => {
          stop.abort(cause);
          throw cause;
        }),
      ),
    );
    const failure = initialized.find((item) => item.status === "rejected");
    if (failure?.status === "rejected") throw failure.reason;
  } catch (cause) {
    await startupFailure(workspace, cause, options);
    await lease?.release().catch(() => undefined);
    state.active = false;
    if (owned) await workspace.close();
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
    `${agent.storage?.name ?? agent.conversations ?? agent.name}:${id}`;
  const restore = async (id: string, agent: AgentAdapter) => {
    if (known.has(conversationKey(agent, id))) return;
    const storage = storageFor(agent);
    invariant(storage, "This adapter does not support native conversations");
    const found = await storage.locate(
      id,
      workspace.repository,
      options.conversationHome,
    );
    if (
      provider.placement !== "host" ||
      workspace.directory !== workspace.repository
    )
      await storage.restore(found, {
        repository: workspace.repository,
        sandbox: runtime,
        staging,
      });
    known.add(conversationKey(agent, id));
  };
  const result: Sandbox = {
    workspace,
    root: runtime.root,
    dispatch<T>(dispatch: DispatchOptions<T>) {
      validateDispatch(dispatch);
      return exclusive(async () => {
        await preflightDispatch(
          dispatch,
          workspace.repository,
          dispatch.agent ?? options.agent,
        );
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
          transcript: ConversationRecord | undefined;
        const captured = new Map<string, ConversationRecord>();
        const storage = storageFor(selected);
        let failure: unknown;
        let conversation = dispatch.continuation?.id;
        const conversations = new Set<string>(
          conversation ? [conversation] : [],
        );
        const save = async (id: string) => {
          invariant(storage, "Conversation storage is unavailable");
          const location = await storage.capture(id, {
            repository: workspace.repository,
            sandbox: runtime,
            staging,
            ...(options.conversationHome
              ? { home: options.conversationHome }
              : {}),
            ...(dispatch.warn ? { warn: dispatch.warn } : {}),
            local: provider.placement === "host",
          });
          captured.set(id, location);
          transcript = location;
          return location;
        };
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
            async (turn) => {
              if (!turn.conversation || !storage || selected.capture === false)
                return turn;
              const location = await save(turn.conversation);
              const usage = selected.transcriptUsage?.(
                await readFile(location.file, "utf8"),
              );
              return {
                ...turn,
                transcript: location.file,
                ...(usage ? { usage } : {}),
              };
            },
          );
        } catch (cause) {
          failure = cause;
          log.record({
            kind: "failure",
            message: cause instanceof Error ? cause.message : String(cause),
          });
        }
        try {
          await sync?.pull();
          if (storage && selected.capture !== false)
            for (const id of conversations)
              if (failure || !captured.has(id)) await save(id);
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
          recordRecovery(failure, {
            branch: workspace.branch,
            directory: workspace.directory,
            commits: changes,
            transcript: transcript?.file,
            log: log.file,
          });
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
            warmContinuation(next);
            invariant(conversation, "No conversation was emitted");
            return result.resume(conversation, { agent: selected, ...next });
          },
          fork<U>(next: DispatchOptions<U>) {
            warmContinuation(next);
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
      settings.signal?.throwIfAborted();
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
        const brief = await completeBrief(settings.brief, signal, settings.ask);
        const text = brief
          ? await renderBrief(
              brief,
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
            ...(settings.terminal ? { terminal: settings.terminal } : {}),
            deadlineMs: 86_400_000,
            signal: settings.signal
              ? AbortSignal.any([settings.signal, stop.signal])
              : stop.signal,
          });
        } finally {
          restoreTerminal();
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
      command.signal?.throwIfAborted();
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
          await sync?.close();
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
  options.signal?.throwIfAborted();
  await preflightDispatch(
    options,
    options.workspace?.repository ?? options.repository ?? process.cwd(),
    options.agent,
  );
  if ((options.passes ?? 1) > 1) {
    const outputs: DispatchResult<T>[] = [];
    for (let index = 0; index < options.passes!; index++) {
      options.signal?.throwIfAborted();
      const output = await dispatch({
        ...options,
        passes: 1,
        observe: (event) =>
          notify(options.observe, { ...event, pass: index + 1 }),
      });
      outputs.push(output);
      if (output.completed) break;
    }
    const last = outputs.at(-1)!;
    return {
      ...last,
      text: outputs.map((output) => output.text).join("\n"),
      turns: outputs.flatMap((output) => output.turns),
      commits: outputs.flatMap((output) => output.commits),
      usage: outputs.reduce(
        (sum, output) => ({
          input: sum.input + output.usage.input,
          cached: sum.cached + output.usage.cached,
          output: sum.output + output.usage.output,
          ...(sum.cacheCreated !== undefined ||
          output.usage.cacheCreated !== undefined
            ? {
                cacheCreated:
                  (sum.cacheCreated ?? 0) + (output.usage.cacheCreated ?? 0),
              }
            : {}),
        }),
        {
          input: 0,
          cached: 0,
          output: 0,
        } as import("../domain/ports.ts").Usage,
      ),
    };
  }
  if (options.continuation) {
    const storage = storageFor(options.agent);
    invariant(storage, "This adapter does not support native conversations");
    await storage.locate(
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
      resume<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          ...next,
          continuation: { id: continuation },
        });
      },
      fork<U>(next: ContinuationOptions<U>) {
        invariant(continuation, "No conversation was emitted");
        return dispatch({
          ...continuationConfiguration(configuration, next),
          ...next,
          continuation: { id: continuation, fork: true },
        });
      },
    };
  } catch (cause) {
    recordRecovery(cause, {
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
    });
    throw cause;
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}

export async function attach(
  options: SandboxOptions & AttachOptions & { readonly agent: AgentAdapter },
): Promise<AttachResult> {
  options.signal?.throwIfAborted();
  validateBrief(options.brief, true);
  const brief = await completeBrief(options.brief, options.signal, options.ask);
  if (brief) options = { ...options, brief };
  if (options.continuation) {
    const storage = storageFor(options.agent);
    invariant(storage, "This adapter does not support native conversations");
    await storage.locate(
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
