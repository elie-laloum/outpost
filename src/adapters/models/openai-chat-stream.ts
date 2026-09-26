import type {
  ChatToolCallDraft,
  StreamDecoder,
} from "./model-protocol.types.ts";
import { object, requireResponse } from "./model-response.ts";
import { eventData } from "./stream-events.ts";

export function chatStream(): StreamDecoder {
  let content: string | undefined;
  let refusal: string | undefined;
  let finish: unknown;
  let usage: unknown;
  let chunks = 0;
  const calls: ChatToolCallDraft[] = [];
  return {
    push(event) {
      if (event.data === "[DONE]") return undefined;
      const data = eventData(event);
      chunks++;
      if (data.usage != null) usage = data.usage;
      if (!Array.isArray(data.choices) || data.choices.length === 0)
        return undefined;
      const choice = object(data.choices[0]);
      finish = choice.finish_reason ?? finish;
      const delta = object(choice.delta ?? {});
      if (typeof delta.refusal === "string")
        refusal = `${refusal ?? ""}${delta.refusal}`;
      for (const value of Array.isArray(delta.tool_calls)
        ? delta.tool_calls
        : []) {
        const part = object(value);
        requireResponse(Number.isSafeInteger(part.index));
        const target = (calls[Number(part.index)] ??= {
          type: "function",
          function: { arguments: "" },
        });
        const fn = object(part.function ?? {});
        if (typeof part.id === "string") target.id = part.id;
        if (typeof fn.name === "string") target.function.name = fn.name;
        if (typeof fn.arguments === "string")
          target.function.arguments += fn.arguments;
      }
      if (typeof delta.content !== "string") return undefined;
      content = `${content ?? ""}${delta.content}`;
      return delta.content || undefined;
    },
    final() {
      requireResponse(chunks > 0);
      return {
        choices: [
          {
            finish_reason: finish,
            message: {
              role: "assistant",
              content: content ?? null,
              ...(calls.length ? { tool_calls: calls.filter(Boolean) } : {}),
              ...(refusal === undefined ? {} : { refusal }),
            },
          },
        ],
        ...(usage === undefined ? {} : { usage }),
      };
    },
  };
}
