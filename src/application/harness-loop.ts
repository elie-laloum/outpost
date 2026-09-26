import type { Usage } from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import type {
  ModelContentBlock,
  ModelStopReason,
  ModelToolCallBlock,
  ModelToolSpec,
} from "../domain/model.types.ts";
import { addUsage } from "../domain/usage.ts";
import type {
  HarnessRuntime,
  LoopState,
  StopHandler,
} from "./harness.types.ts";
import { executeToolCalls } from "./tool-execution.ts";

const stopHandlers: Readonly<Record<ModelStopReason, StopHandler>> = {
  end: async (_runtime, _state, result) => result.text,
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
    state.messages.push({ role: "assistant", content });
    state.messages.push({
      role: "user",
      content: await executeToolCalls(runtime, calls),
    });
    return undefined;
  },
};

export async function harnessLoop(
  runtime: HarnessRuntime,
  prompt: string,
): Promise<string> {
  const { harness, model } = runtime.agent;
  const system = await instructions(runtime);
  const tools: ModelToolSpec[] = harness.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
  const messages: LoopState["messages"] = [
    { role: "user", content: [{ type: "text", text: prompt }] },
  ];
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
    const result = await runtime.modelProvider.request({
      model: model.name,
      messages: [...messages],
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
    const content: readonly ModelContentBlock[] = result.content ?? [
      { type: "text", text: result.text },
    ];
    for (const block of content)
      if (block.type === "text" && block.text)
        runtime.emit({ kind: "text", text: block.text });
    const state: LoopState = { messages, step, toolCalls };
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
