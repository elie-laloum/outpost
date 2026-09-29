import { OutpostError } from "../../domain/errors.ts";
import type { ServerSentEvent } from "../../infrastructure/sse.types.ts";
import { object } from "./model-response.ts";
import {
  MODEL_QUOTA_ERRORS,
  MODEL_UNAVAILABLE_ERRORS,
} from "./model.constants.ts";

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
  const record = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const error = record(data.error ?? record(data.response).error);
  const type = "type" in error ? String(error.type) : undefined;
  const code = typeof error.code === "string" ? error.code : undefined;
  const quota = [type, code].some(
    (value) => value !== undefined && MODEL_QUOTA_ERRORS.has(value),
  );
  const unavailable = [type, code].find(
    (value) => value !== undefined && MODEL_UNAVAILABLE_ERRORS.has(value),
  );
  throw new OutpostError(
    quota ? "quota" : "provider",
    quota
      ? "Model stream reported a usage or rate limit"
      : "Model stream reported an error",
    {
      ...(type ? { type } : {}),
      ...(quota && code ? { code } : {}),
      ...(!quota && unavailable ? { unavailable } : {}),
    },
  );
}
