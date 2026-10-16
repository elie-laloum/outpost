import { OutpostError } from "../../domain/errors.ts";
import { resetTimestamp } from "../../domain/quota.ts";
import { modelJson } from "./model-http.ts";
import { retryAfterMs } from "./retry-after.ts";
import type { ModelProtocol } from "./model-protocol.types.ts";
import {
  MODEL_DIAGNOSTIC_ERRORS,
  MODEL_ERROR_BYTES,
  MODEL_QUOTA_ERRORS,
  MODEL_QUOTA_STATUS,
  MODEL_UNAVAILABLE_ERRORS,
  MODEL_UNAVAILABLE_STATUSES,
} from "./model.constants.ts";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value));
}

function diagnostic(value: unknown): string | undefined {
  return typeof value === "string" && MODEL_DIAGNOSTIC_ERRORS.has(value)
    ? value
    : undefined;
}

export async function httpFailure(
  response: Response,
  maxBytes: number,
  label: "Model" | "Decision",
  quotaError?: ModelProtocol["quotaError"],
): Promise<OutpostError> {
  const body = record(
    await modelJson(response, Math.min(maxBytes, MODEL_ERROR_BYTES)).catch(
      () => undefined,
    ),
  );
  const error = record(body.error ?? record(body.response).error);
  const type = diagnostic(error.type);
  const code =
    diagnostic(error.code) ?? diagnostic(record(error.details).error_code);
  const identifiers = [type, code].filter(
    (value): value is string => value !== undefined,
  );
  const quota =
    response.status === MODEL_QUOTA_STATUS ||
    identifiers.some((value) => MODEL_QUOTA_ERRORS.has(value)) ||
    (response.status === 400 && quotaError?.(error) === true);
  const unavailable =
    identifiers.find((value) => MODEL_UNAVAILABLE_ERRORS.has(value)) ??
    (MODEL_UNAVAILABLE_STATUSES.has(response.status)
      ? `HTTP ${response.status}`
      : undefined);
  const retryAfter = retryAfterMs(response.headers.get("Retry-After"));
  const resetAt =
    quota && retryAfter !== undefined ? resetTimestamp(retryAfter) : undefined;
  const diagnosticText = identifiers.length
    ? ` (${identifiers.join("/")})`
    : "";
  return new OutpostError(
    quota ? "quota" : "provider",
    `${label} request failed with HTTP ${response.status}${diagnosticText}`,
    {
      status: response.status,
      ...(type ? { type } : {}),
      ...(code ? { code } : {}),
      ...(retryAfter === undefined ? {} : { retryAfterMs: retryAfter }),
      ...(resetAt === undefined ? {} : { resetAt }),
      ...(!quota && unavailable ? { unavailable } : {}),
    },
  );
}
