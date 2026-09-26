import type { ModelStopReason } from "../../domain/model.types.ts";

export const ANTHROPIC_STOP_REASONS: Readonly<Record<string, ModelStopReason>> =
  {
    end_turn: "end",
    stop_sequence: "end",
    tool_use: "tool-calls",
    max_tokens: "max-tokens",
    model_context_window_exceeded: "max-tokens",
    refusal: "refusal",
  };

export const CHAT_FINISH_REASONS: Readonly<Record<string, ModelStopReason>> = {
  stop: "end",
  tool_calls: "tool-calls",
  length: "max-tokens",
  content_filter: "refusal",
};

export const RESPONSES_INCOMPLETE_REASONS: Readonly<
  Record<string, ModelStopReason>
> = {
  max_output_tokens: "max-tokens",
  content_filter: "refusal",
};
