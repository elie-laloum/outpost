import type { AgentEvent, CustomAgent, Usage } from "../domain/agent.types.ts";
import type { ModelResult } from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { steeringInbox } from "../domain/steering.ts";
import { harnessBudget } from "./harness-budget.ts";
import { harnessModelProvider } from "./harness-model-provider.ts";
import { MAX_DELEGATION_DEPTH } from "../domain/subagent.constants.ts";
import { addUsage } from "../domain/usage.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { openTranscript } from "../infrastructure/conversations/harness-transcript.ts";
import type { TranscriptHandle } from "../infrastructure/conversations/harness-transcript.types.ts";
import { storageFor } from "./agent-storage.ts";
import { harnessHistory } from "./harness-history.ts";
import { harnessLoop } from "./harness-loop.ts";
import { withMcpTools } from "./harness-mcp.ts";
import type { HarnessTool } from "../domain/tool.types.ts";
import type { CustomTurnContext } from "./harness.types.ts";
import { stopReason } from "./stop-reason.ts";
import { notify } from "./observation.ts";

export async function customTurn(
  lease: SandboxLease,
  agent: CustomAgent,
  prompt: string,
  options: DispatchOptions<unknown>,
  pass: number,
  context: CustomTurnContext,
): Promise<Turn> {
  const start = Date.now();
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const watchdog = activityWatchdog(controller, options, pass);
  const timer = setTimeout(
    () =>
      controller.abort(
        new OutpostError("timeout", "Harness execution timed out"),
      ),
    options.deadlineMs ?? executionDefaults.deadlineMs,
  );
  let usage: Usage = { input: 0, cached: 0, output: 0 };
  const pending = new Set<Promise<unknown>>();
  const track = <T>(operation: Promise<T>): Promise<T> => {
    pending.add(operation);
    void operation
      .finally(() => pending.delete(operation))
      .catch(() => undefined);
    return operation;
  };
  const emit = (event: AgentEvent) => {
    signal.throwIfAborted();
    watchdog.refresh(false);
    notify(options.observe, { ...event, pass, at: new Date().toISOString() });
  };
  const budget = harnessBudget(agent.harness.limits);
  const inbox = steeringInbox(options.steering);
  const account = (result: ModelResult, subagentId?: string): void => {
    const tokens = result.usage ?? {
      input: 0,
      cached: 0,
      output: 0,
      complete: false,
    };
    usage = addUsage(usage, tokens);
    notify(options.observe, {
      kind: "usage",
      tokens,
      ...(subagentId ? { subagentId } : {}),
      pass,
      at: new Date().toISOString(),
    });
    watchdog.refresh(false);
  };
  const modelScope = { track, account };
  const modelProvider = harnessModelProvider({
    agent,
    signal,
    budget,
    ...modelScope,
  });
  const sandbox: SandboxLease = {
    root: lease.root,
    home: lease.home,
    ...(lease.liveInput ? { liveInput: true } : {}),
    invoke: (command) => {
      signal.throwIfAborted();
      return track(
        lease.invoke({
          ...command,
          observe(channel, chunk) {
            watchdog.refresh(false);
            notify((value) => command.observe?.(channel, value), chunk);
          },
          signal: command.signal
            ? AbortSignal.any([command.signal, signal])
            : signal,
        }),
      );
    },
    upload: (source, destination, settings = {}) => {
      signal.throwIfAborted();
      return track(
        lease.upload(source, destination, {
          ...settings,
          signal: settings.signal
            ? AbortSignal.any([settings.signal, signal])
            : signal,
        }),
      );
    },
    download: (source, destination, settings = {}) => {
      signal.throwIfAborted();
      return track(
        lease.download(source, destination, {
          ...settings,
          signal: settings.signal
            ? AbortSignal.any([settings.signal, signal])
            : signal,
        }),
      );
    },
    release: async () => {
      throw new OutpostError(
        "configuration",
        "The harness does not own its sandbox lease",
      );
    },
  };
  let transcript: TranscriptHandle | undefined;
  try {
    signal.throwIfAborted();
    watchdog.refresh(false);
    const storage = storageFor(agent);
    transcript = storage
      ? await openTranscript({
          repository: context.repository,
          store: storage,
          model: agent.model.name,
          ...(context.continuation
            ? { continuation: context.continuation }
            : {}),
        })
      : undefined;
    if (transcript) emit({ kind: "conversation", id: transcript.id });
    const run = (tools: readonly HarnessTool[]) =>
      harnessLoop(
        {
          agent,
          repository: context.repository,
          ...(transcript ? { conversation: transcript.id } : {}),
          budget,
          modelScope,
          permissions: agent.harness.permissions
            ? [agent.harness.permissions]
            : [],
          depth: 0,
          maxDepth:
            agent.harness.limits.maxDelegationDepth ?? MAX_DELEGATION_DEPTH,
          verbose: options.observation?.verbose ?? false,
          tools,
          modelProvider,
          sandbox,
          signal,
          ...(inbox
            ? {
                steer: () => {
                  const messages = inbox.take();
                  for (const message of messages)
                    message.deliver({ mode: "injected" });
                  return messages.map((message) => message.text);
                },
              }
            : {}),
          emit,
          hold: () => watchdog.hold(),
        },
        prompt,
        harnessHistory(transcript),
      );
    const text = context.repair
      ? await run(agent.harness.tools.filter((tool) => tool.readOnly))
      : await withMcpTools(
          agent.harness,
          sandbox,
          signal,
          agent.harness.tools,
          run,
        );
    signal.throwIfAborted();
    for (const value of [
      usage.input,
      usage.cached,
      usage.output,
      usage.cacheCreated ?? 0,
    ])
      invariant(
        Number.isSafeInteger(value) && value >= 0,
        "Harness usage must contain nonnegative token counts",
      );
    invariant(
      usage.cached + (usage.cacheCreated ?? 0) <= usage.input,
      "Cached tokens must be included in input usage",
    );
    notify(options.observe, {
      kind: "result",
      text,
      pass,
      at: new Date().toISOString(),
    });
    notify(options.observe, {
      kind: "finished",
      pass,
      at: new Date().toISOString(),
    });
    return {
      text,
      usage,
      status: 0,
      durationMs: Date.now() - start,
      ...(transcript ? { conversation: transcript.id } : {}),
    };
  } catch (error) {
    const reason = stopReason(options.signal, controller.signal.reason, error);
    if (reason)
      notify(options.observe, {
        kind: "stopped",
        reason,
        pass,
        at: new Date().toISOString(),
      });
    signal.throwIfAborted();
    throw error;
  } finally {
    await transcript?.close();
    controller.abort(new OutpostError("aborted", "Harness turn ended"));
    clearTimeout(timer);
    watchdog.close();
    await Promise.allSettled([...pending]);
  }
}
