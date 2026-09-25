import type { ModelResult } from "../../domain/model.types.ts";
import { object, requireResponse, tokens } from "./model-response.ts";

export function readAnthropicResponse(value: unknown): ModelResult {
  const data = object(value);
  requireResponse(
    data.type === "message" &&
      data.role === "assistant" &&
      data.stop_reason === "end_turn",
  );
  requireResponse(Array.isArray(data.content) && data.content.length > 0);
  const text = data.content
    .map((value) => {
      const block = object(value);
      requireResponse(block.type === "text" && typeof block.text === "string");
      return block.text;
    })
    .join("");
  if (data.usage === undefined) return { text };
  const reported = object(data.usage);
  const cached = tokens(reported.cache_read_input_tokens ?? 0);
  const cacheCreated = tokens(reported.cache_creation_input_tokens ?? 0);
  const input = tokens(reported.input_tokens) + cached + cacheCreated;
  requireResponse(Number.isSafeInteger(input));
  return {
    text,
    usage: {
      input,
      cached,
      cacheCreated,
      output: tokens(reported.output_tokens),
    },
  };
}
