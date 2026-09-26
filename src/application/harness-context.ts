import { SUMMARY_INSTRUCTIONS } from "../domain/context.constants.ts";
import { OutpostError } from "../domain/errors.ts";
import { validateMessages } from "../domain/model-messages.ts";
import type { ModelContentBlock, ModelMessage } from "../domain/model.types.ts";
import type {
  BlockRenderers,
  HarnessHistory,
  HarnessRuntime,
} from "./harness.types.ts";

const renderers: BlockRenderers = {
  text: (block) => block.text,
  "tool-call": (block) =>
    `[tool call ${block.name} ${JSON.stringify(block.input)}]`,
  "tool-result": (block) =>
    `[tool ${block.isError ? "error" : "result"}]\n${block.content}`,
  reasoning: () => "",
};

export async function compact(
  runtime: HarnessRuntime,
  history: HarnessHistory,
  step: number,
): Promise<void> {
  const strategy = runtime.agent.harness.context;
  if (!strategy) return;
  const compacted = await strategy.compact({
    messages: history.messages,
    step,
    model: runtime.agent.model,
    signal: runtime.signal,
    summarize: (messages) => summarize(runtime, messages),
  });
  runtime.signal.throwIfAborted();
  if (compacted === undefined) return;
  validateMessages(compacted);
  const cleaned = compacted.map((message) => ({
    ...message,
    content: message.content.filter((block) => block.type !== "reasoning"),
  }));
  validateMessages(cleaned);
  await history.replace(cleaned);
  runtime.emit({
    kind: "compaction",
    strategy: strategy.name,
    messages: cleaned.length,
  });
}

async function summarize(
  runtime: HarnessRuntime,
  messages: readonly ModelMessage[],
): Promise<string> {
  const result = await runtime.modelProvider.request({
    model: runtime.agent.model.name,
    system: SUMMARY_INSTRUCTIONS,
    prompt: messages.map(render).join("\n\n") || "(no earlier messages)",
  });
  if ((result.stopReason ?? "end") !== "end" || !result.text.trim())
    throw new OutpostError("response", "The model could not summarize history");
  return result.text;
}

function render(message: ModelMessage): string {
  const body = message.content
    .map((block) =>
      (renderers[block.type] as (value: ModelContentBlock) => string)(block),
    )
    .filter(Boolean)
    .join("\n");
  return `${message.role === "user" ? "User" : "Assistant"}:\n${body}`;
}
