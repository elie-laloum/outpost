import type { AgentEvent, CustomAgent, Usage } from "../domain/agent.types.ts";
import type { ModelProvider } from "../domain/model.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { addUsage } from "../domain/usage.ts";
import { activityWatchdog } from "./activity-watchdog.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions, Turn } from "./execution.types.ts";
import { notify } from "./observation.ts";

export async function customTurn(
  lease: SandboxLease,
  agent: CustomAgent,
  prompt: string,
  options: DispatchOptions<unknown>,
  pass: number,
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
  let reported = false;
  const pending = new Set<Promise<unknown>>();
  const track = <T>(operation: Promise<T>): Promise<T> => {
    pending.add(operation);
    void operation
      .finally(() => pending.delete(operation))
      .catch(() => undefined);
    return operation;
  };
  const observe = (event: AgentEvent) => {
    signal.throwIfAborted();
    invariant(
      !["conversation", "usage", "result", "finished", "summary"].includes(
        event.kind,
      ),
      "Custom harness must return its result; conversations and usage events are not supported",
    );
    watchdog.refresh(false);
    notify(options.observe, { ...event, pass, at: new Date().toISOString() });
  };
  const modelProvider: ModelProvider = {
    name: agent.harness.modelProvider.name,
    request(request) {
      return track(
        (async () => {
          signal.throwIfAborted();
          invariant(
            request.model === agent.model,
            "Harness request model must match its agent",
          );
          const result = await agent.harness.modelProvider.request({
            ...request,
            model: agent.model,
            signal: request.signal
              ? AbortSignal.any([request.signal, signal])
              : signal,
          });
          signal.throwIfAborted();
          if (result.usage) {
            usage = addUsage(usage, result.usage);
            reported = true;
            notify(options.observe, {
              kind: "usage",
              tokens: result.usage,
              pass,
              at: new Date().toISOString(),
            });
          }
          watchdog.refresh(false);
          return result;
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
  try {
    signal.throwIfAborted();
    watchdog.refresh(false);
    const result = await agent.harness.run(
      { prompt },
      { model: agent.model, modelProvider, sandbox, signal, observe },
    );
    signal.throwIfAborted();
    invariant(
      result && typeof result.text === "string",
      "Harness must return text",
    );
    if (!reported && result.usage) usage = result.usage;
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
      text: result.text,
      pass,
      at: new Date().toISOString(),
    });
    notify(options.observe, {
      kind: "finished",
      pass,
      at: new Date().toISOString(),
    });
    return {
      text: result.text,
      usage,
      status: 0,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    signal.throwIfAborted();
    throw error;
  } finally {
    controller.abort(new OutpostError("aborted", "Harness turn ended"));
    clearTimeout(timer);
    watchdog.close();
    await Promise.allSettled([...pending]);
  }
}
