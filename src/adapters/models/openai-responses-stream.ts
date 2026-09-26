import type { StreamDecoder } from "./model-protocol.types.ts";
import { requireResponse } from "./model-response.ts";
import { eventData, streamFailure } from "./stream-events.ts";

export function responsesStream(): StreamDecoder {
  let response: unknown;
  const handlers: Readonly<
    Record<string, (data: Record<string, unknown>) => string | undefined>
  > = {
    "response.output_text.delta": (data) => {
      requireResponse(typeof data.delta === "string");
      return data.delta || undefined;
    },
    "response.completed": (data) => {
      response = data.response;
      return undefined;
    },
    "response.incomplete": (data) => {
      response = data.response;
      return undefined;
    },
    "response.failed": (data) => streamFailure(data),
    error: (data) => streamFailure({ error: data }),
  };
  return {
    push(event) {
      const data = eventData(event);
      const handler =
        typeof data.type === "string" && Object.hasOwn(handlers, data.type)
          ? handlers[data.type]
          : undefined;
      return handler?.(data);
    },
    final() {
      requireResponse(response);
      return response;
    },
  };
}
