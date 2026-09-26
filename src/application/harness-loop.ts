import type { Usage } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type {
  ModelContentBlock,
  ModelRequest,
  ModelResult,
  ModelStopReason,
  ModelToolCallBlock,
  ModelToolSpec,
} from "../domain/model.types.ts";
import { loadedSkills } from "../domain/skill.ts";
import { addUsage } from "../domain/usage.ts";
import type {
  HarnessHistory,
  HarnessRuntime,
  LoopState,
  StopHandler,
} from "./harness.types.ts";
import { compact } from "./harness-context.ts";
import {
  afterModel,
  beforeModel,
  sessionInstructions,
  stopRequest,
} from "./harness-hooks.ts";
import { executeToolCalls } from "./tool-execution.ts";

const stopHandlers: Readonly<Record<ModelStopReason, StopHandler>> = {
  end: async (runtime, state, result, content) => {
    const message = await stopRequest(runtime, result.text, state.step);
    await state.history.append({ role: "assistant", content });
    if (message === undefined) return result.text;
    runtime.emit({ kind: "stop-prevented", message });
    await state.history.append({
      role: "user",
      content: [{ type: "text", text: message }],
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
    await state.history.append({
      role: "user",
      content: await executeToolCalls(
        runtime,
        calls,
        state.step,
        loadedSkills(state.history.messages),
      ),
    });
    return undefined;
  },
};

export async function harnessLoop(
  runtime: HarnessRuntime,
  prompt: string,
  history: HarnessHistory,
): Promise<string> {
  const { harness, model } = runtime.agent;
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
  await history.append({
    role: "user",
    content: [{ type: "text", text: prompt }],
  });
  let usage: Usage = { input: 0, cached: 0, output: 0 };
  let toolCalls = 0;
  for (let step = 1; ; step++) {
    runtime.signal.throwIfAborted();
    if (step > harness.limits.maxSteps)
      throw limit(
        "maxSteps",
        `Harness reached ${harness.limits.maxSteps} steps without a final answer`,
      );
    const exceeded = exceededUsage(usage, harness.limits.usage);
    if (exceeded)
      throw limit("usage", `Harness exceeded its ${exceeded} token budget`);
    runtime.emit({ kind: "step", index: step });
    await compact(runtime, history, step);
    await beforeModel(runtime, history.messages, step);
    const result = await requestModel(runtime, {
      model: model.name,
      messages: history.messages,
      ...(system ? { system } : {}),
      ...(tools.length ? { tools } : {}),
      ...(harness.cache ? { cache: true } : {}),
    });
    if (harness.limits.usage && !result.usage)
      throw new OutpostError(
        "configuration",
        "Harness usage limits require a model provider that reports usage",
      );
    if (result.usage) usage = addUsage(usage, result.usage);
    await afterModel(runtime, result, step);
    const content: readonly ModelContentBlock[] = result.content ?? [
      { type: "text", text: result.text },
    ];
    for (const block of content)
      if (block.type === "text" && block.text)
        runtime.emit({ kind: "text", text: block.text });
    const state: LoopState = { history, step, toolCalls };
    const reason = result.stopReason ?? inferredStop(content);
    const answer = await stopHandlers[reason](runtime, state, result, content);
    toolCalls = state.toolCalls;
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
      }),
    ),
  );
  runtime.signal.throwIfAborted();
  return texts.filter((text) => text.trim()).join("\n\n");
}

function inferredStop(content: readonly ModelContentBlock[]): ModelStopReason {
  return content.some((block) => block.type === "tool-call")
    ? "tool-calls"
    : "end";
}

function exceededUsage(
  usage: Usage,
  limits: Partial<Usage> | undefined,
): string | undefined {
  return Object.entries(limits ?? {}).find(
    ([key, value]) => (usage[key as keyof Usage] ?? 0) > (value ?? Infinity),
  )?.[0];
}

function limit(name: string, message: string): OutpostError {
  return new OutpostError("limit", message, { limit: name });
}

async function requestModel(
  runtime: HarnessRuntime,
  request: ModelRequest,
): Promise<ModelResult> {
  const provider = runtime.modelProvider;
  if (!provider.stream) return provider.request(request);
  let result: ModelResult | undefined;
  for await (const event of provider.stream(request)) {
    if (event.type === "text-delta")
      runtime.emit({ kind: "text-delta", text: event.text });
    if (event.type === "result") result = event.result;
  }
  if (!result)
    throw new OutpostError("response", "Model stream ended without a result");
  return result;
}
