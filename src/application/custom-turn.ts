import type { AgentEvent, CustomAgent, Usage } from "../domain/agent.types.ts";
import type {
  ModelProvider,
  ModelRequest,
  ModelResult,
  ModelStreamEvent,
} from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { openTranscript } from "../infrastructure/conversations/harness-transcript.ts";
import type { TranscriptHandle } from "../infrastructure/conversations/harness-transcript.types.ts";
import { storageFor } from "./agent-storage.ts";
import { harnessHistory } from "./harness-history.ts";
import { harnessLoop } from "./harness-loop.ts";
import type { CustomTurnContext } from "./harness.types.ts";
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
  const provider = agent.harness.modelProvider;
  const scoped = (request: ModelRequest): ModelRequest => {
    const { reasoning, maxOutputTokens } = agent.model;
    return {
      ...(reasoning === undefined ? {} : { reasoning }),
      ...(maxOutputTokens === undefined ? {} : { maxOutputTokens }),
      ...request,
      signal,
    };
  };
  const account = (result: ModelResult): ModelResult => {
    signal.throwIfAborted();
    invariant(
      result && typeof result.text === "string",
      "Model provider must return text",
    );
    if (result.usage) {
      usage = addUsage(usage, result.usage);
      notify(options.observe, {
        kind: "usage",
        tokens: result.usage,
        pass,
        at: new Date().toISOString(),
      });
    }
    watchdog.refresh(false);
    return result;
  };
  async function* stream(
    request: ModelRequest,
  ): AsyncGenerator<ModelStreamEvent> {
    signal.throwIfAborted();
    let finish!: () => void;
    track(new Promise<void>((resolve) => (finish = resolve)));
    try {
      for await (const event of provider.stream!(scoped(request))) {
        signal.throwIfAborted();
        watchdog.refresh(false);
        yield event.type === "result"
          ? { type: "result", result: account(event.result) }
          : event;
      }
    } finally {
      finish();
    }
  }
  const modelProvider: ModelProvider = {
    name: provider.name,
    ...(provider.stream ? { stream } : {}),
    request(request) {
      return track(
        (async () => {
          signal.throwIfAborted();
          return account(await provider.request(scoped(request)));
        })(),
      );
    },
  };
  const sandbox: SandboxLease = {
    root: lease.root,
    home: lease.home,
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
    const text = await harnessLoop(
      {
        agent,
        tools: context.repair
          ? agent.harness.tools.filter((tool) => tool.readOnly)
          : agent.harness.tools,
        modelProvider,
        sandbox,
        signal,
        emit,
        hold: () => watchdog.hold(),
      },
      prompt,
      harnessHistory(transcript),
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
