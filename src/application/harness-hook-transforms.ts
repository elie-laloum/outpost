import { invariant, recordRecovery } from "../domain/errors.ts";
import { validateMessages } from "../domain/model-messages.ts";
import type { HarnessHookEvents } from "../domain/hook.types.ts";
import type { ModelMessage, ModelResult } from "../domain/model.types.ts";
import type { HarnessRuntime } from "./harness.types.ts";
import { each, hooks, runHook } from "./harness-hooks.ts";

export async function transformPrompt(
  runtime: HarnessRuntime,
  prompt: string,
  source: "initial" | "steering",
  step: number,
): Promise<string> {
  for (const hook of hooks(runtime, "before-prompt")) {
    const decision = await runHook(runtime, hook, { prompt, source }, step);
    if (decision === undefined) continue;
    invariant(
      !("deny" in decision),
      "deny" in decision ? decision.deny : "Prompt denied",
    );
    prompt = decision.prompt;
  }
  if (
    source === "initial" &&
    runtime.responseInstructions &&
    !prompt.endsWith(runtime.responseInstructions)
  )
    prompt += `\n\n${runtime.responseInstructions}`;
  return prompt;
}

export async function transformRequest(
  runtime: HarnessRuntime,
  event: HarnessHookEvents["before-model"],
  step: number,
): Promise<HarnessHookEvents["before-model"]> {
  let current = event;
  for (const hook of hooks(runtime, "before-model")) {
    const decision = await runHook(runtime, hook, current, step);
    if (decision === undefined) continue;
    const messages = decision.messages ?? current.messages;
    validateMessages(messages);
    preserveReasoning(current.messages, messages);
    current = { ...current, ...decision, messages };
  }
  const instructions = runtime.responseInstructions;
  if (instructions && current.messages !== event.messages) {
    const messages = [...current.messages];
    const last = messages.at(-1);
    const tail = last?.content.at(-1);
    if (
      last?.role === "user" &&
      tail?.type === "text" &&
      tail.text.endsWith(instructions)
    )
      return current;
    if (last?.role === "user")
      messages[messages.length - 1] = {
        ...last,
        content: [...last.content, { type: "text", text: instructions }],
      };
    else
      messages.push({
        role: "user",
        content: [{ type: "text", text: instructions }],
      });
    current = { ...current, messages };
  }
  return current;
}

export async function transformResult(
  runtime: HarnessRuntime,
  result: ModelResult,
  step: number,
): Promise<ModelResult> {
  let current = result;
  for (const hook of hooks(runtime, "after-model")) {
    const decision = await runHook(runtime, hook, { result: current }, step);
    if (decision === undefined) continue;
    const content = decision.result.content ?? [
      ...(current.content ?? []).filter((block) => block.type === "reasoning"),
      { type: "text" as const, text: decision.result.text },
    ];
    const calls = content.filter((block) => block.type === "tool-call");
    invariant(
      new Set(calls.map((call) => call.id)).size === calls.length,
      "Hook tool call identifiers must be unique",
    );
    const assistant = { role: "assistant" as const, content };
    validateMessages([
      { role: "user", content: [{ type: "text", text: "validate" }] },
      assistant,
      {
        role: "user",
        content: calls.length
          ? calls.map((call) => ({
              type: "tool-result" as const,
              callId: call.id,
              content: "",
            }))
          : [{ type: "text", text: "validate" }],
      },
    ]);
    preserveReasoning(
      [{ role: "assistant", content: current.content ?? [] }],
      [assistant],
    );
    const protectedStop =
      current.stopReason === "refusal" || current.stopReason === "max-tokens";
    const stopReason = calls.length
      ? ("tool-calls" as const)
      : ("end" as const);
    current = {
      ...current,
      ...decision.result,
      content,
      stopReason: protectedStop ? current.stopReason! : stopReason,
    };
  }
  return current;
}

export async function transformCompaction(
  runtime: HarnessRuntime,
  phase: "before-compaction" | "after-compaction",
  messages: readonly ModelMessage[],
  strategy: string,
  step: number,
): Promise<readonly ModelMessage[]> {
  for (const hook of hooks(runtime, phase)) {
    const decision = await runHook(runtime, hook, { messages, strategy }, step);
    if (decision === undefined) continue;
    validateMessages(decision.messages);
    messages = decision.messages;
  }
  return messages;
}

export async function reportModelError(
  runtime: HarnessRuntime,
  error: unknown,
  step: number,
): Promise<void> {
  try {
    await each(runtime, "model-error", { error }, step);
  } catch (hookError) {
    recordRecovery(error, { modelErrorHookError: hookError });
  }
}

function preserveReasoning(
  before: readonly ModelMessage[],
  after: readonly ModelMessage[],
): void {
  const blocks = (messages: readonly ModelMessage[]) =>
    messages.flatMap((message) =>
      message.content.filter((block) => block.type === "reasoning"),
    );
  invariant(
    JSON.stringify(blocks(before)) === JSON.stringify(blocks(after)),
    "Hooks cannot modify replayable reasoning blocks",
  );
}
