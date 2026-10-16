import { OutpostError, recordRecovery } from "../domain/errors.ts";
import { responseInstructions } from "../domain/response-instructions.ts";
import type { ResponseSpec } from "../domain/response.types.ts";
import type {
  ModelContentBlock,
  ModelRequest,
  ModelResult,
  ModelStopReason,
  ModelToolCallBlock,
  ModelToolSpec,
} from "../domain/model.types.ts";
import { loadedSkills } from "../domain/skill.ts";
import type {
  HarnessHistory,
  HarnessRuntime,
  LoopState,
  StopHandler,
} from "./harness.types.ts";
import { compact } from "./harness-context.ts";
import { each, sessionInstructions, stopRequest } from "./harness-hooks.ts";
import { executeToolCalls } from "./tool-execution.ts";
import { routeHarnessModel } from "./harness-routing.ts";
import {
  transformPrompt,
  transformRequest,
  transformResult,
  reportModelError,
} from "./harness-hook-transforms.ts";

const stopHandlers: Readonly<Record<ModelStopReason, StopHandler>> = {
  end: async (runtime, state, result, content) => {
    const message = await stopRequest(runtime, result.text, state.step);
    await state.history.append({ role: "assistant", content });
    const instructions = await steering(runtime, state.step);
    if (message === undefined && !instructions.length) return result.text;
    if (message !== undefined)
      runtime.emit({ kind: "stop-prevented", message });
    await state.history.append({
      role: "user",
      content: [
        ...(message === undefined
          ? []
          : [{ type: "text" as const, text: message }]),
        ...instructions,
      ],
    });
    return undefined;
  },
  "max-tokens": async (_runtime, state) => {
    throw new OutpostError(
      "limit",
      `Model output reached maxOutputTokens during step ${state.step}`,
      { limit: "maxOutputTokens", step: state.step },
    );
  },
  refusal: async (_runtime, state) => {
    throw new OutpostError("response", "The model refused to continue", {
      step: state.step,
    });
  },
  "tool-calls": async (runtime, state, _result, content) => {
    const calls = content.filter(
      (block): block is ModelToolCallBlock => block.type === "tool-call",
    );
    state.toolCalls += calls.length;
    const { maxToolCalls } = runtime.agent.harness.limits;
    if (maxToolCalls !== undefined && state.toolCalls > maxToolCalls)
      throw limit(
        "maxToolCalls",
        `Harness exceeded ${maxToolCalls} tool calls`,
      );
    await state.history.append({ role: "assistant", content });
    const results = await executeToolCalls(
      runtime,
      calls,
      state.step,
      loadedSkills(state.history.messages),
    );
    await state.history.append({
      role: "user",
      content: [...results, ...(await steering(runtime, state.step))],
    });
    return undefined;
  },
};

export async function harnessLoop(
  runtime: HarnessRuntime,
  prompt: string,
  history: HarnessHistory,
  response?: ResponseSpec<unknown>,
): Promise<string> {
  let failure: unknown;
  let failed = false;
  let text: string | undefined;
  let lastStep = 0;
  try {
    text = await loop(
      runtime,
      prompt,
      history,
      (step) => {
        lastStep = step;
      },
      response,
    );
    return text;
  } catch (error) {
    failed = true;
    failure = error;
    throw error;
  } finally {
    let reason: "success" | "error" | "aborted" | "timeout" | "limit" = failed
      ? "error"
      : "success";
    if (failure instanceof OutpostError && failure.code === "limit")
      reason = "limit";
    if (runtime.signal.aborted) reason = "aborted";
    if (failure instanceof OutpostError && failure.code === "timeout")
      reason = "timeout";
    try {
      await each(
        {
          ...runtime,
          signal: new AbortController().signal,
          emit: (event) => {
            if (!runtime.signal.aborted) runtime.emit(event);
          },
        },
        "run-end",
        {
          reason,
          ...(text === undefined ? {} : { text }),
          ...(failed ? { error: failure } : {}),
        },
        lastStep,
      );
    } catch (error) {
      if (!failed) throw error;
      recordRecovery(failure, { runEndHookError: error });
    }
  }
}

async function loop(
  runtime: HarnessRuntime,
  prompt: string,
  history: HarnessHistory,
  progress: (step: number) => void,
  response?: ResponseSpec<unknown>,
): Promise<string> {
  const { harness } = runtime.agent;
  const system = [
    await instructions(runtime),
    ...(await sessionInstructions(runtime, prompt)),
  ]
    .filter((text) => text.trim())
    .join("\n\n");
  const tools: ModelToolSpec[] = runtime.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
  const initial = await transformPrompt(runtime, prompt, "initial", 0);
  const pending = await steering(runtime, 0);
  const content: ModelContentBlock[] = [
    { type: "text", text: initial },
    ...pending,
  ];
  if (pending.length && response)
    content.push({ type: "text", text: responseInstructions(response) });
  await history.append({
    role: "user",
    content,
  });
  let toolCalls = 0;
  const announcedSkills = new Set<string>();
  for (let step = 1; ; step++) {
    runtime.signal.throwIfAborted();
    if (step > harness.limits.maxSteps)
      throw limit(
        "maxSteps",
        `Harness reached ${harness.limits.maxSteps} steps without a final answer`,
      );
    progress(step);
    runtime.budget.check();
    const newlyLoaded = [...loadedSkills(history.messages)].filter(
      (name) => !announcedSkills.has(name),
    );
    for (const name of newlyLoaded) announcedSkills.add(name);
    if (newlyLoaded.length)
      runtime.emit({ kind: "skills-loaded", names: newlyLoaded });
    runtime.emit({ kind: "step", index: step });
    await compact(runtime, history, step);
    const model = await routeHarnessModel(
      runtime,
      history,
      system,
      tools,
      step,
    );
    runtime = { ...runtime, agent: { ...runtime.agent, model } };
    const request = await transformRequest(
      runtime,
      { messages: history.messages, ...(system ? { system } : {}) },
      step,
    );
    let received: ModelResult;
    try {
      received = await requestModel(runtime, {
        model: model.name,
        ...(model.reasoning === undefined
          ? {}
          : { reasoning: model.reasoning }),
        ...(model.maxOutputTokens === undefined
          ? {}
          : { maxOutputTokens: model.maxOutputTokens }),
        ...request,
        ...(tools.length ? { tools } : {}),
        ...(harness.cache ? { cache: true } : {}),
      });
    } catch (error) {
      await reportModelError(runtime, error, step);
      throw error;
    }
    const result = await transformResult(runtime, received, step);
    const content: readonly ModelContentBlock[] = result.content ?? [
      { type: "text", text: result.text },
    ];
    for (const block of content) {
      if (block.type === "text" && block.text)
        runtime.emit({ kind: "text", text: block.text });
      if (block.type === "reasoning" && block.text)
        runtime.emit({ kind: "reasoning", text: block.text });
    }
    const state: LoopState = { history, step, toolCalls };
    const reason = result.stopReason ?? inferredStop(content);
    if (typeof reason !== "string" || !Object.hasOwn(stopHandlers, reason))
      throw new OutpostError(
        "response",
        "Model returned an unsupported stop reason",
      );
    const answer = await stopHandlers[reason](runtime, state, result, content);
    toolCalls = state.toolCalls;
    runtime.budget.check();
    if (answer !== undefined) return answer;
  }
}

async function instructions(runtime: HarnessRuntime): Promise<string> {
  const texts = await Promise.all(
    runtime.agent.harness.instructions.map((entry) =>
      entry.resolve({
        sandbox: runtime.sandbox,
        signal: runtime.signal,
        model: runtime.agent.model,
        ...(runtime.mcp ? { mcp: runtime.mcp } : {}),
      }),
    ),
  );
  runtime.signal.throwIfAborted();
  runtime.emit({
    kind: "instructions-loaded",
    count: texts.filter((text) => text.trim()).length,
  });
  return texts.filter((text) => text.trim()).join("\n\n");
}

async function steering(
  runtime: HarnessRuntime,
  step: number,
): Promise<ModelContentBlock[]> {
  const texts = runtime.steering?.take(runtime.subagentId) ?? [];
  for (const text of texts)
    runtime.emit({ kind: "steer", text, mode: "injected" });
  const content: ModelContentBlock[] = [];
  for (const text of texts)
    content.push({
      type: "text",
      text: await transformPrompt(runtime, text, "steering", step),
    });
  return content;
}

function inferredStop(content: readonly ModelContentBlock[]): ModelStopReason {
  return content.some((block) => block.type === "tool-call")
    ? "tool-calls"
    : "end";
}

function limit(name: string, message: string): OutpostError {
  return new OutpostError("limit", message, { limit: name });
}

async function requestModel(
  runtime: HarnessRuntime,
  request: ModelRequest,
): Promise<ModelResult> {
  const provider = runtime.modelProvider;
  if (runtime.verbose) runtime.emit({ kind: "model-request", request });
  try {
    const result = await receive();
    if (runtime.verbose)
      runtime.emit({ kind: "model-response", response: result });
    return result;
  } catch (error) {
    runtime.emit({
      kind: "model-error",
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
  async function receive(): Promise<ModelResult> {
    if (!provider.stream) return provider.request(request);
    let result: ModelResult | undefined;
    for await (const event of provider.stream(request)) {
      if (event.type === "text-delta")
        runtime.emit({ kind: "text-delta", text: event.text });
      if (event.type === "reasoning")
        runtime.emit({ kind: "reasoning", text: event.text });
      if (event.type === "retry")
        runtime.emit({
          kind: "model-retry",
          attempt: event.attempt,
          ...(event.message ? { message: event.message } : {}),
        });
      if (event.type === "result") result = event.result;
    }
    if (!result)
      throw new OutpostError("response", "Model stream ended without a result");
    return result;
  }
}
