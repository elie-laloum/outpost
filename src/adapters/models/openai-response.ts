import { object, tokens, requireResponse } from "./model-response.ts";
import type { ModelResult } from "../../domain/model.types.ts";
import type { Usage } from "../../domain/agent.types.ts";

function usage(
  value: unknown,
  input: string,
  output: string,
  details: string,
): Usage | undefined {
  if (value === undefined || value === null) return undefined;
  const data = object(value);
  const cached =
    data[details] == null
      ? 0
      : tokens(object(data[details]).cached_tokens ?? 0);
  const result = {
    input: tokens(data[input]),
    output: tokens(data[output]),
    cached,
  };
  requireResponse(cached <= result.input);
  return result;
}

export function readChatCompletion(value: unknown): ModelResult {
  const data = object(value);
  requireResponse(Array.isArray(data.choices) && data.choices.length === 1);
  const choice = object(data.choices[0]);
  requireResponse(choice.finish_reason === "stop");
  const message = object(choice.message);
  requireResponse(
    message.role === "assistant" && typeof message.content === "string",
  );
  requireResponse(message.refusal == null && message.function_call == null);
  requireResponse(
    message.tool_calls == null ||
      (Array.isArray(message.tool_calls) && message.tool_calls.length === 0),
  );
  const reported = usage(
    data.usage,
    "prompt_tokens",
    "completion_tokens",
    "prompt_tokens_details",
  );
  return { text: message.content, ...(reported ? { usage: reported } : {}) };
}

export function readModelResponse(value: unknown): ModelResult {
  const data = object(value);
  requireResponse(data.status === "completed" && data.error == null);
  requireResponse(Array.isArray(data.output));
  const texts: string[] = [];
  for (const value of data.output) {
    const item = object(value);
    if (item.type === "reasoning") continue;
    requireResponse(
      item.type === "message" &&
        item.role === "assistant" &&
        item.status === "completed",
    );
    requireResponse(Array.isArray(item.content));
    for (const value of item.content) {
      const part = object(value);
      requireResponse(
        part.type === "output_text" && typeof part.text === "string",
      );
      texts.push(part.text);
    }
  }
  requireResponse(texts.length > 0);
  const reported = usage(
    data.usage,
    "input_tokens",
    "output_tokens",
    "input_tokens_details",
  );
  return { text: texts.join(""), ...(reported ? { usage: reported } : {}) };
}
