import { modelUsage } from "../domain/usage.ts";
import { invariant } from "../domain/errors.ts";
import type {
  ModelProvider,
  ModelRequest,
  ModelResult,
  ModelStreamEvent,
} from "../domain/model.types.ts";
import type { HarnessModelScope } from "./harness-model-provider.types.ts";

export function harnessModelProvider(scope: HarnessModelScope): ModelProvider {
  const { agent, signal, budget, track } = scope;
  const provider = agent.harness.modelProvider;
  const scoped = (request: ModelRequest): ModelRequest => {
    signal.throwIfAborted();
    budget.check();
    return {
      ...request,
      signal,
    };
  };
  const account = (received: ModelResult, model: string): ModelResult => {
    const result = scope.trackModels
      ? {
          ...received,
          usage: modelUsage(
            received.usage ?? {
              input: 0,
              cached: 0,
              output: 0,
              complete: false,
            },
            model,
          ),
        }
      : received;
    signal.throwIfAborted();
    invariant(
      result && typeof result.text === "string",
      "Model provider must return text",
    );
    scope.account(result);
    budget.account(result);
    return result;
  };
  async function* stream(
    request: ModelRequest,
  ): AsyncGenerator<ModelStreamEvent> {
    let finish!: () => void;
    track(new Promise<void>((resolve) => (finish = resolve)));
    try {
      let received = false;
      for await (const event of provider.stream!(scoped(request))) {
        signal.throwIfAborted();
        if (event.type === "result") {
          invariant(!received, "Model stream returned more than one result");
          received = true;
          yield {
            type: "result",
            result: account(event.result, request.model),
          };
          continue;
        }
        yield event;
      }
    } finally {
      finish();
    }
  }
  return {
    name: provider.name,
    ...(provider.stream ? { stream } : {}),
    request: (request) =>
      track(
        Promise.resolve().then(async () =>
          account(await provider.request(scoped(request)), request.model),
        ),
      ),
  };
}
