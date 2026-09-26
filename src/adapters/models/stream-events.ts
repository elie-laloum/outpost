import { OutpostError } from "../../domain/errors.ts";
import type { ServerSentEvent } from "../../infrastructure/sse.types.ts";
import { object } from "./model-response.ts";

export function eventData(event: ServerSentEvent): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(event.data);
  } catch {
    throw new OutpostError("response", "Model stream event is not valid JSON");
  }
  return object(value);
}

export function streamFailure(data: Record<string, unknown>): never {
  const error = data.error;
  const type =
    error && typeof error === "object" && "type" in error
      ? String(error.type)
      : undefined;
  throw new OutpostError("provider", "Model stream reported an error", {
    ...(type ? { type } : {}),
  });
}
